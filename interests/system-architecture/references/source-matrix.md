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
| 持久化写入的确认边界 | 应用的 `fsyncSync` 调用在 Node.js 中表达什么？ | [Node.js File system API](https://nodejs.org/api/fs.html#fsfsyncsyncfd) | Node.js v26.8.1；访问日期：2026-08-30 | `fs.fsyncSync(fd)` 请求将打开文件描述符的数据刷新到存储设备；其具体实现取决于操作系统和设备。 | 不得据此承诺任一硬件的掉电保持、文件系统崩溃一致性、固定延迟或业务端到端耐久。 |
| 持久化写入的确认边界 | Java 文件通道的 `force` 有何确认边界？ | [Java SE 25 FileChannel](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/channels/FileChannel.html#force(boolean)) | Java SE 25；访问日期：2026-08-30 | `FileChannel.force(boolean)` 请求把该通道对文件作出的更新写入所在存储设备；本地设备与非本地设备、元数据参数及映射缓冲区具有不同条件和边界。 | 不得把该 API 的返回外推为远程存储、设备缓存、电源故障、复制副本或业务协议的保证。 |
| WAL 与本地恢复 | 为什么先写日志能支持崩溃后的恢复？ | [PostgreSQL 18 WAL introduction](https://www.postgresql.org/docs/current/wal-intro.html) | PostgreSQL 18；访问日期：2026-08-30 | PostgreSQL WAL 要求数据文件变更先有相应 WAL 记录持久化；借助 WAL 可在崩溃后 REDO 未落到数据页的变更。 | 不得把 PostgreSQL 的事务、复制、备份或文件系统建议泛化为其他数据库、消息系统或任意硬件的保证。 |
| 分区复制与提交边界 | Kafka 4.2 的设计资料应如何定位具体行为？ | [Apache Kafka 4.2 Design](https://kafka.apache.org/42/design/) | Apache Kafka 4.2；访问日期：2026-08-30 | 此页仅作为 Kafka 4.2 Design 目录入口，用于定位官方设计子页。 | 不得从目录入口推导具体复制、提交、KRaft 或故障恢复行为；若 4.2 页面中具体段落不可读取，正文必须退回 Kafka 官方当前版本的具体子页，且不得用旧版本行为冒充当前行为。 |
| 分区复制与提交边界 | topic 配置能表达哪些副本与写入约束？ | [Apache Kafka 4.2 topic configuration](https://kafka.apache.org/42/configuration/topic-configs/) | Apache Kafka 4.2；访问日期：2026-08-30 | 可按该版本页面逐项引用 topic 配置名称、定义、类型、默认值和有效值。 | 不得脱离具体配置、broker、producer、consumer 与故障条件，宣称任何 topic 配置单独保证一致性、零数据丢失或端到端 exactly-once。 |
| 流处理 checkpoint 与恢复 | checkpoint 如何参与有状态流作业的容错？ | [Apache Flink stable Fault Tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/) | Apache Flink stable documentation；访问日期：2026-08-30 | 可引用 Flink 容错、state snapshot、恢复与端到端语义所需条件的官方说明。 | 不得把 Flink 的语义写成与 source、sink、外部系统和部署配置无关的物理 exactly-once 保证。 |
| 流处理 checkpoint 与恢复 | 大状态 checkpoint 的调优应观察什么？ | [Apache Flink stable large-state checkpoint tuning](https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/large_state_tuning/) | Apache Flink stable documentation；访问日期：2026-08-30 | 可引用官方列出的 checkpoint 与大状态调优机制、适用条件和观察指标。 | 不得承诺固定吞吐、延迟、恢复时间或把某一调优项写成所有 state backend 与工作负载的最佳设置。 |
| 有状态服务恢复 | StatefulSet 提供哪些身份、顺序和存储编排能力？ | [Kubernetes StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) | Kubernetes Documentation；访问日期：2026-08-30 | 可引用 StatefulSet 为 Pod 提供稳定标识、稳定网络标识和稳定存储，以及其部署、扩缩与更新行为。 | 不得把控制器编排外推为应用层复制、数据一致性、自动故障恢复或业务 RPO/RTO 保证。 |
| 有状态服务恢复 | PersistentVolume 与 PersistentVolumeClaim 解决了什么边界？ | [Kubernetes Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) | Kubernetes Documentation；访问日期：2026-08-30 | 可引用 PV/PVC 的生命周期、绑定和存储资源抽象。 | 不得据此宣称卷本身保证数据库崩溃一致性、跨区域复制、备份、加密或任意存储后端的性能。 |
| 有状态服务恢复 | 为什么 StatefulSet Pod 的强制删除不是常规恢复手段？ | [Kubernetes force-delete StatefulSet Pod](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/) | Kubernetes Documentation；访问日期：2026-08-30 | 可引用强制删除的操作语义和官方风险警告，用于说明人工核验、隔离与应用层恢复的必要性。 | 不得把强制删除描述为安全的默认自愈操作，或据此推断应用数据不会损坏、不会出现双实例或已经完成业务恢复。 |

## 使用规则

1. 本表中的“允许支持的结论”是正文可使用的最大边界，不足以支持的主张必须补充相应官方一手资料。
2. “不允许外推”优先于通俗化表达；无法保留条件和边界时，删除该结论。
3. Kafka 4.2 Design 仅保留目录入口：正文先核实具体段落；不可读取时退回 Kafka 官方当前版本的具体子页，并显式标注版本差异。
