// ===== Supabase Cloud Storage (Fixed) =====
// 所有设备共享同一份数据，实时同步

const DB = (() => {
  function getConfig() {
    return {
      url: localStorage.getItem("blog_supabase_url") || "",
      key: localStorage.getItem("blog_supabase_key") || ""
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

    // 检查 Supabase 配置
    const config = getConfig();
    if (!config.url || !config.key || config.url.includes("your-project")) {
      log("📦 Supabase 未配置，使用本地存储");
      updateSyncStatus("local");
      return;
    }

    try {
      if (typeof window.supabase === "undefined") {
        await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      }

      supabase = window.supabase.createClient(config.url, config.key);
      connected = true;
      log("✅ Supabase 已连接");

      // 初始同步：从云端拉取所有数据
      await syncAllFromCloud();

      // 订阅实时变化
      for (const key of getCollectionNames()) {
        subscribeToCollection(key);
      }

      updateSyncStatus("synced");
    } catch (e) {
      log("⚠️ 连接失败: " + e.message);
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

  // ===== 从云端拉取数据（合并所有设备）=====
  async function syncAllFromCloud() {
    if (!connected) return;
    for (const key of getCollectionNames()) {
      await syncFromCloud(key);
    }
  }

  async function syncFromCloud(collection) {
    if (!connected) return;
    try {
      // 读取该集合的所有记录（所有设备）
      const { data, error } = await supabase
        .from("blog_data")
        .select("content, device_id")
        .eq("collection", collection);

      if (error) throw error;

      if (data && data.length > 0) {
        // 合并所有设备的数据
        let allCloudData = [];
        for (const row of data) {
          if (row.content && Array.isArray(row.content)) {
            allCloudData = allCloudData.concat(row.content);
          }
        }

        // 去重合并
        const localData = localCache[collection] || [];
        const merged = mergeData(localData, allCloudData);
        localCache[collection] = merged;
        localStorage.setItem("myblog_" + collection, JSON.stringify(merged));

        // 同时更新云端（合并后的完整数据写回当前设备）
        await uploadToCloud(collection, merged);

        // 触发 UI 更新
        window.dispatchEvent(new CustomEvent("db-sync", {
          detail: { collection, data: merged }
        }));
      }
    } catch (e) {
      log("⚠️ 同步 " + collection + " 失败: " + e.message);
    }
  }

  // ===== 上传数据到云端 =====
  async function uploadToCloud(collection, data) {
    if (!connected) return;

    try {
      const { error } = await supabase
        .from("blog_data")
        .upsert({
          collection: collection,
          device_id: deviceId,
          content: data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "collection,device_id"
        });

      if (error) throw error;
    } catch (e) {
      log("⚠️ 上传 " + collection + " 失败: " + e.message);
    }
  }

  // ===== 实时订阅（接收所有设备的变化）=====
  function subscribeToCollection(collection) {
    if (!connected) return;

    supabase
      .channel("blog_" + collection)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "blog_data",
        filter: `collection=eq.${collection}`
      }, (payload) => {
        // 接收所有设备的变化，不只是其他设备
        if (payload.new && payload.new.content) {
          const cloudData = payload.new.content || [];
          const localData = localCache[collection] || [];

          // 检查数据是否真的变化了
          const cloudStr = JSON.stringify(cloudData);
          const localStr = JSON.stringify(localData);

          if (cloudStr !== localStr) {
            const merged = mergeData(localData, cloudData);
            localCache[collection] = merged;
            localStorage.setItem("myblog_" + collection, JSON.stringify(merged));

            window.dispatchEvent(new CustomEvent("db-sync", {
              detail: { collection, data: merged }
            }));
            log("🔄 " + collection + " 已实时同步 (" + (payload.new.device_id || "unknown") + ")");
          }
        }
      })
      .subscribe();
  }

  // ===== 合并数据（按 id 去重，保留最新的）=====
  function mergeData(existing, cloud) {
    const map = new Map();

    // 先放入现有数据
    for (const item of existing) {
      map.set(String(item.id), item);
    }

    // 云端数据覆盖（更新的优先）
    for (const item of cloud) {
      map.set(String(item.id), item);
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
    // 上传到云端
    uploadToCloud(collection, data);
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

  // ===== 手动刷新（从云端重新拉取）=====
  async function refresh() {
    if (!connected) return;
    log("🔄 手动刷新...");
    await syncAllFromCloud();
    updateSyncStatus("synced");
  }

  // ===== 导出/导入 =====
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
              await uploadToCloud(key, localCache[key]);
            }
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
    refresh,
    exportAll,
    importAll,
    getDeviceId: () => deviceId,
    isOnline: () => connected,
  };
})();

document.addEventListener("DOMContentLoaded", () => DB.init());
