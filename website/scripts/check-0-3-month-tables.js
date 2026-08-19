#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../site/stages/family/parenting/0-3/index.html');
const page = fs.readFileSync(pagePath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const monthly = page.match(/<h3>月龄速查表<\/h3>[\s\S]*?<h3>学习路径图<\/h3>/)?.[0] || '';
const related = page.match(/<h3>月龄相关内容<\/h3>[\s\S]*?<h3>学习路径图<\/h3>/)?.[0] || '';

assert(monthly, '0–3 岁页面应包含月龄速查表区块');
assert(monthly.includes('月龄表用于观察表现差异'), '月龄表应说明其用途是观察表现差异');
assert(!monthly.includes('<th>详情</th>'), '月龄表不应重复详情列');
assert(!monthly.includes('/cognitive/early-reading-01.html'), '月龄表不应重复早期阅读链接');
assert(!monthly.includes('/cognitive/joint-attention-01.html'), '月龄表不应重复联合注意链接');
assert(!monthly.includes('/physical/gross-motor-01.html'), '月龄表不应重复粗大动作链接');

assert(related, '0–3 岁页面应包含月龄相关内容区块');
for (const label of ['产前准备与迎接新生儿', '新手父母心理调适', '日常护理指南', '母语发展（0–3 岁）']) {
  assert(related.includes(label), `月龄相关内容应保留${label}入口`);
}

console.log('0–3 month table checks passed');
