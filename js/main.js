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
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
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
