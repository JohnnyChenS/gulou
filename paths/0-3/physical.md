---
id: 0-3-physical
name: 0-3岁身体能力发展路径
stage: 0-3
domain: physical
description: 从粗大动作到感觉统合的身体能力发展路径
estimated_duration: 0-36个月（持续进行）
review_status: draft
---

# 0-3岁身体能力发展路径

## 路径总览

本路径覆盖 0-3 岁身体能力发展的 4 个核心领域。路径设计遵循动作发展的自然顺序：先发展粗大动作（抬头→翻身→坐→爬→走），再发展精细动作（抓握→捏取→工具使用），口部运动和感觉统合贯穿始终。

## 步骤

### Step 1: 粗大动作发展

- **prompt**: 0-3-core-gross-motor-01
- **prerequisites**: 无（起始步骤）
- **age_range**: 0-24m
- **completion_criteria**:
  - 用户能描述粗大动作发展的里程碑顺序（抬头→翻身→坐→爬→站→走）
  - 用户了解每个里程碑的正常时间窗口（非单点时间）
  - 用户已为孩子提供足够的俯卧时间
  - 用户了解学步车的争议和爬行的重要性
- **trigger**:
  - condition: user-initiated 或 state-based
  - description: 用户首次关注孩子运动发育，或孩子开始出现翻身、坐、爬等动作
  - agent_should: 了解孩子当前月龄和已掌握的动作，推荐适合的促进活动

### Step 2: 精细动作发展

- **prompt**: 0-3-core-fine-motor-01
- **prerequisites**: [0-3-core-gross-motor-01]
- **age_range**: 0-36m
- **completion_criteria**:
  - 用户能描述抓握发展的阶段（反射→尺侧→桡侧→对捏→工具使用）
  - 用户已在日常中融入精细动作练习（自主进食、翻书、搭积木等）
  - 用户了解小物品窒息风险并采取预防措施
- **trigger**:
  - condition: state-based
  - description: 孩子开始出现抓握行为（约 3-4 个月），或用户报告孩子"什么都往嘴里放"
  - agent_should: 引导用户理解手-口协调的发展意义，在安全前提下提供精细动作练习

### Step 3: 口部运动发展

- **prompt**: 0-3-core-oral-motor-01
- **prerequisites**: [0-3-core-gross-motor-01]
- **age_range**: 0-24m
- **completion_criteria**:
  - 用户能描述口部运动发展链条（吸吮→吞咽→咀嚼→发音）
  - 用户了解辅食质地与口腔肌肉训练的关系
  - 用户已了解窒息高风险食物和预防措施
  - 用户了解何时需要寻求语言治疗师帮助
- **trigger**:
  - condition: state-based
  - description: 孩子约 4-6 个月开始辅食添加，或用户报告孩子"不太会嚼"或"流口水多"
  - agent_should: 了解孩子当前的喂养方式和口部运动表现，推荐适合的食物质地和口腔游戏

### Step 4: 感觉统合

- **prompt**: 0-3-core-sensory-integration-01
- **prerequisites**: [0-3-core-gross-motor-01]
- **age_range**: 0-36m
- **completion_criteria**:
  - 用户能描述三大感觉系统（前庭觉、本体觉、触觉）的基本概念
  - 用户已为孩子提供多感官体验的环境
  - 用户了解感官过载的信号和应对方法
  - 用户了解何时需要寻求职能治疗师帮助
- **trigger**:
  - condition: state-based
  - description: 孩子对某些感官刺激过度敏感或过度寻求（如不喜欢被触碰、不停旋转）
  - agent_should: 帮助用户观察孩子的感觉偏好，提供适合的感官活动和安全注意事项
