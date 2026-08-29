#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const entryPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/index.html');
const entry = fs.readFileSync(entryPath, 'utf8');
const assessmentPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/development-assessment.html');
const assessment = fs.readFileSync(assessmentPath, 'utf8');
const executivePath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/executive-function-01.html');
const executive = fs.readFileSync(executivePath, 'utf8');
const preLiteracyMathPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/pre-literacy-math-01.html');
const preLiteracyMath = fs.readFileSync(preLiteracyMathPath, 'utf8');
const socialPlayPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/social-play-01.html');
const socialPlay = fs.readFileSync(socialPlayPath, 'utf8');
const handEyePath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/physical/hand-eye-coordination-01.html');
const handEye = fs.readFileSync(handEyePath, 'utf8');
const attentionPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/attention-focus-01.html');
const attention = fs.readFileSync(attentionPath, 'utf8');
const curiosityPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/curiosity-and-learning-01.html');
const curiosity = fs.readFileSync(curiosityPath, 'utf8');
const delayPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/delay-of-gratification-01.html');
const delay = fs.readFileSync(delayPath, 'utf8');
const emotionRegulationPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/emotion-regulation-01.html');
const emotionRegulation = fs.readFileSync(emotionRegulationPath, 'utf8');
const theoryOfMindPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/theory-of-mind-01.html');
const theoryOfMind = fs.readFileSync(theoryOfMindPath, 'utf8');
const genderIdentityPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/gender-identity-self-concept-01.html');
const genderIdentity = fs.readFileSync(genderIdentityPath, 'utf8');
const readingHabitsPath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/reading-habits-01.html');
const readingHabits = fs.readFileSync(readingHabitsPath, 'utf8');
const screenTimePath = path.resolve(__dirname, '../site/stages/family/parenting/3-6/cognitive/screen-time-01.html');
const screenTime = fs.readFileSync(screenTimePath, 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(entry.includes('按观察进入'), '3–6 岁入口应引导家长按观察问题进入正文');
assert(entry.includes('兴趣尝试'), '3–6 岁入口应保留兴趣拓展的位置');
assert(!entry.includes('关键期'), '3–6 岁入口不应把发展写成单一关键期');
assert(!entry.includes('每日户外活动不少于2小时'), '3–6 岁入口不应把户外活动写成固定达标量');
assert(!entry.includes('建议每 3 个月做一次完整评估'), '3–6 岁入口不应要求家庭按固定周期做完整评估');
assert(!entry.includes('## 理论依据'), '3–6 岁入口不应把不同性质的理论平铺为统一依据');

assert(assessment.includes('不是一张打分表'), '3–6 岁发展评估应明确不是家庭打分表');
assert(assessment.includes('观察—调整—复盘'), '3–6 岁发展评估应提供观察、调整和复盘循环');
assert(assessment.includes('可以观察的变化'), '3–6 岁发展评估应以可观察变化组织年龄段内容');
for (const legacyPhrase of ['场景测试', '勾选式', '每 3 个月做一次']) {
  assert(!assessment.includes(legacyPhrase), `3–6 岁发展评估不应保留旧框架：${legacyPhrase}`);
}

assert(executive.includes('成人支持'), '执行功能正文应把成人支持和环境调整放在前面');
for (const legacyPhrase of ['比 IQ 更能预测学业成功', '错过这个窗口', '注意力约 5-8 分钟']) {
  assert(!executive.includes(legacyPhrase), `执行功能正文不应保留效果或年龄承诺：${legacyPhrase}`);
}

assert(preLiteracyMath.includes('阅读和数学经验'), '前阅读与前数学正文应以日常经验组织内容');
for (const legacyPhrase of ['每天读 15 分钟', '最佳预测指标', '幼小衔接班的效果是短期的']) {
  assert(!preLiteracyMath.includes(legacyPhrase), `前阅读与前数学正文不应保留未经支持的承诺：${legacyPhrase}`);
}

assert(socialPlay.includes('不同形式的游戏会交错出现'), '社会性游戏正文应说明游戏形式会重叠交错');
for (const legacyPhrase of ['关键期', '最佳训练场', '一对一的玩伴约会比去游乐场更容易建立友谊']) {
  assert(!socialPlay.includes(legacyPhrase), `社会性游戏正文不应保留线性或效果承诺：${legacyPhrase}`);
}

assert(handEye.includes('不直接代表大脑成熟'), '手眼协调正文应避免把单一动作等同于大脑成熟度');
for (const legacyPhrase of ['直接反映大脑成熟程度', '关键期', '应该能做']) {
  assert(!handEye.includes(legacyPhrase), `手眼协调正文不应保留成熟度或年龄承诺：${legacyPhrase}`);
}

assert(attention.includes('环境和任务'), '注意力正文应把环境和任务难度纳入观察');
for (const legacyPhrase of ['持续注意时长', '每天 15-30 分钟', '需要 10-15 分钟才能重新进入', '最好投资']) {
  assert(!attention.includes(legacyPhrase), `注意力正文不应保留固定时长或效果承诺：${legacyPhrase}`);
}

assert(curiosity.includes('这些是观察方向'), '好奇心正文应把年龄内容定位为观察方向');
for (const legacyPhrase of ['关键期', '最佳训练场', '最有效']) {
  assert(!curiosity.includes(legacyPhrase), `好奇心正文不应保留阶段或效果承诺：${legacyPhrase}`);
}

assert(delay.includes('可靠关系和成人支持'), '延迟满足正文应把可靠关系和成人支持放在前面');
for (const legacyPhrase of ['能等待多久', '5 岁以上仍完全不能等待任何事物', '每天 1-2 次']) {
  assert(!delay.includes(legacyPhrase), `延迟满足正文不应保留固定等待时长或频率：${legacyPhrase}`);
}

assert(emotionRegulation.includes('共同调节'), '情绪调节正文应把成人共同调节放在前面');
for (const legacyPhrase of ['预测 10 年后的社交能力和学业表现', '应该能做', '每周 2-3 次', '关键过渡期']) {
  assert(!emotionRegulation.includes(legacyPhrase), `情绪调节正文不应保留年龄或长期效果承诺：${legacyPhrase}`);
}

assert(theoryOfMind.includes('观点采择不是一场测试'), '心理理论正文应避免把理解他人写成测验');
for (const legacyPhrase of ['巨大认知飞跃', '每天 2-3 次', '每周 2-3 次', '6 岁以上仍完全不能理解他人的想法']) {
  assert(!theoryOfMind.includes(legacyPhrase), `心理理论正文不应保留夸张或固定年龄承诺：${legacyPhrase}`);
}

assert(genderIdentity.includes('兴趣和身份不是一回事'), '性别认同正文应区分兴趣、表达和身份');
for (const legacyPhrase of ['关键期', '每周 1-2 次', '4 岁以上仍不知道自己的性别', '不是好奇或探索']) {
  assert(!genderIdentity.includes(legacyPhrase), `性别认同正文不应保留线性发展或排除性判断：${legacyPhrase}`);
}

assert(readingHabits.includes('阅读可以从孩子的兴趣开始'), '阅读习惯正文应从兴趣和关系出发');
for (const legacyPhrase of ['约 12% 的差异', '每 1-2 周一次', '动态调整', '直接推动语言表达能力']) {
  assert(!readingHabits.includes(legacyPhrase), `阅读习惯正文不应保留未经支持的精确或效果承诺：${legacyPhrase}`);
}

assert(screenTime.includes('家庭媒体计划'), '屏幕管理正文应引导家庭共同制定媒体计划');
for (const legacyPhrase of ['每天 20-30 分钟', '每天 30-40 分钟', '每天 40-60 分钟', '最有效方式', '5 岁以上仍完全无法接受任何屏幕时间限制']) {
  assert(!screenTime.includes(legacyPhrase), `屏幕管理正文不应保留固定分龄时长或效果承诺：${legacyPhrase}`);
}

console.log('3–6 entry checks passed');
