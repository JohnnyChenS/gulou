#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../site/stages/family/parenting/0-3/index.html');
const page = fs.readFileSync(pagePath, 'utf8');
const quickStartPath = path.resolve(__dirname, '../site/stages/family/parenting/quick-start.html');
const quickStart = fs.readFileSync(quickStartPath, 'utf8');

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

assert(quickStart.includes('先处理安全问题'), '快速入口应先提供安全分流');
assert(quickStart.includes('按孩子当前阶段进入'), '快速入口应按阶段导航，而不是按固定达标项导航');
assert(quickStart.includes('/stages/family/parenting/0-3/日常护理/newborn-sleep-01.html'), '快速入口应链接到新生儿睡眠正文');
assert(!quickStart.includes('按月龄速查'), '快速入口不应传播旧的月龄速查框架');
for (const legacyPhrase of ['200-300 词', '自主意志', '符号思维', '共情萌芽', '400-161-9995']) {
  assert(!quickStart.includes(legacyPhrase), `快速入口不应保留旧表述：${legacyPhrase}`);
}

console.log('0–3 entry checks passed');
