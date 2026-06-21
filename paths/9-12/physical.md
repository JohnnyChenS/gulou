---
id: 9-12-physical
name: 9-12岁身体能力发展路径
stage: 9-12
domain: physical
description: 从运动习惯锚定到青春期前健康管理的身体发展路径
estimated_duration: 9-12岁（持续进行）
review_status: draft
---

# 9-12岁身体能力发展路径

## 路径总览

本路径覆盖 9-12 岁身体能力发展的 3 个核心领域（与 6-9 岁相同但侧重点不同）。此阶段是青春期前的最后准备期——运动习惯需要从"建立"升级到"锚定"，近视防控进入最关键的高发期，学业压力开始显著压缩睡眠时间。路径设计与 6-9 岁的同名路径衔接，但各项能力的要求更高、挑战更大。

## 步骤

### Step 1: 运动习惯锚定

- **prompt**: 9-12-physical-sports-habits-01
- **prerequisites**: [6-9-physical-sports-habits-01]
- **age_range**: 9-12y
- **completion_criteria**:
  - 用户理解此阶段是运动习惯"锚定"而非"建立"的阶段
  - 孩子已找到至少 1-2 项喜欢的运动（广泛尝试后聚焦）
  - 运动已从"任务"变为孩子的"主动需求"
- **trigger**:
  - condition: state-based
  - description: 用户报告"孩子运动不够""只喜欢电子游戏"，或担心学业挤压运动时间
  - agent_should: 从运动与学业的关系入手（运动提升学习效率），而非仅仅强调运动的重要性

### Step 2: 视力保护

- **prompt**: 9-12-physical-vision-protection-01
- **prerequisites**: [6-9-physical-vision-protection-01]
- **age_range**: 9-12y
- **completion_criteria**:
  - 用户了解 9-12 岁是近视发生和度数增长的高峰期
  - 用户已建立系统的视力保护方案（户外活动 + 用眼卫生 + 定期检查）
  - 用户了解低浓度阿托品和角膜塑形镜等医学干预方案
- **trigger**:
  - condition: state-based
  - description: 孩子视力下降、查出近视、或学业加重导致用眼时间骤增
  - agent_should: 评估当前视力状况和防控措施，强调户外活动是成本最低、效果最好的预防手段

### Step 3: 睡眠管理

- **prompt**: 9-12-physical-sleep-management-01
- **prerequisites**: [6-9-physical-sleep-management-01]
- **age_range**: 9-12y
- **completion_criteria**:
  - 用户了解 9-12 岁仍需要 9-12 小时睡眠（随年龄下限递减）
  - 用户已建立应对学业挤压睡眠的底线规则
  - 用户了解电子设备蓝光和睡前兴奋对睡眠的影响
- **trigger**:
  - condition: state-based
  - description: 用户报告"作业做不完""早上起不来""睡前还要玩手机"
  - agent_should: 评估实际睡眠时间和学业压力，优先保护睡眠底线而非追求作业完美

## 待创建内容

- 专项运动启蒙
- 速度与敏捷性
- 心肺耐力进阶
- 力量发展（安全入门）
- 运动损伤预防
