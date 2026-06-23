// ===== Cross-Device Storage Layer =====
// 支持 Firebase 云端同步 + localStorage 离线回退
// 打开浏览器控制台查看连接状态

const DB = (() => {
  // Firebase 配置 — 替换为你自己的项目信息
  // 1. 访问 https://console.firebase.google.com
  // 2. 创建项目 → 添加 Web 应用 → 复制配置
  const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-blog-sync",
  };

  let db = null;
  let useFirebase = false;
  let userId = null;
  const listeners = {};
  const localCache = {};

  // ===== 生成设备唯一 ID =====
  function getDeviceId() {
    let id = localStorage.getItem("blog_device_id");
    if (!id) {
      id = "dev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("blog_device_id", id);
    }
    return id;
  }

  // ===== 初始化 =====
  async function init() {
    userId = getDeviceId();
    log("设备 ID: " + userId);

    // 尝试加载 Firebase
    try {
      if (typeof firebase !== "undefined" && firebaseConfig.apiKey !== "demo-key") {
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();

        // 启用离线持久化
        db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

        useFirebase = true;
        log("✅ Firebase 已连接，数据将云端同步");
        updateSyncStatus("synced");
      } else {
        log("📦 使用本地存储模式（如需云端同步请配置 Firebase）");
        updateSyncStatus("local");
      }
    } catch (e) {
      log("📦 Firebase 不可用，使用本地存储");
      updateSyncStatus("local");
    }

    // 从 localStorage 加载缓存
    ["notes", "guestbook", "gallery", "settings"].forEach((key) => {
      const data = localStorage.getItem("myblog_" + key);
      if (data) localCache[key] = JSON.parse(data);
    });

    // 如果 Firebase 可用，监听云端变化
    if (useFirebase) {
      ["notes", "guestbook", "gallery", "settings"].forEach((key) => {
        listenToCollection(key);
      });
    }
  }

  // ===== 读取 =====
  async function get(collection) {
    // 先返回本地缓存
    const local = localCache[collection] || [];

    if (!useFirebase) return local;

    try {
      const snapshot = await db.collection("users").doc(userId).collection(collection).get();
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));

      // 按时间排序（最新的在前）
      data.sort((a, b) => (b.id > a.id ? 1 : -1));

      // 更新本地缓存
      localCache[collection] = data;
      localStorage.setItem("myblog_" + collection, JSON.stringify(data));

      return data;
    } catch (e) {
      log("⚠️ 读取失败，使用本地数据: " + e.message);
      return local;
    }
  }

  // ===== 写入 =====
  async function set(collection, data) {
    // 更新本地缓存
    localCache[collection] = data;
    localStorage.setItem("myblog_" + collection, JSON.stringify(data));

    if (!useFirebase) return true;

    try {
      const colRef = db.collection("users").doc(userId).collection(collection);

      // 获取现有文档 ID
      const existing = await colRef.get();
      const existingIds = new Set();
      existing.forEach((doc) => existingIds.add(doc.id));

      // 删除不再存在的文档
      for (const id of existingIds) {
        if (!data.find((item) => String(item.id) === id)) {
          await colRef.doc(id).delete();
        }
      }

      // 写入/更新所有文档
      const batch = db.batch();
      data.forEach((item) => {
        const docRef = colRef.doc(String(item.id));
        batch.set(docRef, item);
      });
      await batch.commit();

      updateSyncStatus("synced");
      return true;
    } catch (e) {
      log("⚠️ 同步失败，已保存到本地: " + e.message);
      updateSyncStatus("error");
      return false;
    }
  }

  // ===== 监听云端变化（实时同步）=====
  function listenToCollection(collection) {
    if (!useFirebase) return;

    try {
      db.collection("users")
        .doc(userId)
        .collection(collection)
        .onSnapshot(
          (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (b.id > a.id ? 1 : -1));

            // 只在数据真正变化时更新
            const oldStr = JSON.stringify(localCache[collection]);
            const newStr = JSON.stringify(data);
            if (oldStr !== newStr) {
              localCache[collection] = data;
              localStorage.setItem("myblog_" + collection, JSON.stringify(data));

              // 触发自定义事件通知 UI 更新
              window.dispatchEvent(
                new CustomEvent("db-sync", { detail: { collection, data } })
              );
              log("🔄 " + collection + " 已同步");
            }
          },
          (error) => {
            log("⚠️ 监听失败: " + error.message);
          }
        );
    } catch (e) {}
  }

  // ===== 添加单条记录 =====
  async function add(collection, item) {
    const data = localCache[collection] || [];
    data.unshift(item);
    return await set(collection, data);
  }

  // ===== 删除单条记录 =====
  async function remove(collection, id) {
    const data = (localCache[collection] || []).filter(
      (item) => String(item.id) !== String(id)
    );
    return await set(collection, data);
  }

  // ===== 更新单条记录 =====
  async function update(collection, id, updates) {
    const data = localCache[collection] || [];
    const index = data.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      return await set(collection, data);
    }
    return false;
  }

  // ===== 同步状态 UI =====
  function updateSyncStatus(status) {
    const el = document.getElementById("sync-status");
    if (!el) return;

    const map = {
      synced: { icon: "☁️", text: "云端同步中", color: "#22c55e" },
      local: { icon: "📦", text: "本地存储", color: "#94a3b8" },
      error: { icon: "⚠️", text: "同步异常", color: "#ef4444" },
      syncing: { icon: "🔄", text: "同步中...", color: "#6366f1" },
    };

    const s = map[status] || map.local;
    el.innerHTML = `<span style="color:${s.color}">${s.icon} ${s.text}</span>`;
  }

  // ===== 日志 =====
  function log(msg) {
    console.log("%c[BlogDB] " + msg, "color: #6366f1; font-weight: bold;");
  }

  // ===== 公开 API =====
  return {
    init,
    get,
    set,
    add,
    remove,
    update,
    getDeviceId,
    isOnline: () => useFirebase,
  };
})();

// ===== 页面加载时初始化 =====
document.addEventListener("DOMContentLoaded", () => DB.init());
