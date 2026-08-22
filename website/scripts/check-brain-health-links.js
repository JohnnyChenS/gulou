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
  ['stages/family/parenting/12-14/cognitive/metacognition-learning-strategies-01.html', '延迟检索'],
  ['stages/family/parenting/14-18/cognitive/autonomous-learning-and-interest-01.html', '学习计划'],
];
for (const [page, marker] of localLearningPages) {
  assert(exists(page), `年龄阶段学习文章应保留：${page}`);
  assert(read(page).includes(marker), `年龄阶段学习文章应包含本地学习方法：${page}`);
}

const elderArticle = 'stages/60-plus/cognitive-maintenance/brain-health-01.html';
assert(exists(elderArticle), '60+ 岁阶段应保留脑健康与认知保持文章');
assert(read(elderArticle).includes('何时就医'), '60+ 岁脑健康文章应保留就医提示');

const learningRoutes = {
  '0-3': '/paths/learning/ages/0-3.html',
  '3-6': '/paths/learning/ages/3-6.html',
  '6-9': '/paths/learning/ages/6-9.html',
  '9-12': '/paths/learning/ages/9-12.html',
  '12-14': '/paths/learning/ages/12-14.html',
  '14-18': '/paths/learning/ages/14-18.html',
};

for (const [age, href] of Object.entries(learningRoutes)) {
  const page = read(`stages/family/parenting/${age}/index.html`);
  assert(page.includes(`href="${href}"`), `${age} 岁页面应提供对应的按年龄学习路线`);
  assert(page.includes('href="/paths/learning/index.html"'), `${age} 岁页面应提供学习路径总览入口`);
}

console.log('Brain health link checks passed');
