// ===== Widgets Module =====

// Clock
function initClock() {
  const timeEl = document.getElementById("widget-clock-time");
  const dateEl = document.getElementById("widget-clock-date");
  const greetEl = document.getElementById("widget-clock-greeting");
  if (!timeEl) return;

  function update() {
    const now = new Date();
    timeEl.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${days[now.getDay()]}`;
    const h = now.getHours();
    let g = "🌙 晚上好";
    if (h >= 5 && h < 9) g = "🌅 早上好";
    else if (h >= 9 && h < 12) g = "☀️ 上午好";
    else if (h >= 12 && h < 14) g = "🍜 中午好";
    else if (h >= 14 && h < 18) g = "🌤 下午好";
    if (greetEl) greetEl.textContent = g;
  }
  update();
  setInterval(update, 1000);
}

// Visitor Counter
function initVisitorCounter() {
  const KEY = "myblog_visitors";
  let count = parseInt(localStorage.getItem(KEY) || "0");
  const sk = "myblog_session";
  if (!sessionStorage.getItem(sk)) {
    count++;
    localStorage.setItem(KEY, count);
    sessionStorage.setItem(sk, "1");
  }
}

// Online Time
function initOnlineTime() {
  const el = document.getElementById("widget-online-time");
  if (!el) return;
  const t = Date.now();
  function update() {
    const s = Math.floor((Date.now() - t) / 1000);
    el.textContent = `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }
  update();
  setInterval(update, 1000);
}

// Weather
function initWeather() {
  const tempEl = document.getElementById("widget-weather-temp");
  const descEl = document.getElementById("widget-weather-desc");
  const iconEl = document.getElementById("widget-weather-icon");
  if (!tempEl) return;
  const w = [
    { icon: "☀️", temp: "28°C", desc: "晴朗" },
    { icon: "🌤", temp: "25°C", desc: "多云" },
    { icon: "🌧", temp: "20°C", desc: "小雨" },
    { icon: "⛅", temp: "23°C", desc: "阴天" },
    { icon: "🌈", temp: "22°C", desc: "雨后彩虹" },
  ];
  const wt = w[new Date().getHours() % w.length];
  iconEl.textContent = wt.icon;
  tempEl.textContent = wt.temp;
  descEl.textContent = wt.desc;
}

// Stats (from DB)
async function initWidgetStats() {
  const a = document.getElementById("widget-stat-articles");
  const n = document.getElementById("widget-stat-notes");
  const m = document.getElementById("widget-stat-msgs");
  const p = document.getElementById("widget-stat-photos");
  if (a) a.textContent = typeof articles !== "undefined" ? articles.length : 0;
  if (n) n.textContent = (await DB.get("notes")).length;
  if (m) m.textContent = (await DB.get("guestbook")).length;
  if (p) p.textContent = (await DB.get("gallery")).length;
}

// Listen for sync updates
function initWidgetSync() {
  window.addEventListener("db-sync", async () => {
    const n = document.getElementById("widget-stat-notes");
    const m = document.getElementById("widget-stat-msgs");
    const p = document.getElementById("widget-stat-photos");
    if (n) n.textContent = (await DB.get("notes")).length;
    if (m) m.textContent = (await DB.get("guestbook")).length;
    if (p) p.textContent = (await DB.get("gallery")).length;
  });
}

function initWidgets() {
  initClock();
  initVisitorCounter();
  initOnlineTime();
  initWeather();
  initWidgetStats();
  initWidgetSync();
}

document.addEventListener("DOMContentLoaded", initWidgets);
