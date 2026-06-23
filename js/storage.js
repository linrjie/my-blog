// ===== Cross-Device Storage =====
// 本地 localStorage + 一键导出/导入 JSON 文件实现跨设备同步
// 无需任何外部服务，数据完全在你手中

const DB = (() => {
  const collections = ["notes", "guestbook", "gallery", "settings", "friends"];
  const localCache = {};

  // ===== 初始化 =====
  async function init() {
    // 从 localStorage 加载所有数据
    for (const key of collections) {
      const data = localStorage.getItem("myblog_" + key);
      if (data) localCache[key] = JSON.parse(data);
      else localCache[key] = [];
    }
    updateSyncStatus("local");
    log("✅ 本地数据已加载");
  }

  // ===== 读取 =====
  async function get(collection) {
    return localCache[collection] || [];
  }

  // ===== 写入 =====
  async function set(collection, data) {
    localCache[collection] = data;
    localStorage.setItem("myblog_" + collection, JSON.stringify(data));
    return true;
  }

  // ===== 添加 =====
  async function add(collection, item) {
    const data = localCache[collection] || [];
    data.unshift(item);
    return await set(collection, data);
  }

  // ===== 删除 =====
  async function remove(collection, id) {
    const data = (localCache[collection] || []).filter(
      (item) => String(item.id) !== String(id)
    );
    return await set(collection, data);
  }

  // ===== 更新 =====
  async function update(collection, id, updates) {
    const data = localCache[collection] || [];
    const index = data.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      return await set(collection, data);
    }
    return false;
  }

  // ===== 导出所有数据为 JSON 文件 =====
  async function exportAll() {
    const allData = {};
    for (const key of collections) {
      allData[key] = localCache[key] || [];
    }
    allData._exported = new Date().toLocaleString("zh-CN");
    allData._device = localStorage.getItem("blog_device_id") || "unknown";

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `myblog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    log("📤 数据已导出");
  }

  // ===== 从 JSON 文件导入数据 =====
  async function importAll(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const allData = JSON.parse(e.target.result);

          for (const key of collections) {
            if (allData[key] && Array.isArray(allData[key])) {
              // 合并数据（去重）
              const existing = localCache[key] || [];
              const imported = allData[key];
              const merged = mergeData(existing, imported);
              localCache[key] = merged;
              localStorage.setItem("myblog_" + key, JSON.stringify(merged));
            }
          }

          log("📥 数据已导入");
          resolve(true);
        } catch (err) {
          log("❌ 导入失败: " + err.message);
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  // ===== 合并数据（按 id 去重，保留最新的）=====
  function mergeData(existing, imported) {
    const map = new Map();
    for (const item of existing) {
      map.set(String(item.id), item);
    }
    for (const item of imported) {
      const key = String(item.id);
      if (!map.has(key)) {
        map.set(key, item);
      } else {
        // 保留更新的
        const existingItem = map.get(key);
        if (JSON.stringify(item) !== JSON.stringify(existingItem)) {
          map.set(key, item);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.id > b.id) return -1;
      if (a.id < b.id) return 1;
      return 0;
    });
  }

  // ===== 同步状态 =====
  function updateSyncStatus(status) {
    const el = document.getElementById("sync-status");
    if (!el) return;
    const map = {
      local: { icon: "📦", text: "本地存储", color: "#94a3b8" },
      synced: { icon: "✅", text: "已同步", color: "#22c55e" },
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
    getDeviceId: () => localStorage.getItem("blog_device_id") || "unknown",
    isOnline: () => false,
  };
})();

document.addEventListener("DOMContentLoaded", () => DB.init());
