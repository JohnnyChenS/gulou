---
id: system-architecture-checkpoint-replay-01
stage: 05-data-architecture
track: interests
domain: system-architecture
topic: Checkpoint 与 Replay：有状态流作业的恢复边界
age_range: 18y+
difficulty: advanced
review_status: draft
references:
  - ../references/source-matrix.md
tags: [Flink, checkpoint, replay, exactly-once, stateful-processing]
learning_paths: [system-architecture]
related_prompts: [system-architecture-wal-01, system-architecture-replicated-log-01]
---

# 检查点与重放（Checkpoint and Replay）：有状态流作业的恢复边界

## 一句话理解

检查点把算子状态与输入位置保存在同一个一致边界，故障后作业才知道应从哪里继续并重放哪些输入。

## 本页要解决的问题

当检查点 `n` 已完成、`n+1` 尚未完成时作业故障，有状态计算应从哪个可验证的一致边界继续，又如何防止重放改变下游结果？

## 本页词汇

| 中文 | English | 在本页中的含义 |
|---|---|---|
| 检查点 | Checkpoint | 已完成后可作为故障恢复起点的受控工件 |
| 状态快照 | State Snapshot | 某个一致切面上的算子状态记录 |
| 输入位置 | Source Position | 与状态快照配套、重启后继续读取的位置 |
| 一致切面 | Consistent Cut | 所有参与者对已纳入和未纳入历史共同同意的边界 |
| 检查点屏障 | Checkpoint Barrier | 在数据流中标记检查点切面的协调标记 |
| 屏障对齐 | Barrier Alignment | 多输入算子等待同一检查点屏障齐备的过程 |
| 重放 | Replay | 恢复后从已验证位置重新读取并处理输入 |
| 端到端恰好一次 | End-to-End Exactly-Once | 在已声明边界内由可重放输入、一致状态与事务或幂等输出共同支撑的逻辑结果语义 |

## 在路线中的位置

这是纵向切片的第四步，上一页是[复制日志（Replicated Log）](../03-distributed-systems/replicated-log.md)，下一页是[有状态服务恢复](../06-cloud-native-sre/stateful-recovery.md)，完整地图见[系统架构与 AI 工程](../_index.md)。

## 学习目标

完成本单元后，你能用“状态快照 + 输入位置”解释有状态流作业为何能从一致位置恢复；在双输入算子中追踪 checkpoint barrier 与 alignment；并把 Flink 的作业内 exactly-once 与端到端结果 exactly-once 分开评审。具体组件行为仅指 Apache Flink 2.3.0 的官方稳定文档所述条件，不承诺每条事件在物理世界中只执行一次。

## 先修知识

- 已完成 [Write-Ahead Log：从提交确认到崩溃恢复](../04-data-systems/write-ahead-log.md)，能区分恢复起点、日志重放与备份。
- 已完成 [分区复制与提交边界](../03-distributed-systems/replicated-log.md)，理解 Kafka offset、重复投递与下游幂等的必要性。
- 熟悉有状态算子的窗口、聚合或去重状态，以及 RPO（允许恢复到的较早位置）和 RTO（恢复到可服务所需时间）。

## 问题场景

一个 Flink 作业消费 Kafka 的用户行为事件，按用户维护会话和特征状态，并写入下游特征存储。checkpoint `n` 已完成；随后 source 继续读取并处理更多事件，checkpoint `n+1` 的 barrier 已发出但尚未完成。此时某个 TaskManager 故障。

问题不是“故障前的每条事件是否都恰好运行过一次”，而是：恢复应采用哪个可验证的一致切面？哪些 operator state 和 Kafka source position 属于该切面？`n` 之后、`n+1` 完成之前的事件为何会被重新读取？下游已经看见的写入如何避免因重放而产生错误结果？

## 第一层：底层思想

读完这一层，你应能回答：算子状态与输入位置如何组成一个故障后可继续的一致切面？

**恢复点由状态和输入位置共同构成。** 对有状态流作业，只保存算子状态而不保存输入位置，会不知道从哪里继续读；只保存 source position 而不保存状态，则新输入会叠加到错误的历史。一个可恢复的 checkpoint 因而需要把每个相关 operator 的 state 与 source 的读取位置放到同一恢复契约中。这里的“位置”是可重放 source 的读取边界，不是业务事件 ID，也不替代 Kafka 的保留、权限或可读性配置。

**consistent cut 是恢复时应当看到的共同历史前缀。** 对 checkpoint `n`，每个参与者都需要能说明自己已把哪一段输入的影响包含进状态、哪一段尚未包含。Flink 用 checkpoint barrier 在数据流中标记这条切面。barrier 不是业务数据，也不是“事件已交付到所有外部系统”的确认；它协调的是作业内部 state snapshot 与 source position 的一致性。

**alignment 处理多输入算子的时间差。** 双输入 operator 先在一侧收到 barrier `n` 时，会暂停该输入后续记录的消费，同时继续处理另一侧直到同一 barrier 到达；在两个 barrier 都到达时，才为该切面做快照。这避免 snapshot 混入一侧 barrier 之后、另一侧 barrier 之前的记录。若有背压，barrier 本身与被阻塞的输入会延迟，alignment 时间也可能拉长；这是一致性代价的可观测部分，而不是可忽略的控制消息。

**replay 是故障模型的一部分。** checkpoint `n` 完成而 `n+1` 未完成时恢复，作业从 `n` 的 state 与 source position 重启。`n` 后已经处理、但未进入已完成 checkpoint 的记录可以再次被 source 提供并重新计算；`n+1` 的未完成快照不能作为恢复依据。恢复依赖 source 在该位置可重放，以及恢复产物仍可读取。Kafka 的 offset 提供一种位置表达，仍需独立核对 topic 保留期、可访问性和分区变更边界。

**RPO 与 RTO 是两个不同的预算。** checkpoint 间隔越短，故障时相对上一次已完成 checkpoint 的重放窗口通常越小，但协调与持久化快照的运行开销更频繁；间隔越长，运行中开销可能较低，却会积累更多可能需要 replay 的输入。RTO 还受 state 大小、checkpoint storage 的读取、TaskManager 重启、资源调度和恢复后追赶输入速率影响。不能只用 checkpoint 间隔推导固定 RPO/RTO，也不能把 completed checkpoint 当作独立灾难备份。

## 第二层：组件设计落地

读完这一层，你应能回答：Apache Flink 的检查点、状态后端、存储与 sink 各自承担哪段恢复责任？

**Apache Flink 2.3.0：checkpoint。** Flink 的容错机制以 state snapshot 为恢复依据；在可重放 source 的条件下，恢复会从相应位置重新消费。官方说明将 checkpoint barrier 和多输入对齐作为取得一致 snapshot 的机制。一个 checkpoint 只有完成后才可成为本题场景的恢复点；`n+1` 未完成时，不能用它覆盖 `n`。作业内的一次一致恢复不自动说明 Kafka、外部 API 或 sink 都具有相同语义。

**状态、backend 与 checkpoint storage。** operator state 包括业务聚合、窗口、去重等作业状态；state backend 决定状态如何管理，checkpoint storage 保存可用于恢复的 checkpoint 工件。应把 state backend 的本地/远端特性、checkpoint storage 的独立性、访问权限、保留策略和恢复吞吐作为部署评审对象。它们不是单靠“开启 checkpoint”就自动获得的跨区域备份或固定 RTO 承诺。

**savepoint 与 checkpoint 的角色不同。** checkpoint 是运行中容错的受控恢复点；savepoint 是由运维或发布流程选择创建、用于有意停止、升级或迁移作业状态的工件。两者都可能承载状态，但不能把 checkpoint 简化为 backup：backup 还要求独立保留、可验证还原、覆盖灾难模型和恢复演练。也不能把数据库 checkpoint 的“缩短本地 WAL/redo 恢复路径”与 Flink checkpoint 的“state + source position 一致切面”写成相同语义；两者都服务恢复，却保存不同状态、协调不同参与者。

**端到端 exactly-once 的边界。** Flink 的作业内 state consistency 不等于下游结果自动不重复。若恢复重放使 sink 再次接收同一逻辑事件，端到端 exactly-once 还需要 sink 具备 transactional commit，或能按稳定业务 key 幂等写入并让读者看到正确结果。非幂等的“每收到一次就累加/发通知” sink 可能把重放变成重复效果。即使满足这些条件，表达的也是在定义的 source、sink、故障和部署边界内的逻辑结果语义，而不是每条事件物理上只执行一次。

**不使用场景。** 对无可重放输入、不可读取历史位置、或下游不可事务也不可幂等且不允许补偿的流程，不能仅依赖 Flink checkpoint 宣称端到端 exactly-once；需要先改变 source 的可重放/保留协议，或引入可去重的结果存储、事务 sink、outbox/补偿流程。对长期灾难恢复、合规归档或跨地域 RPO，应另建经过校验与恢复演练的备份、复制和数据保留契约，而不是把运行 checkpoint 当成唯一方案。

## 第三层：生产实践与真实案例

读完这一层，你应能回答：如何从检查点完成、对齐、背压、恢复与 sink 结果证据判读一次故障？

案例类型：模拟案例（假设：一个 Apache Flink 2.3.0 作业从 Kafka 消费推荐特征事件；每 60 秒触发 checkpoint；每个 TaskManager 维护较大的用户窗口状态；Kafka 允许从 checkpoint position 重放；下游 feature sink 以 `user_id + feature_window_end + feature_version` 为幂等 key。故障发生在 checkpoint `n` 已完成、`n+1` 未完成时，且没有真实客户、流量或事故主张。）

**症状。** 日间状态增大后，checkpoint 持续时间上升；下游吞吐下降时形成背压，barrier 到达双输入 operator 的时间差扩大；`n+1` 尚未完成时 TaskManager 退出。重启后作业先从 `n` 恢复，再追赶 Kafka 中从 `n` position 起的事件。观察者可能看到相同逻辑 key 再次抵达 sink，但不应仅凭“看到两次调用”断言结果已重复。

**判读路径。**

- 先记录每个已完成 checkpoint 的大小、持续时间、alignment 相关指标、触发间隔和完成时间；大 state 会增加 snapshot 与恢复读取的工作，但任何具体时长都必须由目标 backend、storage 与负载实测。
- 把 barrier 延迟与数据处理延迟分开。背压可能使 barrier 在输入队列中等待，也可能延长双输入对齐期间的阻塞；仅凭总体延迟不能归因。
- 故障后只选最后一个已完成 checkpoint `n`：operator state 与 source position 回到 `n`，`n` 后到故障前的部分事件可重放。`n+1` 的在途结果不是可靠恢复工件。
- 追赶阶段同时观测 source lag、恢复读取速率、状态恢复耗时与 sink 写入拒绝/冲突。若幂等 key 冲突后得到同一逻辑结果，重复投递是可控恢复成本；若 sink 采用非幂等累加或发送副作用，重复会改变结果。

**处置与权衡。** 不应先把 checkpoint 间隔盲目调短。团队应用“完成率、持续时间/间隔比、alignment 延迟、state 大小、重启恢复时间、Kafka lag 和 sink 去重结果”评审：更短间隔降低未 checkpoint 记录的理论重放窗口，却增加协调和存储压力；更长间隔相反。对恢复后追赶，先验证 Kafka 中所需 offset 仍在保留期、checkpoint storage 可读、sink 幂等键在重放窗口内仍有效，再调整 state 结构、吞吐或资源。该案例是模拟，不代表任何真实 Flink 集群的默认设置或性能。

## 第四层：动手验证与架构判断

读完这一层，你应能回答：如何手工画出多输入屏障的一致切面，并判断哪些输出会被重放？

### 活动：手工追踪双输入 operator 的 barrier 切面

- **环境：** 一张可删除的纸质或文本时间线；双输入 operator `Join`，输入 A/B 的事件均按到达顺序记录。设 checkpoint `n` 的 barrier 为 `BA(n)`、`BB(n)`，checkpoint `n+1` 的 barrier 为 `BA(n+1)`、`BB(n+1)`。不连接生产 Kafka、Flink 或任何真实 sink。
- **步骤：**

  1. 写下初始状态 `S0`，并在 A 上依次写 `A1, BA(n), A2, BA(n+1), A3`，在 B 上依次写 `B1, B2, BB(n), B3, BB(n+1)`。假设 `Join` 先收到 `BA(n)`，因此暂停 A 的 `A2` 及之后记录，继续处理 B 的 `B1, B2`，直到收到 `BB(n)`。
  2. 在两个 `n` barrier 都到达的时刻，画出 checkpoint `n`：列出其 state 所包含的输入影响，并在图上标出 `A2`、`B3` 不属于该 checkpoint。解除 A 的暂停后，只继续到 `BA(n+1)` 到达；此时暂停 A 的 `A3`，但不要让 `BB(n+1)` 到达 `Join`。
  3. 宣布“checkpoint `n` 已完成，只有 `BA(n+1)` 到达，`BB(n+1)` 仍留在故障后的 replay，因此 `n+1` 未完成”，并立即注入 TaskManager 故障。把 operator state 和两路 source position 都恢复到 `n`；从位置后的第一条记录重新列出会被 replay 的事件，判断未完成的 `n+1` 不能作为恢复点且其切面不包含哪些输入影响。
  4. 将每个逻辑输出写成 `(key, value)`。分别按两种 sink 规则计算恢复后的结果：规则 X 按 key 覆盖/去重（幂等）；规则 Y 每到一条都做 `counter += value`（非幂等）。

- **预期观察：** `n` 的切面只包含两个 `n` barrier 之前已被该 operator 纳入的一致输入影响；`n+1` 仅收到 A 侧 barrier，B 侧 barrier 尚在故障后的 replay 中，因而没有可用的 `n+1` checkpoint。`A2`、`B3` 以及其后的数据会在从 `n` 恢复后再出现。规则 X 的最终逻辑 key/value 与无故障运行一致；规则 Y 因 replay 对相同逻辑输出再次累加而可能不同。barrier 的先后到达说明 alignment 的必要性，不是某一输入的事件已永久消失。
- **成功条件：** 时间线明确标出两个 `n` barrier 和仅有 `BA(n+1)` 的到达顺序、checkpoint `n` 包含/不包含的事件、`n+1` 因缺少 `BB(n+1)` 而不可恢复的边界、恢复使用的 state 与两路位置，以及两种 sink 的最终结果差异；结论明确写出“端到端结果 exactly-once 还依赖 transactional 或幂等 sink”。
- **清理方式：** 删除本活动创建的时间线、示例 state、示例 key 和 counter；未创建外部 topic、checkpoint 或 sink 资源，因此无需清理共享系统。

该活动验证的是一致切面、alignment 和 replay 与 sink 语义之间的推理关系；它不测量 Flink 的吞吐、Kafka 的真实 offset 提交、外部存储事务、网络分区或生产恢复时间。

### 架构判断题：checkpoint `n` 与 `n+1` 的故障复盘

请给出如下结论所需的证据：`n` 的完成时间与可读工件、每个 source 的恢复 position、operator state 的版本、`n+1` 未完成的证据、Kafka 保留期、TaskManager 故障时间、恢复开始/完成时间，以及 sink 对重放 key 的处理结果。若任何一项缺失，不要写“完全没有重复”或“恢复到最新事件”；应降级为可验证的事实，例如“从最后已完成的 checkpoint 重放，且由 sink 幂等契约吸收重复”。

## 常见误区与适用边界

- **误区：** checkpoint 包含状态就足以恢复。**边界：** 还必须有与 state 一致的 source position 和可重放输入；缺少任一项都无法证明恢复到同一逻辑切面。
- **误区：** barrier 是每条事件的确认。**边界：** barrier 是 snapshot 协调标记；它不等于 Kafka 的所有副本确认、外部系统写入成功或业务确认。
- **误区：** checkpoint 间隔越短越可靠。**边界：** 更短的未快照重放窗口要以更多 snapshot 协调和存储开销交换；大 state、背压和 checkpoint storage 可能使完成时间上升。
- **误区：** checkpoint 就是 backup。**边界：** checkpoint 服务运行恢复；独立 backup 还需保留、完整性、灾难模型和可还原性证据。数据库 checkpoint 与流作业 checkpoint 也不能因为名称相同就继承彼此语义。
- **误区：** Flink 开启 exactly-once 就没有重复。**边界：** 作业内一致性不自动覆盖 source、sink 或外部副作用；端到端逻辑结果还需要可重放 source 与 transactional 或幂等 sink，且仍不表示物理执行仅一次。

## 掌握度检查

1. **解释：** 在 checkpoint `n` 完成、`n+1` 未完成时 TaskManager 故障，为什么恢复必须使用 `n` 的 state 和 source position？说明 barrier、alignment 与 replay 各解决什么，并指出不覆盖的外部边界。
2. **应用：** 某作业状态很大，当前 checkpoint 间隔为 60 秒，恢复后 Kafka lag 的追赶会影响特征时效。请给出间隔调整的假设、必须同时观测的运行开销和恢复时间证据，以及不应只凭“60 秒”作出的结论。
3. **迁移：** 比较数据库 checkpoint 与 Flink checkpoint：两者各保存/协调什么，分别如何缩小恢复工作；为什么不能将数据库 WAL 的提交语义或 Flink source position 直接迁移到另一方？
4. **不使用：** 当输入不可重放，或 sink 既非 transactional 也不能按稳定业务 key 幂等时，为什么不应承诺端到端 exactly-once？为该流程提出 source 保留/重放、事务或去重/补偿协议中的替代方案，并说明仍需验证的故障边界。

## 在综合项目中的应用

[进入日志、状态与恢复纵向切片综合评审](../capstone/log-state-recovery-review.md)，把 Flink 的一致切面与 Kafka source、幂等 sink、容量追赶和 Kubernetes 恢复串联。

### ADR：推荐特征流水线的恢复窗口与 sink 幂等策略

**状态：** 建议采用；仅在目标 Apache Flink 2.3.0、Kafka 保留策略、checkpoint storage 可读性和 feature sink 幂等行为均已演练验证后生效。

**上下文：** 推荐特征由 Kafka 事件驱动，作业维护窗口状态并在故障后需要恢复。把“Flink checkpoint 已开启”简写成“不会重复更新特征”会掩盖 checkpoint `n` 到故障间的 replay，以及下游写入副作用。

**决策：** 以 **60 秒 checkpoint 间隔** 作为待验证的起始假设，而非固定性能承诺；允许的重放窗口定义为“最后一个已完成 checkpoint 对应 source position 至故障点之间、且 Kafka 保留仍可读取的事件”。sink 对每个特征结果使用稳定幂等 key：`user_id + feature_window_end + feature_version`，同一 key 的重放写入必须得到相同逻辑结果或被明确去重。若 sink 改为发送通知、非幂等累加，或 key 的保留期短于允许重放窗口，则不将该路径称为端到端 exactly-once；改用事务 sink、可去重结果表或补偿/outbox 协议。每次恢复保留 completed checkpoint ID、source position、state/恢复时间、Kafka lag、checkpoint duration、alignment 迹象和 sink 冲突/去重证据。

**后果：** 较短间隔可能缩小待重放输入，却会增加 checkpoint 协调和存储压力；较长间隔反之。幂等 key 让同一逻辑特征可安全重放，但要求定义 key、版本、保留期和更新语义。该决策不提供跨地域 backup、Kafka 事件永久可读、外部副作用仅发生一次或固定 RPO/RTO 的承诺。

**验证与回滚：** 在隔离的模拟工作负载中，制造 checkpoint `n` 完成而 `n+1` 未完成时的 TaskManager 故障；验收恢复从 `n` 的 position 开始、允许窗口内事件可从 Kafka 读取、sink 对重复 key 的最终结果不变，并记录恢复追赶时间。若 storage 不可读、所需 Kafka offset 已过期、checkpoint 持续时间接近/超过间隔、或 sink 无法保持幂等，停止用该恢复路径承诺特征正确性：暂停发布或降级为可重算批处理，修复 source 保留、storage、资源或 sink 协议后再演练。

## 权威来源与延伸阅读

- [来源矩阵：Apache Flink 2.3.0 的容错与大状态 checkpoint 调优边界](../references/source-matrix.md)
- [Apache Flink 2.3.0：Fault Tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/)（组件版本：Apache Flink 2.3.0；官方页面；访问日期：2026-08-30）
- [Apache Flink 2.3.0：Tuning Checkpoints and Large State](https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/large_state_tuning/)（组件版本：Apache Flink 2.3.0；官方页面；访问日期：2026-08-30）
- [PostgreSQL 18：Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html)（用于限量对照数据库 checkpoint；PostgreSQL 18；访问日期：2026-08-30）

## 下一步

按主路线进入[云原生 / SRE](../06-cloud-native-sre/_index.md)；沿本纵向切片继续学习[有状态服务恢复：编排、数据与一致性的边界](../06-cloud-native-sre/stateful-recovery.md)，把作业内的一致恢复推进到容器、卷和应用协议的联合恢复。本切片暂不展开无对齐检查点与大状态深度调优，待核心恢复证据链掌握后再延伸。
