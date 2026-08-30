---
id: system-architecture-replicated-log-01
stage: 03-distributed-systems
track: interests
domain: system-architecture
topic: Replicated Log：副本、提交与选主
age_range: 18y+
difficulty: advanced
review_status: draft
references:
  - ../references/source-matrix.md
tags: [distributed-systems, replicated-log, Kafka, ISR, leader-election]
learning_paths: [system-architecture]
related_prompts: [system-architecture-page-cache-durable-io-01, system-architecture-wal-01]
---

# Replicated Log：副本、提交与选主

## 学习目标

完成本单元后，你能把“本地日志已写入”与“分布式记录已提交”区分为不同命题；用副本集合、复制进度、提交规则、选主资格和故障时序回答一条已确认记录会不会出现在新 leader 上。你还能以 Kafka 4.2 的 partition replication 为例，解释 `acks`、ISR、`min.insync.replicas` 与 unclean leader election 的组合边界，而不会把 Kafka 数据分区复制误称为“就是 Raft”。

## 先修知识

- 已完成 [Page Cache、写入确认与持久化边界](../01-computer-systems/page-cache-and-durable-io.md)，能说明单节点 `fsync` 或稳定介质边界不等于远端副本已存在。
- 已完成 [Write-Ahead Log：从提交确认到崩溃恢复](../04-data-systems/write-ahead-log.md)，熟悉追加日志、位置推进、重放和本地崩溃恢复。
- 熟悉网络超时、节点故障、网络分区与 RPO；能从监控和配置读取一个 partition 的 leader、replicas 与 ISR。

## 问题场景

某支付通知服务把事件追加到 Kafka topic `payment-notices`。该 topic 的一个 partition 配置为 replication factor 3，broker `B1` 是 leader，`B2`、`B3` 是 follower。此刻 `B3` 落后而被移出 ISR，ISR 为 `{B1, B2}`。生产者采用 `acks=all`，`min.insync.replicas=2`；它收到事件 `E-42` 的成功响应后，`B1` 立刻故障。

问题不是“B1 已经把文件写了没有”，而是：`E-42` 是否已经在**新 leader** 上？在本场景中，成功意味着当前 ISR 的 `B1` 和 `B2` 都已写入；`B2` 是可选 leader，故它接任时含有 `E-42`。若 `B2` 在接任前也不可用，仅剩非 ISR 的 `B3`，默认禁用 unclean leader election 时 partition 保持不可写；若显式允许 `B3` 以非 ISR 身份接任，`B3` 不保证含有 `E-42`。成功响应的含义必须随这一完整状态机读出。

## 第一层：底层思想

**顺序不是全局顺序，而是一个日志实例的顺序。** Replicated log 为某个状态序列建立单调位置：leader 决定追加次序，follower 复制该顺序。Kafka 4.2 把 topic 划为全序的 partition；因此顺序、leader、ISR 和确认均须以 `topic-partition` 为单位讨论，不能把“topic 有三副本”误作一个跨所有 partition 的单一日志。[Kafka 4.2 Design](../references/source-matrix.md)将 partition 描述为 replicated log。

**复制进度必须进入模型。** 对某条记录 `r`，仅知道 `B1` 的本地日志含有 `r`，只说明 B1 的本地进度；它没有说明 B2、B3 是否也含有 `r`。设 `R(r)` 是已应用 `r` 的副本集合，`E` 是故障后允许参加选主的集合。可靠的提交规则必须使 `R(r)` 与任何可能赢得选主的 `E` 有受约束的重叠；否则旧 leader 可以确认 `r`，新 leader 却从一个不含 `r` 的日志继续。

**commit point 是协议点，不是某台机器上的写入点。** 本地 WAL、Page Cache 或一次 `fsync` 可以给一个 broker 的崩溃恢复提供证据，却不能自行建立多个节点的共同前缀。在 replicated log 中，提交点应同时回答：哪些副本已纳入确认、这些副本的进度如何被判定、leader 故障时谁能接任，以及接任者为何包含已确认前缀。只要其中任何一项没写进契约，“已提交”就是模糊词。

**quorum overlap 是一种性质，不是一句口号。** 固定多数派的常见思路是使提交集合与选主比较集合相交：在 `2f+1` 副本中，至少收 `f+1` 个确认并从至少 `f+1` 个副本比较最新日志，可使它们共享一个含已提交记录的副本。Kafka 4.2 的 partition replication 采用不同机制：动态维护已追上 leader 的 ISR；当前 ISR 的成员才有资格成为 leader，提交等待当前 ISR 的全部副本。这是 ISR 规则，不应简写为“Kafka partition replication 就是 Raft”。相同的目标是 leader 完整性：客户被告知已提交的记录不能在可接受的新 leader 上消失；实现该目标的集合、进度判定和成员变化规则则不同。

**leader 完整性也需要拒绝陈旧领导者。** 故障检测可能误判，网络恢复后旧 leader 可能仍认为自己可写。**fencing** 是通用设计要求：领导权应带可单调推进的世代或等价权威，接收写入的一方只接受当前权威，阻止过期 leader 继续形成冲突历史。本单元用它来审查“选主后谁还能写”的必要条件；不把它替代为对 Kafka 4.2 任一未在来源中列明的具体协议字段的断言。

**失败模型先于耐久承诺。** 本地磁盘故障、broker 进程故障、整机丢失、网络分区、两个 broker 同时故障和同一可用区失效不是同一个事件。`RF=3` 只给出三个 replica assignment，不说明它们是否跨主机、机架、可用区或独立电源域。即便一条记录已由当前 ISR 覆盖，保证也以至少一个合格副本在故障链中持续存活为条件；持久化设置、故障域与选主策略仍决定可恢复范围。

## 第二层：组件设计落地

**Kafka 4.2 的数据面：partition 是复制单位。** 以下版本性事实均指 Apache Kafka 4.2，访问日期 2026-08-30。[官方 Design 的 replicated-log 段](https://kafka.apache.org/42/design/design/#replicated-logs-quorums-isrs-and-state-machines-oh-my)说明，一个 partition 有 leader 与 follower；leader 选择顺序，follower 复制；ISR 是跟上 leader 的动态集合，只有 ISR 成员可被选为 leader。因而一个 topic 的不同 partition 可以有不同 leader、ISR 缩减和可用性，事故评审应精确到 topic、partition、offset 与副本 broker。

**Kafka 4.2 的确认面：`acks` 表示生产者等待什么。** [Producer Configs](https://kafka.apache.org/42/configuration/producer-configs/#acks)定义：

| 生产者设置 | 成功响应的最小含义 | 不能据此单独推出什么 |
|---|---|---|
| `acks=0` | 客户端不等待 broker 确认；记录进入客户端 socket buffer 即被视作已发送。 | leader 收到、任何副本写入、可被消费者看到，或故障后仍存在。 |
| `acks=1` | leader 写入自己的本地 log 后响应；不等待 follower 的完整确认。 | follower 已复制；若 leader 在 follower 复制前故障，该记录仍可保留。 |
| `acks=all`（`-1`） | leader 等待**当前 ISR 的全部成员**确认。 | 所有已分配副本都已写入；ISR 在之后仍不变；任意数量或任意故障域故障后一定可用。 |

`acks=all` 不是“等待 `min.insync.replicas` 个副本”的简写：Kafka 4.2 topic 配置明确规定它等待全部**当前** ISR；`min.insync.replicas` 是能否接受该类写入的下限闸门。若 ISR 当前为 `{B1,B2,B3}`，即使 `min.insync.replicas=2`，`acks=all` 仍等待三者；若 ISR 为 `{B1,B2}` 且下限为 2，则等待这两个。这个区别决定故障窗口与延迟，不能省略。

**Kafka 4.2 的可用性闸门：`min.insync.replicas`。** [Topic Configs](https://kafka.apache.org/42/configuration/topic-configs/#min.insync.replicas)规定：当生产者使用 `acks=all`，当前 ISR 少于该值时写入失败（可能出现 `NotEnoughReplicas` 或 `NotEnoughReplicasAfterAppend`）。它不把 `acks=0` 或 `acks=1` 升级成 ISR 确认。为 `RF=3` 选择 `acks=all, min.insync.replicas=2` 的效果是：有两名当前 ISR 时才给这类写入成功；把第三个副本落后后的单副本确认窗口关掉，代价是再失去一名 ISR 成员就拒绝写入。

**Kafka 4.2 的不干净选主：显式地在可用性与一致性间取舍。** [Topic Configs](https://kafka.apache.org/42/configuration/topic-configs/#unclean.leader.election.enable)将 `unclean.leader.election.enable` 定义为允许非 ISR 副本作为最后手段当选 leader，且可能造成数据丢失；4.2 默认值为 `false`。禁用时，若没有合格 ISR 副本，partition 可能保持不可用，保存“不要让缺前缀的副本成为真相”的边界；启用时可缩短不可用时间，但新 leader 可能缺少此前记录。它不是“提高高可用”的无条件开关，而是必须由数据负责人接受的损失风险选择。

**KRaft metadata quorum 与 partition 数据复制是两套对象。** Kafka 4.2 的 [KRaft Controllers 文档](https://kafka.apache.org/42/operations/kraft/#controllers)说 controller 参与 **metadata quorum**；典型部署选 3 或 5 个 controller，并以 controller 多数存活维持 metadata quorum 的可用性。这解决集群元数据与 controller 角色的可用性问题。它不改变上述每个 partition 的 leader/follower/ISR/`acks` 规则，也不证明一条 partition record 已复制到 metadata controller。因此本单元分别讨论：KRaft metadata quorum 的多数派可用性，以及 Kafka partition 数据面的 ISR 提交与选主；两者不能合并成“Kafka 就是 Raft”。

**不使用场景。** 若业务需要跨区域灾难恢复、可验证的长期恢复点或第三方系统上的同一业务状态，单个 Kafka partition 的复制确认不是完整方案；需另设跨集群复制、备份、演练和业务补偿契约。若命令不能容忍未知提交结果或重复投递，也不能只提高 `acks`；还需幂等键、去重和业务级确认。如果写多读少且只有单机本地恢复需求，直接引入三副本日志会增加运维与尾延迟；一个经演练的本地 WAL 或数据库可能更合适，前提是其故障域符合需求。

## 第三层：生产实践与真实案例

案例类型：模拟案例（假设：一个三 broker Kafka 4.2 集群，`payment-notices` 的目标 partition 为 RF=3，`B1` 为 leader、`B2`/`B3` 为 follower；生产者所用 `acks` 和 topic 的 `min.insync.replicas` 均按下表给定。broker 的本地持久化、网络、故障域、controller 与真实业务流量不作未验证的额外承诺。）

### 三 broker 故障时间线：确认记录是否会在新 leader 上

采用 `acks=all, min.insync.replicas=2`，初始 assignments 为 `B1/B2/B3`，leader=`B1`。

1. **B3 落后：** `B3` 不再满足 ISR 进度条件，当前 ISR 缩为 `{B1,B2}`。新写入仍可用，因为 ISR 大小为 2；`E-42` 的成功表示 B1、B2 都在当前 ISR 中确认它，不表示 B3 有它。
2. **B1 在成功响应后故障：** `B2` 是仍在 ISR 的候选者，接任后含有 `E-42`。这里的结论来自“确认集合 `{B1,B2}` 与可选 leader 集合的受控重叠”，而非 B1 曾经本地落盘或 topic 有 RF=3。
3. **B2 在完成接任前也不可用：** 此时 B3 是已分配却非 ISR 的副本。默认不干净选主关闭时，partition 不可写，等待具备前缀的副本恢复；这牺牲可用性以避免让 B3 的缺失前缀成为真相。若明确启用 unclean election 并由 B3 接任，则 `E-42` 存在潜在丢失窗口，不能再宣称它一定在新 leader 上。

这个模拟的判定只覆盖给定的 ISR、确认和选主条件；它没有证明 B1/B2 的介质对断电、机架级同时丢失或区域灾难的耐久性，也没有证明 producer 没有在网络错误后重试造成业务重复。

### 三 broker × `acks` × `min.insync.replicas` × follower 状态故障矩阵

固定 assignment 为 `B1` leader、`B2/B3` follower、RF=3。状态 A 的 ISR 是 `{B1,B2,B3}`；状态 B 中 B3 落后或故障而 ISR 为 `{B1,B2}`。每一格均假设写入后 B1 立刻故障，并回答该格的**写入可用性 / 成功确认含义 / 潜在丢失窗口**。`min.insync.replicas` 仅影响 `acks=all` 的写入闸门；表中对其他 `acks` 保留该事实，而不伪造其保护作用。此矩阵假设未启用 ELR：Kafka 4.2 官方配置页说明，启用 Eligible Leader Replicas 时 `min.insync.replicas` 的语义会变化，必须另按该功能的官方文档和实际配置复核。

| follower 状态（B1/B2/B3） | `acks` | `min.insync.replicas` | 写入可用性 | 成功确认语义 | B1 随后故障的潜在丢失窗口 |
|---|---:|---:|---|---|---|
| A：B2、B3 均在 ISR，ISR=3 | 0 | 1 | 客户端不等待 broker；调用可立即返回。 | 只表示客户端视为已发送；未知 B1 是否收到。 | 记录可在到达 B1 前丢失；即使 B2/B3 正常，也不能从该调用结果断言记录存在。 |
| A：B2、B3 均在 ISR，ISR=3 | 0 | 2 | 同左；此设置不把 `acks=0` 变为 ISR 确认。 | 同左。 | 同左；`min.insync.replicas=2` 不覆盖无确认发送。 |
| A：B2、B3 均在 ISR，ISR=3 | 1 | 1 | B1 可写时可确认。 | B1 已写本地 log；未等待 B2/B3。 | B1 在 follower 复制前故障时，成功记录可能不在新 leader。 |
| A：B2、B3 均在 ISR，ISR=3 | 1 | 2 | B1 可写时可确认；该下限不升级 `acks=1`。 | 同上。 | 同上；不可把该配置当作两副本确认。 |
| A：B2、B3 均在 ISR，ISR=3 | all | 1 | 可写，且当前三个 ISR 都能确认。 | B1、B2、B3 都确认；并非仅等 1 个。 | 在给定的 B1 单点故障后，B2/B3 仍有该记录并可作为 ISR leader；若后续所有 ISR 副本都不再存活，保证条件失效。 |
| A：B2、B3 均在 ISR，ISR=3 | all | 2 | 可写，且仍等待当前三个 ISR。 | B1、B2、B3 都确认；下限 2 是准入闸门。 | 对 B1 单点故障同左；该格不承诺任意两 broker 同时故障或跨故障域存活。 |
| B：B2 在 ISR，B3 落后/故障，ISR=2 | 0 | 1 | 客户端不等待 broker；调用可立即返回。 | 只表示客户端视为已发送。 | B1 接收前或复制给 B2 前均可能丢失；B3 的 assignment 不提供确认证据。 |
| B：B2 在 ISR，B3 落后/故障，ISR=2 | 0 | 2 | 同左；下限不约束 `acks=0` 的返回。 | 同左。 | 同左。 |
| B：B2 在 ISR，B3 落后/故障，ISR=2 | 1 | 1 | B1 可写时可确认。 | B1 本地 log 已写；未等 B2。 | B1 在 B2 复制前故障时，成功记录可能丢失；B3 不是可用于此推断的 ISR 副本。 |
| B：B2 在 ISR，B3 落后/故障，ISR=2 | 1 | 2 | B1 可写时可确认；下限不约束 `acks=1`。 | 同上。 | 同上。 |
| B：B2 在 ISR，B3 落后/故障，ISR=2 | all | 1 | 可写；等待当前两个 ISR 的全部确认。 | B1 与 B2 确认；不等待 B3。 | B1 故障后 B2 可接任且含记录。若 B2 随后也失去，B3 作为非 ISR 接任仅在显式 unclean 选择下可能发生，记录可丢。 |
| B：B2 在 ISR，B3 落后/故障，ISR=2 | all | 2 | 可写；ISR 恰好达到下限，等待 B1 与 B2。 | B1 与 B2 确认；这是该矩阵中关闭单副本 `acks=all` 窗口的设置。 | B1 故障后 B2 含记录并可接任；若 B2 在接任前也失效，默认保持不可用，unclean 接任则记录可能丢。 |

**如何读表。** A/B 状态的差异说明 assignment 数量不是确认集合的数量；`acks=all` 的差异说明下限不等于实际等待数量；最后一列说明“写入成功”无法脱离紧接着的选主和第二次故障。观察时必须记录实际 `acks`、topic override 与 broker 默认的有效 `min.insync.replicas`、leader/ISR 变化时间、producer 成功或失败时间，以及 unclean election 的有效配置。仅查看 RF、topic 名或一次 send 成功不足以复盘。

## 第四层：动手验证与架构判断

### 活动：以状态证据复盘 B1 故障后的提交边界

- **环境：** 一套经团队批准、可随时删除的 Kafka 4.2 实验集群，恰有 B1/B2/B3 三个 broker；一个专用测试 topic 与专用 consumer group。开始前确认该 topic、broker 名称、`acks`、有效 `min.insync.replicas` 和 `unclean.leader.election.enable` 均属于本活动，且没有生产消费者使用它。
- **步骤：**

  1. 创建或核验专用 topic 为 RF=3，记录该 partition 的 assignment、leader 与 ISR；将 producer 固定为 `acks=all`，将 topic 的有效 `min.insync.replicas` 固定为 2。把这些配置和开始时间写入实验记录。
  2. 暂停或隔离该 partition 在 B3 上的 follower replication（使用实验环境现有、经批准的故障注入方式），持续观察直到元数据把 B3 移出 ISR；记录 `leader=B1`、`ISR={B1,B2}` 的证据。不要在生产环境通过杀进程或修改未知配置制造故障。
  3. 生产带唯一 key 的记录 `E-42`，保存 producer 的成功或失败结果、partition、offset 与时间。随后仅使 B1 不可用，等待选主完成，重新读取该 partition 的 leader/ISR，并从 B2 新 leader 读取 `E-42`。
  4. 不启用 unclean leader election。若实验中 B2 不可用而只剩 B3，停止写入并记录 partition 不可用，不以 B3 强行恢复来“证明”结果。清理专用 topic、consumer group、故障注入和实验 broker 状态；清理前再次确认所有名称仍为专用资源。

- **预期观察：** B3 落后时 ISR 变为 `{B1,B2}`；`acks=all, min.insync.replicas=2` 的成功记录在 B1 故障后由 B2 读到。若 ISR 再少于 2，新的 `acks=all` 写入失败或不可用；这说明下限是可用性闸门，而不是把历史成功补写给 B3。
- **成功条件：** 记录了 B3 移出 ISR 的证据、`E-42` 的成功响应及 offset、B1 故障后的新 leader 与对 `E-42` 的读取证据；实验结束后所有专用 topic、group、故障注入和实验资源均已清理或按团队实验规范恢复。
- **清理方式：** 仅删除在开始时列明且确认归属本活动的专用 topic/group；撤销活动专用的网络隔离或 replication 限流；恢复 B1/B2/B3 到实验基线。不得删除共享 topic、broker 数据目录、controller metadata 或任何生产资源。

该活动验证的是“当前 ISR 的确认与可选新 leader 的重叠”这一可观察假设；它不模拟机架/可用区毁损、磁盘掉电、KRaft controller 多数派失效、跨集群恢复或真实业务 exactly-once。

### 架构评审活动：修正一份看似乐观的 AI 建议

待评审建议：**“RF=3 且 `acks=all`，所以任何两台机器同时故障也不会丢数据。”**

请为该句做一次带证据的反驳，逐项写出它遗漏的假设：

| 必须拆出的假设 | 评审问题 | 需要的证据或修订 |
|---|---|---|
| ISR | 成功当时的 ISR 是 3、2 还是 1？所有被分配副本是否都在 ISR？ | 保存每个成功写入附近的 leader/ISR 时间线；`acks=all` 等待当前 ISR，不等于 RF=3。 |
| 时序 | 两次故障发生在 producer 发送、leader 本地写、follower 追上、成功响应、ISR 变更和新 leader 接任的哪两个事件之间？ | 为记录保存 offset、producer 结果和各事件时间；超时或网络错误可能留下未知提交结果。 |
| 持久化 | “机器故障”是进程退出、可重启主机、磁盘/电源丢失，还是整个故障域毁损？每个 surviving broker 的日志在该模型下能否恢复？ | 将 broker 本地耐久与设备/部署假设另列并演练；不从 `acks` 推导硬件掉电语义。 |
| 选主 | 新 leader 只能来自哪个集合？所有 ISR 副本都不可用时，是停写还是允许非 ISR 的 B3 接任？ | 记录 `unclean.leader.election.enable` 的有效值与实际选主结果；若 unclean 接任，缺前缀是已知风险。 |
| 故障域 | B1/B2/B3 是否位于独立主机、机架、可用区、电源和网络路径？“两台机器”是否能覆盖同一故障域？ | 记录 replica placement 与故障域映射；RF=3 本身不证明独立性。 |

学习者的修订结论至少应达到：**“在 Kafka 4.2 的某个 partition 上，若 producer 使用 `acks=all`，成功时当前 ISR 满足该 topic 的 `min.insync.replicas`，并且故障后始终至少有一个含该提交前缀的 ISR 副本存活且可被选为 leader，则该已确认记录不应因该 leader 故障丢失。该结论不覆盖 `acks=0/1`、未知提交结果、所有 ISR 副本失效、unclean leader election、未验证的本地介质故障，或未隔离的共同故障域。”**

## 常见误区与适用边界

- **误区：** leader 写入本地 log 后就等于分布式持久。**边界：** 本地写入只给 leader 的本地恢复提供证据；必须结合 follower 进度、确认集合与故障后的 leader 资格讨论分布式提交。
- **误区：** `RF=3` 与 `acks=all` 自动容忍两台机器同时故障。**边界：** `acks=all` 等待当前 ISR，不是 assignment 全集；同时故障是否跨越提交集合和可选 leader 集合，取决于 ISR、时序、选主和故障域。
- **误区：** `min.insync.replicas=2` 表示 `acks=all` 只等待两个副本。**边界：** 它是当前 ISR 的最低准入数；实际成功仍等待全部当前 ISR。若 ISR 有 3 个，仍等待 3 个。
- **误区：** `min.insync.replicas` 能保护所有 producer。**边界：** Kafka 4.2 的该闸门适用于 `acks=all`；`acks=0` 没有 broker 确认，`acks=1` 不等 follower 全部确认。
- **误区：** unclean leader election 只是更高可用。**边界：** 非 ISR 副本接任可能缺少已确认前缀；这是用一致性/数据完整性风险换可用性的显式选择。
- **误区：** KRaft controller 多数派就是 partition 数据的多数派提交。**边界：** controller metadata quorum 和每个 partition 的 leader/ISR 数据复制是不同状态集合；两者均需评审，不能互相替代。

## 掌握度检查

1. **解释：** 为什么“B1 的本地 WAL 已同步”不能证明 `E-42` 会在 B1 故障后的新 leader 上？用复制进度、提交集合、leader 完整性和 fencing 各说明一个不可省略的条件。
2. **应用：** 某 RF=3 partition 当前 ISR 为 `{B1,B2}`，B3 落后。业务无法接受单副本成功后丢失，但可以接受 ISR 少于 2 时暂停写入。请给出 `acks`、`min.insync.replicas`、unclean election 的选择，说明 B1 故障及 B1/B2 都不可用时的预期行为和所需观测证据。
3. **迁移：** 将“提交集合必须与可选新 leader 集合产生受控重叠”的模型迁移到固定多数派 replicated log。指出与 Kafka ISR 的两项不同，并解释为何不能只凭“它们都叫 quorum”断言协议相同。
4. **不使用：** 某审计命令要求跨可用区灾难恢复、长期可验证留存且不得接受未知提交结果。何时不应只依赖单个 Kafka partition 的 `acks=all`？提出跨集群/备份、幂等/审计和故障域验证的替代或补充方案，并说明各自解决的边界。

## 在综合项目中的应用

### ADR：支付通知事件的确认契约与故障降级

**状态：** 建议采用，须经实际 Kafka 4.2 版本、topic 有效配置、replica placement 与故障演练核验后生效。

**上下文：** 支付通知一旦被下游执行可能触发用户可见或不可逆动作。把 leader 本地追加、Kafka producer 成功、消费者可见、跨故障域恢复与下游执行混成一个“已可靠发送”会掩盖重试、重复和数据丢失窗口。

**决策：** 对此类 partition，采用 RF=3、producer `acks=all`、topic 有效 `min.insync.replicas=2`，并保持 `unclean.leader.election.enable=false`。成功响应只承诺记录已满足 Kafka 4.2 在当时当前 ISR 和下限条件下的 partition 提交规则；若 ISR 少于 2，停止接受这类写入并让上游按幂等 key 重试或进入受控暂存，不为了持续写入启用不干净选主。每次发布和事故时同时核对生产者 `acks`、topic override、broker default、leader/ISR 变更、partition/offset、unclean 设置、replica placement 和 controller metadata quorum 的健康度。

**后果：** 这会在 follower 落后或第二个 ISR 副本失效时牺牲写入可用性，并增加确认等待；换来避免把 `acks=all` 降级为单副本成功。它仍不构成跨地域备份、业务 exactly-once、消费者处理成功或电源/故障域独立性的证明。下游按事件 ID 去重，审计留存与跨区域恢复另立数据保留和演练契约。

**验证与回滚：** 在隔离的三 broker Kafka 4.2 集群执行本单元活动，验收 B3 移出 ISR 后 B1 故障仍由 B2 读到成功记录，以及 ISR 少于 2 时新写入不被错误确认。定期演练 producer 网络错误后的幂等重试、broker 故障、replica placement 审核和控制器 quorum 的独立故障边界。若有效配置漂移到 `acks!=all`、`min.insync.replicas<2` 或允许 unclean leader election，停止将 producer 成功用于支付通知确认，降级为可重试暂存并告警，直到重新核验配置与恢复路径。

## 权威来源与延伸阅读

- [来源矩阵：Kafka 4.2 partition replication、producer/topic configs 与 KRaft controller](../references/source-matrix.md)
- [Apache Kafka 4.2 Design：Replicated Logs, Quorums, ISRs, and State Machines](https://kafka.apache.org/42/design/design/#replicated-logs-quorums-isrs-and-state-machines-oh-my)（组件版本：Apache Kafka 4.2；官方页面；访问日期：2026-08-30）
- [Apache Kafka 4.2 Design：Availability and Durability Guarantees](https://kafka.apache.org/42/design/design/#availability-and-durability-guarantees)（组件版本：Apache Kafka 4.2；官方页面；访问日期：2026-08-30）
- [Apache Kafka 4.2 Producer Configs：`acks`](https://kafka.apache.org/42/configuration/producer-configs/#acks)（组件版本：Apache Kafka 4.2；官方页面；访问日期：2026-08-30）
- [Apache Kafka 4.2 Topic Configs：`min.insync.replicas` 与 `unclean.leader.election.enable`](https://kafka.apache.org/42/configuration/topic-configs/)（组件版本：Apache Kafka 4.2；官方页面；访问日期：2026-08-30）
- [Apache Kafka 4.2 KRaft：Controllers](https://kafka.apache.org/42/operations/kraft/#controllers)（组件版本：Apache Kafka 4.2；官方页面；访问日期：2026-08-30）
