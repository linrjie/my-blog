// ===== Notes Module (with cross-device sync) =====

// ===== Render Notes List =====
async function renderNotesList() {
  const container = document.getElementById("notes-list");
  if (!container) return;

  const notes = await DB.get("notes");

  if (notes.length === 0) {
    container.innerHTML =
      '<p class="empty-state">📭 还没有笔记，快去创建第一条吧！</p>';
    return;
  }

  container.innerHTML = notes
    .map(
      (n) => `
    <div class="note-card">
      <button class="note-delete" onclick="event.stopPropagation();deleteNote('${n.id}')" title="删除">✕</button>
      <h3>${escapeHtml(n.title)}</h3>
      <div class="note-preview">${n.contentMd ? parseMarkdown(n.contentMd).replace(/<[^>]+>/g, " ").slice(0, 150) + "..." : escapeHtml(n.content || "").slice(0, 150)}</div>
      ${
        n.attachments && n.attachments.length > 0
          ? `<div class="note-attachments">${n.attachments
              .filter((a) => a.type.startsWith("image/"))
              .slice(0, 3)
              .map(
                (a) =>
                  `<img class="note-attach-thumb" src="${a.data}" alt="attachment" />`
              )
              .join("")}</div>`
          : ""
      }
      <div class="note-meta">
        <span>${n.tags ? n.tags : ""}</span>
        <span>${n.createdAt}</span>
      </div>
    </div>
  `
    )
    .join("");
}

// ===== Create Note =====
async function createNote() {
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").value.trim();
  const tags = document.getElementById("note-tags").value.trim();

  if (!title) { alert("请输入标题"); return; }
  if (!content) { alert("请输入内容"); return; }

  const fileInput = document.getElementById("note-files");
  const files = Array.from(fileInput.files);

  const saveNote = async (attachments) => {
    const note = {
      id: Date.now(),
      title,
      content,
      contentMd: content,
      tags,
      attachments: attachments || [],
      createdAt: new Date().toLocaleString("zh-CN"),
    };
    await DB.add("notes", note);
    resetNoteForm();
    renderNotesList();
  };

  if (files.length > 0) {
    let loaded = 0;
    const attachments = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        attachments.push({ name: file.name, type: file.type, data: e.target.result });
        loaded++;
        if (loaded === files.length) saveNote(attachments);
      };
      reader.readAsDataURL(file);
    });
  } else {
    saveNote([]);
  }
}

async function deleteNote(id) {
  if (confirm("确定要删除这条笔记吗？")) {
    await DB.remove("notes", id);
    renderNotesList();
  }
}

function resetNoteForm() {
  document.getElementById("note-title").value = "";
  document.getElementById("note-content").value = "";
  document.getElementById("note-tags").value = "";
  document.getElementById("note-files").value = "";
  document.getElementById("note-file-preview").innerHTML = "";
  document.getElementById("note-preview").innerHTML =
    '<p class="md-empty">开始输入内容...</p>';
}

// ===== File Preview =====
function initNoteFileUpload() {
  const input = document.getElementById("note-files");
  const preview = document.getElementById("note-file-preview");
  if (!input || !preview) return;

  input.addEventListener("change", () => {
    preview.innerHTML = "";
    Array.from(input.files).forEach((file, i) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement("div");
          div.className = "file-preview-item";
          div.innerHTML = `<img src="${e.target.result}" alt="${file.name}" /><button class="remove-file" onclick="this.parentElement.remove()">✕</button>`;
          preview.appendChild(div);
        };
        reader.readAsDataURL(file);
      } else {
        const div = document.createElement("div");
        div.className = "file-preview-item";
        div.style.cssText = "display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);font-size:0.6rem;color:var(--text-muted);text-align:center;padding:4px";
        div.innerHTML = `📄<br>${file.name.slice(0, 8)}`;
        preview.appendChild(div);
      }
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  renderNotesList();
  initNoteFileUpload();
  // 监听云端同步
  window.addEventListener("db-sync", (e) => {
    if (e.detail.collection === "notes") renderNotesList();
  });
});
