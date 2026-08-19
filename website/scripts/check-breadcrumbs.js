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

const home = read('index.html');
const family = read('stages/family/parenting/0-3/index.html');
const route = read('paths/learning/ages/0-3.html');
const familyBreadcrumb = family.match(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/)?.[0] || '';

assert(!home.includes('aria-label="当前位置"'), '首页不应显示面包屑');
assert(family.includes('aria-label="当前位置"'), '年龄页应显示面包屑');
assert(familyBreadcrumb.includes('class="breadcrumbs-list"'), '面包屑应使用横向路径容器');
assert(!familyBreadcrumb.includes('<ol>'), '面包屑不应使用带编号的列表');
assert(familyBreadcrumb.includes('breadcrumbs-separator'), '面包屑应显示路径分隔符');
assert(family.includes('href="/stages/"'), '年龄页面包屑应包含阶段主线');
assert(family.includes('href="/stages/family/"'), '年龄页面包屑应包含家庭期');
assert(family.includes('href="/stages/family/parenting/"'), '年龄页面包屑应包含育儿指导');
assert(family.includes('婴幼儿'), '年龄页面包屑应显示当前年龄');
assert(route.includes('aria-label="当前位置"'), '学习路径页应显示面包屑');
assert(route.includes('href="/paths/"'), '学习路径页面包屑应包含学习路径');

console.log('Breadcrumb checks passed');
