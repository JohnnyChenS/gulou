---
id: parenting-adolescent
name: 青春期父母指导路径
stage: family
domain: parenting-support
description: 14-18 岁青少年父母的育儿指导路径，覆盖沟通重建、冲突应对、心理危机识别、学业压力和数字生活管理
estimated_duration: 孩子 14-18 岁（持续进行）
review_status: draft
---

# 青春期父母指导路径

## 路径总览

本路径覆盖 14-18 岁青少年父母最核心的 5 个育儿挑战：亲子沟通重建、叛逆与冲突应对、心理健康危机识别、升学压力管理、数字设备治理。路径分为两个模块：核心能力模块（沟通和冲突是基础）和专项议题模块（心理健康、学业、数字生活可按需触发）。

本路径与 `parenting-wellbeing`（父母心理健康路径）互补：wellbeing 路径关注父母自身的心理状态（0-14 岁），本路径关注父母应对青少年的育儿能力（14-18 岁）。两者有部分 Prompt 共享（如育儿焦虑管理、比较与竞争心理）。

## 模块一：核心能力

### Step 1: 青春期亲子沟通

- **prompt**: 14-18-core-parent-teen-communication-01
- **prerequisites**: 无（起始步骤）
- **age_range**: 14-18y
- **completion_criteria**:
  - 用户理解青春期沟通模式转变的发展原因
  - 用户已开始使用"观察式"而非"指责式"的沟通方式
  - 用户能在孩子表达不同意见时保持倾听
- **trigger**:
  - condition: state-based
  - description: 用户报告孩子"不和我说话""一说话就吵架""回家就关门"
  - agent_should: 了解孩子年龄和具体沟通困境，从理解沟通转变开始

### Step 2: 青春期叛逆与冲突应对

- **prompt**: 14-18-core-adolescent-rebellion-01
- **prerequisites**: [14-18-core-parent-teen-communication-01]
- **age_range**: 14-18y
- **completion_criteria**:
  - 用户能区分"正常自主性追求"和"危险行为信号"
  - 用户已掌握冲突"暂停键"的使用方法
  - 用户能区分"安全底线"和"个人偏好"并分别设定规则
- **trigger**:
  - condition: state-based
  - description: 用户报告亲子冲突频繁升级、孩子挑战规则、或出现叛逆行为
  - agent_should: 了解具体冲突场景，帮助用户区分叛逆的发展功能和危险信号

## 模块二：专项议题

### Step 3: 青少年心理健康危机识别

- **prompt**: 14-18-core-adolescent-mental-health-01
- **prerequisites**: [14-18-core-parent-teen-communication-01]
- **age_range**: 14-18y
- **completion_criteria**:
  - 用户能区分正常青春期情绪波动和需要关注的心理信号（绿/黄/红灯）
  - 用户知道如何开口谈论心理健康话题
  - 用户了解中国地区的心理危机热线和求助渠道
- **trigger**:
  - condition: state-based
  - description: 用户报告孩子持续情绪低落、自伤行为、社交退缩、或表达自杀想法
  - agent_should: 立即评估紧急程度，必要时建议就医并提供热线，不要等待更多信息

### Step 4: 升学压力与学业焦虑

- **prompt**: 14-18-core-academic-pressure-01
- **prerequisites**: []
- **age_range**: 14-18y
- **completion_criteria**:
  - 用户能区分"关心学业"和"制造压力"
  - 用户已调整期望管理方式（关注过程而非结果）
  - 用户能在升学阶段维护亲子关系
- **trigger**:
  - condition: state-based
  - description: 用户报告孩子考试焦虑、成绩下滑导致家庭冲突、或自己比孩子还焦虑
  - agent_should: 了解孩子年级和具体学业困境，帮助用户管理自己的焦虑

### Step 5: 数字设备与网络管理

- **prompt**: 14-18-core-digital-life-01
- **prerequisites**: []
- **age_range**: 14-18y
- **completion_criteria**:
  - 用户能区分"高频使用"和"问题性使用"
  - 用户已建立家庭数字使用规则（全家适用）
  - 用户了解网络安全基本知识
- **trigger**:
  - condition: state-based
  - description: 用户报告孩子沉迷游戏、社交媒体问题、或因手机引发频繁冲突
  - agent_should: 了解具体使用情况和冲突场景，帮助用户从"禁止"转向"引导式管理"
