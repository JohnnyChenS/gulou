#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const site = path.resolve(__dirname, '../site');

function read(rel) {
  return fs.readFileSync(path.join(site, rel), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const removedPages = [
  'paths/0-3/physical.html',
  'paths/3-6/cognitive-psychological.html',
  'paths/3-6/physical.html',
  'paths/6-9/cognitive-psychological.html',
  'paths/6-9/physical.html',
  'paths/9-12/cognitive-psychological.html',
  'paths/9-12/physical.html',
  'paths/parenting/adolescent-physical.html',
  'paths/brain-health/index.html',
  'paths/brain-health/0-18-development-and-learning.html',
  'paths/brain-health/evidence-based-learning.html',
];

for (const page of removedPages) {
  assert(!fs.existsSync(path.join(site, page)), `旧路径页面不应继续生成：${page}`);
}

const retainedPages = [
  'paths/0-3/cognitive-psychological.html',
  'paths/12-14/cognitive-psychological.html',
  'paths/12-14/physical.html',
  'paths/parenting/parent-adolescent.html',
  'paths/parenting/parent-wellbeing.html',
];

const missingParentIndexes = {
  'paths/0-3/cognitive-psychological.html': '/paths/0-3/',
  'paths/12-14/cognitive-psychological.html': '/paths/12-14/',
  'paths/12-14/physical.html': '/paths/12-14/',
  'paths/parenting/parent-adolescent.html': '/paths/parenting/',
  'paths/parenting/parent-wellbeing.html': '/paths/parenting/',
};

for (const page of retainedPages) {
  const html = read(page);
  assert(html.includes('专题延伸') || html.includes('专题规划'), `保留页面应说明其是专题延伸或规划：${page}`);
  assert(!html.includes(`<a href="${missingParentIndexes[page]}" class="back-link">`), `页面不应生成不存在的上级入口：${page}`);
  for (const legacyField of ['completion_criteria', 'agent_should', 'prerequisites']) {
    assert(!html.includes(legacyField), `保留页面不应出现旧 Agent 字段 ${legacyField}：${page}`);
  }
}

const index = read('paths/index.html');
for (const page of removedPages) {
  const href = `/${page}`;
  assert(!index.includes(href), `路径索引不应继续链接已删除页面：${href}`);
}

assert(index.includes('/paths/learning/ages/index.html'), '路径索引应保留新的按年龄学习路线入口');
assert(!index.includes('/paths/brain-health/'), '路径索引不应链接已移除的脑健康入口');

const framework = path.resolve(__dirname, '../../references/brain-health-evidence-framework.md');
assert(fs.existsSync(framework), '编辑用脑健康证据框架应保留');

const elderBrainHealth = 'stages/60-plus/cognitive-maintenance/brain-health-01.html';
assert(fs.existsSync(path.join(site, elderBrainHealth)), '60+ 岁阶段应保留本地脑健康与认知保持文章');

const stage12to14 = read('stages/family/parenting/12-14/index.html');
assert(!stage12to14.includes('/paths/12-14/cognitive-psychological.html'), '12–14 岁页面不应链接旧认知路径');
assert(stage12to14.includes('/paths/12-14/physical.html'), '12–14 岁页面应保留身体能力专题入口');
assert(read('paths/12-14/physical.html').includes('状态：</strong>规划中'), '12–14 岁身体规划页应显示中文规划状态');

console.log('Legacy path migration checks passed');
