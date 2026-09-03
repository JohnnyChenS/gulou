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

## 这条路线解决什么问题

当一个服务从单机发展到多副本、实时数据链路和 AI 能力时，真正困难的不是背组件名，而是解释状态在哪里、确认意味着什么、故障如何传播、数据怎样恢复，以及为什么一个方案在新约束下仍然成立。本路线把这些判断拆成十个阶段，并用同一个 AI 内容推荐平台作为练习载体。

## 一张图看懂路线

### 知识依赖关系

```text
                    Computer Systems
                           |
                        Network
                           |
                 Distributed Systems
                    /              \
             Data Systems       Cloud Native
                    |                 |
             Data Architecture       SRE
                    \                 /
                     \               /
                       ML -----------+
                        |             |
                  Recommender      LLM
                        \             |
                         \           RAG
                          \           /
                            AI/Agent
                                |
                              Agent
```

这张图表示知识之间的概念依赖与汇聚关系：前置能力会在后续主题中被反复调用，但它不是要求每一页都按图中连线阅读的唯一顺序。

### 十阶段阅读顺序

| 分区 | 阶段 | 这一段要回答的问题 |
|---|---|---|
| 基础与方法 | [0 架构方法](00-architecture-method/_index.md) → [1 计算机系统](01-computer-systems/_index.md) → [2 网络](02-network/_index.md) | 如何从需求和约束开始，解释单机行为，再判断远程调用的延迟、超时和部分失败？ |
| 分布式与数据 | [3 分布式系统](03-distributed-systems/_index.md) → [4 数据系统](04-data-systems/_index.md) → [5 数据架构](05-data-architecture/_index.md) | 如何在分区、复制、存储和数据生命周期中保持正确性并可恢复？ |
| 生产与智能 | [6 云原生/SRE](06-cloud-native-sre/_index.md) → [7 ML 系统](07-ml-systems/_index.md) → [8 推荐系统](08-recommendation-systems/_index.md) → [9 AI 工程](09-ai-engineering/_index.md) | 如何把系统部署、运营、模型、推荐和 AI 能力放进可观测、可回滚、可控成本的生产边界？ |

**主干顺序：** 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09。这个宏观顺序保持稳定；阶段内的材料可以随验证结果调整，但不会改变先理解基础与方法、再进入分布式与数据、最后走向生产与智能的推进关系。

## 两种阅读方式

**主干阅读**按十个阶段依次推进。每个阶段先理解问题，再看组件怎样承载思想，最后留下一个可复核的项目产物。

**第一条纵向切片**只追踪一条因果链：[Page Cache、写入确认与持久化边界](01-computer-systems/page-cache-and-durable-io.md) → [Write-Ahead Log](04-data-systems/write-ahead-log.md) → [Replicated Log](03-distributed-systems/replicated-log.md) → [Checkpoint 与 Replay](05-data-architecture/checkpoint-and-replay.md) → [有状态服务恢复](06-cloud-native-sre/stateful-recovery.md) → [综合评审](capstone/log-state-recovery-review.md)。它用同一条“日志—状态—恢复”问题穿过多个阶段，不改变主干顺序。

## 四层学习法

1. **底层思想**：用状态、边界、时序和故障模型解释“为什么会这样”。
2. **组件设计落地**：把思想映射到一个组件或协议，并说明它新增了什么保证、又留下什么缺口。
3. **生产实践与真实案例**：沿着时间线看正常路径、故障现象、证据、处置和预防。
4. **动手验证与架构判断**：在隔离环境中做最小实验，再回答“何时使用、何时不使用、证据是否足够”。

## 如何判断完成

**阅读完成**是走完选定路线，能用自己的话复述每页的核心问题、关键边界与下一步，并留下阶段要求的项目产物。它说明你已经接触并理解材料，不等于能够独立做出架构判断。

**达到掌握**则需要在新的约束或故障下独立定位状态与确认边界，比较至少两个方案的权衡，用估算、实验或故障证据支持结论，并能指出 AI 生成建议中的遗漏与不适用条件。掌握应由可复核的产物和评审结果证明，而不是由阅读页数证明。

## 综合项目与学习验证

先完成[日志、状态与恢复纵向切片综合评审](capstone/log-state-recovery-review.md)，并使用[真实学习者验证协议](capstone/validation-protocol.md)记录逐页耗时、实验证据与独立评审结果。完成十个阶段后进入[综合项目入口](capstone/_index.md)，以最终架构、容量估算、SLO、故障模型、数据正确性、成本和演进路线证明判断能力。

## 材料边界

本路线面向已有多年开发经验、熟悉至少一种主力语言和常见 Web 基础设施的工程师，不替代零基础编程、通用机器学习算法或单一框架 API 教材。课程按十二个月、每周 6–8 小时设计，其中包括 48 个内容周和 4 个复习、补课或中断缓冲周；AI 内容推荐平台是贯穿验证载体，而不是绑定正文的唯一技术栈。

以下是作者材料，不属于学习阶段：[作者规范](authoring-guide.md)与[第一批来源矩阵](references/source-matrix.md)。
