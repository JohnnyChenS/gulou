---
id: system-architecture-learning-path
name: 系统架构与 AI 工程
stage: all
track: interests
domain: system-architecture
description: 面向资深开发者的系统架构、数据系统与 AI 工程学习路径
age_range: 18y+
estimated_duration: 12个月（每周6–8小时）
page_type: route-index
route_group: system-architecture-core
review_status: draft
---

# 系统架构与 AI 工程

## 目标读者

已有多年开发经验、熟悉至少一种主力语言和常见 Web 基础设施，并希望用系统方法理解架构行为、评审方案的工程师。

## 非目标读者

本路径不替代零基础编程、通用机器学习算法或单一框架 API 教材；未完成真实验证前，不扩写零基础教材。

## 学习成果

1. 能从需求、约束、状态、数据流与故障边界出发，说明架构选择及其权衡。
2. 能通过估算、实验、故障注入和证据评审，让系统从单机演进至可运营的 AI 内容推荐平台。

## 学习投入与方法

课程按十二个月、每周 6–8 小时设计：48 个内容周和 4 个复习、补课或中断缓冲周。它采用“阶段→单元→知识点”的知识螺旋，以及“需求→估算→设计→实现→压测→故障注入→演进”的项目螺旋。

每个知识点均按四层教学模型展开：底层思想、组件设计落地、生产实践与真实案例、动手验证与架构判断。AI 内容推荐平台是贯穿验证载体，而非绑定正文的唯一技术栈。

掌握层级依次为识别、解释、应用、掌握；阅读完成不等于掌握，最后一级需要在新约束或故障下独立比较方案、评审 AI 输出并说明边界。

## 课程阶段

| 阶段 | 入口 | 重点 |
|---|---|---|
| 0 | [架构方法与基线诊断](00-architecture-method/_index.md) | 分析框架、估算与初始评审 |
| 1 | [Computer Systems](01-computer-systems/_index.md) | 单机运行时与性能行为 |
| 2 | [Network](02-network/_index.md) | 远程调用、部分失败与流量 |
| 3 | [Distributed Systems](03-distributed-systems/_index.md) | 分区、复制、一致性与恢复 |
| 4 | [Data Systems](04-data-systems/_index.md) | 存储、索引与读写权衡 |
| 5 | [Data Architecture](05-data-architecture/_index.md) | 事件、流处理与数据生命周期 |
| 6 | [Cloud Native / SRE](06-cloud-native-sre/_index.md) | 部署、可观测性与可靠性 |
| 7 | [ML Systems](07-ml-systems/_index.md) | 训练、服务、版本与监控 |
| 8 | [Recommendation Systems](08-recommendation-systems/_index.md) | 召回、排序、在线服务与实验 |
| 9 | [AI Engineering](09-ai-engineering/_index.md) | RAG、工作流/Agent 与安全评估 |

## 综合架构评审

完成十个阶段后进入[综合项目入口](capstone/_index.md)，以最终架构、容量估算、SLO、故障模型、数据正确性、成本和演进路线证明判断能力。

## 参与编写

以下是作者材料，不是学习阶段：[作者规范](authoring-guide.md)与[第一批来源矩阵](references/source-matrix.md)。
