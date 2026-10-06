#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pagePath = path.resolve(__dirname, '../site/stages/family/parenting/0-3/index.html');
const page = fs.readFileSync(pagePath, 'utf8');
const routePath = path.resolve(__dirname, '../site/paths/parenting/new-parent/index.html');
const route = fs.readFileSync(routePath, 'utf8');
const chapterPath = path.resolve(__dirname, '../site/paths/parenting/new-parent/10-six-weeks-to-three-months.html');
const chapter = fs.readFileSync(chapterPath, 'utf8');
const quickStartPath = path.resolve(__dirname, '../site/stages/family/parenting/quick-start.html');
const quickStart = fs.readFileSync(quickStartPath, 'utf8');
const oldAgeRoutePath = path.resolve(__dirname, '../site/paths/learning/ages/0-3.html');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(route.includes('新手父母连续阅读'), '0–3 岁连续理解应从新手父母主线进入');
assert(route.includes('十五章主线'), '新手父母主线应列出完整十五章');
assert(chapter.includes('route-chapter-list'), '新手父母章节页应使用可展开的章节列表');
for (const chapter of ['01-before-birth.html', '08-reading-baby-signals.html', '15-twenty-four-to-thirty-six-months.html']) {
  assert(route.includes(chapter), `新手父母主线应包含${chapter}`);
}

assert(page.includes('宝宝照料与成长：需要时查'), '0–3 岁页面应明确自己是按需查阅页');
assert(page.includes('正在照料宝宝'), '0–3 岁页面应提供日常照料入口');
assert(page.includes('想理解宝宝的变化'), '0–3 岁页面应提供发展理解入口');
assert(page.includes('安全与求助'), '0–3 岁页面应先提供安全分流');
assert(page.includes('怎样观察并准备咨询'), '0–3 岁页面应提供持续担忧时的咨询入口');
for (const carePage of ['crying-checklist-01.html', 'holding-newborn-01.html', 'feeding-guide-01.html', 'burping-guide-01.html', 'diaper-changing-01.html', 'newborn-sleep-01.html', 'colic-relief-01.html', 'bathing-care-01.html']) {
  assert(page.includes(`日常护理/${carePage}`), `0–3 岁页面应能找到日常照料：${carePage}`);
}
for (const topicPage of ['learning-foundations-01.html', 'attachment-01.html', 'cause-effect-01.html', 'object-permanence-01.html', 'joint-attention-01.html', 'early-reading-01.html', 'screen-time-01.html', 'symbolic-thinking-01.html', 'self-awareness-01.html', 'empathy-01.html', 'autonomy-01.html']) {
  assert(page.includes(`cognitive/${topicPage}`), `0–3 岁页面应能找到当前专题：${topicPage}`);
}
assert(!page.includes('月龄观察地图'), '0–3 岁查阅页不应再用月龄地图组织阅读');
assert(!page.includes('月龄相关内容'), '0–3 岁查阅页不应再保留旧月龄路线区块');

assert(quickStart.includes('先处理安全问题'), '快速入口应先提供安全分流');
assert(quickStart.includes('/stages/family/parenting/0-3/日常护理/newborn-sleep-01.html'), '快速入口应链接到日常照料正文');
assert(quickStart.includes('/stages/family/parenting/0-3/cognitive/attachment-01.html'), '快速入口应链接到当前认知专题');
assert(!quickStart.includes('按月龄速查'), '快速入口不应传播旧的月龄速查框架');

assert(!fs.existsSync(oldAgeRoutePath), '旧 0–3 岁年龄路线壳应已删除');

console.log('0–3 entry checks passed');
