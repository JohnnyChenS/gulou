# 系统架构图到课程内容覆盖矩阵

## 用途与边界

本文是作者与维护者使用的覆盖基线，不是学习者页面，也不会进入网站渲染。本文只记录概念架构图、十阶段阅读路线和现有正式单元之间的对应关系；课程正文是否新增、拆分或改序，需要另行决策。

本轮以课程总入口中的概念架构图为**权威覆盖分类**。现有 `00 → 01 → … → 09` 十阶段路线是教学实现细节：它可以把一个图块拆成多个阶段，也可以把两个图块合在一个阶段讲，但不能让图中的覆盖缺口消失。具体对应规则如下：

- **Phase 0（架构方法与基线诊断）**不是图中的独立领域块，而是所有图块共用的方法入口，负责质量属性、容量估算、状态/数据流、故障边界、ADR 和假设清单。
- **Network** 是十阶段路线中的独立 Phase 2；在图的覆盖分类中，它归入 `Computer Systems` 下的 `OS / Network`，为后续远程调用、部分失败和分布式语义提供前置知识。
- **Cloud Native / SRE** 在十阶段路线中合并为 Phase 6；在图的覆盖分类中拆成 `Cloud Native` 与 `SRE` 两行，分别检查 `Docker / K8s` 和 `Observability / Reliability / Capacity`，避免“一篇阶段提纲”被误当成两个领域都已有正式单元。
- **Recommendation Systems** 是十阶段路线中的独立 Phase 8；在图的覆盖分类中归入 `ML` 下的 `Recommender / Ranking`，并与 Phase 7 的 `Training` 一起检查从训练到在线反馈的闭环。

## 四层覆盖口径

每个图块都按同一顺序判断是否形成可教学、可复核的内容：**底层思想 → 组件设计落地 → 生产实践与真实案例 → 动手验证与架构判断**。阶段索引中的概述、组件例子和综合项目建议只算阶段提纲；只有独立 Markdown 学习页完整落实四层结构，才算正式单元。综合评审消费前序单元的证据，不是第六个领域理论单元。

状态只使用以下三个标签，不使用百分比：

- `已完成正式单元`：该图块至少有一个独立的四层正式单元；不表示图块全部讲完。
- `已有阶段提纲`：已有阶段索引和范围说明，但还没有该图块自己的四层正式单元。
- `尚未开始`：当前 Markdown 中还没有可对应的阶段提纲或正式单元。

## 当前状态摘要

矩阵共 7 个顶层图块：`已完成正式单元` 4 行，`已有阶段提纲` 3 行，`尚未开始` 0 行。当前有 5 个领域正式单元和 1 个 capstone 综合评审；Phase 0、Network 与 Recommendation Systems 的阶段索引分别作为跨图块方法或教学拆分记录，不计入这 6 个正式单元。

## 图块覆盖矩阵

| 顶层图块（保留图中标签） | 仍需解释的概念 | 当前 Markdown 覆盖 | 目标正式单元集合 | 代表性组件 | 生产案例形状 | 最小实验 / 证据产物 | 当前状态 | 下一项内容动作 |
|---|---|---|---|---|---|---|---|---|
| `Computer Systems`（`OS / Network`、`Concurrency`） | CPU 调度与并发、内存层级、系统调用与 IO；连接状态、超时、重试、尾延迟和背压之间的因果链仍需独立单元化 | Phase 1 [Computer Systems](../../interests/system-architecture/01-computer-systems/_index.md)；Phase 2 [Network](../../interests/system-architecture/02-network/_index.md) 是本图块中 `Network` 的教学拆分；已有 [Page Cache、写入确认与持久化边界](../../interests/system-architecture/01-computer-systems/page-cache-and-durable-io.md) | 已有：Page Cache、写入确认与持久化边界；待决：Concurrency 单元、Network 超时/重试/背压单元 | Linux、JVM、Netty、Nginx / Envoy、gRPC | 单机写入经过页缓存确认后拆出远程服务；下游变慢引发队列、重试放大和尾延迟 | 写入确认时间线及 `fsync`/批量对比；再补一份故障注入记录，能区分服务端变慢与网络丢失 | `已完成正式单元` | 先评审 Phase 2 的超时—重试—背压是否应成为下一正式单元，并锁定它与 Page Cache 单元共用的请求时间线和验收证据。 |
| `Distributed Systems`（`Consistency`、`Replication`） | 一致性模型、分区、复制、quorum、commit、election、fencing、重复与乱序的适用边界尚未形成完整单元组 | Phase 3 [Distributed Systems](../../interests/system-architecture/03-distributed-systems/_index.md)；已有 [Replicated Log：副本、提交与选主](../../interests/system-architecture/03-distributed-systems/replicated-log.md) | 已有：Replicated Log；待决：一致性模型与分区/再平衡单元 | Kafka、Raft 类复制组、ZooKeeper / etcd | 三副本日志在网络分区、leader 失联和重试时判断已提交前缀与未知结果 | 三 broker 故障时间线、`acks`/ISR 故障矩阵、选主与旧 leader fencing 证据 | `已完成正式单元` | 用现有 Replicated Log 单元做基线，列出它未覆盖的一致性模型与分区取舍，并决定下一单元是“Consistency”还是“Partition/Rebalancing”。 |
| `Data Systems`（`Storage / Compute`、`Stream / Batch`） | 存储布局、索引与查询执行，批处理/流处理的时间语义、状态、迟到数据、幂等 sink 和端到端正确性仍需扩展 | Phase 4 [Data Systems](../../interests/system-architecture/04-data-systems/_index.md) 与 Phase 5 [Data Architecture](../../interests/system-architecture/05-data-architecture/_index.md)；已有 [Write-Ahead Log](../../interests/system-architecture/04-data-systems/write-ahead-log.md) 和 [Checkpoint 与 Replay](../../interests/system-architecture/05-data-architecture/checkpoint-and-replay.md) | 已有：Write-Ahead Log、Checkpoint 与 Replay；待决：Storage / Compute 查询路径单元、Stream / Batch 正确性单元 | PostgreSQL、LSM/B-Tree 存储引擎、Kafka、Flink、对象存储 / 数仓 | 用户行为从事务写入进入事件流，经状态计算生成在线特征，并在崩溃后从可证明的起点恢复 | WAL LSN/checkpoint 恢复记录；barrier 切面、source position、operator state、replay 与 sink 校验 | `已完成正式单元` | 先画出现有两个正式单元覆盖的“事务恢复—流式恢复”边界，再选择查询执行或批流一致性中证据缺口更大的一个作为下一单元。 |
| `Cloud Native`（`Docker / K8s`） | 容器隔离、镜像与供应链、调度/调和、网络、稳定身份、卷、扩缩容，以及基础设施恢复与应用恢复的边界仍需系统化 | Phase 6 [Cloud Native / SRE](../../interests/system-architecture/06-cloud-native-sre/_index.md) 中的 Cloud Native 部分；已有 [有状态服务恢复](../../interests/system-architecture/06-cloud-native-sre/stateful-recovery.md) | 已有：有状态服务恢复；待决：容器隔离与 Kubernetes 调和单元 | Docker、Kubernetes Pod / Deployment / StatefulSet、Service / Ingress、PV / PVC | StatefulSet 成员失联后，编排器重建实例，但旧 writer、卷和应用日志的状态尚未收敛 | Pod/节点事件时间线、旧 writer fencing、卷与日志校验、实际 RPO/RTO 和清理确认 | `已完成正式单元` | 先检查“容器隔离—期望状态—调和”是否能以一个最小无状态案例补齐，再决定是否需要独立于有状态恢复的正式单元。 |
| `SRE`（`Observability`、`Reliability`、`Capacity`） | SLI/SLO/Error Budget、容量模型、告警质量、发布与回滚、事故响应和复盘尚无专属四层单元 | Phase 6 [Cloud Native / SRE](../../interests/system-architecture/06-cloud-native-sre/_index.md) 中已有 SRE 阶段提纲；有状态恢复正式单元提供恢复证据，但不等于 SRE 专属单元 | 待建：SLO / Error Budget 与容量门禁单元；待决：事故响应与发布回滚是否独立成单元 | OpenTelemetry、Prometheus、Grafana、Kubernetes rollout / rollback | 推荐服务流量增长、尾延迟恶化并消耗 Error Budget；团队按告警、降级、回滚和复盘闭环处置 | 可复算容量估算、SLI 查询与 SLO 表、告警 runbook、发布停止条件、事故时间线 | `已有阶段提纲` | 在扩写前先选择“SLO 与容量门禁”或“事故响应与回滚”作为首个 SRE 正式单元，并定义可重复的故障负载与通过条件。 |
| `ML`（`Recommender`、`Ranking`、`Training`） | 数据/特征/标签时序、切分与泄漏、训练/服务一致性、漂移；召回、排序、重排、冷启动、反馈回路和实验偏差均待正式单元化 | Phase 7 [ML Systems](../../interests/system-architecture/07-ml-systems/_index.md) 覆盖 `Training`；Phase 8 [Recommendation Systems](../../interests/system-architecture/08-recommendation-systems/_index.md) 是 `Recommender / Ranking` 的教学拆分；当前均为阶段提纲 | 待建：训练数据与泄漏单元、模型发布/漂移单元、召回—排序—重排单元、反馈与实验偏差单元 | Feature Store、Model Registry、Model Serving、向量检索 / 双塔、排序与重排服务、实验平台 | 同一推荐请求从候选生成到排序/重排，再把曝光和行为回流训练；新模型离线变好但线上分布与长期指标变化 | 特征/标签可用时间与版本映射、泄漏检查、线上链路时间线、预注册 A/B 记录、漂移与回滚证据 | `已有阶段提纲` | 先决定首个 ML 正式单元从“训练数据边界”还是“在线推荐链路”切入，并要求它显式交接 Phase 8 的反馈与实验证据。 |
| `AI/Agent`（`LLM`、`RAG`、`Agent`） | Token/Context、Embedding/检索/RAG 证据链、Workflow/State Machine、Agent Loop、评估与护栏、工具最小权限和外部副作用恢复均待正式单元化 | Phase 9 [AI Engineering](../../interests/system-architecture/09-ai-engineering/_index.md) 已有阶段提纲，无独立正式单元 | 待建：RAG 证据与引用单元、Workflow / State Machine 单元、Agent 工具权限与评估单元 | 模型 API、Embedding 模型、向量索引、工作流编排器、工具网关、评估集与追踪系统 | 推荐平台增加带引用的内容解释或运营助手；恶意检索内容诱导越权工具调用，系统必须拒绝、升级或停止 | 版本化评估结果、检索/引用追踪、Prompt Injection 回放、权限矩阵、审批点、步数/时间/成本预算与回滚记录 | `已有阶段提纲` | 先锁定一个有明确用户价值且无生产写权限的能力，再在 RAG 证据链与 Agent 权限门禁之间选择首个正式单元。 |

## 六个现有正式单元

以下清单用于区分“已有独立四层正文”和“只有阶段索引”。前五项是领域正式单元，第六项是消费它们证据的 capstone 综合评审：

1. [Page Cache、写入确认与持久化边界](../../interests/system-architecture/01-computer-systems/page-cache-and-durable-io.md)
2. [Write-Ahead Log：从提交确认到崩溃恢复](../../interests/system-architecture/04-data-systems/write-ahead-log.md)
3. [Replicated Log：副本、提交与选主](../../interests/system-architecture/03-distributed-systems/replicated-log.md)
4. [Checkpoint 与 Replay：有状态流作业的恢复边界](../../interests/system-architecture/05-data-architecture/checkpoint-and-replay.md)
5. [有状态服务恢复：编排、数据与一致性的边界](../../interests/system-architecture/06-cloud-native-sre/stateful-recovery.md)
6. [日志、状态与恢复纵向切片综合评审](../../interests/system-architecture/capstone/log-state-recovery-review.md)

[真实学习者验证协议](../../interests/system-architecture/capstone/validation-protocol.md)是验证证据文档，不计入上述六个正式单元。

## 暂不扩写正文门禁

在下列条件满足前，**不要扩写学习者正文**：

1. 维护者确认图中 7 个顶层块及其原始标签仍是下一轮的权威覆盖分类。
2. 为下一正式单元选定且只选定一个图块缺口，写清受众问题、先修证据、四层产物和不包含范围。
3. 确认该单元复用现有 AI 内容推荐平台案例与“日志—状态—恢复”证据链的位置，不另起一套无法串联的案例。
4. 预先定义最小实验、可观察指标、失败条件、清理步骤和独立评审方式。

## 恢复内容扩展前的下一项决策

下一次作者评审需要决定：**七个图块中，哪个未正式单元化的关键缺口最先阻碍端到端架构判断，并因此成为唯一的下一正式单元？** 候选应从矩阵“下一项内容动作”中选择，并以现有六单元证据链的可复用程度、生产故障风险和最小实验可行性排序。作出这一决定并记录单元验收契约后，才恢复正文扩写；在此之前只维护矩阵与事实一致性。
