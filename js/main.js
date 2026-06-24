// ===== Theme Toggle =====
function initTheme() {
  const saved = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateToggleIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateToggleIcon(next);
}

function updateToggleIcon(theme) {
  const btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "☀️ 浅色模式" : "🌙 深色模式";
  }
}

// ===== Active Nav =====
function setActiveNav() {
  const path = window.location.pathname;
  const filename = path.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === filename || (filename === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

// ===== Mobile Nav Toggle =====
function toggleNav() {
  const nav = document.getElementById("main-nav");
  const toggle = document.getElementById("nav-toggle");
  const overlay = document.getElementById("nav-overlay");
  if (!nav) return;

  const isOpen = nav.classList.contains("open");
  if (isOpen) {
    closeNav();
  } else {
    nav.classList.add("open");
    toggle.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeNav() {
  const nav = document.getElementById("main-nav");
  const toggle = document.getElementById("nav-toggle");
  const overlay = document.getElementById("nav-overlay");
  if (nav) nav.classList.remove("open");
  if (toggle) toggle.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

// 点击导航链接后自动关闭
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav a")) {
    closeNav();
  }
});

// ESC 键关闭导航
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});

// ===== Background Slideshow =====
function initBgSlideshow() {
  const images = document.querySelectorAll(".bg-layer .bg-image");
  if (images.length <= 1) return;

  let current = 0;
  setInterval(() => {
    images[current].classList.remove("active");
    current = (current + 1) % images.length;
    images[current].classList.add("active");
  }, 6000);
}

// ===== Back to Top =====
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setActiveNav();
  initBackToTop();
});

// ===== Cleanup on page unload =====
const cleanupTimers = [];

function registerTimer(id) {
  cleanupTimers.push(id);
  return id;
}

window.addEventListener("beforeunload", () => {
  cleanupTimers.forEach(id => clearInterval(id));
  cleanupTimers.length = 0;
});
