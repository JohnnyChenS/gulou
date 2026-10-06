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
const parentSupport = fs.readFileSync(path.resolve(__dirname, '../site/stages/family/parenting/parents/index.html'), 'utf8');
const prenatal = fs.readFileSync(path.resolve(__dirname, '../site/stages/family/parenting/parents/prenatal/prenatal-preparation-01.html'), 'utf8');
const sleep = fs.readFileSync(path.resolve(__dirname, '../site/stages/family/parenting/parents/postpartum/sleep-deprivation-01.html'), 'utf8');
const depression = fs.readFileSync(path.resolve(__dirname, '../site/stages/family/parenting/parents/postpartum/postpartum-depression-01.html'), 'utf8');
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
for (const carePage of ['crying-checklist-01.html', 'holding-newborn-01.html', 'feeding-guide-01.html', 'burping-guide-01.html', 'diaper-changing-01.html', 'newborn-sleep-01.html', 'colic-relief-01.html', 'bathing-care-01.html', 'vaccination-guide-01.html']) {
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

// A reader may enter at their baby's current age without reading chapter 8.
const chapterSafety = chapter.match(/<h2\b[^>]*>出现这些变化，先求助<\/h2>[\s\S]*?(?=<h2\b)/)?.[0] || '';
assert(chapterSafety, '第十章应在互动方法前独立展示安全分流');
const interactionHeading = chapter.match(/<h2\b[^>]*>先找到“可以来回”的时刻<\/h2>/)?.[0] || '';
assert(interactionHeading && chapter.indexOf(chapterSafety) < chapter.indexOf(interactionHeading), '第十章安全分流应先于互动方法');
for (const signal of ['呼吸费力', '难以唤醒', '没有反应', '抽搐', '立即联系当地急救']) {
  assert(chapterSafety.includes(signal), `第十章应直接说明急救条件：${signal}`);
}
assert(/三个月及以下[\s\S]*直肠温度[\s\S]*38°C[\s\S]*立即联系儿科/.test(chapterSafety), '第十章应明确适用年龄、测温部位、发热阈值与求助动作');
assert(chapterSafety.includes('不为取得某个读数而等待'), '量不准或宝宝状态不对时不应等待读数');
assert(chapterSafety.includes('主管团队的方案'), '第十章应保留特殊情况的个体医嘱边界');

// Preserve caregiver safety and support guarantees independently of age-route
// naming, so removing a redundant directory does not remove these checks.
assert(parentSupport.includes('/paths/parenting/new-parent/index.html'), '父母支持应连接新手父母主线');
assert(parentSupport.includes('/stages/family/parenting/index.html'), '父母支持应能返回当前唯一年龄目录入口');
assert(parentSupport.includes('不把父母文章算作孩子年龄主线的进度'), '父母支持应与孩子主线并行');
const crisisStart = parentSupport.indexOf('id="有立即危险-先求助"');
const readingStart = parentSupport.indexOf('id="新生儿家庭的四篇短路线"');
assert(crisisStart >= 0 && readingStart > crisisStart, '父母支持入口应先分流危机，再提供阅读路线');
for (const signal of ['伤害自己或孩子', '幻觉', '无法保证安全', '接手孩子', '当地急救']) {
  assert(parentSupport.includes(signal), `父母支持应保留危机条件或安全交接：${signal}`);
}
assert(prenatal.includes('支持与分工'), '产前准备应覆盖支持与照料分工');
assert(!prenatal.includes('68%'), '产前准备不应恢复缺少语境的固定比例承诺');
assert(!prenatal.includes('奶瓶（即使母乳喂养也备 1-2 个）'), '产前准备不应恢复非必要的固定用品清单');
assert(sleep.includes('一段连续休息'), '睡眠剥夺应以连续休息和明确交接为行动目标');
for (const legacyPhrase of ['21:00-1:00', '1-2 分钟']) {
  assert(!sleep.includes(legacyPhrase), `睡眠剥夺不应恢复旧的固定安排：${legacyPhrase}`);
}
assert(depression.includes('分娩者、父亲、伴侣和其他照料者'), '心理支持应覆盖不同照料者');
for (const signal of ['立即求助', '可靠的成人立即接手宝宝', '不要让处于危机中的人独处', '当地急救服务']) {
  assert(depression.includes(signal), `产后抑郁页面应保留危机求助动作：${signal}`);
}
for (const content of [quickStart, sleep, depression]) {
  assert(!content.includes('400-161-9995'), '照料和心理支持页面不应恢复未经核实的旧热线');
}

assert(!fs.existsSync(oldAgeRoutePath), '旧 0–3 岁年龄路线壳应已删除');

console.log('0–3 entry checks passed');
