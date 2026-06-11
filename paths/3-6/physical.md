---
id: 3-6-physical
name: 3-6岁身体能力发展路径
stage: 3-6
domain: physical
description: 从基本动作技能到户外活动习惯的完整身体发展路径
estimated_duration: 3-6岁（持续进行）
review_status: draft
---

# 3-6岁身体能力发展路径

## 路径总览

本路径覆盖 3-6 岁身体能力发展的 5 个核心领域。路径设计遵循动作发展的自然层次：先建立基础动作模式（基本动作技能），再发展身体控制能力（平衡与协调、手眼协调），然后确立运动习惯（利手确立、户外活动习惯）。

## 步骤

### Step 1: 基本动作技能

- **prompt**: 3-6-physical-basic-movement-01
- **prerequisites**: 无（起始步骤）
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能描述移动技能（跑、跳、单脚跳）和物体控制技能（投、接、踢）的发展规律
  - 用户已为孩子提供充足的基本动作练习机会
  - 用户能判断孩子动作发展是否在正常范围内
- **trigger**:
  - condition: user-initiated 或 state-based
  - description: 孩子约 3 岁，或用户报告"孩子跑步姿势奇怪""动作比同龄人笨拙"
  - agent_should: 引导用户通过游戏促进基本动作技能，避免过早专项化训练

### Step 2: 平衡与协调

- **prompt**: 3-6-physical-balance-coordination-01
- **prerequisites**: [3-6-physical-basic-movement-01]
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能区分静态平衡和动态平衡
  - 用户已开始和孩子玩促进平衡的游戏（如单脚站、走直线）
  - 用户理解适度冒险对平衡发展的重要性
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，或用户报告"孩子总摔跤""不敢走高的地方"
  - agent_should: 引导用户通过渐进式挑战促进平衡发展，避免过度保护

### Step 3: 手眼协调

- **prompt**: 3-6-physical-hand-eye-coordination-01
- **prerequisites**: [3-6-physical-basic-movement-01]
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能描述手眼协调从粗大到精细的发展阶梯
  - 用户已为孩子提供丰富的精细操作材料（积木、画笔、串珠等）
  - 用户理解书写准备需要先发展精细运动，而非直接练写字
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，或用户报告"孩子握笔很别扭""不愿意做手工"
  - agent_should: 引导用户通过游戏发展手眼协调，避免过早要求书写

### Step 4: 利手确立

- **prompt**: 3-6-physical-handedness-01
- **prerequisites**: [3-6-physical-hand-eye-coordination-01]
- **age_range**: 3-5y
- **completion_criteria**:
  - 用户能描述利手确立的发展规律和影响因素
  - 用户已停止纠正孩子的用手偏好（如果是左利手）
  - 用户能为左利手孩子提供合适的工具和环境
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，开始表现出明显的用手偏好，或家人坚持纠正左利手
  - agent_should: 帮助用户理解利手是大脑偏侧化的自然表现，提供左利手支持建议

### Step 5: 户外活动习惯

- **prompt**: 3-6-physical-outdoor-habits-01
- **prerequisites**: 无（可与 Step 1 并行）
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户了解户外活动对运动发展、视力保护、情绪调节的重要性
  - 用户已建立规律的户外活动习惯（每天不少于 2 小时）
  - 用户能合理管理屏幕时间
- **trigger**:
  - condition: state-based
  - description: 孩子约 3 岁，或用户报告"孩子不愿意出门""总想看屏幕"
  - agent_should: 帮助用户建立户外活动常规，提供不同天气的户外方案
