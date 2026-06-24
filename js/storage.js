// ===== Supabase Cloud Storage (Fixed - no refresh loop) =====

const DB = (() => {
  function getConfig() {
    return {
      url: localStorage.getItem("blog_supabase_url") || "https://rkhulwyvmkikagghfayw.supabase.co",
      key: localStorage.getItem("blog_supabase_key") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraHVsd3l2bWtpa2FnZ2hmYXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDk0OTEsImV4cCI6MjA5NzgyNTQ5MX0.pcnF2pjhsPkIKz9hxyJXM8wGwwZhTt6D66ky1_SZjyo"
    };
  }

  let supabase = null;
  let deviceId = null;
  const localCache = {};
  let connected = false;
  let isSyncing = false; // 防止同步循环
  const syncTimers = {}; // 防抖计时器

  // ===== 初始化 =====
  async function init() {
    deviceId = getDeviceId();

    // 加载本地缓存
    for (const key of getCollectionNames()) {
      const data = localStorage.getItem("myblog_" + key);
      if (data) localCache[key] = JSON.parse(data);
      else localCache[key] = [];
    }

    const config = getConfig();
    if (!config.url || !config.key || config.url.includes("your-project")) {
      updateSyncStatus("local");
      return;
    }

    try {
      if (typeof window.supabase === "undefined") {
        await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      }

      supabase = window.supabase.createClient(config.url, config.key);
      connected = true;

      // 初始同步
      await syncAllFromCloud();

      // 订阅实时变化
      for (const key of getCollectionNames()) {
        subscribeToCollection(key);
      }

      updateSyncStatus("synced");
    } catch (e) {
      console.log("[BlogDB] 连接失败:", e.message);
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

  // ===== 从云端拉取 =====
  async function syncAllFromCloud() {
    if (!connected) return;
    for (const key of getCollectionNames()) {
      await syncFromCloud(key);
    }
  }

  async function syncFromCloud(collection) {
    if (!connected || isSyncing) return;
    try {
      const { data, error } = await supabase
        .from("blog_data")
        .select("content, device_id")
        .eq("collection", collection);

      if (error) throw error;

      if (data && data.length > 0) {
        let allCloudData = [];
        for (const row of data) {
          if (row.content && Array.isArray(row.content)) {
            allCloudData = allCloudData.concat(row.content);
          }
        }

        const localData = localCache[collection] || [];
        const merged = mergeData(localData, allCloudData);

        // 只在数据真正变化时更新
        if (JSON.stringify(merged) !== JSON.stringify(localData)) {
          localCache[collection] = merged;
          localStorage.setItem("myblog_" + collection, JSON.stringify(merged));
          notifyUI(collection, merged);
        }
      }
    } catch (e) {
      console.log("[BlogDB] 同步失败:", collection, e.message);
    }
  }

  // ===== 上传到云端（防抖）=====
  function scheduleUpload(collection) {
    if (!connected) return;
    clearTimeout(syncTimers[collection]);
    syncTimers[collection] = setTimeout(() => {
      uploadToCloud(collection);
    }, 500); // 500ms 防抖
  }

  async function uploadToCloud(collection) {
    if (!connected || isSyncing) return;
    const data = localCache[collection] || [];

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
      console.log("[BlogDB] 上传失败:", collection, e.message);
    }
  }

  // ===== 实时订阅 =====
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
        // 忽略自己设备的更新（避免循环）
        if (payload.new && payload.new.device_id === deviceId) return;

        if (payload.new && payload.new.content) {
          const cloudData = payload.new.content || [];
          const localData = localCache[collection] || [];

          if (JSON.stringify(cloudData) !== JSON.stringify(localData)) {
            isSyncing = true; // 标记正在同步，阻止上传
            const merged = mergeData(localData, cloudData);
            localCache[collection] = merged;
            localStorage.setItem("myblog_" + collection, JSON.stringify(merged));
            notifyUI(collection, merged);
            isSyncing = false;
          }
        }
      })
      .subscribe();
  }

  // ===== 通知 UI 更新 =====
  function notifyUI(collection, data) {
    window.dispatchEvent(new CustomEvent("db-sync", {
      detail: { collection, data }
    }));
  }

  // ===== 合并数据 =====
  function mergeData(existing, cloud) {
    const map = new Map();
    for (const item of existing) {
      map.set(String(item.id), item);
    }
    for (const item of cloud) {
      map.set(String(item.id), item);
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.id > b.id) return -1;
      if (a.id < b.id) return 1;
      return 0;
    });
  }

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
    scheduleUpload(collection);
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

  async function refresh() {
    if (!connected) return;
    isSyncing = true;
    await syncAllFromCloud();
    isSyncing = false;
    updateSyncStatus("synced");
  }

  // ===== 导出/导入 =====
  async function exportAll() {
    const allData = {};
    for (const key of getCollectionNames()) {
      allData[key] = localCache[key] || [];
    }
    allData._exported = new Date().toLocaleString("zh-CN");
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
          isSyncing = true;
          for (const key of getCollectionNames()) {
            if (allData[key] && Array.isArray(allData[key])) {
              const existing = localCache[key] || [];
              localCache[key] = mergeData(existing, allData[key]);
              localStorage.setItem("myblog_" + key, JSON.stringify(localCache[key]));
              await uploadToCloud(key);
            }
          }
          isSyncing = false;
          resolve(true);
        } catch (err) {
          isSyncing = false;
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

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

  return {
    init, get, set, add, remove, update,
    refresh, exportAll, importAll,
    getDeviceId: () => deviceId,
    isOnline: () => connected,
  };
})();

document.addEventListener("DOMContentLoaded", () => DB.init());
