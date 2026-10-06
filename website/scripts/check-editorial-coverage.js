#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const matter = require('gray-matter');
const { resolvePath } = require('./slug-map');
const { normalizeTarget } = require('./route-registry');

const root = path.resolve(__dirname, '../..');
const site = path.join(root, 'website/site');
const coverage = JSON.parse(fs.readFileSync(path.join(root, 'docs/reading/editorial-coverage.json'), 'utf8'));
const errors = [];
const recordMap = new Map();
const sourceFiles = [];
function collect(dir, suffix, result) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, suffix, result);
    else if (entry.name.endsWith(suffix)) result.push(full);
  }
}
for (const dir of ['stages', 'paths', 'interests', 'references']) collect(path.join(root, dir), '.md', sourceFiles);
sourceFiles.push(path.join(root, 'roadmap.md'));
assert.equal(coverage.complete, true, 'the full-library audit must be explicitly completed');
for (const record of coverage.files) {
  if (recordMap.has(record.path)) errors.push(`duplicate coverage record: ${record.path}`);
  recordMap.set(record.path, record);
  if (!['rewritten', 'integrated', 'retained'].includes(record.status)) errors.push(`invalid editorial status: ${record.path}`);
  if (!record.note || !record.reading_note || !record.role) errors.push(`missing concrete review/use record: ${record.path}`);
  if (!Array.isArray(record.sources_checked)) errors.push(`missing source-check scope: ${record.path}`);
  if (record.entry && !fs.existsSync(path.join(root, record.entry))) errors.push(`missing reading entry: ${record.path} -> ${record.entry}`);
}
const sourceRels = new Set(sourceFiles.map(file => path.relative(root, file)));
for (const [rel] of recordMap) if (!sourceRels.has(rel)) errors.push(`record without source: ${rel}`);
for (const file of sourceFiles) {
  const rel = path.relative(root, file);
  const raw = fs.readFileSync(file, 'utf8');
  const record = recordMap.get(rel);
  if (!record) { errors.push(`not reviewed: ${rel}`); continue; }
  const hash = createHash('sha256').update(raw).digest('hex');
  if (hash !== record.sha256) errors.push(`review record is stale: ${rel}`);
  const parsed = matter(raw);
  if (!parsed.content.trim()) errors.push(`empty published content: ${rel}`);
  const built = path.join(site, rel === 'roadmap.md' ? 'roadmap.html' : resolvePath(rel));
  if (!fs.existsSync(built)) errors.push(`content not built: ${rel}`);
  else {
    const html = fs.readFileSync(built, 'utf8');
    if (!html.includes('aria-label="本篇阅读用途"') && !html.includes('class="route-nav"') && !html.includes('aria-label="选择阅读路线"')) {
      errors.push(`reading purpose or chapter navigation not visible: ${rel}`);
    }
    if (html.includes('[object Object]')) errors.push(`malformed rendered content: ${rel}`);
  }
}

// Every existing parenting topic must be discoverable from its own stage/support
// directory, independently of the navigation metadata injected by the builder.
const parenting = 'stages/家庭期（25-45岁）/育儿指导';
for (const group of ['0-3岁', '3-6岁', '6-9岁', '9-12岁', '12-14岁', '14-18岁', '父母自身']) {
  const indexRel = `${parenting}/${group}/_index.md`;
  const raw = fs.readFileSync(path.join(root, indexRel), 'utf8');
  const linked = new Set([...raw.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map(match => normalizeTarget(indexRel, match[1])).filter(Boolean));
  for (const rel of sourceRels) {
    if (!rel.startsWith(`${parenting}/${group}/`) || rel.endsWith('/_index.md') || rel.endsWith('/development-assessment.md')) continue;
    if (!linked.has(rel)) errors.push(`topic missing from its reading directory: ${rel}`);
  }
}

// Check the actual generated destinations, including deep links whose headings
// can change during broad prose editing. External sites are outside this check.
const htmlFiles = [];
collect(site, '.html', htmlFiles);
const home = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const stylePath = home.match(/href="([^"]*\/assets\/style\.css[^\"]*)"/)?.[1];
assert.ok(stylePath, 'cannot determine built base path');
const base = new URL(stylePath, 'https://gulou.invalid').pathname.split('/assets/')[0];
const idsByFile = new Map();
let links = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(site, file).replaceAll(path.sep, '/');
  for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    const url = new URL(href, `https://gulou.invalid${base}/${rel}`);
    if (url.origin !== 'https://gulou.invalid') continue;
    const decoded = decodeURIComponent(url.pathname);
    if (base && decoded !== base && !decoded.startsWith(base + '/')) {
      errors.push(`link escapes built base path: ${rel} -> ${href}`); continue;
    }
    let dest = decoded.slice(base.length).replace(/^\//, '');
    if (!dest || dest.endsWith('/')) dest += 'index.html';
    const target = path.resolve(site, dest);
    if (!target.startsWith(site + path.sep) || !fs.existsSync(target)) {
      errors.push(`missing built destination: ${rel} -> ${href}`); continue;
    }
    links++;
    if (!url.hash || !target.endsWith('.html')) continue;
    if (!idsByFile.has(target)) {
      const targetHtml = fs.readFileSync(target, 'utf8');
      idsByFile.set(target, new Set([...targetHtml.matchAll(/\bid="([^"]+)"/g)].map(item => item[1])));
    }
    const anchor = decodeURIComponent(url.hash.slice(1));
    if (!idsByFile.get(target).has(anchor)) errors.push(`missing built anchor: ${rel} -> ${href}`);
  }
}
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
console.log(`Editorial coverage passed: ${sourceFiles.length} reviewed pages, ${links} local links, ${htmlFiles.length} HTML pages; all parenting topics mapped.`);
