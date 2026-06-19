#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const matter = require('gray-matter');

// ─── Config ────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '../..');
const WEBSITE_DIR = path.resolve(__dirname, '../../website');
const OUT = path.resolve(__dirname, '../docx');

const CONTENT_DIRS = ['stages', 'interests', 'paths', 'references'];
const SKIP = new Set(['.git', '.claude', '.sisyphus', 'node_modules', 'CLAUDE.md', 'CONTRIBUTING.md']);

// 复用 website 的 slug 映射
const { resolvePath } = require(path.join(WEBSITE_DIR, 'scripts/slug-map'));

// ─── Safe YAML Parse ──────────────────────────────────────────────────────

function safeMatter(raw) {
  try {
    return matter(raw);
  } catch (e) {
    return { data: {}, content: raw };
  }
}

// ─── Emoji 去除 ──────────────────────────────────────────────────────────

/** 去除文本中的 emoji 和特殊图标字符 */
function stripEmoji(text) {
  // 匹配 emoji 和 Dingbats 等特殊符号
  return text.replace(/[\u{1F600}-\u{1F64F}]/gu, '')   // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')   // Misc Symbols & Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')   // Transport & Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')   // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')      // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')      // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')      // Variation Selectors
    .replace(/[\u{200D}]/gu, '')               // Zero Width Joiner
    .replace(/[\u{2B50}-\u{2B55}]/gu, '')      // Stars & circles
    .replace(/[\u{23E9}-\u{23F3}]/gu, '')      // Various symbols
    .replace(/[\u{23F8}-\u{23FA}]/gu, '')      // Various symbols
    .replace(/[\u{FE0F}]/gu, '')               // Variation selector
    .replace(/[\u{200B}-\u{200D}\u{FEFF}]/gu, '') // Zero-width chars
    .replace(/[\u{2190}-\u{21FF}]/gu, '')      // Arrows
    .replace(/[\u{2702}-\u{27B0}]/gu, '');     // Dingbats
}

// ─── Helpers ──────────────────────────────────────────────────────────────

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

/** 从 Markdown 内容中提取标题 */
function extractTitle(fm, content) {
  if (fm.topic) return fm.topic;
  if (fm.name) return fm.name;
  if (fm.stage_name) return fm.stage_name;
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return 'AI 教育图谱';
}

/** 将 Markdown 中的相对链接转为文字说明 */
function convertLinksForDocx(mdContent) {
  return mdContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `[${text}](${url})`;
    }
    return `「${text}」`;
  });
}

/** 为 Pandoc 准备 Markdown 内容 */
function prepareMarkdown(raw) {
  const { data: fm, content } = safeMatter(raw);

  let md = content;
  if (raw.startsWith('---')) {
    const endIdx = raw.indexOf('---', 3);
    if (endIdx > 0) {
      md = raw.slice(endIdx + 3).trim();
    }
  }

  md = convertLinksForDocx(md);
  md = md.replace(/```mermaid\n[\s\S]*?```/g, '（图表请参考在线版本）');

  // 确保列表前有空行（Pandoc 要求列表前有空行才能识别）
  // 只在非列表行后面紧跟列表项时添加空行
  const lines = md.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^\s*[-*+] /.test(line);
    const prevLine = i > 0 ? lines[i - 1] : '';
    const prevIsListItem = /^\s*[-*+] /.test(prevLine) || /^\s*\d+\. /.test(prevLine);
    const prevIsEmpty = prevLine.trim() === '';
    const prevIsHeading = /^#{1,6}\s/.test(prevLine);

    // 当前行是列表项，前一行不是空行也不是列表项也不是标题，加空行
    if (isListItem && !prevIsEmpty && !prevIsListItem && !prevIsHeading) {
      result.push('');
    }
    result.push(line);
  }
  md = result.join('\n');

  // 分割线转为可见的虚线段落
  md = md.replace(/^\n*---+\n*$/gm, '\n────────────────────────────────────────\n');
  md = md.replace(/^\n*\*\*\*+\n*$/gm, '\n────────────────────────────────────────\n');
  md = md.replace(/^\n*___+\n*$/gm, '\n────────────────────────────────────────\n');

  return { fm, md };
}

// ─── Main Build ────────────────────────────────────────────────────────────

function build() {
  console.log('Building Word documents...');

  // 清理输出目录
  if (fs.existsSync(OUT)) {
    fs.rmSync(OUT, { recursive: true });
  }
  fs.mkdirSync(OUT, { recursive: true });

  // 用 Python 生成引用文档（纯黑、表格带边框）
  console.log('  生成引用文档...');
  try {
    execSync(`python3 "${__dirname}/gen-reference.py"`, {
      cwd: __dirname,
      stdio: 'pipe',
      timeout: 30000,
    });
  } catch (e) {
    console.warn('  ⚠ 引用文档生成失败，使用默认样式');
  }

  const refPath = path.join(OUT, '_reference.docx');

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
    allFiles.push({ full: roadmapPath, rel: 'roadmap.md' });
  }

  // 转换每个文件
  let count = 0;
  let errors = 0;

  for (const { full, rel } of allFiles) {
    try {
      const raw = fs.readFileSync(full, 'utf-8');
      const { fm, md } = prepareMarkdown(raw);

      if (md.trim().length === 0) continue;

      const title = extractTitle(fm, md);

      let finalMd = md;
      if (!md.trim().startsWith('# ')) {
        finalMd = `# ${title}\n\n${md}`;
      }

      // 去除 emoji
      finalMd = stripEmoji(finalMd);

      // 写入临时 Markdown 文件
      const tempMd = path.join(OUT, '_temp.md');
      fs.writeFileSync(tempMd, finalMd, 'utf-8');

      // 使用 Pandoc 转换
      const outRel = resolvePath(rel).replace(/\.html$/, '.docx');
      const outPath = path.join(OUT, outRel);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      const pandocCmd = [
        'pandoc',
        `"${tempMd}"`,
        `-o "${outPath}"`,
        '--from=markdown',
        '--to=docx',
        fs.existsSync(refPath) ? `--reference-doc="${refPath}"` : '',
        '--wrap=none',
      ].filter(Boolean).join(' ');

      execSync(pandocCmd, { stdio: 'pipe', timeout: 30000 });

      // 后处理：为表格添加边框
      try {
        execSync(`python3 "${__dirname}/fix-tables.py" "${outPath}"`, {
          stdio: 'pipe',
          timeout: 10000,
        });
      } catch (e) {
        // 边框修复失败不影响主流程
      }

      if (fs.existsSync(tempMd)) fs.unlinkSync(tempMd);

      count++;
    } catch (e) {
      errors++;
      console.error(`  ✗ ${rel}: ${e.message.split('\n')[0]}`);
    }
  }

  // 清理引用文档
  if (fs.existsSync(refPath)) fs.unlinkSync(refPath);

  console.log(`\nDone! Generated ${count} Word documents in word/docx/`);
  if (errors > 0) {
    console.log(`  (${errors} files had errors)`);
  }
}

build();
