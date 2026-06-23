// ===== Gallery Module (with cross-device sync) =====

async function renderGallery() {
  const container = document.getElementById("gallery-grid");
  if (!container) return;

  const photos = await DB.get("gallery");

  if (photos.length === 0) {
    container.innerHTML =
      '<p class="empty-state" style="grid-column:1/-1">📷 图集还是空的，上传第一张照片吧！</p>';
    return;
  }

  container.innerHTML = photos
    .map(
      (p) => `
    <div class="gallery-item" onclick="openLightbox('${p.data.slice(0, 50)}...')">
      <img src="${p.data}" alt="${escapeHtml(p.caption || "photo")}" loading="lazy" />
      <button class="gallery-delete" onclick="event.stopPropagation();deletePhoto('${p.id}')" title="删除">✕</button>
      ${p.caption ? `<div class="gallery-caption">${escapeHtml(p.caption)}</div>` : ""}
    </div>
  `
    )
    .join("");
}

async function uploadPhotos(files) {
  const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length === 0) { alert("请选择图片文件"); return; }

  let loaded = 0;
  const photos = [];

  for (const file of imageFiles) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      photos.push({
        id: Date.now() + loaded,
        data: e.target.result,
        caption: file.name.replace(/\.[^.]+$/, ""),
        createdAt: new Date().toLocaleString("zh-CN"),
      });
      loaded++;
      if (loaded === imageFiles.length) {
        const existing = await DB.get("gallery");
        await DB.set("gallery", [...photos, ...existing]);
        renderGallery();
      }
    };
    reader.readAsDataURL(file);
  }
}

async function deletePhoto(id) {
  if (confirm("确定要删除这张照片吗？")) {
    await DB.remove("gallery", id);
    renderGallery();
  }
}

function initGalleryDragDrop() {
  const zone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("gallery-file-input");
  if (!zone || !fileInput) return;

  zone.addEventListener("click", () => fileInput.click());
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    uploadPhotos(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", () => {
    uploadPhotos(fileInput.files);
    fileInput.value = "";
  });
}

function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const photos = JSON.parse(localStorage.getItem("myblog_gallery") || "[]");
  const photo = photos.find(p => p.data.startsWith(src));
  lb.querySelector("img").src = photo ? photo.data : src;
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
  renderGallery();
  initGalleryDragDrop();
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  window.addEventListener("db-sync", (e) => {
    if (e.detail.collection === "gallery") renderGallery();
  });
});
