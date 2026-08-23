#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../site/stages/family/parenting/0-3/index.html');
const page = fs.readFileSync(pagePath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const monthly = page.match(/<h3>月龄观察地图<\/h3>[\s\S]*?<h3>月龄相关内容<\/h3>/)?.[0] || '';
const related = page.match(/<h3>月龄相关内容<\/h3>[\s\S]*?<h3>主题关联，而非学习顺序<\/h3>/)?.[0] || '';

assert(monthly, '0–3 岁页面应包含月龄观察地图区块');
assert(monthly.includes('不是达标表'), '月龄观察地图应说明其不是达标表');
assert(monthly.includes('可以观察的变化'), '月龄观察地图应使用可观察变化，而不是固定达标要求');
assert(!monthly.includes('<a '), '月龄观察地图不应重复具体能力文章链接');

assert(related, '0–3 岁页面应包含月龄相关内容区块');
for (const label of ['产前准备与迎接新生儿', '新手父母心理调适', '日常护理指南', '母语与多语言互动（0–3 岁）']) {
  assert(related.includes(label), `月龄相关内容应保留${label}入口`);
}

console.log('0–3 month table checks passed');
