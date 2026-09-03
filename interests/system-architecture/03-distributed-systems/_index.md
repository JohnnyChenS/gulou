---
stage: all
track: interests
domain: system-architecture
review_status: planned
page_type: route
route_group: system-architecture-core
route_key: distributed-systems
route_order: 3
route_label: Distributed Systems
route_next: ../04-data-systems/_index.md
---

# Distributed Systems

## 阶段目标

从“状态放在哪里、故障后以谁为准”出发，理解多个节点如何共同维护状态。完成本阶段后，你应能在网络分区、节点故障和消息重复下说明一次写入何时提交、读者可能看到什么，以及系统凭什么恢复。

## 进入条件

已经拆出一个远程服务，能追踪请求标识、超时和重试，并理解“调用方超时”不等于“服务端没有执行”。还需要选定一份必须在节点故障后继续解释其正确性的状态。

## 这一阶段先把什么讲清楚

- **分区（Partition）**把状态按键或范围分成可独立放置和处理的部分，换来扩展能力，也引入热点、数据倾斜和再平衡。
- **复制（Replication）**让同一份逻辑状态存在多个副本，以提高可用性或读取能力，但副本进度可能不同。
- **领导者/跟随者（Leader/Follower）**规定谁接收或排序写入、谁复制结果；角色减少并发决策，却让领导者故障成为必须处理的状态转换。
- **法定人数（Quorum）**用满足规则的一组副本确认读写，目的是让关键读写集合发生重叠，而不是简单地“多数就一定正确”。
- **提交（Commit）**是系统承诺某条状态转换不会被后续正常协议推翻的边界；收到、写入本地日志、复制和提交是不同事件。
- **选主（Election）**在旧领导者不可用时选择有资格继续推进的节点，必须结合任期、日志新旧、超时和隔离旧领导者的机制，避免两个领导者同时接受冲突写入。

在这些概念之上，再讨论一致性级别、共识、顺序与因果关系，以及幂等、去重、消息语义、事务、故障恢复和状态重建。

## 组件如何承载这些思想

理解上述状态机制后，再把 Kafka 看作分区复制日志与消费者进度的例子，把 etcd 看作基于共识维护小规模关键状态的例子。ZooKeeper、Redis Cluster、MySQL 集群和分布式数据库分别采用不同的分区、复制、提交与故障转移契约；比较它们时，应问组件暴露了什么状态和保证，而不是只对照功能表。

## 综合项目产物

为 AI 内容推荐平台引入事件总线，提交一张状态与故障图：标出分区键、副本位置、领导者/跟随者、提交边界、消费者进度、幂等或去重位置，以及领导者故障后的选主和恢复路径。每条“不会丢”“不会重复”的结论都要对应协议条件和可观测证据。

## 阶段挑战

给定一条已经被领导者接收、但部分副本尚未确认的记录，分别推演网络分区、进程崩溃和重新选主后的结果。解释它是否已提交、哪个副本有资格当选、消费者可能看到重复还是缺口，以及系统怎样通过幂等、去重、隔离或重放守住正确性与降级边界。

## 阅读顺序

主路线仍是 Distributed Systems → Data Systems → Data Architecture。首批“日志、状态与恢复”纵向切片保留一次临时的 WAL 绕行，并严格按以下链接顺序学习：先复习 [Page Cache、写入确认与持久化边界](../01-computer-systems/page-cache-and-durable-io.md)，再**临时前往** Data Systems 学习 [Write-Ahead Log：从提交确认到崩溃恢复](../04-data-systems/write-ahead-log.md)，然后**返回本阶段主路线**完成 [Replicated Log：副本、提交与选主](replicated-log.md)，最后沿主路线进入 Data Systems，并在之后进入 Data Architecture 的 Checkpoint 与 Replay。临时绕行只为先建立本地恢复模型，不改变阶段 route 顺序。
