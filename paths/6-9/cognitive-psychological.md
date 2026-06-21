---
id: 6-9-cognitive-psychological
name: 6-9岁认知与心理发展路径
stage: 6-9
domain: cognitive-psychological
description: 从学校适应到社交技能和学习习惯建立的完整认知发展路径
estimated_duration: 6-9岁（持续进行）
review_status: draft
---

# 6-9岁认知与心理发展路径

## 路径总览

本路径覆盖 6-9 岁认知与心理发展的 4 个核心能力。此阶段的核心是学校适应——从家庭环境进入正式学校教育，需要发展友谊技能（社交适应）、口头表达能力（课堂参与）、创造性思维（学科学习）和金钱概念（生活技能）。路径设计遵循从"适应学校"到"在学校中发展"的顺序。

## 步骤

### Step 1: 友谊技能

- **prompt**: 6-9-cognitive-friendship-skills-01
- **prerequisites**: 无（起始步骤）
- **age_range**: 6-9y
- **completion_criteria**:
  - 用户能描述 6-9 岁友谊发展从"玩伴"到"互惠"的转变
  - 用户已开始引导孩子建立友谊技能（轮流、分享、冲突解决）
  - 用户能区分正常社交挫折和需要关注的社交困难
- **trigger**:
  - condition: state-based
  - description: 孩子刚入学，或用户报告"孩子交不到朋友""和同学有冲突"
  - agent_should: 了解孩子的具体社交场景，从理解友谊发展阶段开始提供建议

### Step 2: 口头表达能力

- **prompt**: 6-9-cognitive-oral-expression-01
- **prerequisites**: 无（可与 Step 1 并行）
- **age_range**: 6-9y
- **completion_criteria**:
  - 用户能区分叙事、说明、观点表达三种表达类型
  - 用户已开始在日常对话中有意识地引导孩子讲述和复述
  - 用户了解口才和表达的差异，不过早追求"口才"
- **trigger**:
  - condition: state-based
  - description: 用户报告"孩子在学校不敢举手发言""讲事情说不清楚"
  - agent_should: 引导用户从日常对话中的叙事练习开始，而非直接要求孩子在公众场合表达

### Step 3: 创造性思维

- **prompt**: 6-9-cognitive-creative-thinking-01
- **prerequisites**: 无（可与 Step 1 并行）
- **age_range**: 6-9y
- **completion_criteria**:
  - 用户能区分发散思维和聚合思维，理解两者都需要发展
  - 用户已开始问开放式问题（"还有什么可能？"而非"对不对？"）
  - 用户能在不压制创造性的同时帮孩子适应学校的结构化学习
- **trigger**:
  - condition: state-based
  - description: 用户报告"孩子想法太多不守规矩""只会按老师说的做"
  - agent_should: 帮助用户在"适应学校规则"和"保持创造性"之间找到平衡

### Step 4: 金钱概念与储蓄

- **prompt**: 6-9-cognitive-money-concepts-01
- **prerequisites**: 无（可与 Step 1 并行）
- **age_range**: 6-9y
- **completion_criteria**:
  - 用户能描述 6-9 岁金钱认知的发展阶段
  - 用户已开始给孩子零花钱并建立基本储蓄习惯
  - 用户理解"劳动报酬"和"无条件给予"各有价值
- **trigger**:
  - condition: state-based
  - description: 孩子开始对钱感兴趣、要求买东西，或用户焦虑"怎么教孩子钱的概念"
  - agent_should: 了解孩子的年龄和当前金钱认知水平，从"三罐法"（储蓄/消费/分享）开始

## 待创建内容

- 守恒与逻辑运算
- 阅读习得
- 元认知发展
- 注意力发展
- 规则与道德推理
- 胜任感与自我效能
