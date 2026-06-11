---
id: 3-6-cognitive-psychological
name: 3-6岁认知与心理发展路径
stage: 3-6
domain: cognitive-psychological
description: 从心理理论萌芽到前阅读与前数学的完整认知发展路径
estimated_duration: 3-6岁（持续进行）
review_status: draft
---

# 3-6岁认知与心理发展路径

## 路径总览

本路径覆盖 3-6 岁认知与心理发展的 7 个核心能力。路径设计遵循发展心理学的自然顺序：先建立社会认知基础（心理理论），再发展自我调节能力（执行功能、延迟满足、情绪调节），然后发展社会性（社会性游戏），最后发展学习准备能力（前阅读与前数学）和自我认知（性别认同与自我概念）。

## 步骤

### Step 1: 心理理论基础

- **prompt**: 3-6-core-theory-of-mind-01
- **prerequisites**: 无（起始步骤）
- **age_range**: 3-5y
- **completion_criteria**:
  - 用户能描述心理理论的发展阶梯（不知道别人想什么→理解别人有不同想法→理解错误信念）
  - 用户已开始在日常对话中使用"心理状态语言"（想、觉得、以为、希望）
  - 用户理解"以自我为中心"是发展特征而非品德问题
- **trigger**:
  - condition: user-initiated 或 state-based
  - description: 孩子约 3 岁，或用户报告孩子"好像不理解别人会难过""以为什么都和自己一样"
  - agent_should: 引导用户观察孩子的观点采择行为，提供使用心理状态语言的示范

### Step 2: 执行功能发展

- **prompt**: 3-6-core-executive-function-01
- **prerequisites**: 无（可与 Step 1 并行）
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能描述执行功能的三个核心成分（抑制控制、工作记忆、认知灵活性）
  - 用户已开始和孩子玩促进执行功能的游戏（如"红灯绿灯"、记忆游戏）
  - 用户理解屏幕时间对执行功能的影响
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，或用户报告"孩子坐不住""做事没耐心""记不住两件事"
  - agent_should: 引导用户通过游戏（而非说教）促进执行功能，推荐具体游戏

### Step 3: 延迟满足能力

- **prompt**: 3-6-core-delay-of-gratification-01
- **prerequisites**: [3-6-core-executive-function-01]
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能描述延迟满足能力的发展规律和影响因素（策略、信任、环境）
  - 用户已开始在日常场景中练习"等待并获得更好回报"
  - 用户理解"说到做到"对培养延迟满足的重要性
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，或用户报告"孩子什么都不能等""要什么马上就要"
  - agent_should: 帮助用户理解延迟满足是可学习的策略，从短等待开始渐进训练

### Step 4: 情绪调节策略

- **prompt**: 3-6-core-emotion-regulation-01
- **prerequisites**: [3-6-core-theory-of-mind-01]
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能区分"情绪辅导"和"情绪压制"
  - 用户已开始教孩子使用具体的情绪调节策略（如深呼吸、用语言表达感受）
  - 用户能在孩子情绪爆发时保持冷静并给予支持
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，或用户报告"孩子一发脾气就打人""输了就崩溃大哭"
  - agent_should: 引导用户先接纳情绪再引导行为，示范情绪辅导的话术

### Step 5: 社会性游戏发展

- **prompt**: 3-6-core-social-play-01
- **prerequisites**: [3-6-core-theory-of-mind-01, 3-6-core-emotion-regulation-01]
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能描述社会性游戏的发展阶段（独自→平行→联合→合作）
  - 用户已为孩子创造同伴游戏的机会
  - 用户能在孩子社交冲突中扮演"脚手架"而非"裁判"
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，开始有固定玩伴，或用户报告"孩子不会和小朋友玩""总是抢玩具"
  - agent_should: 引导用户观察孩子的游戏类型，提供促进合作游戏的策略

### Step 6: 前阅读与前数学

- **prompt**: 3-6-core-pre-literacy-math-01
- **prerequisites**: [3-6-core-executive-function-01]
- **age_range**: 4-6y
- **completion_criteria**:
  - 用户能区分"前阅读技能"和"认字"，理解前阅读的重要性
  - 用户已建立规律的亲子共读习惯
  - 用户能在日常生活中自然融入前数学活动（数数、比较、分类）
- **trigger**:
  - condition: state-based
  - description: 孩子约 4-5 岁，或用户焦虑"别人家孩子都在认字了"
  - agent_should: 帮助用户理解"玩中学"的价值，提供高质量共读和前数学游戏的示范

### Step 7: 性别认同与自我概念

- **prompt**: 3-6-core-gender-identity-self-concept-01
- **prerequisites**: [3-6-core-theory-of-mind-01]
- **age_range**: 3-6y
- **completion_criteria**:
  - 用户能描述性别认同发展的三个阶段（标签→稳定性→恒常性）
  - 用户了解如何避免刻板化强化的同时支持性别认同发展
  - 用户已开始帮助孩子建立多元的自我描述
- **trigger**:
  - condition: state-based
  - description: 孩子约 3-4 岁，开始表现出性别刻板行为，或用户发现孩子对性别话题好奇
  - agent_should: 引导用户理解这是正常发展，提供开放、包容的回应方式
