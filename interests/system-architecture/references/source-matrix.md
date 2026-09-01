---
id: system-architecture-source-matrix
stage: all
track: interests
domain: system-architecture
topic: source-matrix
age_range: 18y+
difficulty: advanced
review_status: draft
references: []
tags: [system-architecture, references]
learning_paths: [system-architecture]
related_prompts: []
---

# 系统架构课程第一批来源矩阵

本矩阵仅登记正式知识单元拟引用的第一手官方资料。每次写正文时重新核对页面；版本性结论必须同时写明组件版本、官方页面和访问日期。外部课程只链接不复制，ChatGPT 对话不是事实来源。

| 知识单元 | 核心问题 | 第一手资料 | 版本或访问日期 | 允许支持的结论 | 不允许外推 |
|---|---|---|---|---|---|
| 持久化写入的确认边界 | DAX 改变了哪条 I/O 路径，哪些条件仍然成立？ | [Linux Kernel DAX](https://docs.kernel.org/filesystems/dax.html) | Linux Kernel Documentation；访问日期：2026-08-30 | DAX 在满足底层存储和文件系统条件时可绕过 page cache 的额外副本；启用与实际 `S_DAX` 状态受文件系统、挂载选项和介质支持影响。 | 不得据此宣称 DAX 对所有工作负载更快、自动持久化、适用于任意架构或替代备份。 |
| 持久化写入的确认边界 | Page Cache、缓冲/直接路径与回写如何区分？ | [Linux Kernel Page Cache](https://docs.kernel.org/next/mm/page_cache.html)；[Linux Kernel iomap buffered I/O](https://docs.kernel.org/filesystems/iomap/operations.html) | Linux Kernel Documentation；访问日期：2026-08-30 | 正常文件读、写和 `mmap` 经 Page Cache，`O_DIRECT` 等路径可绕过它；buffered I/O 默认使用 Page Cache，脏缓存随后回写，`fsync` 及其变体可强制回写。因而系统调用返回、其他进程可见性、缓存/回写状态和业务耐久确认必须作为不同事件建模。 | 不得将 iomap 或 Page Cache 文档外推为全部文件系统、设备缓存、跨进程可见性细节或应用协议的端到端持久化保证。 |
| 持久化写入的确认边界 | 设备缓存、flush 与稳定介质如何区分？ | [Linux Kernel explicit volatile write-back cache control](https://docs.kernel.org/block/writeback_cache_control.html) | Linux Kernel Documentation；访问日期：2026-08-30 | 具有易失写回缓存的设备可在数据到达非易失存储前向操作系统报告 I/O 完成；Linux 块层提供 flush 与 FUA 机制供文件系统控制设备缓存。 | 不得把块层机制外推为任一驱动、设备、控制器或电源保护配置正确实现 flush/FUA，或承诺硬件掉电保持。 |
| 持久化写入的确认边界 | 应用的 `fsyncSync` 调用在 Node.js 中表达什么？ | [Node.js File system API](https://nodejs.org/api/fs.html#fsfsyncsyncfd) | Node.js v26.8.1；访问日期：2026-08-30 | `fs.fsyncSync(fd)` 请求将打开文件描述符的数据刷新到存储设备；其具体实现取决于操作系统和设备。Node.js 同步 API 会阻塞事件循环直至操作完成或失败。 | 不得据此承诺任一硬件的掉电保持、文件系统崩溃一致性、固定延迟或业务端到端耐久。 |
| 持久化写入的确认边界 | Java 文件通道的 `force` 有何确认边界？ | [Java SE 25 FileChannel](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/FileChannel.html#force(boolean)) | Java SE 25；访问日期：2026-08-30 | `FileChannel.force(boolean)` 请求把该通道对文件作出的更新写入所在存储设备；本地设备与非本地设备、元数据参数及映射缓冲区具有不同条件和边界。 | 不得把该 API 的返回外推为远程存储、设备缓存、电源故障、复制副本或业务协议的保证。 |
| WAL 与本地恢复 | 为什么先写日志能支持崩溃后的恢复、确认与 checkpoint 有何关系？ | [PostgreSQL 18 WAL introduction](https://www.postgresql.org/docs/current/wal-intro.html)；[PostgreSQL 18 asynchronous commit](https://www.postgresql.org/docs/current/wal-async-commit.html)；[PostgreSQL 18 WAL configuration](https://www.postgresql.org/docs/current/wal-configuration.html) | PostgreSQL 18（当前文档）；访问日期：2026-08-30 | 本页仅可使用 PostgreSQL WAL 的基本原则：数据文件的变更须先有已刷新到永久存储的 WAL 记录；崩溃后可 REDO 尚未写入数据页的变更。可使用同步提交等待 WAL 刷新、异步提交在 WAL 落盘前返回成功而可能丢失最近事务；异步提交的最大风险窗口为 `3 × wal_writer_delay`，因此可在明确配置值时计算其上界；checkpoint 刷新脏数据页并以其记录确定 REDO 起点，以及 checkpoint 频率、I/O 与恢复工作量之间的条件性权衡。 | 不得把 PostgreSQL 的事务、复制、备份、归档、文件系统建议或异步提交语义泛化为其他数据库、消息系统或任意硬件的保证；不得把本地同步提交外推为节点/可用区故障下的复制或备份保证；不得把 WAL 等同于备份、复制或业务事件/审计日志。 |
| WAL 与本地恢复 | InnoDB redo log 与 PostgreSQL WAL 的共同模型和术语如何限量对照？ | [MySQL 8.4 InnoDB Redo Log](https://dev.mysql.com/doc/refman/8.4/en/innodb-redo-log.html) | MySQL 8.4 Reference Manual；访问日期：2026-08-30 | InnoDB 将 redo log 描述为用于 crash recovery 的磁盘结构；数据文件未完成的更新可在初始化时重放；redo 以递增 LSN 表示，checkpoint 推进时旧 redo 可被截断，恢复从最新 checkpoint LSN 开始。 | 不得据此断言 InnoDB 与 PostgreSQL 的提交确认、页格式、复制、备份、配置默认值、性能或故障语义相同，或将任一实现当作全部数据库的 WAL 定义。 |
| 分区复制与提交边界 | Kafka 4.2 的 partition replicated log 如何定义提交、ISR 与选主？ | [Apache Kafka 4.2 Design: Replicated Logs, Quorums, ISRs, and State Machines](https://kafka.apache.org/42/design/design/#replicated-logs-quorums-isrs-and-state-machines-oh-my)；[Availability and Durability Guarantees](https://kafka.apache.org/42/design/design/#availability-and-durability-guarantees) | Apache Kafka 4.2；访问日期：2026-08-30 | topic 被划分为全序 partition；每个 partition 是 replicated log，副本分配、leader/follower 和动态 ISR 以 partition 为单位。消息须被当前 ISR 的全部副本写入才是 committed；只有 ISR 成员可被选为 leader。Kafka 的 `acks=0`、`acks=1` 与 `acks=all` 分别对应不等待 broker 确认、只等 leader、本次等待全部当前 ISR 的不同确认边界。 | 不得把 `acks=all` 写成全部已分配副本均已确认、无条件零丢失、已跨故障域、消费者端到端 exactly-once，或把 Kafka partition replication 简写成“就是 Raft”。不得将固定多数派 quorum 的选主/提交算法细节外推到 Kafka partition。 |
| 分区复制与提交边界 | `min.insync.replicas` 与 unclean leader election 如何改变 Kafka 4.2 的可用性/耐久取舍？ | [Apache Kafka 4.2 topic configuration](https://kafka.apache.org/42/configuration/topic-configs/#min.insync.replicas)；[NotEnoughReplicasAfterAppendException Javadoc](https://kafka.apache.org/42/javadoc/org/apache/kafka/common/errors/NotEnoughReplicasAfterAppendException.html)；[unclean.leader.election.enable](https://kafka.apache.org/42/configuration/topic-configs/#unclean.leader.election.enable) | Apache Kafka 4.2；配置页访问日期：2026-08-30；Javadoc 访问日期：2026-09-01 | 对 `acks=all`，`min.insync.replicas` 限制写入成功所需的最小 ISR 数；当前 ISR 小于该值时生产者得到 `NotEnoughReplicas` 或 `NotEnoughReplicasAfterAppend`。Javadoc 明确后者是在消息已经追加到 log 后才发现 ISR 低于下限，producer 重试会造成重复；因此没有成功 ack 不能证明消息最终不存在。`acks=all` 仍等待全部当前 ISR，而非只等待最小值。允许非 ISR 副本作为最后手段被选作 leader 的 unclean leader election 可能导致数据丢失，默认值为 `false`。Kafka 4.2 还注明启用 Eligible Leader Replicas（ELR）时该配置语义会变化。 | 不得把 `min.insync.replicas` 单独用于推断 `acks=0` 或 `acks=1` 的确认语义，或把 producer 错误/超时解释为消息必然未追加；不得宣称启用 unclean election 后仍保留此前已确认记录；不得把默认值替代实际 topic/broker 配置核验。本矩阵未经 ELR 配置核验时，不得套用至启用 ELR 的 topic。 |
| 分区复制与提交边界 | Kafka 4.2 KRaft 的 metadata quorum 与 partition data replication 如何分界？ | [Apache Kafka 4.2 KRaft: Controllers](https://kafka.apache.org/42/operations/kraft/#controllers) | Apache Kafka 4.2；访问日期：2026-08-30 | KRaft 模式中 controller 参与 metadata quorum；配置 3 个 controller 时需多数存活以维持该 quorum 的可用性。controller 与 broker 可分离或组合部署。 | 不得把 controller metadata quorum 的多数派可用性当成每个 topic partition 数据副本的提交规则、数据耐久性或跨故障域保证；不得由此把 Kafka partition replication 描述为 Raft。 |
| 流处理 checkpoint 与恢复 | checkpoint 如何参与有状态流作业的容错？ | [Apache Flink stable Fault Tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/) | Apache Flink 2.3.0（stable 文档在访问日所指版本）；访问日期：2026-08-30 | snapshot 可包含 operator state 与 source position；checkpoint barrier 及多输入 alignment 用于一致 snapshot；恢复依赖可重放 source；端到端 exactly-once 还要求 transactional 或 idempotent sink。 | 不得把 Flink 的语义写成与 source、sink、外部系统和部署配置无关的物理 exactly-once 保证，或声称每条事件只会物理执行一次。 |
| 流处理 checkpoint 与恢复 | 大状态 checkpoint 的调优应观察什么？ | [Apache Flink stable large-state checkpoint tuning](https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/large_state_tuning/) | Apache Flink 2.3.0（stable 文档在访问日所指版本）；访问日期：2026-08-30 | 可引用官方列出的 checkpoint 与大状态调优机制、适用条件和观察指标。 | 不得承诺固定吞吐、延迟、恢复时间或把某一调优项写成所有 state backend 与工作负载的最佳设置。 |
| 有状态服务恢复 | StatefulSet 提供哪些身份、顺序和存储编排能力？ | [Kubernetes StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) | Kubernetes Documentation；访问日期：2026-08-30 | 可引用 StatefulSet 为 Pod 提供稳定标识、稳定网络标识和稳定存储，以及其部署、扩缩与更新行为。 | 不得把控制器编排外推为应用层复制、数据一致性、自动故障恢复或业务 RPO/RTO 保证。 |
| 有状态服务恢复 | PersistentVolume 与 PersistentVolumeClaim 解决了什么边界？ | [Kubernetes Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) | Kubernetes Documentation；访问日期：2026-08-30 | 可引用 PV/PVC 的生命周期、绑定和存储资源抽象。 | 不得据此宣称卷本身保证数据库崩溃一致性、跨区域复制、备份、加密或任意存储后端的性能。 |
| 有状态服务恢复 | 为什么 StatefulSet Pod 的强制删除不是常规恢复手段？ | [Kubernetes force-delete StatefulSet Pod](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/) | Kubernetes Documentation；访问日期：2026-08-30 | 可引用强制删除的操作语义和官方风险警告，用于说明人工核验、隔离与应用层恢复的必要性。 | 不得把强制删除描述为安全的默认自愈操作，或据此推断应用数据不会损坏、不会出现双实例或已经完成业务恢复。 |

## 使用规则

1. 本表中的“允许支持的结论”是正文可使用的最大边界，不足以支持的主张必须补充相应官方一手资料。
2. “不允许外推”优先于通俗化表达；无法保留条件和边界时，删除该结论。
3. Kafka 4.2 版本性结论须引用具体官方子页和相应配置项；不得以目录入口代替复制、确认、KRaft 或故障恢复行为的证据。
