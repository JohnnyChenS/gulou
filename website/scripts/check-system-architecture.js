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
const REQUIRED_FORMAL_UNIT_FIELDS = [
  'id',
  'stage',
  'track',
  'domain',
  'topic',
  'age_range',
  'difficulty',
  'review_status',
  'references',
  'tags',
  'learning_paths',
  'related_prompts',
];
const REQUIRED_PROTOCOL_HEADINGS = [
  '## 验证批次',
  '## 逐页耗时、术语与活动证据',
  '## 四层有效性',
  '## 综合评审独立完成记录',
  '## AI 评审缺陷记录',
  '## 内容调整建议',
  '## 验证结论',
];
const REQUIRED_ROOT_MARKERS = [
  '## 这条路线解决什么问题',
  '## 一张图看懂路线',
  '## 两种阅读方式',
  '## 四层学习法',
  '## 如何判断完成',
];
const REQUIRED_PHASE_HEADINGS = [
  '## 阶段目标',
  '## 进入条件',
  '## 这一阶段先把什么讲清楚',
  '## 组件如何承载这些思想',
  '## 综合项目产物',
  '## 阶段挑战',
  '## 阅读顺序',
];
const REQUIRED_FORMAL_ORIENTATION_HEADINGS = [
  '## 一句话理解',
  '## 本页要解决的问题',
  '## 本页词汇',
  '## 在路线中的位置',
  '## 下一步',
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateHeadingsInOrder(content, headings, rel) {
  let previousIndex = -1;
  for (const heading of headings) {
    const match = new RegExp(`^${escapeRegex(heading)}\\s*$`, 'gm').exec(content);
    if (!match) fail(`${rel}: 缺少 ${heading}`);
    if (match.index <= previousIndex) fail(`${rel}: 标题顺序错误：${heading}`);
    previousIndex = match.index;
  }
}

function validateStringField(fm, field, rel) {
  if (typeof fm[field] !== 'string' || !fm[field].trim()) {
    fail(`${rel}: ${field} 必须是非空字符串`);
  }
}

function validateStringArrayField(fm, field, rel) {
  if (!Array.isArray(fm[field]) || !fm[field].every(item => typeof item === 'string' && item.trim())) {
    fail(`${rel}: ${field} 必须是字符串数组`);
  }
}

function validateSourceContains(content, markers, rel) {
  for (const marker of markers) {
    if (!content.includes(marker)) fail(rel + ': 缺少 ' + marker);
  }
}

function validateFormalUnitFrontmatter(fm, rel) {
  for (const field of REQUIRED_FORMAL_UNIT_FIELDS) {
    if (!Object.hasOwn(fm, field)) fail(`${rel}: 缺少 frontmatter 字段 ${field}`);
  }
  for (const field of ['id', 'stage', 'track', 'domain', 'topic', 'age_range', 'difficulty', 'review_status']) {
    validateStringField(fm, field, rel);
  }
  for (const field of ['references', 'tags', 'learning_paths', 'related_prompts']) {
    validateStringArrayField(fm, field, rel);
  }
}

function assertExactSet(actual, expected, label) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
    fail(`${label}不匹配。\n期望：${JSON.stringify(sortedExpected)}\n实际：${JSON.stringify(sortedActual)}`);
  }
}

const rootIndex = readMarkdown(path.join(COURSE, '_index.md'));
for (const rel of REQUIRED_SLICE) readMarkdown(path.join(COURSE, rel));
const validationProtocolRel = 'capstone/validation-protocol.md';
const validationProtocol = readMarkdown(path.join(COURSE, validationProtocolRel));
if (validationProtocol.fm.page_type !== 'learning-validation-protocol') {
  fail(`${validationProtocolRel}: page_type 必须是 learning-validation-protocol`);
}
if (validationProtocol.fm.review_status !== 'draft') {
  fail(`${validationProtocolRel}: review_status 必须是 draft`);
}
validateHeadingsInOrder(validationProtocol.content, REQUIRED_PROTOCOL_HEADINGS, validationProtocolRel);
if (rootIndex.fm.page_type !== 'route-index') fail('课程总入口必须是 route-index');
if (rootIndex.fm.route_group !== ROUTE_GROUP) fail('课程总入口 route_group 不正确');
if (rootIndex.fm.domain !== 'system-architecture') fail('课程总入口 domain 不正确');
validateSourceContains(rootIndex.content, REQUIRED_ROOT_MARKERS, 'interests/system-architecture/_index.md');

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
  validateSourceContains(page.content, REQUIRED_PHASE_HEADINGS, rel);
});

const interestIndex = fs.readFileSync(path.join(ROOT, 'interests/_index.md'), 'utf8');
if (!interestIndex.includes('system-architecture/_index.md')) fail('兴趣总索引未链接系统架构课程');
const siteBuilder = fs.readFileSync(path.join(ROOT, 'website/scripts/build-site.js'), 'utf8');
validateSourceContains(siteBuilder, ["siteUrl('interests/')", '按兴趣探索'], 'website/scripts/build-site.js');

const formalRoots = PHASES.map(([dir]) => path.join(COURSE, dir));
formalRoots.push(path.join(COURSE, 'capstone'));
const formalUnits = formalRoots.flatMap(dir => collectFormalUnits(dir));
assertExactSet(
  formalUnits.map(file => path.relative(COURSE, file)),
  REQUIRED_SLICE,
  '正式知识单元集合',
);
for (const file of formalUnits) {
  const page = readMarkdown(file);
  const rel = path.relative(ROOT, file);
  validateFormalUnitFrontmatter(page.fm, rel);
  if (page.fm.track !== 'interests') fail(`${rel}: track 必须是 interests`);
  if (page.fm.domain !== 'system-architecture') fail(`${rel}: domain 必须是 system-architecture`);
  if (page.fm.review_status !== 'draft') fail(`${rel}: review_status 必须是 draft`);
  if (!Array.isArray(page.fm.learning_paths) || !page.fm.learning_paths.includes('system-architecture')) {
    fail(`${rel}: learning_paths 必须包含 system-architecture`);
  }
  validateHeadingsInOrder(page.content, REQUIRED_HEADINGS, rel);
  validateHeadingsInOrder(page.content, REQUIRED_FORMAL_ORIENTATION_HEADINGS, rel);
  if (/\b(TODO|TBD)\b|待补充|稍后补充/i.test(page.raw)) fail(`${rel}: 含占位文本`);
  if (page.raw.includes('gulou-agent')) fail(`${rel}: 公开课程正文不得依赖 gulou-agent`);
}

console.log(`System architecture check passed: ${PHASES.length} phases, ${formalUnits.length} formal units.`);
