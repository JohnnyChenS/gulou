---
id: system-architecture-authoring-guide
stage: all
track: interests
domain: system-architecture
topic: authoring-contract
age_range: 18y+
difficulty: advanced
review_status: draft
references: []
tags: [system-architecture, authoring]
learning_paths: [system-architecture]
related_prompts: []
---

# 系统架构课程作者规范

本规范面向已有多年工程经验的作者。正式知识单元首版只面向“已有多年开发经验、熟悉至少一种主力语言和常见 Web 基础设施”的工程师。课程先解释思想和约束，再落到组件；它不是组件 API、框架选型清单或排行榜。不得把正文扩展为零基础编程或计算机本科教材、面试或认证训练，也不得承诺岗位晋升或学习结果。

## Frontmatter 契约

每个正式知识单元必须使用完整 frontmatter。可按单元替换取值，但不得省略字段。

```yaml
---
id: system-architecture-example-unit
stage: 01-computer-systems
track: interests
domain: system-architecture
topic: durable-write-boundary
age_range: 18y+
difficulty: advanced
review_status: draft
references:
  - references/source-matrix.md
tags: [storage, durability]
learning_paths: [system-architecture]
related_prompts: []
---
```

## 正式知识单元的固定结构

正式知识单元必须按以下十一项标题书写，且顺序不变：

```markdown
## 学习目标
## 先修知识
## 问题场景
## 第一层：底层思想
## 第二层：组件设计落地
## 第三层：生产实践与真实案例
## 第四层：动手验证与架构判断
## 常见误区与适用边界
## 掌握度检查
## 在综合项目中的应用
## 权威来源与延伸阅读
```

## 四层问题契约

| 层 | 必须回答的问题 |
|---|---|
| 第一层：底层思想 | 这个问题的状态、约束、失败模型与不可绕过的权衡是什么？ |
| 第二层：组件设计落地 | 组件以哪些机制、接口和配置承载这些约束；它们分别不承诺什么？ |
| 第三层：生产实践与真实案例 | 在可核验的真实环境中，哪些条件、症状、观测和决策使这些边界重要？ |
| 第四层：动手验证与架构判断 | 学习者如何通过可复现观察验证假设，并在给定约束下说明选择或不选择？ |

## 证据、比较与案例

- 组件比较必须以工作负载、状态模型、故障边界、运维约束和成本为条件；不得写成脱离条件的排行榜、总分或“最佳”结论。
- 真实案例采用：`案例类型：真实案例（公开来源：<URL>；访问日期：YYYY-MM-DD）`。没有可核验公开来源，不得标为真实案例。
- 模拟案例采用：`案例类型：模拟案例（假设：<明确输入、故障与约束>）`。模拟案例不得暗示真实流量、客户或事故。
- 版本性事实采用：`组件版本：<版本>；官方页面：<URL>；访问日期：YYYY-MM-DD`。未写清三项，不得把版本行为写成事实。
- ChatGPT 对话只能帮助起草或生成问题，不能作为事实来源。Khan Academy 和其他外部材料只允许链接或按许可引用；不得复制受限制的正文、视频或题目。

## 活动与掌握度检查

每项活动必须明确：**环境、步骤、预期观察、成功条件、清理方式**。活动应验证一个可观察的假设，不得把命令成功或服务启动当作架构结论。

掌握度问题至少各覆盖一次：

1. **解释**：说明机制为何存在及其边界。
2. **应用**：在给定约束下选定机制并说明证据。
3. **迁移**：将同一思想应用到不同组件或故障模型。
4. **不使用**：说明何时不应使用该机制或组件，并提出替代方案。

## 禁止项与篇幅

不得出现 `TODO`；不得伪造流量、事故或案例；不得把 ChatGPT 回答当来源；不得依赖 `gulou-agent`。单篇以完整解决一个问题为准，不设机械字数指标。
