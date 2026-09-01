---
id: system-architecture-capstone
name: 系统架构综合项目
stage: all
track: interests
domain: system-architecture
description: AI 内容推荐平台的综合架构评审入口
age_range: 18y+
review_status: draft
---

# 系统架构综合项目

## 第一批纵向切片

- [日志、状态与恢复纵向切片综合评审](log-state-recovery-review.md)
- [真实学习者验证协议](validation-protocol.md)

第一批只验证 Page Cache、PostgreSQL WAL、Kafka replicated log、Flink checkpoint/replay 与 Kubernetes stateful recovery 的贯通能力；模型、Prompt 和索引仅以版本字段进入 replay/rollback，不在本批新增后续阶段正式正文。

## 系统边界

以 AI 内容推荐平台为验证载体，明确用户、内容、事件、训练、在线服务、运营与外部依赖的边界；项目不规定唯一技术栈。

## 概念架构

提交需求、质量属性、状态与数据流、故障边界、架构决策记录、假设清单，以及最终架构、容量估算、SLO、故障模型、数据正确性说明、成本估算和演进路线。

## 从单机到 1M QPS 的估算级演进

从单体版需求和容量假设出发，经历远程服务、事件总线与副本、事务/缓存/搜索/分析/特征存储、实时数据链路、容器化运营、模型服务、推荐闭环及 AI 能力；用估算说明 1M QPS 下的容量、尾延迟、背压、成本与先失效点。

## 重复评审问题

1. State 在哪里？
2. 组件挂掉或网络超时会怎样？
3. 重复、乱序和重试会怎样？
4. 数据是否可能丢失或产生静默错误？
5. 10 倍流量下哪里先失效？
6. Backpressure 如何传播？
7. 如何知道系统已经出问题？
8. 如何恢复、回滚或降级？
9. 当前方案的安全边界是什么？
10. 当前方案的建设和运行成本是多少？

## 隐私数据禁区

不得将真实用户隐私数据、凭证或生产数据带入实验、演示或 AI 工具；仅使用经授权、最小化且可退出的实验数据。

## 实验环境退出与清理

实验结束后删除临时资源和数据，撤销凭证与访问权限，停止产生费用的服务，并记录验证结果、剩余风险和退出确认。
