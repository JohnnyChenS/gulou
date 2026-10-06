#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const site = path.resolve(__dirname, '../site');

function read(rel) {
  return fs.readFileSync(path.join(site, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(site, rel));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!exists('paths/brain-health'), '网站不应生成独立的脑健康路径目录');

const generatedHtml = [];
function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(full);
    else if (entry.name.endsWith('.html')) generatedHtml.push(full);
  }
}
collectHtml(site);

for (const file of generatedHtml) {
  const html = fs.readFileSync(file, 'utf8');
  assert(!html.includes('/paths/brain-health/'), `页面仍引用已移除的脑健康路径：${path.relative(site, file)}`);
  assert(!html.includes('<h2>脑健康与学习</h2>'), `页面仍有独立的脑健康与学习章节：${path.relative(site, file)}`);
}

const localLearningPages = [
  ['stages/family/parenting/6-9/cognitive/school-learning-habits-01.html', '主动回忆'],
  ['stages/family/parenting/9-12/cognitive/self-regulated-learning-01.html', '延迟后回忆'],
  ['stages/family/parenting/12-14/cognitive/metacognition-learning-strategies-01.html', '隔开一段时间后用空白纸写要点'],
  ['stages/family/parenting/14-18/cognitive/autonomous-learning-and-interest-01.html', '怎样判断计划是否在工作'],
];
for (const [page, marker] of localLearningPages) {
  assert(exists(page), `年龄阶段学习文章应保留：${page}`);
  assert(read(page).includes(marker), `年龄阶段学习文章应包含本地学习方法：${page}`);
}

const elderArticle = 'stages/60-plus/cognitive-maintenance/brain-health-01.html';
assert(exists(elderArticle), '60+ 岁阶段应保留脑健康与认知保持文章');
assert(read(elderArticle).includes('何时就医'), '60+ 岁脑健康文章应保留就医提示');

// School-age learning stays in its canonical age course, rather than a second
// brain-health course or a duplicate age wrapper.
for (const age of ['3-6', '6-9', '9-12', '12-14', '14-18']) {
  const html = read(`stages/family/parenting/${age}/index.html`);
  assert(html.includes('class="route-nav"'), `${age} 岁目录应直接编排阅读章节`);
  assert(html.includes('route-steps'), `${age} 岁目录应展示明确章节列表`);
  assert(!html.includes('/paths/learning/ages/'), `${age} 岁目录不应返回旧年龄壳页`);
}

console.log('Brain health and canonical learning course checks passed');
