// ===== Tags Page Logic =====
function initTagsPage() {
  const cloudEl = document.getElementById("tags-cloud");
  const listEl = document.getElementById("tags-articles");
  if (!cloudEl || !listEl) return;

  // Collect all tags
  const tagMap = {};
  articles.forEach((a) => {
    a.tags.forEach((t) => {
      if (!tagMap[t]) tagMap[t] = [];
      tagMap[t].push(a);
    });
  });

  const tags = Object.keys(tagMap).sort();

  // Render tag cloud
  cloudEl.innerHTML = tags
    .map(
      (t) =>
        `<span class="tag" data-tag="${t}">${t} (${tagMap[t].length})</span>`
    )
    .join("");

  // Check URL for pre-selected tag
  const params = new URLSearchParams(window.location.search);
  const preTag = params.get("tag");

  let currentTag = preTag && tagMap[preTag] ? preTag : null;

  // Pre-highlight tag in cloud
  if (currentTag) {
    cloudEl.querySelectorAll(".tag").forEach((el) => {
      if (el.dataset.tag === currentTag) el.classList.add("active");
    });
  }

  function render() {
    const targetTag = currentTag;
    const displayTags = targetTag ? [targetTag] : tags;

    listEl.innerHTML = displayTags
      .map(
        (t) => `
        <div class="tag-section">
          <h3>${t}</h3>
          ${tagMap[t]
            .map(
              (a) => `
            <article class="article-card" onclick="location.href='article.html?id=${a.id}'">
              <div class="article-cover">
                <img src="${a.cover}" alt="cover" loading="lazy" />
                <div class="article-cover-overlay"></div>
              </div>
              <div class="article-card-body">
                <div class="article-card-header">
                  <h2>${a.title}</h2>
                  <span class="date">${a.date}</span>
                </div>
                <p class="excerpt">${a.excerpt}</p>
              </div>
            </article>
          `
            )
            .join("")}
        </div>
      `
      )
      .join("");
  }

  // Click handler
  cloudEl.addEventListener("click", (e) => {
    const tag = e.target.dataset.tag;
    if (!tag) return;

    if (currentTag === tag) {
      currentTag = null;
      e.target.classList.remove("active");
    } else {
      currentTag = tag;
      cloudEl
        .querySelectorAll(".tag")
        .forEach((el) => el.classList.remove("active"));
      e.target.classList.add("active");
    }
    render();
  });

  render();
}

document.addEventListener("DOMContentLoaded", initTagsPage);
