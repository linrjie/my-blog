renderArticleList("article-list");
initDailyQuote();
var allTags=[...new Set(articles.flatMap(function(a){return a.tags}))];
var tagsEl=document.getElementById("sidebar-tags");
if(tagsEl){tagsEl.innerHTML=allTags.slice(0,12).map(function(t){return '<a href="tags.html?tag='+encodeURIComponent(t)+'" class="sidebar-tag">'+t+'</a>'}).join("")}
var recentEl=document.getElementById("sidebar-recent");
if(recentEl){recentEl.innerHTML=articles.slice(0,3).map(function(a){return '<a href="article.html?id='+a.id+'" class="sidebar-recent-item"><div class="sidebar-recent-title">'+a.title+'</div><div class="sidebar-recent-date">'+a.date+'</div></a>'}).join("")}
document.getElementById("stat-tags").textContent=allTags.length;
var si=document.getElementById("search-sidebar");var dt;
if(si){si.addEventListener("input",function(){clearTimeout(dt);dt=setTimeout(function(){var q=si.value;var r=searchArticles(q);var c=document.getElementById("article-list");if(!c)return;if(r.length===0){c.innerHTML='<p style="text-align:center;color:var(--text-muted);padding:40px 0">没有找到匹配的文章</p>';return}c.innerHTML=r.map(function(a){return '<a href="article.html?id='+a.id+'" class="article-card"><div class="article-card-header"><h3 class="article-card-title">'+highlightText(a.title,q)+'</h3><span class="article-card-date">'+a.date+'</span></div><p class="article-card-summary">'+highlightText(a.excerpt,q)+'</p><div class="article-card-footer"><div class="article-card-tags">'+a.tags.map(function(t){return '<span class="article-tag">'+t+'</span>'}).join("")+'</div><span class="article-card-reading">5 min</span></div></a>'}).join("")},200)})}
document.addEventListener("keydown",function(e){if(e.key==="/"){e.preventDefault();if(si)si.focus()}if(e.key==="Escape"){if(si)si.blur()}});
window.addEventListener("scroll",function(){var b=document.getElementById("back-top");if(b){b.classList.toggle("visible",window.scrollY>300)}});
document.getElementById("back-top").addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});
document.getElementById("nav-toggle").addEventListener("click",function(){document.getElementById("nav-links").classList.toggle("open");document.getElementById("nav-overlay").classList.toggle("active")});
document.getElementById("nav-overlay").addEventListener("click",function(){document.getElementById("nav-links").classList.remove("open");document.getElementById("nav-overlay").classList.remove("active")});
document.getElementById("search-btn").addEventListener("click",function(){if(si)si.focus()});
document.getElementById("theme-btn").addEventListener("click",function(){toggleTheme()});
async function applyHero(){var s=await SettingsStore.get();document.getElementById("hero-name").textContent=s.name;document.getElementById("hero-card-name").textContent=s.name;document.getElementById("hero-card-desc").textContent=s.subtitle}
applyHero();
