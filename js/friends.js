// ===== Friends Module (with cross-device sync) =====

async function renderFriends() {
  const container = document.getElementById("friends-list");
  if (!container) return;

  const friends = await DB.get("friends");

  if (friends.length === 0) {
    container.innerHTML =
      '<p class="empty-state">🤝 还没有友链，添加第一个朋友吧！</p>';
    return;
  }

  container.innerHTML = friends
    .map(
      (f) => `
    <div class="friend-card">
      <div class="friend-actions">
        <button class="friend-action-btn friend-edit-btn" onclick="editFriend('${f.id}')" title="编辑">✎</button>
        <button class="friend-action-btn friend-del-btn" onclick="deleteFriend('${f.id}')" title="删除">✕</button>
      </div>
      <img class="friend-avatar" src="${f.avatar || getDefaultAvatar(f.name)}" alt="${escapeHtml(f.name)}" onerror="this.src='${getDefaultAvatar(f.name)}'" />
      <div class="friend-info">
        <div class="friend-name">${escapeHtml(f.name)}</div>
        <div class="friend-desc">${escapeHtml(f.desc || "")}</div>
        <a class="friend-link" href="${f.url || "#"}" target="_blank" rel="noopener">${f.url || "未设置链接"}</a>
      </div>
    </div>
  `
    )
    .join("");
}

function getDefaultAvatar(name) {
  const colors = ["6366f1", "a855f7", "ec4899", "f43f5e", "f97316", "22c55e", "06b6d4"];
  const color = colors[(name || "").charCodeAt(0) % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=${color}&color=fff&bold=true&size=128`;
}

async function saveFriend() {
  const name = document.getElementById("friend-name").value.trim();
  const url = document.getElementById("friend-url").value.trim();
  const desc = document.getElementById("friend-desc").value.trim();
  const avatarInput = document.getElementById("friend-avatar-input");
  const avatarPreview = document.getElementById("friend-avatar-preview");
  const editId = document.getElementById("friend-edit-id").value;

  if (!name) { alert("请输入友链名称"); return; }
  if (!url) { alert("请输入链接地址"); return; }

  const save = async (avatar) => {
    const friendData = {
      name,
      url,
      desc,
      avatar: avatar || avatarPreview.src,
      updatedAt: new Date().toLocaleString("zh-CN"),
    };

    if (editId) {
      // 编辑模式
      await DB.update("friends", editId, friendData);
    } else {
      // 新增模式
      friendData.id = Date.now();
      friendData.createdAt = new Date().toLocaleString("zh-CN");
      await DB.add("friends", friendData);
    }

    resetFriendForm();
    renderFriends();
  };

  // 如果用户选择了新头像
  if (avatarInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => save(e.target.result);
    reader.readAsDataURL(avatarInput.files[0]);
  } else {
    save(null);
  }
}

async function editFriend(id) {
  const friends = await DB.get("friends");
  const friend = friends.find((f) => String(f.id) === String(id));
  if (!friend) return;

  document.getElementById("friend-name").value = friend.name;
  document.getElementById("friend-url").value = friend.url;
  document.getElementById("friend-desc").value = friend.desc || "";
  document.getElementById("friend-edit-id").value = id;

  if (friend.avatar) {
    document.getElementById("friend-avatar-preview").src = friend.avatar;
  }

  // 滚动到表单
  document.getElementById("friend-form").scrollIntoView({ behavior: "smooth" });

  // 修改按钮文字
  const saveBtn = document.getElementById("friend-save-btn");
  saveBtn.textContent = "✏️ 更新友链";
}

async function deleteFriend(id) {
  if (confirm("确定要删除这条友链吗？")) {
    await DB.remove("friends", id);
    renderFriends();
  }
}

function resetFriendForm() {
  document.getElementById("friend-name").value = "";
  document.getElementById("friend-url").value = "";
  document.getElementById("friend-desc").value = "";
  document.getElementById("friend-avatar-input").value = "";
  document.getElementById("friend-edit-id").value = "";
  document.getElementById("friend-avatar-preview").src = getDefaultAvatar("");
  document.getElementById("friend-save-btn").textContent = "💾 添加友链";
}

function initFriendAvatarUpload() {
  const input = document.getElementById("friend-avatar-input");
  const preview = document.getElementById("friend-avatar-preview");
  if (!input || !preview) return;

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => { preview.src = ev.target.result; };
    reader.readAsDataURL(file);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  renderFriends();
  initFriendAvatarUpload();
  // 监听云端同步
  window.addEventListener("db-sync", (e) => {
    if (e.detail.collection === "friends") {
      clearTimeout(window._friendsTimer);
      window._friendsTimer = setTimeout(() => renderFriends(), 300);
    }
  });
});
