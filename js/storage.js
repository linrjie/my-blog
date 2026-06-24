// ===== Supabase Cloud Storage =====
// 实时跨设备同步，所有设备数据自动更新
//
// 设置步骤：
// 1. 访问 https://supabase.com 注册免费账号
// 2. 创建新项目（记下 Project URL 和 anon key）
// 3. 在 SQL Editor 中执行下方建表脚本
// 4. 将 URL 和 Key 填入下方配置

const DB = (() => {
  // ============ Supabase 配置 ============
  // 从设置页面读取，或手动填写
  function getConfig() {
    return {
      url: localStorage.getItem("blog_supabase_url") || "https://your-project.supabase.co",
      key: localStorage.getItem("blog_supabase_key") || "your-anon-key"
    };
  }

  let supabase = null;
  let deviceId = null;
  const localCache = {};
  let connected = false;

  // ===== 初始化 =====
  async function init() {
    deviceId = getDeviceId();
    log("设备 ID: " + deviceId);

    // 加载本地缓存
    for (const key of getCollectionNames()) {
      const data = localStorage.getItem("myblog_" + key);
      if (data) localCache[key] = JSON.parse(data);
      else localCache[key] = [];
    }

    // 检查是否配置了 Supabase
    const config = getConfig();
    if (config.url.includes("your-project") || config.key.includes("your-anon")) {
      log("📦 Supabase 未配置，使用本地存储模式");
      updateSyncStatus("local");
      return;
    }

    try {
      // 动态加载 Supabase SDK
      if (typeof window.supabase === "undefined") {
        await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      }

      supabase = window.supabase.createClient(config.url, config.key);
      connected = true;
      log("✅ Supabase 已连接");

      // 监听所有集合的实时变化
      for (const key of getCollectionNames()) {
        subscribeToCollection(key);
      }

      // 初始同步
      await syncAllFromCloud();
      updateSyncStatus("synced");
    } catch (e) {
      log("⚠️ Supabase 连接失败: " + e.message);
      updateSyncStatus("error");
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function getCollectionNames() {
    return ["notes", "guestbook", "gallery", "settings", "friends"];
  }

  // ===== 从云端同步到本地 =====
  async function syncAllFromCloud() {
    if (!connected) return;
    for (const key of getCollectionNames()) {
      await syncFromCloud(key);
    }
  }

  async function syncFromCloud(collection) {
    if (!connected) return;
    try {
      const { data, error } = await supabase
        .from("blog_data")
        .select("content")
        .eq("collection", collection)
        .eq("device_id", deviceId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data && data.content) {
        const cloudData = data.content;
        const localData = localCache[collection] || [];

        // 合并数据
        const merged = mergeData(localData, cloudData);
        localCache[collection] = merged;
        localStorage.setItem("myblog_" + collection, JSON.stringify(merged));

        // 触发 UI 更新
        window.dispatchEvent(new CustomEvent("db-sync", {
          detail: { collection, data: merged }
        }));
      }
    } catch (e) {
      log("⚠️ 同步 " + collection + " 失败: " + e.message);
    }
  }

  // ===== 从本地同步到云端 =====
  async function syncToCloud(collection) {
    if (!connected) return;
    const data = localCache[collection] || [];

    try {
      // 先尝试更新
      const { error: updateError } = await supabase
        .from("blog_data")
        .upsert({
          collection: collection,
          device_id: deviceId,
          content: data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "collection,device_id"
        });

      if (updateError) throw updateError;
    } catch (e) {
      log("⚠️ 上传 " + collection + " 失败: " + e.message);
    }
  }

  // ===== 实时订阅 =====
  function subscribeToCollection(collection) {
    if (!connected) return;

    supabase
      .channel("blog_" + collection)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "blog_data",
        filter: `collection=eq.${collection}`
      }, (payload) => {
        if (payload.new && payload.new.device_id !== deviceId) {
          const cloudData = payload.new.content || [];
          const localData = localCache[collection] || [];
          const merged = mergeData(localData, cloudData);
          localCache[collection] = merged;
          localStorage.setItem("myblog_" + collection, JSON.stringify(merged));

          window.dispatchEvent(new CustomEvent("db-sync", {
            detail: { collection, data: merged }
          }));
          log("🔄 " + collection + " 已实时同步");
        }
      })
      .subscribe();
  }

  // ===== 合并数据（按 id 去重）=====
  function mergeData(existing, cloud) {
    const map = new Map();
    for (const item of cloud) {
      map.set(String(item.id), item);
    }
    for (const item of existing) {
      const key = String(item.id);
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.id > b.id) return -1;
      if (a.id < b.id) return 1;
      return 0;
    });
  }

  // ===== 设备 ID =====
  function getDeviceId() {
    let id = localStorage.getItem("blog_device_id");
    if (!id) {
      id = "dev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("blog_device_id", id);
    }
    return id;
  }

  // ===== 公开 API =====
  async function get(collection) {
    return localCache[collection] || [];
  }

  async function set(collection, data) {
    localCache[collection] = data;
    localStorage.setItem("myblog_" + collection, JSON.stringify(data));
    syncToCloud(collection);
    return true;
  }

  async function add(collection, item) {
    const data = localCache[collection] || [];
    data.unshift(item);
    return await set(collection, data);
  }

  async function remove(collection, id) {
    const data = (localCache[collection] || []).filter(
      (item) => String(item.id) !== String(id)
    );
    return await set(collection, data);
  }

  async function update(collection, id, updates) {
    const data = localCache[collection] || [];
    const index = data.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      return await set(collection, data);
    }
    return false;
  }

  // ===== 导出/导入（兼容旧版）=====
  async function exportAll() {
    const allData = {};
    for (const key of getCollectionNames()) {
      allData[key] = localCache[key] || [];
    }
    allData._exported = new Date().toLocaleString("zh-CN");
    allData._device = deviceId;

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myblog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importAll(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const allData = JSON.parse(e.target.result);
          for (const key of getCollectionNames()) {
            if (allData[key] && Array.isArray(allData[key])) {
              const existing = localCache[key] || [];
              localCache[key] = mergeData(existing, allData[key]);
              localStorage.setItem("myblog_" + key, JSON.stringify(localCache[key]));
            }
          }
          // 同步到云端
          for (const key of getCollectionNames()) {
            await syncToCloud(key);
          }
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  // ===== 同步状态 =====
  function updateSyncStatus(status) {
    const el = document.getElementById("sync-status");
    if (!el) return;
    const map = {
      synced: { icon: "☁️", text: "云端同步", color: "#22c55e" },
      local: { icon: "📦", text: "本地存储", color: "#94a3b8" },
      error: { icon: "⚠️", text: "同步异常", color: "#ef4444" },
    };
    const s = map[status] || map.local;
    el.innerHTML = `<span style="color:${s.color}">${s.icon} ${s.text}</span>`;
  }

  function log(msg) {
    console.log("%c[BlogDB] " + msg, "color: #6366f1; font-weight: bold;");
  }

  return {
    init,
    get,
    set,
    add,
    remove,
    update,
    exportAll,
    importAll,
    getDeviceId: () => deviceId,
    isOnline: () => connected,
  };
})();

document.addEventListener("DOMContentLoaded", () => DB.init());
