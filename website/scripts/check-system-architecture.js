#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = path.resolve(__dirname, '../..');
const COURSE = path.join(ROOT, 'interests/system-architecture');
const ROUTE_GROUP = 'system-architecture-core';
const NON_UNIT_FILES = new Set(['validation-protocol.md']);
const REQUIRED_SLICE = [
  '01-computer-systems/page-cache-and-durable-io.md',
  '03-distributed-systems/replicated-log.md',
  '04-data-systems/write-ahead-log.md',
  '05-data-architecture/checkpoint-and-replay.md',
  '06-cloud-native-sre/stateful-recovery.md',
  'capstone/log-state-recovery-review.md',
];
const PHASES = [
  ['00-architecture-method', 'architecture-method', '架构方法与基线诊断'],
  ['01-computer-systems', 'computer-systems', 'Computer Systems'],
  ['02-network', 'network', 'Network'],
  ['03-distributed-systems', 'distributed-systems', 'Distributed Systems'],
  ['04-data-systems', 'data-systems', 'Data Systems'],
  ['05-data-architecture', 'data-architecture', 'Data Architecture'],
  ['06-cloud-native-sre', 'cloud-native-sre', 'Cloud Native / SRE'],
  ['07-ml-systems', 'ml-systems', 'ML Systems'],
  ['08-recommendation-systems', 'recommendation-systems', 'Recommendation Systems'],
  ['09-ai-engineering', 'ai-engineering', 'AI Engineering'],
];
const REQUIRED_HEADINGS = [
  '## 学习目标',
  '## 先修知识',
  '## 问题场景',
  '## 第一层：底层思想',
  '## 第二层：组件设计落地',
  '## 第三层：生产实践与真实案例',
  '## 第四层：动手验证与架构判断',
  '## 常见误区与适用边界',
  '## 掌握度检查',
  '## 在综合项目中的应用',
  '## 权威来源与延伸阅读',
];

function fail(message) {
  throw new Error(message);
}

function readMarkdown(full) {
  if (!fs.existsSync(full)) fail(`缺少文件：${path.relative(ROOT, full)}`);
  const raw = fs.readFileSync(full, 'utf8');
  const parsed = matter(raw);
  return { raw, fm: parsed.data, content: parsed.content };
}

function collectFormalUnits(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFormalUnits(full, results);
    else if (entry.name.endsWith('.md') && entry.name !== '_index.md' && !NON_UNIT_FILES.has(entry.name)) results.push(full);
  }
  return results;
}

const rootIndex = readMarkdown(path.join(COURSE, '_index.md'));
for (const rel of REQUIRED_SLICE) readMarkdown(path.join(COURSE, rel));
readMarkdown(path.join(COURSE, 'capstone/validation-protocol.md'));
if (rootIndex.fm.page_type !== 'route-index') fail('课程总入口必须是 route-index');
if (rootIndex.fm.route_group !== ROUTE_GROUP) fail('课程总入口 route_group 不正确');
if (rootIndex.fm.domain !== 'system-architecture') fail('课程总入口 domain 不正确');

const requiredGuides = ['authoring-guide.md', 'references/source-matrix.md'];
for (const rel of requiredGuides) {
  readMarkdown(path.join(COURSE, rel));
  if (!rootIndex.content.includes(`](${rel})`)) fail(`课程总入口未链接 ${rel}`);
}

PHASES.forEach(([dir, key, label], index) => {
  const rel = `${dir}/_index.md`;
  const page = readMarkdown(path.join(COURSE, rel));
  if (page.fm.page_type !== 'route') fail(`${rel}: page_type 必须是 route`);
  if (page.fm.route_group !== ROUTE_GROUP) fail(`${rel}: route_group 不正确`);
  if (page.fm.route_key !== key) fail(`${rel}: route_key 应为 ${key}`);
  if (Number(page.fm.route_order) !== index) fail(`${rel}: route_order 应为 ${index}`);
  if (page.fm.route_label !== label) fail(`${rel}: route_label 应为 ${label}`);
  if (!rootIndex.content.includes(`](${rel})`)) fail(`课程总入口未链接 ${rel}`);
  const next = PHASES[index + 1];
  const expectedNext = next ? `../${next[0]}/_index.md` : undefined;
  if (page.fm.route_next !== expectedNext) fail(`${rel}: route_next 应为 ${expectedNext || '空'}`);
  for (const heading of ['## 阶段目标', '## 核心单元', '## 组件映射', '## 综合项目演进', '## 阶段挑战', '## 阅读顺序']) {
    if (!page.content.includes(heading)) fail(`${rel}: 缺少 ${heading}`);
  }
});

const interestIndex = fs.readFileSync(path.join(ROOT, 'interests/_index.md'), 'utf8');
if (!interestIndex.includes('system-architecture/_index.md')) fail('兴趣总索引未链接系统架构课程');

const formalRoots = PHASES.map(([dir]) => path.join(COURSE, dir));
formalRoots.push(path.join(COURSE, 'capstone'));
const formalUnits = formalRoots.flatMap(dir => collectFormalUnits(dir));
for (const file of formalUnits) {
  const page = readMarkdown(file);
  const rel = path.relative(ROOT, file);
  if (page.fm.track !== 'interests') fail(`${rel}: track 必须是 interests`);
  if (page.fm.domain !== 'system-architecture') fail(`${rel}: domain 必须是 system-architecture`);
  if (page.fm.review_status !== 'draft') fail(`${rel}: review_status 必须是 draft`);
  if (!Array.isArray(page.fm.learning_paths) || !page.fm.learning_paths.includes('system-architecture')) {
    fail(`${rel}: learning_paths 必须包含 system-architecture`);
  }
  for (const heading of REQUIRED_HEADINGS) {
    if (!page.content.includes(heading)) fail(`${rel}: 缺少 ${heading}`);
  }
  if (/\b(TODO|TBD)\b|待补充|稍后补充/i.test(page.raw)) fail(`${rel}: 含占位文本`);
  if (page.raw.includes('gulou-agent')) fail(`${rel}: 公开课程正文不得依赖 gulou-agent`);
}

console.log(`System architecture check passed: ${PHASES.length} phases, ${formalUnits.length} formal units.`);
