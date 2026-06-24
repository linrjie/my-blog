// ===== Projects Data =====
var projects = [
  {
    name: "MyBlog",
    description: "个人博客系统，支持跨设备数据同步、Markdown编辑、图集管理等功能。",
    icon: "📝",
    techStack: ["HTML", "CSS", "JavaScript", "Supabase"],
    github: "https://github.com/linrjie/my-blog",
    demo: "https://linrjie.github.io/my-blog/"
  },
  {
    name: "Vue Admin Dashboard",
    description: "基于Vue3的后台管理模板，包含权限管理、数据可视化、国际化等功能。",
    icon: "📊",
    techStack: ["Vue3", "TypeScript", "Element Plus", "Pinia"],
    github: "https://github.com/linrjie/vue-admin",
    demo: ""
  },
  {
    name: "Node.js API Server",
    description: "RESTful API服务框架，支持JWT认证、限流、日志记录等企业级功能。",
    icon: "⚙️",
    techStack: ["Node.js", "Express", "MongoDB", "Redis"],
    github: "https://github.com/linrjie/api-server",
    demo: ""
  }
];

function renderProjectList(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = projects.map(function(p) {
    var links = '';
    if (p.github) links += '<a href="' + p.github + '" class="project-link" target="_blank">GitHub</a>';
    if (p.demo) links += '<a href="' + p.demo + '" class="project-link" target="_blank">Demo</a>';
    
    return '<div class="project-card">' +
      '<div class="project-card-header">' +
        '<span class="project-card-icon">' + p.icon + '</span>' +
        '<div class="project-card-links">' + links + '</div>' +
      '</div>' +
      '<h3 class="project-card-name">' + p.name + '</h3>' +
      '<p class="project-card-desc">' + p.description + '</p>' +
      '<div class="project-card-tech">' +
        p.techStack.map(function(t) { return '<span class="project-tech-tag">' + t + '</span>'; }).join("") +
      '</div>' +
    '</div>';
  }).join("");
}
