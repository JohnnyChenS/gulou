#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const site = path.resolve(__dirname, '../site');
const read = rel => fs.readFileSync(path.join(site, rel), 'utf8');
const removedPages = [
  'paths/0-3/cognitive-psychological.html', 'paths/0-3/physical.html',
  'paths/3-6/cognitive-psychological.html', 'paths/3-6/physical.html',
  'paths/6-9/cognitive-psychological.html', 'paths/6-9/physical.html',
  'paths/9-12/cognitive-psychological.html', 'paths/9-12/physical.html',
  'paths/12-14/cognitive-psychological.html', 'paths/12-14/physical.html',
  'paths/parenting/adolescent-physical.html', 'paths/parenting/parent-wellbeing.html',
  'paths/parenting/parent-adolescent.html', 'paths/learning/index.html',
  'paths/learning/ages/index.html', ...['0-3', '3-6', '6-9', '9-12', '12-14', '14-18'].map(age => `paths/learning/ages/${age}.html`),
  'paths/learning/questions/learning-habits.html',
  'paths/brain-health/index.html', 'paths/brain-health/0-18-development-and-learning.html',
  'paths/brain-health/evidence-based-learning.html',
  'stages/family/parenting/0-3/daily-care/index.html',
];
for (const page of removedPages) assert.ok(!fs.existsSync(path.join(site, page)), `重复入口不应生成兼容页：${page}`);
const htmlFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
collect(site);
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const page of removedPages) assert.ok(!html.includes('/' + page), `仍引用已删除入口：${path.relative(site, file)} → ${page}`);
}
const home = read('index.html');
const base = new URL(home.match(/href="([^"]*\/assets\/style\.css[^"]*)"/)[1], 'https://gulou.invalid').pathname.split('/assets/')[0];
const index = read('paths/index.html');
function destinations(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match => {
    let pathname = new URL(match[1].replaceAll('&amp;', '&'), 'https://gulou.invalid').pathname.slice(base.length);
    return pathname.endsWith('/') ? pathname + 'index.html' : pathname;
  });
}
for (const page of ['paths/parenting/new-parent/', 'paths/exploration/youth/', 'stages/family/parenting/parents/index.html', 'stages/family/parenting/index.html']) {
  const target = `/${page.endsWith('/') ? page + 'index.html' : page}`;
  assert.ok(destinations(index).includes(target), `阅读总入口缺少有效入口：${page}`);
}
const parenting = read('stages/family/parenting/index.html');
for (const age of ['3-6', '6-9', '9-12', '12-14', '14-18']) {
  const target = `/stages/family/parenting/${age}/index.html`;
  assert.ok(destinations(parenting).includes(target), `年龄选择页缺少唯一目录：${age}`);
}
assert.ok(read('stages/family/parenting/parents/index.html').includes('route-steps'), '父母支持目录应合并短路线');
assert.ok(fs.existsSync(path.join(site, 'stages/family/parenting/12-14/cognitive/body-development-01.html')), '青春期身体正文不能随路径壳一起删除');
assert.ok(fs.existsSync(path.join(site, 'stages/60-plus/cognitive-maintenance/brain-health-01.html')), '老年脑健康正文应保留');
assert.ok(fs.existsSync(path.resolve(__dirname, '../../references/brain-health-evidence-framework.md')), '作者证据框架应保留');
console.log(`Canonical entry migration passed: ${removedPages.length} removed destinations, ${htmlFiles.length} HTML pages checked`);
