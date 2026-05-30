# 学习路径索引

学习路径定义了 Prompt 之间的先后关系、完成标准和触发条件，是 AI Agent 实现长期陪伴引导的基础。

## 路径设计原则

1. **路径 = 学习曲线**：一条路径覆盖一个能力领域从入门到掌握的完整过程
2. **步骤有先后**：prerequisites 定义前置依赖，Agent 据此判断用户是否"准备好"
3. **完成可评估**：completion_criteria 用自然语言描述，Agent 在对话中判断
4. **触发可自动化**：trigger 告诉 Agent 何时主动推送，而非等用户来问

## 当前路径

### 0-3 岁育儿指导

| 路径 | 文件 | 覆盖 Prompt | 说明 |
|------|------|------------|------|
| 认知与心理发展 | [0-3/cognitive-psychological.md](0-3/cognitive-psychological.md) | 8 个 | 从依恋建立到符号思维萌芽 |
| 身体能力发展 | [0-3/physical.md](0-3/physical.md) | 4 个 | 从粗大动作到感觉统合 |

### 父母自身支持

| 路径 | 文件 | 覆盖 Prompt | 说明 |
|------|------|------------|------|
| 父母心理健康 | [parenting/parent-wellbeing.md](parenting/parent-wellbeing.md) | 13 个 | 从产前准备到持续的自我照顾（0-14 岁） |
| 青春期父母指导 | [parenting/parent-adolescent.md](parenting/parent-adolescent.md) | 5 个 | 沟通重建、叛逆应对、心理危机、学业压力、数字生活（14-18 岁） |

### 待创建

- 3-6 岁育儿指导路径
- 6-9 岁育儿指导路径
- 9-12 岁育儿指导路径
- 12-14 岁育儿指导路径
- 兴趣学习路径
- ...
