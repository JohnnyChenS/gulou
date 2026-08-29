#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../site/stages/family/parenting/0-3/index.html');
const page = fs.readFileSync(pagePath, 'utf8');
const quickStartPath = path.resolve(__dirname, '../site/stages/family/parenting/quick-start.html');
const quickStart = fs.readFileSync(quickStartPath, 'utf8');
const parentSupportPath = path.resolve(__dirname, '../site/stages/family/parenting/parents/index.html');
const parentSupport = fs.readFileSync(parentSupportPath, 'utf8');
const prenatalPath = path.resolve(__dirname, '../site/stages/family/parenting/parents/prenatal/prenatal-preparation-01.html');
const prenatal = fs.readFileSync(prenatalPath, 'utf8');
const sleepPath = path.resolve(__dirname, '../site/stages/family/parenting/parents/postpartum/sleep-deprivation-01.html');
const sleep = fs.readFileSync(sleepPath, 'utf8');
const depressionPath = path.resolve(__dirname, '../site/stages/family/parenting/parents/postpartum/postpartum-depression-01.html');
const depression = fs.readFileSync(depressionPath, 'utf8');

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

assert(parentSupport.includes('0–3 岁当前重点'), '父母支持入口应明确当前 0–3 岁重点');
assert(parentSupport.includes('辅助支持路径'), '父母支持入口应说明其从属于年龄阶段主入口');
assert(!parentSupport.includes('## 理论依据'), '父母支持入口不应把不同性质的理论平铺为统一依据');

assert(prenatal.includes('支持与分工'), '产前准备应覆盖支持网络与照料分工');
assert(!prenatal.includes('68%'), '产前准备不应保留缺少当前语境的固定比例承诺');
assert(!prenatal.includes('奶瓶（即使母乳喂养也备 1-2 个）'), '产前准备不应把非必要用品写成固定清单');

assert(sleep.includes('一段连续休息'), '睡眠剥夺页面应把连续休息作为核心行动目标');
for (const legacyPhrase of ['21:00-1:00', '1-2 分钟', '400-161-9995']) {
  assert(!sleep.includes(legacyPhrase), `睡眠剥夺页面不应保留旧表述：${legacyPhrase}`);
}

assert(depression.includes('分娩者、父亲、伴侣和其他照料者'), '产后抑郁页面应覆盖不同照料者');
assert(depression.includes('立即求助'), '产后抑郁页面应明确立即求助路径');
assert(!depression.includes('400-161-9995'), '产后抑郁页面不应保留未经核实的旧热线');

console.log('0–3 entry checks passed');
