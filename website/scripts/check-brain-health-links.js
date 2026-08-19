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

function routeNav(html) {
  return html.match(/<section class="route-nav"[\s\S]*?<\/section>/)?.[0] || '';
}

const evidence = read('paths/brain-health/evidence-based-learning.html');
const hub = read('paths/brain-health/index.html');
const ageRoute = read('paths/learning/ages/9-12.html');
const questionRoute = read('paths/learning/questions/school-learning.html');

assert(!evidence.includes('<section class="route-nav"'), '循证学习文章不应绑定年龄路线');
assert(!evidence.includes('/stages/family/parenting/9-12/'), '循证学习文章不应出现 9-12 岁路线链接');
assert(hub.includes('href="/paths/brain-health/evidence-based-learning.html"'), '脑健康总页应链接循证学习方法');
assert(!routeNav(ageRoute).includes('evidence-based-learning'), '9-12 岁路线主步骤不应绑定全局循证文章');
assert(!routeNav(questionRoute).includes('evidence-based-learning'), '学校学习路线主步骤不应绑定全局循证文章');

const ageEntries = {
  '0–3 岁': '/stages/family/parenting/0-3/index.html',
  '3–6 岁': '/stages/family/parenting/3-6/index.html',
  '6–9 岁': '/stages/family/parenting/6-9/index.html',
  '9–12 岁': '/stages/family/parenting/9-12/index.html',
  '12–14 岁': '/stages/family/parenting/12-14/index.html',
  '14–18 岁': '/stages/family/parenting/14-18/index.html',
  '大学期（18–22 岁）': '/stages/18-22/index.html',
  '职场开始（22–28 岁）': '/stages/22-28/index.html',
  '职场发展（28–40 岁）': '/stages/28-40/index.html',
  '家庭期（25–45 岁）': '/stages/family/index.html',
  '中年期（40–60 岁）': '/stages/40-60/index.html',
  '老年期（60+ 岁）': '/stages/60-plus/index.html',
};

for (const [label, href] of Object.entries(ageEntries)) {
  assert(hub.includes(`href="${href}"`), `脑健康总页应提供${label}入口`);
}

for (const age of ['0-3', '3-6', '6-9', '9-12', '12-14', '14-18']) {
  const page = read(`stages/family/parenting/${age}/index.html`);
  assert(page.includes('href="/paths/brain-health/index.html"'), `${age} 岁页面应提供脑健康总页入口`);
}

console.log('Brain health link checks passed');
