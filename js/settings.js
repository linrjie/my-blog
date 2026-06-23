// ===== Settings Module (with cross-device sync) =====
const SettingsStore = {
  defaults: {
    name: "XingHuiSama",
    subtitle: "在代码与学术间穿梭的普通人。记录技术思考，分享学习心得。",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=c0aede",
    favicon: "",
  },

  async get() {
    const saved = await DB.get("settings");
    return saved.length > 0 ? { ...this.defaults, ...saved[0] } : { ...this.defaults };
  },

  async save(settings) {
    const existing = await DB.get("settings");
    if (existing.length > 0) {
      await DB.update("settings", existing[0].id, settings);
    } else {
      await DB.add("settings", { id: 1, ...settings });
    }
  },
};

// ===== Apply Settings to Current Page =====
async function applySettings() {
  const s = await SettingsStore.get();

  document.querySelectorAll(".logo").forEach((el) => {
    el.innerHTML = `${escapeHtml(s.name)}<span class="logo-accent">の</span>宝藏之地`;
  });

  const heroName = document.getElementById("setting-hero-name");
  if (heroName) heroName.textContent = s.name;

  const heroDesc = document.getElementById("setting-hero-desc");
  if (heroDesc) heroDesc.textContent = s.subtitle;

  const heroAvatar = document.querySelector(".hero-avatar img");
  if (heroAvatar && s.avatar) heroAvatar.src = s.avatar;

  if (s.favicon) {
    let link = document.querySelector("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = s.favicon;
  }

  const aboutName = document.getElementById("about-name");
  if (aboutName) aboutName.textContent = `Hi, 我是${s.name} 👋`;

  const aboutSubtitle = document.getElementById("about-subtitle");
  if (aboutSubtitle) aboutSubtitle.textContent = s.subtitle;
}

// ===== Settings Page Functions =====
async function initSettingsPage() {
  const nameInput = document.getElementById("settings-name");
  const subtitleInput = document.getElementById("settings-subtitle");
  const avatarPreview = document.getElementById("settings-avatar-preview");
  const avatarInput = document.getElementById("settings-avatar-input");
  const saveBtn = document.getElementById("settings-save");
  if (!nameInput) return;

  const s = await SettingsStore.get();
  nameInput.value = s.name;
  subtitleInput.value = s.subtitle;
  avatarPreview.src = s.avatar;

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => { avatarPreview.src = ev.target.result; };
    reader.readAsDataURL(file);
  });

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const subtitle = subtitleInput.value.trim();
    if (!name) { alert("请输入昵称"); return; }

    await SettingsStore.save({ name, subtitle, avatar: avatarPreview.src });
    saveBtn.textContent = "✅ 已保存";
    saveBtn.style.background = "#22c55e";
    setTimeout(() => { saveBtn.textContent = "💾 保存设置"; saveBtn.style.background = ""; }, 2000);
    applySettings();
  });

  const resetBtn = document.getElementById("settings-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (confirm("确定要恢复默认设置吗？")) {
        await SettingsStore.save({ ...SettingsStore.defaults });
        nameInput.value = SettingsStore.defaults.name;
        subtitleInput.value = SettingsStore.defaults.subtitle;
        avatarPreview.src = SettingsStore.defaults.avatar;
        applySettings();
        resetBtn.textContent = "✅ 已恢复";
        setTimeout(() => { resetBtn.textContent = "↺ 恢复默认"; }, 2000);
      }
    });
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  applySettings();
  initSettingsPage();
});
