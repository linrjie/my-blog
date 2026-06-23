// ===== 文章数据 =====
const articles = [
  {
    id: 1,
    title: "用 JavaScript 实现一个简易模板引擎",
    date: "2026-06-20",
    tags: ["JavaScript", "前端"],
    cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    excerpt:
      "模板引擎是 Web 开发中不可或缺的工具。本文将从零开始，用不到 50 行代码实现一个支持变量替换、条件判断和循环的模板引擎。",
    content: `
      <p>模板引擎是 Web 开发中不可或缺的工具，它让我们能够将数据和展示逻辑分离。市面上有很多成熟的模板引擎，但了解其原理对提升编程能力大有裨益。</p>

      <h2>基本原理</h2>
      <p>模板引擎的核心思路很简单：接收一个模板字符串和一个数据对象，通过字符串替换生成最终的 HTML 内容。</p>

      <h2>实现变量替换</h2>
      <p>最基础的功能是变量替换。我们使用 <code>{{variable}}</code> 作为占位符：</p>
      <pre><code>function render(template, data) {
  return template.replace(/\\{\\{(\\w+)\\}\\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}</code></pre>

      <h2>添加条件判断</h2>
      <p>接下来支持 <code>{{#if}}</code> 语法：</p>
      <pre><code>// 模板: {{#if show}}&lt;p&gt;可见&lt;/p&gt;{{/if}}
function parseConditionals(template, data) {
  return template.replace(
    /\\{\\{#if (\\w+)\\}\\}([\\s\\S]*?)\\{\\{\\/if\\}\\}/g,
    (match, key, content) => data[key] ? content : ''
  );
}</code></pre>

      <h2>总结</h2>
      <p>虽然这个实现非常简化，但它展示了模板引擎的核心原理。在实际项目中，你可能还需要考虑转义、嵌套、错误处理等问题。理解这些基础概念后，使用任何模板引擎都会更加得心应手。</p>
    `,
  },
  {
    id: 2,
    title: "CSS Grid 布局完全指南",
    date: "2026-06-15",
    tags: ["CSS", "前端", "布局"],
    cover: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80",
    excerpt:
      "Grid 布局是 CSS 中最强大的布局系统。本文将通过实际案例，带你全面掌握 Grid 的核心概念和常用技巧。",
    content: `
      <p>CSS Grid 是一个二维布局系统，它能同时处理行和列，让复杂的页面布局变得简单直观。</p>

      <h2>基本概念</h2>
      <p>Grid 布局引入了几个核心概念：</p>
      <ul>
        <li><strong>Grid Container</strong> — 设置 <code>display: grid</code> 的元素</li>
        <li><strong>Grid Item</strong> — 容器的直接子元素</li>
        <li><strong>Grid Line</strong> — 网格线，构成网格的基础</li>
        <li><strong>Grid Track</strong> — 相邻两条网格线之间的空间</li>
      </ul>

      <h2>创建网格</h2>
      <pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}</code></pre>

      <h2>实战：响应式卡片布局</h2>
      <p>使用 <code>auto-fill</code> 和 <code>minmax</code> 可以轻松实现响应式布局：</p>
      <pre><code>.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}</code></pre>

      <blockquote>Grid 和 Flexbox 不是竞争关系，而是互补的工具。Grid 擅长二维布局，Flexbox 擅长一维布局。</blockquote>

      <h2>总结</h2>
      <p>CSS Grid 极大地简化了复杂布局的实现。掌握它之后，你会发现很多以前需要 hack 才能实现的布局，现在只需要几行代码。</p>
    `,
  },
  {
    id: 3,
    title: "从零搭建一个 RESTful API",
    date: "2026-06-08",
    tags: ["Node.js", "后端", "Express"],
    cover: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    excerpt:
      "手把手教你用 Node.js 和 Express 从零搭建一个完整的 RESTful API，包含路由设计、错误处理和数据验证。",
    content: `
      <p>构建 RESTful API 是现代 Web 开发的基本技能。本文将使用 Node.js 和 Express 框架，从零搭建一个结构清晰的 API 服务。</p>

      <h2>项目初始化</h2>
      <pre><code>mkdir my-api && cd my-api
npm init -y
npm install express cors</code></pre>

      <h2>基础服务器</h2>
      <pre><code>const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});</code></pre>

      <h2>设计路由</h2>
      <p>遵循 RESTful 规范设计路由：</p>
      <ul>
        <li><code>GET /api/posts</code> — 获取文章列表</li>
        <li><code>GET /api/posts/:id</code> — 获取单篇文章</li>
        <li><code>POST /api/posts</code> — 创建文章</li>
        <li><code>PUT /api/posts/:id</code> — 更新文章</li>
        <li><code>DELETE /api/posts/:id</code> — 删除文章</li>
      </ul>

      <h2>错误处理</h2>
      <p>统一的错误处理中间件能让 API 更加健壮：</p>
      <pre><code>app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});</code></pre>

      <h2>总结</h2>
      <p>一个结构良好的 API 是应用成功的基础。在实际开发中，你还需要考虑认证授权、限流、日志记录等更多方面。</p>
    `,
  },
  {
    id: 4,
    title: "Git 工作流最佳实践",
    date: "2026-05-28",
    tags: ["Git", "工具"],
    cover: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    excerpt:
      "团队协作中良好的 Git 工作流至关重要。本文介绍几种主流的 Git 工作流模式，以及如何在实际项目中选择合适的方案。",
    content: `
      <p>在团队协作中，规范的 Git 工作流能够显著提升开发效率，减少合并冲突和代码混乱。</p>

      <h2>Git Flow</h2>
      <p>Git Flow 是最经典的分支管理策略，适合有明确发布周期的项目：</p>
      <ul>
        <li><strong>main</strong> — 生产环境代码</li>
        <li><strong>develop</strong> — 开发分支</li>
        <li><strong>feature/*</strong> — 功能分支</li>
        <li><strong>release/*</strong> — 发布分支</li>
        <li><strong>hotfix/*</strong> — 紧急修复分支</li>
      </ul>

      <h2>Trunk-Based Development</h2>
      <p>对于持续交付的团队，主干开发可能更合适：</p>
      <pre><code># 频繁地从 main 创建短命分支
git checkout -b quick-fix main
# 快速开发并合并
git checkout main
git merge quick-fix</code></pre>

      <h2>Commit 规范</h2>
      <p>好的提交信息是项目历史的宝贵财富：</p>
      <pre><code>feat: 添加用户注册功能
fix: 修复登录页面样式问题
docs: 更新 API 文档
refactor: 重构认证模块</code></pre>

      <h2>总结</h2>
      <p>没有放之四海而皆准的最佳工作流。选择适合团队规模和项目特点的方案，并坚持执行，才是最重要的。</p>
    `,
  },
];

// ===== 日志数据 =====
const changelog = [
  {
    date: "2026-06-23",
    version: "v1.6.0",
    changes: [
      { type: "feat", text: "新增友链页面，支持添加、编辑、删除友情链接" },
      { type: "feat", text: "友链支持上传自定义头像，不上传自动生成" },
      { type: "feat", text: "友链数据云端同步，多设备可见" },
      { type: "feat", text: "新增友链申请模板，方便他人交换友链" },
      { type: "improve", text: "导航栏新增友链入口" },
    ],
  },
  {
    date: "2026-06-23",
    version: "v1.5.0",
    changes: [
      { type: "feat", text: "新增设置页面，支持自定义昵称、简介和头像" },
      { type: "feat", text: "设置实时预览，保存后立即生效到所有页面" },
      { type: "feat", text: "导航栏新增设置入口（⚙️ 图标）" },
      { type: "feat", text: "支持主题切换（浅色/深色）和数据清除" },
      { type: "improve", text: "所有页面自动读取并应用个性化设置" },
    ],
  },
  {
    date: "2026-06-23",
    version: "v1.4.0",
    changes: [
      { type: "feat", text: "首页新增桌面小组件：时钟、在线时长、数据统计、天气、快捷导航" },
      { type: "feat", text: "笔记页面新增 Markdown 编辑器，支持实时预览" },
      { type: "feat", text: "Markdown 编辑器支持工具栏：粗体、斜体、标题、代码、列表、表格等" },
      { type: "feat", text: "笔记内容使用 Markdown 格式存储和渲染" },
      { type: "improve", text: "首页改为两栏布局：内容 + 侧边栏小组件" },
    ],
  },
  {
    date: "2026-06-23",
    version: "v1.3.0",
    changes: [
      { type: "feat", text: "新增个人笔记页面，支持创建笔记、上传附件" },
      { type: "feat", text: "新增留言板页面，支持留言和附图上传" },
      { type: "feat", text: "新增图集页面，支持拖拽上传、灯箱预览" },
      { type: "feat", text: "所有数据使用 localStorage 持久化存储" },
      { type: "improve", text: "参考 xinghuisama.top 全面升级为毛玻璃风格" },
      { type: "improve", text: "添加动态背景轮播、萤火虫粒子、渐变光晕" },
      { type: "improve", text: "导航栏新增笔记、留言、图集入口" },
    ],
  },
  {
    date: "2026-06-23",
    version: "v1.2.0",
    changes: [
      { type: "feat", text: "添加文章搜索功能，支持按标题和内容实时筛选" },
      { type: "feat", text: "新增日志页面，记录博客更新历史" },
      { type: "feat", text: "为每篇文章添加封面图片" },
      { type: "feat", text: "添加返回顶部按钮" },
      { type: "feat", text: "文章详情页新增相关推荐" },
      { type: "improve", text: "优化导航栏，新增日志入口" },
    ],
  },
  {
    date: "2026-06-20",
    version: "v1.1.0",
    changes: [
      { type: "feat", text: "新增标签筛选页面" },
      { type: "feat", text: "新增关于我页面" },
      { type: "feat", text: "支持深色/浅色主题切换" },
      { type: "improve", text: "优化移动端响应式布局" },
    ],
  },
  {
    date: "2026-06-15",
    version: "v1.0.0",
    changes: [
      { type: "feat", text: "博客初始版本发布" },
      { type: "feat", text: "首页文章列表展示" },
      { type: "feat", text: "文章详情页" },
    ],
  },
];

// ===== 生成封面 HTML =====
function renderCover(cover) {
  if (!cover) return "";
  return `
    <div class="article-cover">
      <img src="${cover}" alt="cover" loading="lazy" />
      <div class="article-cover-overlay"></div>
    </div>`;
}

// ===== 搜索文章 =====
function searchArticles(query) {
  if (!query || !query.trim()) return articles;
  const q = query.toLowerCase().trim();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
  );
}

// ===== 渲染文章列表 =====
function renderArticleList(containerId, filterTag) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = filterTag
    ? articles.filter((a) => a.tags.includes(filterTag))
    : articles;

  if (filtered.length === 0) {
    container.innerHTML =
      '<p class="empty-state">😕 没有找到匹配的文章</p>';
    return;
  }

  container.innerHTML = filtered
    .map(
      (a) => `
    <article class="article-card" onclick="location.href='article.html?id=${a.id}'">
      ${renderCover(a.cover)}
      <div class="article-card-body">
        <div class="article-card-header">
          <h2>${a.title}</h2>
          <span class="date">${a.date}</span>
        </div>
        <p class="excerpt">${a.excerpt}</p>
        <div class="tags">
          ${a.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
      </div>
    </article>
  `
    )
    .join("");
}

// ===== 渲染文章详情 =====
function renderArticleDetail() {
  const container = document.getElementById("article-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  const article = articles.find((a) => a.id === id);

  if (!article) {
    container.innerHTML =
      '<p class="empty-state" style="padding:80px 0">😕 文章不存在</p>';
    return;
  }

  document.title = article.title + " - 我的博客";

  // 相关推荐：同标签的其他文章
  const related = articles
    .filter((a) => a.id !== id && a.tags.some((t) => article.tags.includes(t)))
    .slice(0, 3);

  const relatedHTML =
    related.length > 0
      ? `
    <div class="related-section">
      <h3 class="section-title">📖 相关推荐</h3>
      <div class="related-list">
        ${related
          .map(
            (r) => `
          <a href="article.html?id=${r.id}" class="related-card">
            <div class="article-cover">
              <img src="${r.cover}" alt="cover" loading="lazy" />
              <div class="article-cover-overlay"></div>
            </div>
            <div class="related-card-body">
              <h4>${r.title}</h4>
              <span class="date">${r.date}</span>
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </div>`
      : "";

  container.innerHTML = `
    <nav class="breadcrumb">
      <a href="index.html">首页</a>
      <span class="breadcrumb-sep">›</span>
      <span>${article.title}</span>
    </nav>
    <div style="border-radius:var(--radius);overflow:hidden;margin-bottom:28px">
      ${renderCover(article.cover)}
    </div>
    <div class="article-header">
      <h1>${article.title}</h1>
      <div class="article-meta">
        <span>${article.date}</span>
        <div class="tags">
          ${article.tags
            .map(
              (t) =>
                `<a class="tag" href="tags.html?tag=${encodeURIComponent(t)}">${t}</a>`
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="article-content">
      ${article.content}
    </div>
    ${relatedHTML}
  `;
}

// ===== 渲染日志页 =====
function renderChangelog() {
  const container = document.getElementById("changelog-list");
  if (!container) return;

  const typeMap = {
    feat: { label: "新增", cls: "cl-feat" },
    improve: { label: "优化", cls: "cl-improve" },
    fix: { label: "修复", cls: "cl-fix" },
  };

  container.innerHTML = changelog
    .map(
      (entry) => `
    <div class="changelog-entry">
      <div class="changelog-header">
        <span class="changelog-version">${entry.version}</span>
        <span class="changelog-date">${entry.date}</span>
      </div>
      <ul class="changelog-changes">
        ${entry.changes
          .map((c) => {
            const t = typeMap[c.type] || typeMap.feat;
            return `<li><span class="changelog-type ${t.cls}">${t.label}</span>${c.text}</li>`;
          })
          .join("")}
      </ul>
    </div>
  `
    )
    .join("");
}

// ===== 首页搜索绑定 =====
function initSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;

  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value;
      const results = searchArticles(query);
      const container = document.getElementById("article-list");
      if (!container) return;

      if (results.length === 0) {
        container.innerHTML =
          '<p class="empty-state">😕 没有找到匹配的文章</p>';
        return;
      }

      container.innerHTML = results
        .map(
          (a) => `
        <article class="article-card" onclick="location.href='article.html?id=${a.id}'">
          ${renderCover(a.cover)}
          <div class="article-card-body">
            <div class="article-card-header">
              <h2>${highlightText(a.title, query)}</h2>
              <span class="date">${a.date}</span>
            </div>
            <p class="excerpt">${highlightText(a.excerpt, query)}</p>
            <div class="tags">
              ${a.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
            </div>
          </div>
        </article>
      `
        )
        .join("");
    }, 200);
  });
}

// ===== 高亮搜索关键词 =====
function highlightText(text, query) {
  if (!query || !query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="search-highlight">$1</mark>'
  );
}
