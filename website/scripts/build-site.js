#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { resolvePath, resolveSlug, SLUG_MAP } = require('./slug-map');

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

const CONTENT_DIRS = ['stages', 'interests', 'paths', 'references'];

// 跳过的文件/目录
const SKIP = new Set(['.git', '.claude', '.sisyphus', 'node_modules', 'CLAUDE.md', 'CONTRIBUTING.md']);

// ─── Helpers ───────────────────────────────────────────────────────────────

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
  return html.replace(/href="([^"]*\.md)"/g, (match, href) => {
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
    return `href="/${htmlPath}"`;
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
function buildSidebar(currentRelPath, allFiles) {
  const currentDir = path.dirname(currentRelPath);
  const currentFile = path.basename(currentRelPath);

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
    const baseName = path.basename(f.rel, '.md');
    const slug = resolvePath(f.rel);
    const isActive = f.rel === currentRelPath ? ' class="active"' : '';
    const label = baseName === '_index' ? '概述' : baseName;
    return `<a href="/${slug}"${isActive}>${label}</a>`;
  }).join('\n');

  // 上级目录链接
  const parentSlug = resolvePath(currentDir + '/_index.md').replace('index.html', '');
  const backLink = currentDir.includes('/')
    ? `<a href="/${parentSlug}" class="back-link">← 返回上级</a>`
    : '';

  return `${backLink}\n<nav class="sidebar-nav">\n${links}\n</nav>`;
}

// ─── HTML Template ─────────────────────────────────────────────────────────

function renderPage({ title, description, sidebar, metaCard, content, references, isHome }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 鼓楼</title>
  <meta name="description" content="${description}">
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

  <div class="layout">
    ${sidebar ? `<aside class="sidebar">${sidebar}</aside>` : ''}

    <main class="content">
      <div class="content-inner">
        ${metaCard}
        ${content}
        ${references}
        <div class="ad-slot">广告位</div>
      </div>
    </main>
  </div>

  <footer class="site-footer">
    <p>内容基于 <a href="https://github.com/JohnnyChenS/gulou">鼓楼</a> 开源项目 · 采用 CC BY-SA 4.0 协议</p>
  </footer>
  <script src="/assets/nav.js"></script>
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
  <meta name="description" content="鼓楼 = grow。把权威的成长发展知识，整理成每个人看得懂、用得上的结构化内容。">
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
    <p class="subtitle">鼓楼 = grow。鼓楼是我长大的地方，拨浪鼓是童年的声音。</p>
    <p>覆盖全人生阶段的成长知识库。<br>把权威的成长发展知识，整理成每个人看得懂、用得上的结构化内容。</p>
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

  // 写首页
  fs.writeFileSync(path.join(OUT, 'index.html'), renderHomePage());
  console.log('  ✓ index.html');

  // 收集所有内容文件
  const allFiles = [];
  for (const dir of CONTENT_DIRS) {
    const fullDir = path.join(ROOT, dir);
    const files = collectMdFiles(fullDir, ROOT);
    allFiles.push(...files);
  }

  // 转换 roadmap.md
  const roadmapPath = path.join(ROOT, 'roadmap.md');
  if (fs.existsSync(roadmapPath)) {
    const raw = fs.readFileSync(roadmapPath, 'utf-8');
    const { data: fm, content } = safeMatter(raw);
    const bodyHtml = marked(content);
    const title = extractTitle(fm, bodyHtml);
    const desc = extractDescription(fm, bodyHtml);
    const sidebar = buildSidebar('roadmap.md', allFiles);
    const html = renderPage({
      title,
      description: desc,
      sidebar,
      metaCard: '',
      content: rewriteLinks(bodyHtml, 'roadmap.md'),
      references: '',
    });
    fs.writeFileSync(path.join(OUT, 'roadmap.html'), html);
    console.log('  ✓ roadmap.html');
  }

  // 转换每个内容文件
  let count = 0;
  for (const { full, rel } of allFiles) {
    // 跳过空目录对应的 _index.md（如果目录下没有其他 md 文件）
    const dir = path.dirname(rel);
    const siblings = allFiles.filter(f => path.dirname(f.rel) === dir && f.rel !== rel);
    const isIndex = path.basename(rel) === '_index.md';

    const raw = fs.readFileSync(full, 'utf-8');
    const { data: fm, content } = safeMatter(raw);

    // 检查正文是否为空（只有 frontmatter 没有内容）
    if (content.trim().length === 0 && isIndex) {
      // 空的 index 文件，仍然生成页面但标记为空
      const outRel = resolvePath(rel);
      const outPath = path.join(OUT, outRel);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      const title = extractTitle(fm, '');
      const sidebar = buildSidebar(rel, allFiles);
      const html = renderPage({
        title,
        description: `${title} — 鼓楼`,
        sidebar,
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
    const sidebar = buildSidebar(rel, allFiles);

    // 重写链接
    const rewritten = rewriteLinks(bodyHtml, rel);

    // 渲染完整页面
    const html = renderPage({
      title,
      description: desc,
      sidebar,
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
        return `<a href="/${dir}/${slug}/" class="stage-card"><h3>${e.name}</h3></a>`;
      }).join('\n');

      const html = renderPage({
        title: dir === 'stages' ? '阶段主线' : dir === 'interests' ? '兴趣副线' : dir,
        description: `鼓楼 — ${dir}`,
        sidebar: '',
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
