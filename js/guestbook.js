// ===== Guestbook Module (with cross-device sync) =====

async function renderMessages() {
  const container = document.getElementById("message-list");
  if (!container) return;

  const messages = await DB.get("guestbook");

  if (messages.length === 0) {
    container.innerHTML =
      '<p class="empty-state">💬 还没有留言，来做第一个留言的人吧！</p>';
    return;
  }

  container.innerHTML = messages
    .map(
      (m) => `
    <div class="message-card">
      <button class="message-delete" onclick="deleteMessage('${m.id}')" title="删除">✕</button>
      <div class="message-header">
        <div class="message-avatar">${(m.name || "?")[0].toUpperCase()}</div>
        <div>
          <div class="message-author">${escapeHtml(m.name)}</div>
          <div class="message-time">${m.time}</div>
        </div>
      </div>
      <div class="message-body">${escapeHtml(m.content)}</div>
      ${
        m.image
          ? `<img class="message-image" src="${m.image}" alt="附图" onclick="openLightbox('${m.image}')" />`
          : ""
      }
    </div>
  `
    )
    .join("");
}

async function submitMessage() {
  const name = document.getElementById("msg-name").value.trim();
  const content = document.getElementById("msg-content").value.trim();
  const fileInput = document.getElementById("msg-image");

  if (!name) { alert("请输入昵称"); return; }
  if (!content) { alert("请输入留言内容"); return; }

  const saveMsg = async (image) => {
    await DB.add("guestbook", {
      id: Date.now(),
      name,
      content,
      image,
      time: new Date().toLocaleString("zh-CN"),
    });
    resetMsgForm();
    renderMessages();
  };

  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => saveMsg(e.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    saveMsg(null);
  }
}

async function deleteMessage(id) {
  if (confirm("确定要删除这条留言吗？")) {
    await DB.remove("guestbook", id);
    renderMessages();
  }
}

function resetMsgForm() {
  document.getElementById("msg-name").value = "";
  document.getElementById("msg-content").value = "";
  document.getElementById("msg-image").value = "";
  document.getElementById("msg-image-preview").innerHTML = "";
}

function initMsgFileUpload() {
  const input = document.getElementById("msg-image");
  const preview = document.getElementById("msg-image-preview");
  if (!input || !preview) return;

  input.addEventListener("change", () => {
    preview.innerHTML = "";
    if (input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.innerHTML = `<div class="file-preview-item"><img src="${e.target.result}" alt="preview" /><button class="remove-file" onclick="document.getElementById('msg-image').value='';this.parentElement.remove()">✕</button></div>`;
        };
        reader.readAsDataURL(file);
      }
    }
  });
}

function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  lb.querySelector("img").src = src;
  lb.classList.add("active");
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.classList.remove("active");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  renderMessages();
  initMsgFileUpload();
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  window.addEventListener("db-sync", (e) => {
    if (e.detail.collection === "guestbook") renderMessages();
  });
});
