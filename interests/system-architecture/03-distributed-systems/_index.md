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

在分区、复制、时序与故障约束下说明一致性、消息语义和恢复方案。

## 核心单元

- [Replicated Log：副本、提交与选主](replicated-log.md)：把本地日志、当前 ISR 的提交边界和故障后的选主资格分开建模。
- 分布式时间、状态、故障模型、Partition、Sharding、Hash、Range、Consistent Hashing、Hot Partition、Data Skew 与 Rebalance。
- Replication、Leader、Follower、Quorum、Failover、Split Brain、Fencing、Strong/Eventual/Read-after-write/Linearizable Consistency、CAP 与 PACELC。
- Consensus、Raft、Paxos、Term、Log Replication、Leader Election、Logical Clock、Ordering 与因果关系。
- Idempotency、Deduplication、Retry、Timeout、消息语义、分布式事务、Saga、Transactional Outbox、Backpressure、故障恢复与状态重建。

## 组件映射

Kafka、etcd、ZooKeeper、Redis Cluster、MySQL 集群和分布式数据库。

## 综合项目演进

引入事件总线、分区、副本、消息语义、幂等处理和故障恢复。

## 阶段挑战

解释重复、乱序、重试与节点故障下的正确性、恢复与降级边界。

## 阅读顺序

以已拆分远程服务并可观测超时为进入条件。首批“日志、状态与恢复”纵向切片只有一次跨阶段学习跳转：先完成 [Page Cache、写入确认与持久化边界](../01-computer-systems/page-cache-and-durable-io.md)，再临时前往 Data Systems 完成 [Write-Ahead Log：从提交确认到崩溃恢复](../04-data-systems/write-ahead-log.md)，返回本页完成 [Replicated Log：副本、提交与选主](replicated-log.md)，然后进入 Data Architecture 的 Checkpoint 与 Replay。

这次跳转只让首批纵向切片在消费 WAL 模型后继续验证恢复链路；它不改变宏观阶段 route 的顺序（Distributed Systems → Data Systems → Data Architecture），也不改变后续主干学习的顺序。
