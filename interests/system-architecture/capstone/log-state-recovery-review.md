---
id: system-architecture-log-state-recovery-capstone-01
stage: capstone
track: interests
domain: system-architecture
topic: 日志、状态与恢复纵向切片综合评审
age_range: 18y+
difficulty: advanced
review_status: draft
references:
  - ../references/source-matrix.md
tags: [system-architecture, state, log, snapshot, replay, recovery]
learning_paths: [system-architecture]
related_prompts: [system-architecture-page-cache-durable-io-01, system-architecture-wal-01, system-architecture-replicated-log-01, system-architecture-checkpoint-replay-01, system-architecture-stateful-recovery-01]
---

# 日志、状态与恢复纵向切片综合评审

## 学习目标

完成本单元后，你能把一条推荐事件从 API 接入到在线特征更新画成状态与证据链；区分本地 I/O、数据库提交、分区复制、流作业 checkpoint 和 Kubernetes 编排各自的恢复边界；并用容量估算、故障矩阵和 runbook 证明 RPO/RTO，而不是把若干组件名拼成“不会丢也不会重复”的承诺。

## 先修知识

按依赖顺序完成并保留各单元的活动证据与 ADR：

1. [Page Cache、写入确认与持久化边界](../01-computer-systems/page-cache-and-durable-io.md)
2. [Write-Ahead Log：从提交确认到崩溃恢复](../04-data-systems/write-ahead-log.md)
3. [Replicated Log：副本、提交与选主](../03-distributed-systems/replicated-log.md)
4. [Checkpoint 与 Replay：有状态流作业的恢复边界](../05-data-architecture/checkpoint-and-replay.md)
5. [有状态服务恢复：编排、数据与一致性的边界](../06-cloud-native-sre/stateful-recovery.md)

本综合评审不要求新增 ML Systems、Recommendation Systems 或 AI Engineering 正文，也不以真实用户、生产流量或真实事故作为练习材料。

## 问题场景

案例类型：模拟案例（假设：推荐平台 API 接收带唯一 `event_id` 的行为事件；本地接入日志用于短时缓冲，PostgreSQL 18 保存事件元数据，Kafka 4.2 的三副本 partition 承载事件流，Apache Flink 2.3.0 从 Kafka 计算在线特征并写入按稳定 key 幂等覆盖的 feature sink；Kafka 或 Flink 的有状态成员运行于 Kubernetes v1.37 StatefulSet。峰值输入为每秒 32,000 条、每条 1 KiB，允许从 Kafka 重放 15 分钟；演练仅在隔离、可丢弃环境进行。）

产品要求把“API 已接受”“可在本机恢复”“Kafka 已提交”“Flink 可从一致切面重放”“在线特征结果正确”“Pod 已重建”分别说明。评审者要回答：每个确认点依赖哪份 state、哪段 log 或 snapshot、哪些 replica、哪个 replay 起点和 fencing 证据；发生连续故障时，实际 RPO/RTO 如何从记录算出。

## 第一层：底层思想

统一模型不是把所有组件称为日志，而是给每一层写出七个对象：

| 对象 | 评审定义 | 本切片中的例子 |
|---|---|---|
| state | 当前业务或系统判断所依赖、会随事件改变的事实 | PostgreSQL 数据页、Kafka partition 前缀、Flink operator state、feature sink 的版本化值 |
| log | 以顺序位置描述变化、可支撑确认或恢复的记录 | 本地追加文件、PostgreSQL WAL、Kafka partition log |
| snapshot | 为恢复保存的某个受控状态切面 | PostgreSQL checkpoint 所缩短的 REDO 起点、Flink completed checkpoint 的 state 与 source position |
| replica | 在给定时刻持有某段状态或日志的成员 | Kafka 当前 ISR 中已确认某 offset 的 broker |
| replay | 从已验证起点重新应用后续变化 | PostgreSQL REDO；Flink 从 completed checkpoint position 重读 Kafka |
| fencing | 阻止过期写入者继续形成冲突历史的证据或机制 | 旧节点隔离、旧 epoch/lease 被拒绝、只允许合格 leader 写入 |
| RPO / RTO | 可回到的最后 durable point / 从故障判定到恢复可接受服务的时长 | 最后确认 offset 或 checkpoint；判定、隔离、恢复、追赶、校验各阶段耗时 |

一次恢复只有在这些对象形成闭环时才成立：业务确认必须指向可验证的 durable point；durable point 必须能映射到恢复算法；恢复算法必须拿到仍可读的 log、snapshot 或 replica；新的写入者必须排除旧权威；恢复结果还要通过业务不变量或幂等 key 校验。任何单一 API、PVC、`acks` 或 checkpoint 开关都不能独立覆盖整条链。

RPO 和 RTO 不能互相代替。减少未同步批龄、等待更多 ISR 或缩短 checkpoint 间隔可能改变 RPO 风险窗口，却也可能增加确认延迟、快照压力或恢复资源需求；更快创建 Pod 只影响 RTO 的一部分。评审结论必须附带故障模型、实际配置和观测证据。

## 第二层：组件设计落地

按数据流逐层声明接口与非承诺：

| 层 | 对外确认或恢复接口 | 必须保存的证据 | 不能向下一层外推 |
|---|---|---|---|
| Linux Page Cache / 本地追加日志 | 有界批次完成同步请求后，才按本地故障模型确认 | `event_id`、批次 ID、`write`/同步结果、批龄、文件尾校验 | 不表示 PostgreSQL、Kafka 或远端副本已接收 |
| PostgreSQL 18 WAL | 同步或异步提交按实际配置定义本地提交窗口；REDO 恢复未落入数据页的变化 | 事务 ID、提交时间、LSN、`synchronous_commit`、`wal_writer_delay`、checkpoint 与恢复结果 | 不表示有独立备份、跨节点副本或业务事件已投递 |
| Kafka 4.2 replicated log | `acks=all` 等待当前 ISR；`min.insync.replicas` 是该确认的准入闸门 | topic/partition/offset、producer 结果、assignment、leader/ISR 时间线、unclean 配置和故障域 | 不表示全部 assignment 已确认、外部 sink 已处理或任意共同故障后零丢失 |
| Flink 2.3.0 checkpoint / replay | 仅 completed checkpoint 的 operator state 与 source position 可作恢复点 | checkpoint ID、完成时间、storage 可读性、source position、alignment、replay 与 sink 去重结果 | 不表示每条事件物理只执行一次，也不自动覆盖外部副作用 |
| Kubernetes v1.37 StatefulSet / PV / PVC | 控制器、稳定 identity 和存储关联承载编排；应用协议承载恢复 | Pod/节点事件、ordinal/PVC/PV、attach 状态、fencing、应用 epoch、日志/状态恢复和成员接纳 | 不表示旧实例已停止、卷内数据一致、应用已恢复或达到业务 RPO/RTO |

接口之间使用同一个 `event_id` 和可关联的时间线：API 请求 ID → 本地批次 → PostgreSQL 事务 ID/LSN → Kafka partition/offset → Flink checkpoint/source position → feature key/version。映射记录是复盘证据，不是新增一次分布式事务；若某层无法提供映射，应明确其未知结果、重试和补偿策略。

## 第三层：生产实践与真实案例

### 从 API 到在线特征的连续故障时序

案例类型：模拟案例（假设沿用“问题场景”；所有时间、吞吐和故障均为纸面输入，不声称来自生产系统。）

| 时刻与故障点 | 可观察现象 | 不可直接下结论 | 需要的处置与证据 |
|---|---|---|---|
| F1：API 在本地 `write()` 返回后、批次同步前响应成功，节点掉电 | 调用方有成功响应，恢复文件尾缺少一个批次 | 不能说 `write()` 已保证稳定介质 | 降低响应承诺或等同步后确认；用批次 ID、同步时间和尾部校验界定缺口 |
| F2：PostgreSQL 异步提交返回后、对应 WAL 刷新前进程崩溃 | 元数据事务曾返回成功，恢复后最近记录缺失 | 不能把 WAL 的存在等同于该事务已 durable 或已有备份 | 核对实际提交策略与风险窗口；从上游 `event_id` 幂等补齐，或对不可丢数据改同步提交 |
| F3：Kafka producer 遇到超时，随后 leader 故障且 ISR 缩小 | producer 没有成功 ack，重试后可能看到重复 | 不能从超时推断消息一定未追加，也不能从 RF=3 推断三副本都含记录 | 保存 offset/错误与 ISR 时序；以幂等 key 核验最终结果，ISR 不足时按契约拒写 |
| F4：Kafka 当前 ISR 中最后一个含已确认前缀的副本不可用 | partition 无 clean leader，写入暂停 | 不能为可用性启用 unclean election 后仍承诺保留此前前缀 | 保持降级，等待合格副本或走已验证恢复路径；记录 unclean 设置与可选 leader 集合 |
| F5：Flink checkpoint `n+1` 未完成时 TaskManager 故障 | 作业从 completed checkpoint `n` 恢复并重读后续 offset | 不能声称故障前所有调用只发生一次 | 核验 `n` 的 state/source position、Kafka 保留和重放范围，保存 sink 幂等冲突结果 |
| F6：feature sink 改为非幂等累加，重放同一事件 | 相同逻辑事件第二次写入改变在线特征 | 不能用“Flink exactly-once 已开启”覆盖 sink 副作用 | 暂停发布；恢复稳定 feature key/version 的覆盖或事务/去重协议，再重放并比较结果 |
| F7：Kubernetes 中有状态 Pod `Unknown`，值班者拟强制删除 | 控制面失去节点状态，新 Pod 可能被创建 | 不能说旧进程已停、卷已安全或新成员可写 | 先证明节点隔离和旧 writer fencing，再核验 PV/PVC、应用 epoch、日志前缀和成员接纳 |

评审必须沿同一 `event_id` 穿过全部故障点，分别写出“已知、未知、承诺、补偿”。若恢复后 feature sink 的最终 key/value 与无故障基线一致，只能在所列 source、sink、版本和故障条件内陈述逻辑结果一致；不能宣称外部世界没有发生重复调用。

### 第一批范围锁定

本批只整合 Page Cache、PostgreSQL WAL、Kafka replicated log、Flink checkpoint/replay 与 Kubernetes stateful recovery。模型、Prompt 和索引只作为可版本化状态轻触：重放事件时记录 `model_version`、`prompt_version`、`index_version`，避免新版本静默改写历史结果；需要回滚时选择已验证版本并重新计算可重放区间。模型训练、推荐算法、Prompt 工程和索引构建不在本批展开，也不新增相应阶段的正式文章。

## 第四层：动手验证与架构判断

### 活动：提交一次纸面端到端恢复评审

- **环境：** 本页模拟参数、一份本地文档或纸面表格；不得接入生产 API、Kafka、Flink、Kubernetes、真实用户数据、凭证或产生费用的资源。
- **步骤：**

  1. 提交 **state inventory**：逐项列出状态所有者、主键/位置、写入者、确认点、恢复来源、保留期、敏感性和负责人；至少覆盖本地批次、PostgreSQL 元数据、Kafka partition、Flink operator state、feature sink，以及模型/Prompt/索引版本字段。
  2. 提交 **durability matrix**：对 F1–F7 分别写出当前 durable point、易失窗口、可重放来源、未知结果处理、备份/副本边界和所需证据。任何格不能只写组件名。
  3. 提交 **failure matrix**：为每个故障写检测信号、立即降级、数据影响、恢复起点、fencing、成功条件、RPO/RTO 计算和仍未覆盖的风险。
  4. 提交 **容量估算**：峰值 `32,000 events/s × 1 KiB = 31.25 MiB/s`；15 分钟原始 replay 窗口约 `27.5 GiB`，Kafka RF=3 仅按原始 payload 计约 `82.4 GiB`。若要求在 10 分钟内清空这 15 分钟积压，同时新流量仍为 31.25 MiB/s，则处理链至少需要约 `78.1 MiB/s` 的有效消费能力，再另计协议、索引、checkpoint、压缩、网络与安全余量。逐项写出自己的单位、公式、保留系数和最大状态量，不能把估算当实测承诺。
  5. 提交 **recovery runbook**：按检测 → 停止扩大损害 → 判定最后 durable point → fence 旧 writer → 核验 log/snapshot/replica → 恢复与 replay → 数据校验 → 解除降级排列；每步记录所有者、输入证据、停止条件、回滚路径和时间戳。
  6. 提交 **AI 方案评审**：评审这句话——“Kafka RF=3、Flink 开启 checkpoint、服务使用 StatefulSet 与 PVC，因此平台自动达到 RPO=0、不会重复且 Pod force delete 后会自行恢复。”至少识别本地持久化、当前 ISR/确认、未知提交结果、checkpoint 完成状态、source 保留、sink 幂等、fencing、卷数据与 RTO 中的六项缺陷；为每项给出可验证的修订。

- **预期观察：** 同一个“成功”在不同层对应不同状态与证据；一个故障可能同时产生数据缺口、未知提交、重复 replay 和不可安全重建四类问题。容量估算会暴露 replay 追赶需要同时处理积压和新流量。
- **成功条件：** 六份产物齐全；F1–F7 均有独立判定；五个组件按依赖顺序相连；RPO/RTO 可由记录复算；AI 建议至少修正六项缺陷；模型/Prompt/索引只以版本字段进入 replay/rollback；结论不依赖生产数据或未核验组件行为。
- **清理方式：** 删除本活动产生的临时草稿和模拟标识，只保留经审阅的六份脱敏评审产物及验证耗时；未创建外部资源，因此不得运行集群、卷或 topic 删除命令。

完成后，使用[第一批真实学习者验证协议](validation-protocol.md)记录逐页耗时、术语缺口、实验结果与是否能独立完成本评审。

## 常见误区与适用边界

- **误区：** 把 state、log 和 snapshot 当成同一个副本。**边界：** 它们保存的对象、位置和恢复算法不同，必须逐层说明。
- **误区：** 有 WAL、RF=3、checkpoint 和 PVC 就得到端到端 RPO=0。**边界：** 每个机制只在其配置、成员、介质、source/sink 和故障条件内提供证据，跨层承诺需要完整映射与演练。
- **误区：** replay 能自动修复所有丢失。**边界：** 输入必须仍可读，恢复点必须一致，副作用必须可事务、幂等或补偿，版本变化也必须受控。
- **误区：** 新 Pod Ready 即恢复结束。**边界：** 旧 writer fencing、卷、应用状态、成员接纳、数据校验和解除降级仍是独立步骤。
- **不使用场景：** 若问题只涉及无状态、可随时重算的临时 worker，不应套用完整有状态恢复链；应先证明没有不可重放状态，再采用更小的 Deployment 与外部状态合同。

## 掌握度检查

1. **解释：** 用 state、log、snapshot、replica、replay 和 fencing 说明 F1–F7 为什么不能由一个“持久化”开关解决。
2. **应用：** 在峰值与 replay 参数不变时，为一条 `event_id` 写出确认、故障、恢复和最终 feature key 校验的完整时间线，并计算所需追赶吞吐。
3. **迁移：** 把 feature sink 改成会发送外部通知的非幂等系统。指出原方案哪些证据失效，并设计去重、outbox 或补偿边界。
4. **不使用：** 若 AI 建议给所有服务加本地 WAL、Kafka、Flink checkpoint 和 StatefulSet，指出哪些无状态或不可重放场景不适合，并给出更小的状态与恢复合同。

## 在综合项目中的应用

本页就是首批综合项目的交付入口。评审者应把五个前置单元的 ADR 合并成一份有冲突处理的决策记录：本地确认不能覆盖 Kafka 提交，PostgreSQL WAL 不能替代备份，Kafka 提交不能替代 sink 结果，Flink checkpoint 不能替代外部幂等，Kubernetes 编排不能替代应用 fencing 与恢复。

提交后由一名未参与写作的工程师按[真实学习者验证协议](validation-protocol.md)复核；第一位目标学习者也可以是项目所有者本人，但仍必须留下逐页耗时、综合评审产物和可复算结论，不能以“已经读过”代替验证。

## 权威来源与延伸阅读

- [第一批官方来源矩阵](../references/source-matrix.md)
- [Linux Kernel Documentation：Page Cache](https://docs.kernel.org/next/mm/page_cache.html)（访问日期：2026-08-30）
- [PostgreSQL 18：Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html)（访问日期：2026-08-30）
- [Apache Kafka 4.2 Design：Replicated Logs](https://kafka.apache.org/42/design/design/#replicated-logs-quorums-isrs-and-state-machines-oh-my)（访问日期：2026-08-30）
- [Apache Flink 2.3.0：Fault Tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/)（访问日期：2026-08-30）
- [Kubernetes Documentation v1.37：StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)（访问日期：2026-09-01）

外部课程（包括 Khan Academy）只作为链接或按其许可使用，不复制受限制的正文、视频或题目；AI 对话可生成待评审建议，不能作为事实来源。
