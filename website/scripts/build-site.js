#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { resolvePath, resolveSlug, SLUG_MAP } = require('./slug-map');
const { getRouteContext, validateRoutes } = require('./route-registry');

// ─── Safe YAML Parse ──────────────────────────────────────────────────────

function safeMatter(raw) {
  try {
    return matter(raw);
  } catch (e) {
    // YAML 解析失败时，将整个文件作为正文
    console.warn(`  ⚠ YAML parse error, treating as plain markdown: ${e.message.split('\n')[0]}`);
    return { data: {}, content: raw };
  }
}

// ─── Config ────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '../..');
const WEBSITE = path.resolve(__dirname, '..');
const OUT = path.join(WEBSITE, 'site');
const TEMPLATE_DIR = path.join(WEBSITE, 'site-template');

// Base path for GitHub Pages (e.g., '/gulou/' for https://user.github.io/gulou/)
// Set via environment variable or defaults to '/' for local dev
const BASE_PATH = process.env.BASE_PATH || '/';

function siteUrl(rel) {
  const base = BASE_PATH === '/' ? '' : BASE_PATH.replace(/\/$/, '');
  return `${base}/${String(rel).replace(/^\/+/, '')}`;
}

const CONTENT_DIRS = ['stages', 'interests', 'paths', 'references'];

// 跳过的文件/目录
const SKIP = new Set(['.git', '.claude', '.sisyphus', 'node_modules', 'CLAUDE.md', 'CONTRIBUTING.md']);

// ─── Helpers ───────────────────────────────────────────────────────────────

/** 递归收集目录下所有非 .md 文件（图片等静态资源） */
function collectAssets(dir, base) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectAssets(full, base));
    } else if (!entry.name.endsWith('.md')) {
      const rel = path.relative(base, full);
      results.push({ full, rel });
    }
  }
  return results;
}

/** 递归收集目录下所有 .md 文件 */
function collectMdFiles(dir, base) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMdFiles(full, base));
    } else if (entry.name.endsWith('.md')) {
      const rel = path.relative(base, full);
      results.push({ full, rel });
    }
  }
  return results;
}

/** 将 Markdown 中的相对链接重写为 HTML 路径 */
function rewriteLinks(html, sourceRelPath) {
  // 匹配 href="xxx.md" 或 href="xxx/yyy.md" 形式的相对链接
  // marked 会 URL 编码中文字符，所以需要先解码
  const rewrittenMarkdown = html.replace(/href="([^"]*\.md)(#[^"]*)?"/g, (match, href, anchor = '') => {
    // 跳过绝对 URL 和锚点
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
      return match;
    }

    // 解码 URL 编码的中文字符
    const decoded = decodeURIComponent(href);

    // 解析相对路径
    const sourceDir = path.dirname(sourceRelPath);
    let resolved;
    if (decoded.startsWith('/')) {
      resolved = decoded.slice(1);
    } else {
      resolved = path.normalize(path.join(sourceDir, decoded));
    }

    // 应用 slug 映射
    const htmlPath = resolvePath(resolved);
    return `href="${siteUrl(htmlPath)}${anchor}"`;
  });

  return rewrittenMarkdown.replace(/href="\/(?!\/)([^"]*)"/g, (match, href) => {
    const base = BASE_PATH === '/' ? '' : BASE_PATH.replace(/\/$/, '').replace(/^\//, '');
    if (base && (href === base || href.startsWith(`${base}/`))) return match;
    return `href="${siteUrl(href)}"`;
  });
}

/** 从 frontmatter 或正文提取页面描述 */
function extractDescription(fm, bodyHtml) {
  if (fm.description) return fm.description;
  if (fm.topic) return fm.topic;
  // 从第一段提取
  const match = bodyHtml.match(/<p>(.*?)<\/p>/);
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').slice(0, 160);
  }
  return '鼓楼 — 覆盖全人生阶段的成长知识库';
}

/** 从 frontmatter 提取标题 */
function extractTitle(fm, bodyHtml) {
  if (fm.topic) return fm.topic;
  if (fm.name) return fm.name;
  if (fm.stage_name) return fm.stage_name;
  // 从 h1 提取
  const match = bodyHtml.match(/<h1[^>]*>(.*?)<\/h1>/);
  if (match) return match[1].replace(/<[^>]+>/g, '');
  return '鼓楼';
}

/** 渲染 frontmatter 元信息卡片 */
function renderMetaCard(fm) {
  const items = [];

  if (fm.age_range) {
    items.push(`<span class="meta-item"><strong>适用年龄：</strong>${fm.age_range}</span>`);
  }
  if (fm.difficulty) {
    items.push(`<span class="meta-item"><strong>难度：</strong>${fm.difficulty}</span>`);
  }
  if (fm.domain) {
    items.push(`<span class="meta-item"><strong>领域：</strong>${fm.domain}</span>`);
  }
  if (fm.track) {
    items.push(`<span class="meta-item"><strong>主线：</strong>${fm.track}</span>`);
  }
  if (fm.review_status) {
    const statusMap = { draft: '草稿', reviewed: '已审核', published: '已发布' };
    items.push(`<span class="meta-item"><strong>状态：</strong>${statusMap[fm.review_status] || fm.review_status}</span>`);
  }
  if (fm.tags && fm.tags.length) {
    items.push(fm.tags.map(t => `<span class="tag">${t}</span>`).join(' '));
  }

  if (items.length === 0) return '';
  return `<div class="meta-card">${items.join('\n')}</div>`;
}

/** 渲染参考文献 */
function renderReferences(fm) {
  if (!fm.references || fm.references.length === 0) return '';
  const items = fm.references.map(r => `<li>${r}</li>`).join('\n');
  return `\n<h2>参考文献</h2>\n<ul class="references">${items}</ul>`;
}

/** 构建侧边栏导航 HTML */
function pageLabel(page) {
  if (!page) return '';
  if (page.fm && (page.fm.topic || page.fm.name || page.fm.stage_name)) {
    return page.fm.topic || page.fm.name || page.fm.stage_name;
  }
  const baseName = path.basename(page.rel, '.md');
  return baseName === '_index' ? '概述' : baseName.replace(/[-_]+/g, ' ');
}

function buildFallbackSidebar(currentRelPath, allFiles) {
  const currentDir = path.dirname(currentRelPath);

  // 找到同目录的兄弟文件
  const siblings = allFiles
    .filter(f => path.dirname(f.rel) === currentDir)
    .sort((a, b) => {
      // _index.md 排最前
      if (a.rel.endsWith('_index.md')) return -1;
      if (b.rel.endsWith('_index.md')) return 1;
      return path.basename(a.rel).localeCompare(path.basename(b.rel));
    });

  if (siblings.length <= 1) return '';

  const links = siblings.map(f => {
    const slug = resolvePath(f.rel);
    const isActive = f.rel === currentRelPath ? ' class="active"' : '';
    return `<a href="${siteUrl(slug)}"${isActive}>${pageLabel(f)}</a>`;
  }).join('\n');

  // 上级目录链接
  const parentSlug = resolvePath(currentDir + '/_index.md').replace('index.html', '');
  const backLink = currentDir.includes('/')
    ? `<a href="${siteUrl(parentSlug)}" class="back-link">← 返回上级</a>`
    : '';

  return `${backLink}\n<nav class="sidebar-nav">\n${links}\n</nav>`;
}

function buildSidebar(currentRelPath, registry) {
  const context = getRouteContext(currentRelPath, registry);
  if (context) {
    const route = context.route || (context.referencedBy[0] && context.referencedBy[0].route);
    if (route) {
      const steps = context.steps.length ? context.steps : [route];
      const links = steps.map(step => {
        const active = step.rel === currentRelPath ? ' class="active"' : '';
        return `<a href="${siteUrl(resolvePath(step.rel))}"${active}>${pageLabel(step)}</a>`;
      }).join('\n');
      const routeIndex = route.rel.replace(/\/[^/]+$/, '/_index.md');
      const backLink = registry.byRel.has(routeIndex)
        ? `<a href="${siteUrl(resolvePath(routeIndex))}" class="back-link">← 返回路线</a>`
        : '';
      return `${backLink}\n<div class="nav-section">${route.fm.route_label || pageLabel(route)}</div>\n<nav class="sidebar-nav route-steps">\n${links}\n</nav>`;
    }
  }
  return buildFallbackSidebar(currentRelPath, Array.from(registry.byRel.values()));
}

function renderTopNav() {
  return `<nav class="top-nav">
    <a href="${siteUrl('')}" class="logo">
      <img src="${siteUrl('assets/logo.png')}" alt="鼓楼" class="logo-img">
      <span>鼓楼</span>
    </a>
    <a href="${siteUrl('stages/')}">人生阶段</a>
    <a href="${siteUrl('references/')}">知识参考</a>
    <a href="https://github.com/JohnnyChenS/gulou/blob/main/CONTRIBUTING.md">参与贡献</a>
    <a href="https://github.com/JohnnyChenS/gulou">GitHub</a>
  </nav>`;
}

function renderRouteNav(context) {
  if (!context) return '';
  const route = context.route;
  const activeRoute = route || (context.referencedBy[0] && context.referencedBy[0].route);
  if (!activeRoute) return '';
  const steps = context.steps.length ? context.steps : [activeRoute];
  const currentIndex = route ? steps.findIndex(step => step.rel === route.rel) : context.articleIndex;
  const stepText = currentIndex >= 0 ? `第 ${currentIndex + 1} 步 / 共 ${steps.length} 步` : '从这条路线开始';
  const stepLinks = steps.map((step, index) => {
    const active = step.rel === (route && route.rel) || step.rel === context.currentRel
      ? ' class="route-step active"' : ' class="route-step"';
    return `<a href="${siteUrl(resolvePath(step.rel))}"${active}><span>${index + 1}</span>${pageLabel(step)}</a>`;
  }).join('');
  const previousPage = route ? context.previous : context.articlePrevious;
  const nextPage = route ? context.next : context.articleNext;
  const previous = previousPage
    ? `<a class="route-prev" href="${siteUrl(resolvePath(previousPage.rel))}">← 上一步：${pageLabel(previousPage)}</a>`
    : '';
  const next = nextPage
    ? `<a class="route-next" href="${siteUrl(resolvePath(nextPage.rel))}">下一步：${pageLabel(nextPage)} →</a>`
    : '<span class="route-end">这条路线到这里，可以回到路线首页选择下一步。</span>';
  const back = `<a class="route-back" href="${siteUrl(resolvePath(activeRoute.rel))}">返回当前路线</a>`;
  return `<section class="route-nav" aria-label="阅读路线">
    <div class="route-summary"><span>${activeRoute.fm.route_label || pageLabel(activeRoute)}</span><small>${stepText}</small></div>
    <div class="route-steps mobile-route-nav">${stepLinks}</div>
    <div class="route-actions">${route ? previous : back}${next}</div>
  </section>`;
}

// ─── HTML Template ─────────────────────────────────────────────────────────

function renderPage({ title, description, sidebar, routeNav, metaCard, content, references, isHome }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 鼓楼</title>
  <meta name="description" content="${description}">
  <link rel="icon" type="image/png" href="${siteUrl('assets/favicon.png')}">
  <link rel="stylesheet" href="${siteUrl('assets/style.css')}">
</head>
<body>
  ${renderTopNav()}

  <div class="layout">
    ${sidebar ? `<aside class="sidebar">${sidebar}</aside>` : ''}

    <main class="content">
      <div class="content-inner">
        ${metaCard}
        ${routeNav || ''}
        ${content}
        ${references}
        <div class="ad-slot">广告位</div>
      </div>
    </main>
  </div>

  <footer class="site-footer">
    <p>内容基于 <a href="https://github.com/JohnnyChenS/gulou">鼓楼</a> 开源项目 · 采用 CC BY-SA 4.0 协议</p>
  </footer>
  <script src="${siteUrl('assets/nav.js')}"></script>
</body>
</html>`;
}

function renderHomePage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>鼓楼 — 覆盖全人生阶段的成长知识库</title>
  <meta name="description" content="鼓楼 = grow，译为“成长”。把权威的成长发展知识，整理成每个人看得懂、用得上的结构化内容。">
  <link rel="icon" type="image/png" href="${BASE_PATH}assets/favicon.png">
  <link rel="stylesheet" href="${BASE_PATH}assets/style.css">
</head>
<body>
  <nav class="top-nav">
    <a href="${BASE_PATH}" class="logo">
      <img src="${BASE_PATH}assets/logo.png" alt="鼓楼" class="logo-img">
      <span>鼓楼</span>
    </a>
    <a href="${BASE_PATH}stages/">阶段主线</a>
    <a href="${BASE_PATH}interests/">兴趣副线</a>
    <a href="${BASE_PATH}paths/">学习路径</a>
    <a href="${BASE_PATH}references/">理论依据</a>
    <a href="${BASE_PATH}roadmap.html">教育图谱</a>
  </nav>

  <div class="hero">
    <img src="${BASE_PATH}assets/logo.png" alt="鼓楼" class="hero-logo">
    <h1>鼓楼</h1>
    <p class="subtitle">鼓楼 = grow，译为“成长”。同时“鼓楼”亦是我长大的地方，拨浪鼓(logo) 是童年的声音。</p>
  </div>

  <div class="home-section">
    <h2>这是什么</h2>
    <p>一个覆盖全人生阶段的成长知识库。</p>
    <p>从出生到老年，每个阶段都有需要学习和成长的课题——语言、运动、职业发展、育儿、健康管理。这些知识分散在学术论文、专业书籍和专家观点中，普通人很难系统获取。</p>
    <p>鼓楼做的事情很简单：<strong>把权威的成长发展知识，整理成每个人看得懂、用得上的结构化内容。</strong></p>
    <p>核心是知识内容本身，不是 AI 工具。你可以直接阅读获取指导，也可以在此基础上构建个性化建议。</p>
  </div>

  <div class="home-section">
    <h2>长远愿景</h2>
    <p>鼓楼不会永远只做育儿。人生每个阶段都有需要学习和成长的课题——语言、运动、职业发展、健康管理。育儿是起点，不是终点。</p>
    <p>内容按人生阶段组织，每个阶段有独立的知识体系。除了阶段主线，还规划了跨阶段的兴趣学习路径——语言学习、音乐乐器、运动健身、艺术创作、职业技能。</p>
    <p>完整规划见 <a href="${BASE_PATH}roadmap.html">教育图谱</a>。</p>
  </div>

  <div class="home-section">
    <h2>为什么先做育儿</h2>
    <p>作者本人即将成为新手父亲。面对一个新生命的到来，和所有准父母一样，既期待又忐忑。想给孩子最好的成长环境，却不知道该关注什么、怎么引导、哪些信号需要注意。</p>
    <p>这些知识其实都有——发展心理学、教育学、儿科医学等领域积累了大量研究成果。但它们分散在学术论文和专业书籍中，普通人很难系统获取。</p>
    <p>所以鼓楼先从育儿开始：<strong>把这些权威的成长发展知识，整理成家长看得懂、用得上的结构化内容。</strong></p>
    <p>育儿内容归属在「<a href="${BASE_PATH}stages/family/">家庭期（25-45 岁）</a>」阶段下，涵盖 0-18 岁的认知与心理、身体能力两条主线，以及父母自身的心理支持。这样设计是因为养育孩子本身就是人生某个阶段的核心课题，和其他阶段的内容保持统一的组织逻辑。</p>
  </div>

  <div class="home-section">
    <h2>参与贡献</h2>
    <p>鼓楼是一个开源项目，欢迎任何人参与。你可以：</p>
    <ul>
      <li><strong>完善育儿内容</strong> — 目前 0-3 岁和 3-6 岁已有内容，6-12 岁正在补充</li>
      <li><strong>启动其他阶段</strong> — 大学期、职场发展、兴趣学习等方向都在等待启动</li>
      <li><strong>提供专业审核</strong> — 如果你是教育、心理、医学领域的从业者</li>
      <li><strong>翻译成其他语言</strong> — 让更多人受益</li>
    </ul>
    <p>贡献前请阅读 <a href="https://github.com/JohnnyChenS/gulou/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a>。</p>
  </div>

  <h2 style="text-align:center; margin-bottom:24px;">按人生阶段探索</h2>

  <div class="stage-grid">
    <a href="${BASE_PATH}stages/14-18/" class="stage-card">
      <h3>青春期（未完善）</h3>
      <p class="age">14-18 岁 · 身份探索、心理健康、学业发展</p>
    </a>
    <a href="${BASE_PATH}stages/18-22/" class="stage-card">
      <h3>大学期（未完善）</h3>
      <p class="age">18-22 岁 · 学术能力、职业探索、独立生活</p>
    </a>
    <a href="${BASE_PATH}stages/22-28/" class="stage-card">
      <h3>职场开始（未完善）</h3>
      <p class="age">22-28 岁 · 职业发展、财务规划、健康管理</p>
    </a>
    <a href="${BASE_PATH}stages/28-40/" class="stage-card">
      <h3>职场发展（未完善）</h3>
      <p class="age">28-40 岁 · 专业精通、领导力、认知发展</p>
    </a>
    <a href="${BASE_PATH}stages/family/" class="stage-card">
      <h3>家庭期</h3>
      <p class="age">25-45 岁 · 育儿指导、婚姻经营、家庭管理</p>
    </a>
    <a href="${BASE_PATH}stages/40-60/" class="stage-card">
      <h3>中年期（未完善）</h3>
      <p class="age">40-60 岁 · 智慧判断、职业传承、健康维护</p>
    </a>
    <a href="${BASE_PATH}stages/60-plus/" class="stage-card">
      <h3>老年期（未完善）</h3>
      <p class="age">60+ 岁 · 认知保持、社会连接、生命叙事</p>
    </a>
  </div>

  <h2 style="text-align:center; margin-bottom:24px;">按兴趣探索</h2>

  <div class="stage-grid" style="max-width:600px;">
    <a href="${BASE_PATH}interests/language/" class="stage-card">
      <h3>语言学习</h3>
      <p class="age">母语发展 + 英语学习</p>
    </a>
    <a href="${BASE_PATH}interests/mountaineering/" class="stage-card">
      <h3>登山</h3>
      <p class="age">从入门到自主攀登</p>
    </a>
  </div>

  <div class="ad-slot" style="max-width:700px; margin:48px auto;">广告位</div>

  <footer class="site-footer" style="margin-left:0;">
    <p>内容基于 <a href="https://github.com/JohnnyChenS/gulou">鼓楼</a> 开源项目 · 采用 CC BY-SA 4.0 协议</p>
  </footer>
</body>
</html>`;
}

function renderHomePageWithRoutes(registry) {
  const stageOrder = [
    '青春期（14-18岁）',
    '大学期（18-22岁）',
    '职场开始（22-28岁）',
    '职场发展（28-40岁）',
    '家庭期（25-45岁）',
    '中年期（40-60岁）',
    '老年期（60+岁）',
  ];
  const incompleteStages = new Set(['中年期（40-60岁）', '老年期（60+岁）']);
  const stagePages = stageOrder
    .map(name => ({ name, page: registry.byRel.get(`stages/${name}/_index.md`) }))
    .filter(({ page }) => page);
  const stageCards = stagePages.map(({ name, page }) => {
    const incomplete = incompleteStages.has(name) ? '（未完善）' : '';
    return `<a href="${siteUrl(resolvePath(page.rel))}" class="stage-card">
      <h3>${page.fm.stage_name || name}${incomplete}</h3>
      <p class="age">${page.fm.age_range || ''}</p>
    </a>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>鼓楼 — 陪你走过人生每个阶段</title>
  <meta name="description" content="一个开放的成长知识库，帮助你理解当前人生阶段，找到下一步行动。">
  <link rel="icon" type="image/png" href="${siteUrl('assets/favicon.png')}">
  <link rel="stylesheet" href="${siteUrl('assets/style.css')}">
</head>
<body>
  ${renderTopNav()}
  <div class="hero home-hero">
    <img src="${siteUrl('assets/logo.png')}" alt="鼓楼" class="hero-logo">
    <h1>鼓楼：陪你走过人生每个阶段</h1>
    <p class="subtitle">一个开放的成长知识库，帮助你理解当前阶段，找到下一步行动。</p>
  </div>

  <section class="home-section home-name">
    <h2>为什么叫鼓楼</h2>
    <p><strong>鼓楼 = grow。</strong> grow 是成长，也是这个项目想整理的事情；“鼓楼”则是作者长大的地方。首页的拨浪鼓图标，来自童年的声音。</p>
  </section>

  <section class="home-section">
    <h2>鼓楼是什么</h2>
    <p>鼓楼是一个开放的成长知识库，整理从出生到老年不同人生阶段中值得理解、练习和持续关注的主题。</p>
    <p>这里的内容来自发展心理学、教育学、儿科医学和其他专业领域，尽量写成普通家庭可以读懂、用得上的文字。</p>
  </section>

  <section class="home-section">
    <h2>项目动机</h2>
    <p>成长相关的问题常常分散在论文、专业书和不同机构的指南里。鼓楼希望把这些知识整理成清晰的阶段框架，让人在具体时刻更容易找到合适的起点。</p>
    <p>我们尤其关注那些需要在信息过多、时间有限或压力较大时做出的日常决定。</p>
  </section>

  <section class="home-section">
    <h2>项目规划</h2>
    <p>鼓楼会逐步完善人生阶段、兴趣学习和跨阶段主题的内容，并持续补充参考来源、实践方法和需要留意的信号。</p>
    <p>长期目标是帮助每个人在不同阶段理解自己的任务，形成可执行、可复盘的成长路径。</p>
  </section>

  <section class="home-section">
    <h2>现阶段目标</h2>
    <p>当前优先服务对象是 <strong>0–3 岁新手父母</strong>，帮助他们应对早期照护中的不确定和焦虑。</p>
    <p>使用方式很简单：从<strong>观察问题</strong>出发，理解它属于哪个阶段或主题，再<strong>找到下一步行动</strong>，而不是一次读完所有内容。</p>
  </section>

  <section class="home-section">
    <h2>按人生阶段探索</h2>
    <div class="stage-grid entry-grid">${stageCards}</div>
  </section>

  <section class="home-section">
    <h2>参与贡献</h2>
    <p>鼓楼是开源项目。如果你熟悉教育、心理、医学或某个兴趣领域，可以帮助补充内容、检查引用，或者把它翻译成其他语言。</p>
    <p>参与前请阅读 <a href="https://github.com/JohnnyChenS/gulou/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a>。</p>
  </section>

  <footer class="site-footer" style="margin-left:0;">
    <p>内容基于 <a href="https://github.com/JohnnyChenS/gulou">鼓楼</a> 开源项目 · 采用 CC BY-SA 4.0 协议</p>
  </footer>
</body>
</html>`;
}

// ─── Main Build ────────────────────────────────────────────────────────────

function build() {
  console.log('Building static site...');

  // 清理输出目录
  if (fs.existsSync(OUT)) {
    fs.rmSync(OUT, { recursive: true });
  }
  fs.mkdirSync(OUT, { recursive: true });

  // 复制 assets
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(TEMPLATE_DIR, 'style.css'), path.join(OUT, 'assets', 'style.css'));
  fs.copyFileSync(path.join(TEMPLATE_DIR, 'nav.js'), path.join(OUT, 'assets', 'nav.js'));

  // 复制 favicon 和 logo（预生成的静态资源）
  const staticDir = path.join(WEBSITE, 'static');
  const logoFile = path.join(staticDir, 'logo.png');
  const faviconFile = path.join(staticDir, 'favicon.png');
  if (fs.existsSync(logoFile)) {
    fs.copyFileSync(logoFile, path.join(OUT, 'assets', 'logo.png'));
    console.log('  ✓ logo.png');
  }
  if (fs.existsSync(faviconFile)) {
    fs.copyFileSync(faviconFile, path.join(OUT, 'assets', 'favicon.png'));
    console.log('  ✓ favicon.png');
  }

  // 复制 CNAME（自定义域名）
  const cnameFile = path.join(staticDir, 'CNAME');
  if (fs.existsSync(cnameFile)) {
    fs.copyFileSync(cnameFile, path.join(OUT, 'CNAME'));
    console.log('  ✓ CNAME');
  }

  // 收集所有内容文件
  const allFiles = [];
  for (const dir of CONTENT_DIRS) {
    const fullDir = path.join(ROOT, dir);
    const files = collectMdFiles(fullDir, ROOT);
    for (const file of files) {
      const raw = fs.readFileSync(file.full, 'utf-8');
      const parsed = safeMatter(raw);
      allFiles.push({ ...file, fm: parsed.data, content: parsed.content });
    }
  }

  const { registry, errors, warnings } = validateRoutes(allFiles);
  if (errors.length > 0) {
    errors.forEach(error => console.error(`  ✗ ${error}`));
    throw new Error(`Route validation failed with ${errors.length} error(s)`);
  }
  if (warnings.length > 0) console.log(`  ⚠ ${warnings.length} unreferenced knowledge pages (available for direct browsing)`);

  // 写首页
  fs.writeFileSync(path.join(OUT, 'index.html'), renderHomePageWithRoutes(registry));
  console.log('  ✓ index.html');

  // 转换 roadmap.md
  const roadmapPath = path.join(ROOT, 'roadmap.md');
  if (fs.existsSync(roadmapPath)) {
    const raw = fs.readFileSync(roadmapPath, 'utf-8');
    const { data: fm, content } = safeMatter(raw);
    const bodyHtml = marked(content);
    const title = extractTitle(fm, bodyHtml);
    const desc = extractDescription(fm, bodyHtml);
    const sidebar = buildFallbackSidebar('roadmap.md', allFiles);
    const html = renderPage({
      title,
      description: desc,
      sidebar,
      routeNav: '',
      metaCard: '',
      content: rewriteLinks(bodyHtml, 'roadmap.md'),
      references: '',
    });
    fs.writeFileSync(path.join(OUT, 'roadmap.html'), html);
    console.log('  ✓ roadmap.html');
  }

  // 转换每个内容文件
  let count = 0;
  for (const { full, rel, fm: parsedFm, content: parsedContent } of allFiles) {
    // 跳过空目录对应的 _index.md（如果目录下没有其他 md 文件）
    const dir = path.dirname(rel);
    const siblings = allFiles.filter(f => path.dirname(f.rel) === dir && f.rel !== rel);
    const isIndex = path.basename(rel) === '_index.md';

    const fm = parsedFm;
    const content = parsedContent;

    // 检查正文是否为空（只有 frontmatter 没有内容）
    if (content.trim().length === 0 && isIndex) {
      // 空的 index 文件，仍然生成页面但标记为空
      const outRel = resolvePath(rel);
      const outPath = path.join(OUT, outRel);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      const title = extractTitle(fm, '');
      const sidebar = buildSidebar(rel, registry);
      const routeNav = renderRouteNav(getRouteContext(rel, registry));
      const html = renderPage({
        title,
        description: `${title} — 鼓楼`,
        sidebar,
        routeNav,
        metaCard: renderMetaCard(fm),
        content: '<p><em>此部分内容正在编写中，敬请期待。</em></p>',
        references: '',
      });
      fs.writeFileSync(outPath, html);
      count++;
      continue;
    }

    // 跳过只有 frontmatter 的空文件
    if (content.trim().length === 0) continue;

    // Markdown → HTML
    const bodyHtml = marked(content);

    // 提取元信息
    const title = extractTitle(fm, bodyHtml);
    const desc = extractDescription(fm, bodyHtml);
    const metaCard = isIndex ? '' : renderMetaCard(fm);
    const references = isIndex ? '' : renderReferences(fm);

    // 构建侧边栏
    const sidebar = buildSidebar(rel, registry);
    const routeNav = renderRouteNav(getRouteContext(rel, registry));

    // 重写链接
    const rewritten = rewriteLinks(bodyHtml, rel);

    // 渲染完整页面
    const html = renderPage({
      title,
      description: desc,
      sidebar,
      routeNav,
      metaCard,
      content: rewritten,
      references,
    });

    // 写入输出
    const outRel = resolvePath(rel);
    const outPath = path.join(OUT, outRel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    count++;
  }

  // 复制静态资源（图片等非 .md 文件）
  let assetCount = 0;
  for (const dir of CONTENT_DIRS) {
    const fullDir = path.join(ROOT, dir);
    const assets = collectAssets(fullDir, ROOT);
    for (const { full, rel } of assets) {
      // 使用与 md 文件相同的 slug 解析获取输出路径
      const mdRel = rel.replace(/[^/]+$/, '_index.md');  // 用同目录的 _index.md 来确定 slug 前缀

      // 取同目录路径来确定 slug 的基础路径
      const dirPath = path.dirname(rel);
      let outRel;
      // 尝试用 resolvePath 解析同目录下的 _index.md 来确定 slug 映射
      const indexRel = dirPath + '/_index.md';
      const indexOut = resolvePath(indexRel);
      // 输出路径 = index 所在目录 + 原始文件名
      outRel = path.dirname(indexOut) + '/' + path.basename(rel);

      const outPath = path.join(OUT, outRel);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.copyFileSync(full, outPath);
      assetCount++;
    }
  }
  if (assetCount > 0) {
    console.log(`\n  ✓ ${assetCount} static assets copied`);
  }

  // 生成目录索引页（如果 _index.md 不存在）
  for (const dir of CONTENT_DIRS) {
    const fullDir = path.join(ROOT, dir);
    const indexPath = path.join(fullDir, '_index.md');
    if (!fs.existsSync(indexPath)) {
      // 收集子目录
      const entries = fs.readdirSync(fullDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && !SKIP.has(e.name));

      const links = entries.map(e => {
        const slug = resolveSlug(e.name);
        return `<a href="${siteUrl(`${dir}/${slug}/`)}" class="stage-card"><h3>${e.name}</h3></a>`;
      }).join('\n');

      const html = renderPage({
        title: dir === 'stages' ? '阶段主线' : dir === 'interests' ? '兴趣副线' : dir,
        description: `鼓楼 — ${dir}`,
        sidebar: '',
        routeNav: '',
        metaCard: '',
        content: `<h1>${dir === 'stages' ? '阶段主线' : dir === 'interests' ? '兴趣副线' : dir}</h1>\n<div class="stage-grid">${links}</div>`,
        references: '',
      });

      const outDir = path.join(OUT, dir);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
      console.log(`  ✓ ${dir}/index.html`);
    }
  }

  console.log(`\nDone! Generated ${count} pages in site/`);
  console.log(`  Total files: ${count + 2} (including index.html and roadmap.html)`);
}

build();
