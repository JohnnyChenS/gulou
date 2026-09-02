---
id: system-architecture-stateful-recovery-01
stage: 06-cloud-native-sre
track: interests
domain: system-architecture
topic: 有状态服务恢复：编排、数据与一致性的边界
age_range: 18y+
difficulty: advanced
review_status: draft
references:
  - ../references/source-matrix.md
tags: [Kubernetes, StatefulSet, PersistentVolume, fencing, RPO, RTO, recovery]
learning_paths: [system-architecture]
related_prompts: [system-architecture-wal-01, system-architecture-replicated-log-01, system-architecture-checkpoint-replay-01]
---

# 有状态服务恢复：编排、数据与一致性的边界

## 学习目标

完成本单元后，你能把“Pod 又起来了”拆成四个必须分别验证的结果：控制器是否已把声明状态推进到当前状态、同一成员身份是否只由一个可写实例持有、PV/PVC 与应用数据是否处于可恢复状态、以及应用副本协议是否重新接受该成员。你还能为一次恢复演练分别记录 RPO 和 RTO 的证据，而不把 Kubernetes 的重建动作写成数据恢复或分布式一致性保证。

## 先修知识

- 已完成 [Page Cache、写入确认与持久化边界](../01-computer-systems/page-cache-and-durable-io.md)，能区分本地 I/O 完成与可称为 durable 的确认点。
- 已完成 [Write-Ahead Log：从提交确认到崩溃恢复](../04-data-systems/write-ahead-log.md)，理解日志恢复不等于独立备份。
- 已完成 [分区复制与提交边界](../03-distributed-systems/replicated-log.md) 与 [Checkpoint 与 Replay](../05-data-architecture/checkpoint-and-replay.md)，能区分副本提交、可重放输入、completed checkpoint 与下游结果。
- 熟悉 Kubernetes 的 Pod、Service、PVC 与基本告警；能读懂集群事件和应用日志。这里不要求把 Kubernetes API 当作 Kafka 或 Flink 的一致性协议。

## 问题场景

案例类型：模拟案例（假设：隔离演练集群中的 Kafka broker 或 Flink 状态服务成员以 StatefulSet 运行。节点 `node-a` 与控制面发生网络分区；其 `broker-0` Pod 长时间显示 `Unknown`，但没有证据证明节点断电或进程已停止。值班者为了尽快恢复容量，考虑对 `broker-0` 执行强制删除。该案例没有真实客户、流量或事故主张。）

此时最重要的问题不是“API 中的 Pod 是否还在”，而是：`node-a` 是真的死亡，还是仍在运行、只是不再向控制面报告？若旧进程仍持有同一成员身份、卷或写入权限，新 Pod 不能安全地假定自己是唯一实例。恢复必须证明最后 durable point、旧写入者的隔离、卷和副本状态、应用加入条件以及数据结果；仅看到新容器 Ready 不足以回答这些问题。

## 第一层：底层思想

**编排状态不是应用事实。** Kubernetes 控制器不断尝试让资源的当前状态趋近其期望状态；这是一条控制面 reconciliation 链路，而不是对节点上进程、磁盘内容或应用协议的全知观察。网络分区会使控制面无法可靠区分“节点已死”与“旧进程仍在运行但失联”。因此 desired/current state 只能用来陈述控制器看见并期望什么，不能直接推出旧实例不可能写入或数据已经恢复。

**身份必须是排他的，fencing 才能把“不确定”变成可操作边界。** StatefulSet 可为 Pod 提供稳定 ordinal、网络身份和与之关联的持久存储；例如 `broker-0` 的名字可重现。但稳定名字不等于唯一活实例。fencing 是在重建前使旧实例无法继续使用成员身份、卷或写入路径的外部证明与动作：例如确认节点已经断电/隔离，或由应用自己的 epoch、lease、quorum/leader 规则拒绝旧 epoch 的写入。哪种机制有效由目标存储和应用协议决定；Kubernetes 不自动为 Kafka、Flink 或任意状态服务提供正确 fencing。

**存储对象的生命周期与单个 Pod 独立。** PV 是集群中的存储资源，PVC 是工作负载对其提出并绑定的声明；Pod 退出或重建本身不等于数据已被备份、已一致或已复制。StatefulSet 的 `volumeClaimTemplates` 可以把每个 ordinal 关联到稳定存储，但实际卷的访问模式、attach/detach、reclaim policy、后端故障域和快照/备份能力仍需逐项核验。重挂载到新 Pod 只说明该新实例获得了某个卷；它不证明卷内 WAL、状态文件或 checkpoint 在所需故障模型下完整。

**RPO 与 RTO 属于应用恢复合同。** RPO 问“故障后允许回到哪个最后 durable point”；它可能是 Kafka 当前 ISR 已提交前缀、数据库可 REDO 的记录，或 Flink 最后一个 completed checkpoint 的 state 与 source position，取决于应用。RTO 问“从宣布故障到恢复出可接受服务需要多久”；它至少包含判定、fencing、调度、卷处理、应用恢复、追赶/replay、重新加入副本组和数据验证。较快删除 API 对象也许缩短其中一个控制面等待，却不能跳过任何所有权或数据验证步骤；故不能由此承诺固定 RPO/RTO。

## 第二层：组件设计落地

| 层或组件 | 适合承载的责任 | 明确不承诺的责任 | 恢复时必须观察的证据 |
|---|---|---|---|
| Deployment | 维持一组可替换的 Pod 副本，以期望数量和模板滚动更新无状态或可丢失本地状态的工作负载。 | 为每个副本给出稳定成员身份、把某个本地目录恢复成业务状态、应用复制或 leader/fencing。 | 当前/期望副本、Pod 事件、readiness；若有状态，另找数据所有者。 |
| StatefulSet | 为其 Pod 提供稳定 identity、稳定网络 identity、稳定存储关联以及有序部署、伸缩、更新语义。 | Kafka/Flink 副本协议、已提交日志前缀、leader 选举正确性、备份、自动应用恢复或业务 RPO/RTO。 | ordinal 与 PVC 对应关系、控制器/Pod 事件、实际 StatefulSet 策略及应用成员状态。 |
| PV/PVC | 把集群存储资源及其声明、绑定和生命周期与单个 Pod 分开建模。 | 卷内文件系统/数据库崩溃一致性、跨故障域复制、备份成功、恢复点可读或任意后端性能。 | PVC/PV 绑定、StorageClass/访问模式/reclaim policy、attach/mount 事件和目标后端健康。 |
| 应用级复制与恢复 | Kafka 的 partition 副本/ISR 与选主，Flink 的 checkpoint、source position、replay 与 sink 契约等应用语义。 | 由 Kubernetes 资源自动补齐的副本确认、端到端 exactly-once、旧实例已被 fenced 或灾难备份。 | 应用版本、成员/leader/epoch、最后 durable point、日志/状态恢复结果、replica lag、checkpoint 与数据校验。 |

**选择不是排行榜。** 对 worker、HTTP API 或可从不可变输入完全重建的计算，Deployment 的可替换副本模型通常更直接；如果组件自身必须把某个 ordinal、稳定地址或 PVC 对应到成员身份，StatefulSet 提供相应的编排原语。两者都只是 Pod 编排。是否需要 Kafka 的复制与选主、Flink checkpoint/replay、数据库 WAL/备份，取决于数据的状态模型和故障预算，不能由工作负载控制器名称决定。

**应用必须显式拥有恢复协议。** Kafka 的“哪个副本可接任、记录是否已提交”仍由 partition replication、ISR 和选主边界决定；Flink 的“从哪里恢复、哪些结果会重放”仍由 completed checkpoint、source position 与 sink 的 transactional/幂等契约决定。重新创建同名 Pod 并没有替这些协议确认 log 前缀、state snapshot 或外部副作用。反过来，应用已经有正确复制也不能取代对卷 attach、身份和旧实例隔离的核验。

**不使用场景。** 当服务不需要稳定成员身份和每个成员自己的稳定卷，或它的状态可安全地从外部、可验证的数据源重建时，不应为了“看起来更可靠”而把它迁到 StatefulSet；使用 Deployment 并把真正的数据合同放在外部系统。若需求包含跨地域灾难恢复、合规留存或特定 RPO，亦不应只依赖 PV/PVC 或运行 checkpoint；另立独立备份、复制、保留和定期还原演练的合同。

## 第三层：生产实践与真实案例

### 可核验风险案例：强制删除 StatefulSet Pod

Kubernetes 官方的 [Force Delete StatefulSet Pods](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/) 明确把强制删除描述为破坏 StatefulSet “at most one”语义的操作：控制面删除 Pod API 对象不会等待 kubelet 终止原 Pod；若旧节点或进程仍运行，可能出现同一 identity 的多个实例。对有状态应用，这正是可能导致 split brain、并发写入或数据损坏的前置条件，而不是默认自愈路径。组件版本：Kubernetes Documentation v1.37；官方页面；访问日期：2026-09-01。

因此，`kubectl delete pod broker-0 --force --grace-period=0` 不属于本单元的常规恢复步骤。它只能在以下条件已经有书面证据时，作为受控升级处置评估：负责节点已不可运行或已被隔离；旧实例不可能再持有写入能力；目标存储的 attach/access 约束已核对；并且应用负责人已说明新成员如何用 epoch、leader/quorum 或其他应用机制拒绝旧写入者。即使执行后，仍必须完成卷、日志/状态、副本组与数据验证，不能把命令成功当作恢复完成。

### 模拟复盘：`broker-0` 长时间 Unknown

案例类型：模拟案例（假设：`broker-0` 在 `node-a` 上运行；Kafka 或 Flink 状态服务有一个独立的应用副本组与持久卷；`node-a` 对控制面失联 20 分钟，业务进入写入降级。无权访问生产节点，且尚未取得节点断电、卷 detach 或旧进程退出的证据。）

**症状与判读。** 控制面中的 `Unknown` 说明观察链路失去可信状态，不能证明旧进程已死。先冻结会影响该成员的数据面操作或按应用协议降级，再从节点管理面、带外控制台、网络隔离记录、存储附件状态和应用成员/leader/epoch 收集时间线。若仍不能排除旧实例写入，停止在这一点：等待节点恢复或通过经过批准的隔离/fencing 流程消除该不确定性。为缩短告警时间而提前重建，会把“缺少观察”放大为“双写风险”。

**恢复演练检查表（必须按时间记录责任人与证据）。**

1. **确认节点状态：** 基础设施/SRE 确认 `node-a` 是断电、永久失效、已网络隔离，还是仍运行但仅与控制面失联；保留节点、kubelet、带外管理与网络证据。`Unknown` 不是“已死”的同义词。
2. **确认最后 durable point：** 应用负责人记录 Kafka 的可恢复提交前缀/副本状态，或 Flink 最后 completed checkpoint、source position 与状态工件；不要用 Pod 删除时间替代它。
3. **阻止旧实例重新写入：** 基础设施与应用共同完成 fencing，并验证旧节点、旧进程、旧身份/epoch 或旧写入路径已失效；这一步未完成时不得让替代成员承担写入。
4. **验证卷和副本：** 存储负责人核验 PV/PVC 绑定、访问模式、附件/挂载事件与后端健康；应用负责人核验日志、checkpoint 或副本前缀是否可读且满足加入条件。
5. **恢复服务：** 在上述证据齐备后，由 StatefulSet/调度器重建 Pod；应用按自己的日志恢复、state restore 或副本追赶协议启动，而不是以容器进程存在为完成标志。
6. **验证数据：** 以应用层记录、offset/checkpoint、校验和、幂等键或业务不变量核对恢复结果、重放和副本同步；比较可验证 RPO 与最后 durable point。
7. **解除降级：** 仅在替代成员已被应用副本组接受、数据验证通过、告警恢复到约定状态后，由业务/SRE 恢复写入或流量；记录仍保留的风险。
8. **记录时间：** 保存检测、节点判定、fencing 完成、Pod 创建、卷可用、应用恢复、加入副本组、数据验证和解除降级的时间，以分解实际 RTO，且记录实际 RPO 证据。

## 第四层：动手验证与架构判断

### 活动：在纸面时间线验证“重建不等于恢复”

- **环境：** 一张可删除的纸面/文本时间线；不连接 Kubernetes、Kafka、Flink、云卷或任何生产系统。设 `broker-0` 曾在 `node-a` 上运行，其 PVC 为 `data-broker-0`；设最后可证明的应用 durable point 为 `D42`。输入包括：Pod `Unknown`、节点隔离证据、PVC/PV 状态、应用 leader/epoch 记录和一个可验证数据校验结果。
- **步骤：**

  1. 画出 `t0` 到 `t9`，先在 `t1` 标记 `broker-0=Unknown`，并写下两条互斥假设：A“节点已死”、B“旧进程仍运行但与控制面失联”。在没有额外证据时，两条都保持为未决。
  2. 仅为假设 A 补入“基础设施负责人确认节点断电或完成网络隔离”的证据；为假设 B 写出结论“禁止重建可写成员”。再由应用负责人记录 `D42` 和旧 epoch，由存储负责人记录 PVC/PV 绑定及当前 attach 状态。
  3. 在旧实例已被 fenced 的前提下，画出下列时序，并在每一步旁写下所有者和它不能替代的下一步：

     ```text
     t3 StatefulSet controller：按 desired state 创建 broker-0 的 Pod 对象
        -> t4 scheduler：选择并绑定目标节点
        -> t5 存储控制面 + 节点侧 CSI：按实际 driver/后端处理卷 attach/mount，并以事件核验
        -> t6 目标节点 kubelet：在节点上启动 Pod 的 init/app 容器
        -> t7 应用进程：从本地日志、checkpoint 或副本同步执行恢复
        -> t8 应用副本协议：核验 epoch/leader/日志前缀后接纳成员
        -> t9 应用 + SRE：核对 D42、重放/副本和业务校验，再解除降级
     ```

  4. 分别让两名学习者扮演“只看到 t3 Pod 对象已创建的 SRE”和“拿到 t0–t9 证据的应用负责人”。前者只能声明控制器已创建对象，不能声称已调度、已挂卷、已启动、已恢复或已加入副本组；后者才可判断是否满足恢复条件。最后删除时间线和全部模拟记录。

- **预期观察：** `Unknown` 本身不能在 A/B 假设之间裁决；fencing 在 Pod 重建之前。t3 的 Pod 对象创建、t4 的调度绑定、t5 的卷 attach/mount、t6 的 kubelet 启动、t7 的应用日志/状态恢复、t8 的副本组接纳和 t9 的数据校验都有不同所有者；PV 重挂载不替代应用恢复，应用恢复也不替代副本组接纳和数据校验。
- **成功条件：** 时间线明确画出“Pod 重建 → 卷重新挂载 → 应用日志恢复 → 重新加入副本组”，每步标出所有者；写出 `D42` 作为最后 durable point；对“旧实例仍运行”的分支明确写出不重建可写成员；RTO 至少分解到 t1、t2（fencing）、t3（controller）、t4（scheduler）、t5（CSI/存储）、t6（kubelet）、t7（应用恢复）、t8（副本组）、t9（数据验证）。
- **清理方式：** 删除本活动创建的纸面/文本时间线和模拟 member/volume 记录。活动未创建集群、卷、Pod 或应用数据，因此不得运行任何删除命令。

该活动只检验恢复所有权和证据链的推理，不能验证 Kubernetes/CSI 的真实 attach 时延、Kafka/Flink 的协议实现、物理断电、网络隔离可靠性或生产 RPO/RTO。

### 架构判断题：何时才可考虑强制删除

某值班者说：“`broker-0` 已 Unknown 20 分钟，直接 force delete 就会让 StatefulSet 重新拉起并恢复数据。”请列出使该句不能成立的四类缺失证据：节点仍在运行/失联的判定、最后 durable point、旧写入者 fencing、卷与应用副本协议。然后设计一个升级决策：若任何一项缺失，保持写入降级并继续收集证据；若全部条件满足且团队批准强制删除，仍须按检查表完成恢复和数据验证。解释为什么这不是 Kubernetes 自动恢复应用数据或分布式一致性的证明。

## 常见误区与适用边界

- **误区：** StatefulSet 让 Pod 名字稳定，所以不会有双实例。**边界：** 稳定 identity 是编排能力；网络分区和错误的强制删除仍可能使旧进程与新 Pod 同时运行，必须有证据化 fencing。
- **误区：** PVC 还在，所以数据已经安全。**边界：** PVC/PV 表示声明、绑定和存储资源生命周期；卷内数据是否崩溃一致、已复制、可从所需点恢复，取决于后端和应用协议。
- **误区：** 新 Pod Ready 就表示 Kafka/Flink 已恢复。**边界：** Ready 只覆盖该 Pod 的就绪条件；日志/状态恢复、checkpoint/source position、replica lag、成员身份和数据结果仍要由应用验证。
- **误区：** force delete 是卡住 StatefulSet 的默认修复。**边界：** 官方明确警告它会破坏“at most one”语义；只在旧实例被证明不可再写、风险被批准并有应用恢复计划时才可受控评估。
- **误区：** 缩短 Pod 重建时间就降低 RPO。**边界：** RPO 由最后 durable point 和恢复合同定义；更快调度主要影响 RTO 的一部分，并不补回未持久化、未复制或不可重放的数据。

## 掌握度检查

1. **解释：** 为什么控制器将当前状态趋近 desired state，不能证明 `node-a` 上的旧 `broker-0` 已停止？分别说明 stable identity、fencing 和 PV/PVC 生命周期的边界。
2. **应用：** 在本单元的 `Unknown` 场景中，写出允许创建替代成员前必须记录的节点、durable point、fencing、卷和应用副本证据；将每一项分配给基础设施、存储、应用或 SRE 所有者。
3. **迁移：** 将“Pod 重建不等于应用恢复”迁移到 Flink：把 Kafka broker 的日志/副本前缀替换为 completed checkpoint、source position 和 sink 幂等/事务证据；哪些 Kubernetes 检查仍相同，哪些应用证据改变？
4. **不使用：** 一个无本地状态、可由不可变输入重算的批处理 worker，何时不应使用 StatefulSet + 每成员 PVC？说明使用 Deployment 和外部可验证数据源的替代方案，并指出若后来引入不可重放状态，需补上的恢复与 fencing 合同。

## 在综合项目中的应用

[进入日志、状态与恢复纵向切片综合评审](../capstone/log-state-recovery-review.md)，把 Kubernetes 编排、fencing、应用日志恢复和端到端数据校验放进同一 runbook。

### ADR：状态服务的恢复边界与演练准入

**状态：** 建议采用；仅在目标 Kubernetes 版本、存储后端、应用版本和隔离/fencing 机制均经演练验证后生效。

**上下文：** 推荐平台的状态服务可能以 StatefulSet 运行并使用每个成员的 PVC。把“StatefulSet 会重建 Pod”写成“系统已经恢复”会掩盖节点失联时的双身份、PV 重新挂载、Kafka/Flink 自身恢复以及数据验证责任。

**决策：** 将恢复分为四个受控层：控制器负责让 declared workload 接近 desired state；StatefulSet 负责稳定 ordinal、网络 identity 与 PVC 关联；存储团队负责 PV/PVC 生命周期与实际后端可用证据；应用团队负责 fencing、日志/状态恢复、replica membership、重放和数据语义。任何 `Unknown` 成员先进入写入降级和证据收集；不把强制删除列为 runbook 默认动作。只有在节点已失效/隔离、旧写入者已被阻止、最后 durable point 已记录、卷与应用恢复前提已验证，并由相应负责人批准后，才可评估受控重建或强制删除。

**后果：** 该决策可能延长某些不确定故障的写入降级，以避免把失联节点变成 split brain 或双写。它要求为每次演练记录节点判定、fencing、卷、最后 durable point、应用恢复、数据验证和 RPO/RTO 时间；也要求应用具备独立于 Kubernetes 的副本/恢复协议。它不承诺任意 PV 有备份、任意 StatefulSet 自动一致，或所有恢复达到固定时间。

**验证与回滚：** 在隔离、可丢弃的演练环境模拟节点失联，分别演练“已证实节点死亡”和“旧实例仍可能运行”两条路径。验收是：后者不创建第二个可写成员；前者的时间线完整覆盖 Pod、卷、应用恢复、成员接纳与数据校验；记录实际 RPO/RTO 并与目标预算比较。若无法证明 fencing、卷所有权、最后 durable point 或应用数据验证，停止解除降级或停止该恢复发布，回到只读/暂停/从已验证备份或副本恢复的流程，修复证据链后重新演练。

## 权威来源与延伸阅读

- [来源矩阵：Kubernetes controllers、StatefulSet、Persistent Volumes 与强制删除边界](../references/source-matrix.md)
- [Kubernetes Documentation v1.37：Controllers](https://kubernetes.io/docs/concepts/architecture/controller/)（官方页面；访问日期：2026-09-01）
- [Kubernetes Documentation v1.37：StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)（官方页面；访问日期：2026-09-01）
- [Kubernetes Documentation v1.37：Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)（官方页面；访问日期：2026-09-01）
- [Kubernetes Documentation v1.37：Force Delete StatefulSet Pods](https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/)（官方页面；访问日期：2026-09-01）
- [Kafka 4.2 的 partition 复制与提交边界](../03-distributed-systems/replicated-log.md)；[Flink checkpoint 与 replay 边界](../05-data-architecture/checkpoint-and-replay.md)
