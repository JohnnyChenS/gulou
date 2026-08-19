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

for (const age of ['0-3', '3-6', '6-9', '9-12', '12-14', '14-18']) {
  const page = read(`stages/family/parenting/${age}/index.html`);
  assert(page.includes('href="/paths/brain-health/index.html"'), `${age} 岁页面应提供脑健康总页入口`);
}

console.log('Brain health link checks passed');
