---
id: parenting-wellbeing
name: 父母心理健康路径
stage: family
domain: parenting-support
description: 从产前准备到持续自我照顾的父母心理健康完整路径
estimated_duration: 孕期到孩子成年（持续进行）
review_status: draft
---

# 父母心理健康路径

## 路径总览

本路径覆盖父母（照料者）心理健康的 13 个关键领域，从产前心理准备到持续的自我照顾。路径分为三个阶段：产前准备期（怀孕到分娩）、新生儿适应期（0-12个月）、持续养育期（1岁后）。每个阶段都有核心任务和可选支持模块。

## 阶段一：产前准备期

### Step 1: 产前准备与迎接新生儿

- **prompt**: parenting-prenatal-preparation-01
- **prerequisites**: 无（起始步骤）
- **age_range**: prenatal-3m
- **completion_criteria**:
  - 用户了解新生儿出生后第一个月的关键知识
  - 用户已和伴侣讨论过角色分工和支持计划
  - 用户能区分"正常紧张"和"需要关注的情绪问题"
  - 准爸爸已建立"共同养育者"心态
- **trigger**:
  - condition: user-initiated
  - description: 用户怀孕中后期或即将迎来第一个孩子
  - agent_should: 了解用户的具体情况（预产期、第几个孩子、最担心什么），提供针对性指导

## 阶段二：新生儿适应期（0-12个月）

### Step 2: 新手父母心理调适

- **prompt**: parenting-parental-wellbeing-01
- **prerequisites**: [parenting-prenatal-preparation-01]
- **age_range**: 0-12m
- **completion_criteria**:
  - 用户能识别产后正常情绪波动和需要关注的情绪问题
  - 用户已建立基本的自我照顾习惯（哪怕只是每天 15 分钟）
  - 用户了解父亲产后抑郁的表现
- **trigger**:
  - condition: event-based
  - description: 孩子出生后，或用户报告产后情绪困扰
  - agent_should: 了解孩子月龄和用户当前情绪状态，区分"正常疲惫"和"需要关注"

### Step 3: 睡眠剥夺应对

- **prompt**: parenting-sleep-deprivation-01
- **prerequisites**: [parenting-parental-wellbeing-01]
- **age_range**: 0-12m
- **completion_criteria**:
  - 用户了解主要的婴儿睡眠训练方法及其利弊
  - 用户已根据自身育儿理念选择了适合的睡眠策略
  - 用户了解安全睡眠实践
- **trigger**:
  - condition: state-based
  - description: 用户报告长期睡眠不足、孩子频繁夜醒、或对睡眠训练方法感到困惑
  - agent_should: 了解孩子月龄、当前睡眠模式、用户的育儿理念，客观介绍方法

### Step 4: 产后抑郁识别与应对（核心）

- **prompt**: parenting-postpartum-depression-01
- **prerequisites**: [parenting-parental-wellbeing-01]
- **age_range**: 0-24m
- **completion_criteria**:
  - 用户能区分 Baby Blues、产后抑郁、产后焦虑等不同类型
  - 用户了解何时需要寻求专业帮助
  - 用户知道中国地区的紧急求助渠道
- **trigger**:
  - condition: state-based
  - description: 用户报告持续两周以上的情绪低落、无法感受快乐、对婴儿失去兴趣等信号
  - agent_should: 评估严重程度，提供分层应对建议，必要时建议立即就医并提供热线

### Step 5: 夫妻关系产后调适

- **prompt**: parenting-couple-adjustment-01
- **prerequisites**: [parenting-parental-wellbeing-01]
- **age_range**: 0-36m
- **completion_criteria**:
  - 用户了解产后夫妻关系的常见冲突模式
  - 用户已开始使用"温和启动"等沟通技巧
  - 用户能识别家庭暴力/亲密伴侣暴力的信号
- **trigger**:
  - condition: state-based
  - description: 用户报告产后夫妻关系紧张、频繁争吵、感觉被忽视
  - agent_should: 了解具体冲突场景，提供基于 Gottman 理论的沟通策略

## 阶段三：持续养育期

### Step 6: 代际育儿观念冲突

- **prompt**: parenting-intergenerational-parenting-01
- **prerequisites**: []
- **age_range**: 0-6y
- **completion_criteria**:
  - 用户能理解长辈的育儿观念背后的心理需求
  - 用户已掌握"温和而坚定"的边界设定方法
  - 用户能在冲突中找到妥协和坚持的平衡
- **trigger**:
  - condition: state-based
  - description: 用户报告与长辈在育儿观念上产生冲突（喂养、穿着、睡眠、医疗等）
  - agent_should: 了解具体冲突情境，提供理解长辈视角、表达自己立场的具体话术

### Step 7: 育儿社交支持网络

- **prompt**: parenting-support-network-01
- **prerequisites**: []
- **age_range**: 0-6y
- **completion_criteria**:
  - 用户已识别自己现有的支持网络
  - 用户了解不同类型支持（情感支持、实际帮助、信息支持）的区别
  - 用户已迈出寻求帮助的第一步
- **trigger**:
  - condition: state-based
  - description: 用户报告感到孤独、缺乏支持、或不知道如何寻求帮助
  - agent_should: 帮助用户盘点现有资源，找到"今天就可以联系的一个人"

### Step 8: 比较与竞争心理

- **prompt**: parenting-comparison-anxiety-01
- **prerequisites**: []
- **age_range**: 0-18y
- **completion_criteria**:
  - 用户能识别社会比较对自己和孩子的影响
  - 用户已建立"关注自家孩子发展节奏"的意识
  - 用户有应对"别人家孩子"比较的具体策略
- **trigger**:
  - condition: state-based
  - description: 用户在家长群、社交媒体上看到别人家孩子的表现后感到焦虑
  - agent_should: 帮助用户区分"合理关注"和"有害比较"，提供认知重评策略

### Step 9: 育儿焦虑管理

- **prompt**: parenting-anxiety-01
- **prerequisites**: []
- **age_range**: 0-18y
- **completion_criteria**:
  - 用户能区分正常担忧和过度焦虑（绿/黄/红灯）
  - 用户已掌握焦虑急救策略
  - 用户了解焦虑的代际传递机制
- **trigger**:
  - condition: state-based
  - description: 用户报告焦虑影响睡眠、回避正常活动、或反复寻求保证
  - agent_should: 评估焦虑严重程度，提供分级应对建议

### Step 10: 完美主义陷阱

- **prompt**: parenting-perfectionism-trap-01
- **prerequisites**: [parenting-anxiety-01]
- **age_range**: 0-18y
- **completion_criteria**:
  - 用户能识别自己的完美主义思维模式
  - 用户已开始实践"足够好的父母"理念
  - 用户有具体的自我关怀练习
- **trigger**:
  - condition: state-based
  - description: 用户报告对自己育儿方式的高标准、频繁自责、或"我做得不够好"的感受
  - agent_should: 引入 Winnicott "足够好的父母"概念，提供具体的自我关怀练习

### Step 11: 兴趣与身份保持

- **prompt**: parenting-identity-maintenance-01
- **prerequisites**: []
- **age_range**: 0-18y
- **completion_criteria**:
  - 用户能列出自己除"父母"之外的其他身份
  - 用户已开始维护至少一个个人兴趣或社交关系
  - 用户理解"保持自我不是对孩子的背叛"
- **trigger**:
  - condition: state-based
  - description: 用户报告"我除了是妈妈/爸爸什么都不是"、失去个人兴趣、社交萎缩
  - agent_should: 帮助用户盘点身份清单，找到"最小可行行动"恢复一个身份

### Step 12: 父母身心健康

- **prompt**: parenting-parent-health-01
- **prerequisites**: []
- **age_range**: 0-18y
- **completion_criteria**:
  - 用户已评估自己的健康阶段（基本生存/勉强维持/有余力改善）
  - 用户已建立最小可行的健康习惯
  - 用户了解何时需要就医
- **trigger**:
  - condition: state-based
  - description: 用户报告长期疲劳、身体不适、或健康习惯完全崩塌
  - agent_should: 先评估用户所处阶段，给出不超出其当前能力的建议

### Step 13: 父母自我时间管理

- **prompt**: parenting-me-time-01
- **prerequisites**: []
- **age_range**: 0-18y
- **completion_criteria**:
  - 用户已识别自己每周可自由支配的时间
  - 用户能区分"真休息"和"伪休息"（如无意识刷手机）
  - 用户已开始争取自我时间并获得家人支持
- **trigger**:
  - condition: state-based
  - description: 用户报告完全没有自己的时间、感觉被掏空、或对"休息"有内疚感
  - agent_should: 帮助用户盘点可用时间，找到不同长度的自我时间活动建议
