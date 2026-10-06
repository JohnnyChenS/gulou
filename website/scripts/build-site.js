#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
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

// Keep changed reading behavior and styles together when a browser caches assets.
const templateVersions = Object.fromEntries(['style.css', 'nav.js'].map(name => [
  name, createHash('sha256').update(fs.readFileSync(path.join(TEMPLATE_DIR, name))).digest('hex').slice(0, 12),
]));

function templateUrl(name) {
  return `${siteUrl(`assets/${name}`)}?v=${templateVersions[name]}`;
}

const CONTENT_DIRS = ['stages', 'interests', 'paths', 'references'];
const editorialFile = path.join(ROOT, 'docs/reading/editorial-coverage.json');
const editorialCoverage = fs.existsSync(editorialFile)
  ? JSON.parse(fs.readFileSync(editorialFile, 'utf8'))
  : { complete: false, files: [] };
const editorialPages = new Map(editorialCoverage.files.map(record => [record.path, record]));
const STAGE_ORDER = [
  '青春期（14-18岁）',
  '大学期（18-22岁）',
  '职场开始（22-28岁）',
  '职场发展（28-40岁）',
  '家庭期（25-45岁）',
  '中年期（40-60岁）',
  '老年期（60+岁）',
];

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

function headingSlug(text, used) {
  const base = String(text)
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39);/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section';
  let id = base;
  let suffix = 2;
  while (used.has(id)) id = `${base}-${suffix++}`;
  used.add(id);
  return id;
}

function markdownHeadingAnchors(content) {
  const used = new Set();
  const anchors = [];
  for (const match of String(content || '').matchAll(/<a\s+[^>]*id=["']([^"']+)["']/gi)) {
    if (!used.has(match[1])) {
      used.add(match[1]);
      anchors.push(match[1]);
    }
  }
  for (const match of String(content || '').matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const id = headingSlug(match[1].replace(/[`*_\[\]]/g, ''), used);
    if (!anchors.includes(id)) anchors.push(id);
  }
  return anchors;
}

function addHeadingIds(html) {
  const used = new Set();
  for (const match of String(html).matchAll(/\sid="([^"]+)"/g)) used.add(match[1]);
  return String(html).replace(/<h([1-6])>(.*?)<\/h\1>/g, (match, level, inner) => {
    const id = headingSlug(inner, used);
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
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
    const age = String(fm.age_range)
      .replace(/^prenatal-(\d+)m$/, '产前至$1个月')
      .replace(/^(\d+)-(\d+)([ym])$/, (_match, start, end, unit) => `${start}–${end}${unit === 'y' ? '岁' : '个月'}`)
      .replace(/^(\d+)(?:y\+|\+y)$/, '$1岁及以上');
    items.push(`<span class="meta-item"><strong>适用年龄：</strong>${escapeHtml(age)}</span>`);
  }
  if (fm.review_status) {
    const statusMap = { draft: '草稿', planned: '规划中', reviewed: '已审核', published: '已发布' };
    items.push(`<span class="meta-item"><strong>状态：</strong>${escapeHtml(statusMap[fm.review_status] || fm.review_status)}</span>`);
  }

  if (items.length === 0) return '';
  return `<div class="meta-card">${items.join('\n')}</div>`;
}

/** 渲染参考文献 */
function renderReferences(fm) {
  if (fm.references == null) return '';
  if (!Array.isArray(fm.references) || fm.references.some(reference => typeof reference !== 'string')) {
    throw new Error(`References must be text entries; quote YAML values containing a colon: ${fm.id || fm.topic || fm.name}`);
  }
  if (fm.references.length === 0) return '';
  const items = fm.references.map(r => `<li>${escapeHtml(r)}</li>`).join('\n');
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

function stepPage(step) {
  return step && step.page ? step.page : step;
}

function routeContextQuery(route, chapterIndex, section) {
  const params = new URLSearchParams({
    reader_group: String(route.fm.route_group || ''),
    reader_route: String(route.fm.route_key || ''),
    reader_chapter: String(chapterIndex),
  });
  if (section) params.set('reader_section', section);
  return params.toString();
}

function routeData(registry) {
  return registry.routes.map(route => ({
    group: String(route.fm.route_group || ''),
    key: String(route.fm.route_key || ''),
    label: String(route.fm.route_label || pageLabel(route)),
    mode: route.route_group_mode,
    rel: route.rel,
    path: siteUrl(resolvePath(route.rel)),
    chapters: (route.chapters.length > 0 ? route.chapters : (route.legacyChapters || [])).map((chapter, index) => ({
      rel: chapter.page.rel,
      path: siteUrl(resolvePath(chapter.page.rel)),
      label: pageLabel(chapter.page),
      anchors: markdownHeadingAnchors(chapter.page.content),
      index,
    })),
    allowed: (route.contextRels || []).map(rel => siteUrl(resolvePath(rel))),
  }));
}

function buildFallbackSidebar(currentRelPath, allFiles) {
  const currentDir = path.dirname(currentRelPath);
  const isIndex = path.basename(currentRelPath) === '_index.md';
  const currentPage = allFiles.find(f => f.rel === currentRelPath);
  const isRouteIndex = currentPage && currentPage.fm && currentPage.fm.page_type === 'route-index';

  // 找到同目录的兄弟文件
  const siblingCandidates = allFiles
    .filter(f => path.dirname(f.rel) === currentDir)
    .sort((a, b) => {
      // _index.md 排最前
      if (a.rel.endsWith('_index.md')) return -1;
      if (b.rel.endsWith('_index.md')) return 1;
      return path.basename(a.rel).localeCompare(path.basename(b.rel));
    });
  const siblings = isRouteIndex
    ? siblingCandidates.filter(f => f.fm && f.fm.page_type !== 'route')
    : siblingCandidates;

  if (siblings.length <= 1 && !isRouteIndex) return '';

  const links = siblings.map(f => {
    const slug = resolvePath(f.rel);
    const isActive = f.rel === currentRelPath ? ' class="active"' : '';
    return `<a href="${siteUrl(slug)}"${isActive}>${pageLabel(f)}</a>`;
  }).join('\n');

  // 索引页返回其父目录；普通文章返回当前目录索引。
  const parentDir = isIndex ? path.dirname(currentDir) : currentDir;
  const parentIndexRel = parentDir === '.' ? '' : parentDir + '/_index.md';
  const parentSlug = parentIndexRel && allFiles.some(f => f.rel === parentIndexRel)
    ? resolvePath(parentIndexRel).replace('index.html', '')
    : '';
  const backLink = parentSlug
    ? `<a href="${siteUrl(parentSlug)}" class="back-link">← 返回上级</a>`
    : '';

  const sidebarNav = links ? `\n<nav class="sidebar-nav">\n${links}\n</nav>` : '';
  return `${backLink}${sidebarNav}`;
}

function buildSidebar(currentRelPath, registry) {
  const context = getRouteContext(currentRelPath, registry);
  if (context) {
    if (!context.route && context.referencedBy.length > 1) {
      return buildFallbackSidebar(currentRelPath, Array.from(registry.byRel.values()));
    }
    const route = context.route || (context.referencedBy[0] && context.referencedBy[0].route);
    if (route) {
      const steps = context.steps.length ? context.steps : [route];
      const links = steps.map(step => {
        const page = stepPage(step);
        const active = page.rel === currentRelPath ? ' class="active"' : '';
        return `<a href="${siteUrl(resolvePath(page.rel))}"${active}>${pageLabel(page)}</a>`;
      }).join('\n');
      const routeIndex = route.rel.replace(/\/[^/]+$/, '/_index.md');
      const backLink = registry.byRel.has(routeIndex)
        ? `<a href="${siteUrl(resolvePath(routeIndex))}" class="back-link">← 返回路线</a>`
        : '';
      const alternatives = route.route_group_mode === 'alternatives'
        ? (registry.routesByGroup.get(route.fm.route_group) || [])
          .filter(candidate => candidate.rel !== route.rel)
          .map(candidate => `<a href="${siteUrl(resolvePath(candidate.rel))}">${escapeHtml(candidate.fm.route_label || pageLabel(candidate))}</a>`)
          .join('\n')
        : '';
      const alternativeNav = alternatives
        ? `\n<div class="nav-section">其他入口</div>\n<nav class="sidebar-nav route-alternatives">\n${alternatives}\n</nav>`
        : '';
      return `${backLink}\n<div class="nav-section">${escapeHtml(route.fm.route_label || pageLabel(route))}</div>\n<nav class="sidebar-nav route-steps">\n${links}\n</nav>${alternativeNav}`;
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
    <a href="${siteUrl('paths/')}">选择阅读</a>
    <a href="${siteUrl('paths/exploration/youth/')}">探索自己</a>
    <a href="${siteUrl('interests/')}">兴趣课程</a>
    <a href="${siteUrl('references/')}">查来源</a>
  </nav>`;
}

function renderReadingGuide(rel) {
  const record = editorialPages.get(rel);
  if (!record) return '';
  const entry = record.entry && record.entry !== rel
    ? `<a href="${siteUrl(resolvePath(record.entry))}">回到${escapeHtml(record.entry_label || '阅读入口')}</a>`
    : '';
  return `<aside class="reading-guide" aria-label="本篇阅读用途">
    <p>${escapeHtml(record.reading_note || '')}</p>
    ${entry ? `<p>${entry}</p>` : ''}
  </aside>`;
}

function renderRouteNav(context, { bottom = false } = {}) {
  if (!context) return '';
  const route = context.route;
  const activeRoute = route || context.articleRoute;

  // A direct open of a shared page must expose every possible route. The
  // selected route is made explicit by query parameters and checked by nav.js.
  if (!activeRoute && context.referencedBy.length > 0) {
    const choices = context.referencedBy.map(ref => {
      const routeLabel = escapeHtml(ref.route.fm.route_label || pageLabel(ref.route));
      const query = routeContextQuery(ref.route, Number.isInteger(ref.index) ? ref.index : 0);
      return `<a class="route-choice" href="${siteUrl(resolvePath(context.currentRel))}?${query}">${routeLabel}</a>`;
    }).join('');
    return `<section class="route-choice-panel" aria-label="选择阅读路线">
      <strong>这篇内容属于多条阅读路线</strong>
      <p>请选择你想从哪条路线继续，网站会保留章节位置。</p>
      <div class="route-choices">${choices}</div>
    </section>`;
  }
  if (!activeRoute) return '';
  if (bottom && (!context.articleRoute || !context.readingChapter)) return '';

  const chapterSteps = route
    ? (activeRoute.chapters || [])
    : (activeRoute.chapters && activeRoute.chapters.length > 0
      ? activeRoute.chapters
      : (activeRoute.legacyChapters || []));
  const routeIsChapter = !route && context.articleIndex >= 0;
  const steps = chapterSteps.length > 0
    ? chapterSteps
    : (route ? context.steps : []);
  const currentIndex = route
    ? (chapterSteps.length > 0 ? -1 : context.steps.findIndex(step => step.rel === route.rel))
    : context.articleIndex;
  const stepText = currentIndex >= 0
    ? `第 ${currentIndex + 1} 章 / 共 ${steps.length} 章`
    : (steps.length > 0 ? '从这里开始' : '路线入口');
  const stepLinks = steps.map((step, index) => {
    const page = stepPage(step);
    const active = page.rel === context.currentRel ? ' class="route-step active"' : ' class="route-step"';
    const query = routeIsChapter ? `?${routeContextQuery(activeRoute, index)}` : '';
    return `<a href="${siteUrl(resolvePath(page.rel))}${query}"${active}><span>${index + 1}</span>${escapeHtml(pageLabel(page))}</a>`;
  }).join('');
  const stepList = context.readingChapter && routeIsChapter
    ? `<details class="route-chapter-list"><summary>展开章节目录</summary><div class="route-steps mobile-route-nav">${stepLinks}</div></details>`
    : `<div class="route-steps mobile-route-nav">${stepLinks}</div>`;
  const previousPage = route ? context.previous : context.articlePrevious;
  const nextPage = route ? context.next : context.articleNext;
  const chapterHref = (page, fallbackIndex) => {
    if (!page) return '';
    const index = chapterSteps.findIndex(step => stepPage(step).rel === page.rel);
    const chapterIndex = index >= 0 ? index : fallbackIndex;
    const query = chapterIndex >= 0 && chapterSteps.length > 0
      ? `?${routeContextQuery(activeRoute, chapterIndex)}`
      : '';
    return `${siteUrl(resolvePath(page.rel))}${query}`;
  };
  const previousIndex = route ? -1 : context.articleIndex - 1;
  const nextIndex = route ? (nextPage && chapterSteps.findIndex(step => stepPage(step).rel === nextPage.rel)) : context.articleIndex + 1;
  const previous = previousPage
    ? `<a class="route-prev" href="${chapterHref(stepPage(previousPage), previousIndex)}">← 上一章：${escapeHtml(pageLabel(stepPage(previousPage)))}</a>`
    : '';
  const next = nextPage
    ? `<a class="route-next" href="${chapterHref(stepPage(nextPage), nextIndex)}">下一章：${escapeHtml(pageLabel(stepPage(nextPage)))} →</a>`
    : (steps.length > 0 ? '<span class="route-end">这条路线到这里，可以回到路线首页选择下一步。</span>' : '');
  if (bottom) {
    return `<section class="route-nav route-nav-bottom" aria-label="章节前后导航">
      <div class="route-summary"><span>${escapeHtml(activeRoute.fm.route_label || pageLabel(activeRoute))}</span><small>${stepText}</small></div>
      <div class="route-actions">${previous}${next}</div>
    </section>`;
  }
  const back = routeIsChapter
    ? `<a class="route-back" href="${siteUrl(resolvePath(activeRoute.rel))}">返回当前路线</a>`
    : '';
  const topActions = `${route ? '' : back}${previous}${next}`;
  return `<section class="route-nav" aria-label="阅读路线">
    <div class="route-summary"><span>${escapeHtml(activeRoute.fm.route_label || pageLabel(activeRoute))}</span><small>${stepText}</small></div>
    ${stepList}
    <div class="route-actions">${topActions}</div>
  </section>`;
}

const BREADCRUMB_ROOT_LABELS = {
  stages: '阶段主线',
  interests: '兴趣副线',
  paths: '学习路径',
  references: '知识参考',
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBreadcrumbs(currentRelPath, registry, title) {
  if (!currentRelPath) return '';

  const parts = currentRelPath.split('/');
  const isIndex = path.basename(currentRelPath) === '_index.md';
  const directoryParts = parts.slice(0, -1);
  const items = [{ label: '首页', href: siteUrl('') }];
  const prefix = [];

  directoryParts.forEach((segment, index) => {
    prefix.push(segment);
    const directoryRel = prefix.join('/');
    const indexRel = `${directoryRel}/_index.md`;
    const indexPage = registry && registry.byRel.get(indexRel);
    if (index > 0 && !indexPage) return;
    const label = index === 0
      ? BREADCRUMB_ROOT_LABELS[segment] || segment
      : indexPage ? pageLabel(indexPage) : SLUG_MAP[segment] || segment;
    const isCurrentDirectory = isIndex && index === directoryParts.length - 1;
    const href = siteUrl(resolvePath(indexRel)).replace(/index\.html$/, '');
    items.push({ label, href: isCurrentDirectory ? null : href });
  });

  if (!isIndex) items.push({ label: title || path.basename(currentRelPath, '.md'), href: null });

  const links = items.map((item, index) => {
    const current = index === items.length - 1;
    const label = escapeHtml(item.label);
    const content = item.href && !current
      ? `<a href="${item.href}">${label}</a>`
      : `<span${current ? ' aria-current="page"' : ''}>${label}</span>`;
    const separator = current
      ? ''
      : '<span class="breadcrumbs-separator" aria-hidden="true">→</span>';
    return `<span class="breadcrumbs-item">${content}</span>${separator}`;
  }).join('\n');

  return `<nav class="breadcrumbs" aria-label="当前位置"><div class="breadcrumbs-list">\n${links}\n</div></nav>`;
}

// ─── HTML Template ─────────────────────────────────────────────────────────

function safeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function renderPage({ title, description, sidebar, routeNav, routeNavBottom, metaCard, breadcrumb, content, references, sourceNote, currentRel, readerData }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 鼓楼</title>
  <meta name="description" content="${description}">
  <link rel="icon" type="image/png" href="${siteUrl('assets/favicon.png')}">
  <link rel="stylesheet" href="${templateUrl('style.css')}">
</head>
<body data-page-rel="${escapeHtml(currentRel || '')}">
  ${renderTopNav()}

  <div class="layout">
    ${sidebar ? `<aside class="sidebar">${sidebar}</aside>` : ''}

    <main class="content">
      <div class="content-inner">
        ${breadcrumb || ''}
        ${routeNav || ''}
        ${routeNav ? '' : renderReadingGuide(currentRel)}
        ${metaCard}
        ${content}
        ${sourceNote ? `<details class="source-note"><summary>来源核对与审核范围</summary><p>${escapeHtml(sourceNote)}</p></details>` : ''}
        ${references}
        ${routeNavBottom || ''}
      </div>
    </main>
  </div>

  <footer class="site-footer">
    <p><a href="${siteUrl('stages/')}">人生阶段</a> · <a href="${siteUrl('paths/reading-progress.html')}">内容维护记录</a> · <a href="https://github.com/JohnnyChenS/gulou">开源项目</a> · CC BY-SA 4.0</p>
  </footer>
  <script src="${templateUrl('nav.js')}"></script>
  ${readerData ? `<script type="application/json" id="reader-route-data">${safeJson(readerData)}</script>` : ''}
</body>
</html>`;
}

function collectInterestRouteIndexes(registry) {
  return Array.from(registry.byRel.values())
    .filter(page => page.rel.startsWith('interests/')
      && page.rel.endsWith('/_index.md')
      && page.rel.split('/').length === 3)
    .sort((a, b) => {
      if (a.rel === 'interests/system-architecture/_index.md') return -1;
      if (b.rel === 'interests/system-architecture/_index.md') return 1;
      return String(a.fm.name || a.rel).localeCompare(String(b.fm.name || b.rel));
    });
}

function renderInterestCards(registry) {
  const cards = collectInterestRouteIndexes(registry).map(page => {
    const slug = resolvePath(page.rel);
    const name = page.fm.name || page.fm.topic || page.rel;
    const description = page.fm.description || '跨阶段兴趣学习路径';
    return '<a href="' + siteUrl(slug) + '" class="stage-card">'
      + '<h3>' + name + '</h3>'
      + '<p class="age">' + description + '</p>'
      + '</a>';
  }).join('\n');
  return '<section class="home-section">'
    + '<h2>按兴趣探索</h2>'
    + '<p>语言、登山与系统架构各有独立路线；从相应总入口了解适用背景、安全条件和阅读顺序。</p>'
    + '<div class="stage-grid entry-grid">' + cards + '</div>'
    + '</section>';
}

function renderHomePageWithRoutes(registry) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>鼓楼 — 陪你走过人生每个阶段</title>
  <meta name="description" content="一个开放的成长知识库。从新手父母连续阅读开始，逐步理解照料与成长，再按需要查阅具体主题。">
  <link rel="icon" type="image/png" href="${siteUrl('assets/favicon.png')}">
  <link rel="stylesheet" href="${templateUrl('style.css')}">
</head>
<body>
  ${renderTopNav()}
  <div class="hero home-hero">
    <img src="${siteUrl('assets/logo.png')}" alt="鼓楼" class="hero-logo">
    <h1>养育孩子，也认识自己</h1>
    <p class="subtitle">从眼前的生活开始，一章一章读懂成长。</p>
  </div>

  <section class="home-section new-parent-entry" aria-labelledby="new-parent-entry-title">
    <h2 id="new-parent-entry-title">第一次当父母，从这里读起</h2>
    <p>从准备出生、第一次喂奶，读到孩子开始说话和自己做事。每章接住一个新的生活变化，也解释为什么这样照料。</p>
    <div class="reader-entry-actions">
      <a class="reader-start" href="${siteUrl('paths/parenting/new-parent/01-before-birth.html')}">从第一章开始 →</a>
      <a href="${siteUrl('paths/parenting/new-parent/')}">查看十五章目录</a>
    </div>
    <p class="reader-lookup">已有具体问题：<a href="${siteUrl('stages/family/parenting/quick-start.html')}#safety">安全信号与求助</a> · <a href="${siteUrl('stages/family/parenting/0-3/#正在照料宝宝')}">护理操作</a> · <a href="${siteUrl('paths/parenting/new-parent/#十五章主线')}">按当前阶段选章</a></p>
  </section>

  <section class="home-section child-stage-entry">
    <h2>孩子已经更大，从当前阶段继续</h2>
    <p>每个阶段把身体、生活、关系和学习连起来，再按需要查具体主题。</p>
    <div class="stage-grid entry-grid">${['3-6', '6-9', '9-12', '12-14', '14-18'].map(age => `<a class="stage-card" href="${siteUrl(`stages/family/parenting/${age}/`)}"><h3>${age.replace('-', '–')} 岁阅读</h3><p class="age">从本阶段第一篇开始</p></a>`).join('')}</div>
    <p><a href="${siteUrl('stages/family/parenting/parents/')}">父母自己的压力、休息与关系</a></p>
  </section>

  <section class="home-section youth-entry">
    <h2>想知道自己喜欢什么、适合什么</h2>
    <p>不知道从哪里开始，可以先找一次愿意尝试的事情。把体验说清楚，再决定继续、换一种做法，或者停下来。</p>
    <div class="reader-entry-actions"><a class="reader-start" href="${siteUrl('paths/exploration/youth/')}">开始探索自己 →</a></div>
  </section>

  <section class="home-section">
    <h2>关于鼓楼</h2>
    <p>鼓楼是一个开放的成长知识库，整理育儿、身心发展和兴趣学习的资料，帮助读者了解不同阶段的需求，并把知识用于日常生活。</p>
    <p>“鼓楼”呼应英文 grow（成长），也是作者长大的地方；拨浪鼓图标来自童年记忆。</p>
  </section>

  <section class="home-section">
    <h2>从新手父母开始</h2>
    <p>成长相关的资料分散在论文、专业书和各类指南里，读者往往要自己判断先读什么、哪些建议适合当前处境。鼓楼希望把这一步整理工作做好，提供清楚的起点和连贯的阅读顺序。</p>
    <p>从 <strong>0–3 岁新手父母</strong>起步，现有育儿阅读覆盖至 18 岁，并接入父母支持和兴趣课程。其他人生阶段目前以概览为主，入口会说明可读内容的深度。编辑整理与专业复核分别记录。</p>
  </section>

  <section class="home-section">
    <h2>其他人生阶段</h2>
    <p>大学、工作、中年和老年的材料目前以概览为主。<a href="${siteUrl('stages/')}">查看已有内容</a>。</p>
  </section>

  ${renderInterestCards(registry)}

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
  const readerRoutes = routeData(registry);

  // 写首页
  fs.writeFileSync(path.join(OUT, 'index.html'), renderHomePageWithRoutes(registry));
  console.log('  ✓ index.html');

  // 转换 roadmap.md
  const roadmapPath = path.join(ROOT, 'roadmap.md');
  if (fs.existsSync(roadmapPath)) {
    const raw = fs.readFileSync(roadmapPath, 'utf-8');
    const { data: fm, content } = safeMatter(raw);
    const bodyHtml = addHeadingIds(marked(content));
    const title = extractTitle(fm, bodyHtml);
    const desc = extractDescription(fm, bodyHtml);
    const sidebar = buildFallbackSidebar('roadmap.md', allFiles);
    const html = renderPage({
      title,
      description: desc,
      sidebar,
      routeNav: '',
      metaCard: '',
      breadcrumb: renderBreadcrumbs('roadmap.md', registry, title),
      content: rewriteLinks(bodyHtml, 'roadmap.md'),
      references: '',
      currentRel: 'roadmap.md',
      readerData: readerRoutes,
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
      const routeContext = getRouteContext(rel, registry);
      const routeNav = renderRouteNav(routeContext);
      const html = renderPage({
        title,
        description: `${title} — 鼓楼`,
        sidebar,
        routeNav,
        routeNavBottom: renderRouteNav(routeContext, { bottom: true }),
        metaCard: renderMetaCard(fm),
        breadcrumb: renderBreadcrumbs(rel, registry, title),
        content: '<p><em>此部分内容正在编写中，敬请期待。</em></p>',
        references: '',
        sourceNote: fm.source_check_note,
        currentRel: rel,
        readerData: readerRoutes,
      });
      fs.writeFileSync(outPath, html);
      count++;
      continue;
    }

    // 跳过只有 frontmatter 的空文件
    if (content.trim().length === 0) continue;

    // Markdown → HTML
    const bodyHtml = addHeadingIds(marked(content));

    // 提取元信息
    const title = extractTitle(fm, bodyHtml);
    const desc = extractDescription(fm, bodyHtml);
    const metaCard = isIndex ? '' : renderMetaCard(fm);
    const references = isIndex ? '' : renderReferences(fm);

    // 构建侧边栏
    const sidebar = buildSidebar(rel, registry);
    const routeContext = getRouteContext(rel, registry);
    const routeNav = renderRouteNav(routeContext);

    // 重写链接
    const rewritten = rewriteLinks(bodyHtml, rel);

    // 渲染完整页面
    const html = renderPage({
      title,
      description: desc,
      sidebar,
      routeNav,
      routeNavBottom: renderRouteNav(routeContext, { bottom: true }),
      metaCard,
      breadcrumb: renderBreadcrumbs(rel, registry, title),
      content: rewritten,
      references,
      sourceNote: fm.source_check_note,
      currentRel: rel,
      readerData: readerRoutes,
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

      if (dir === 'stages') {
        const stagePosition = new Map(STAGE_ORDER.map((name, index) => [name, index]));
        entries.sort((a, b) => {
          const aPosition = stagePosition.get(a.name);
          const bPosition = stagePosition.get(b.name);
          if (aPosition !== undefined && bPosition !== undefined) return aPosition - bPosition;
          if (aPosition !== undefined) return -1;
          if (bPosition !== undefined) return 1;
          return a.name.localeCompare(b.name);
        });
      }

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
        breadcrumb: renderBreadcrumbs(`${dir}/_index.md`, registry, dir === 'stages' ? '阶段主线' : dir === 'interests' ? '兴趣副线' : dir),
        content: `<h1>${dir === 'stages' ? '阶段主线' : dir === 'interests' ? '兴趣副线' : dir}</h1>\n<div class="stage-grid">${links}</div>`,
        references: '',
        currentRel: `${dir}/_index.md`,
        readerData: readerRoutes,
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
