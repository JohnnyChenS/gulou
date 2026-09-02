# 系统架构学习路径设计

**状态**：已确认设计，待实施计划

**日期**：2026-08-30

**适用仓库**：`gulou-core`

## 1. 背景

本设计源自一次关于 Vibe Coding 时代工程师能力演进的讨论。讨论的核心判断是：
AI 会持续降低语法记忆和常规代码生成的稀缺性，但不会替代工程师对运行时行为、系统故障、
数据正确性、容量、成本和架构权衡的判断。资深工程师需要从“会使用很多组件”进一步成长为
“能用统一的系统理论解释组件、评审方案并推动系统演进”。

`gulou-core/interests/` 已用于承载跨人生阶段、从入门到高阶的纵向兴趣路径。系统架构学习
适合作为一条新的成人专业兴趣路径进入公开知识库，但它不属于当前 `gulou-agent` 的育儿
MVP 知识范围。

原始讨论提供了实用的宏观顺序：

```text
Computer Systems
→ Network
→ Distributed Systems
→ Data Systems
→ Data Architecture
→ Cloud Native / SRE
→ ML Systems
→ Recommendation Systems
→ AI Engineering
```

本设计将这条顺序课程化，并把每个具体知识点统一写成“底层思想、组件设计落地、生产实践、
动手验证与架构判断”四层内容。

## 2. 目标读者

第一版只服务于已有多年开发经验的工程师，默认读者：

- 有五年左右或更长的软件开发经验；
- 熟悉至少一种主力编程语言，第一批内容可优先照顾 Java/Web 背景；
- 使用过关系数据库、缓存、消息队列或搜索等常见基础设施；
- 能阅读和修改代码，不需要从变量、循环和基础 Web API 重新学习；
- 已接触若干中间件，但知识较零散，希望形成统一的系统认知；
- 希望能验证 AI 生成的代码和架构，而不是把 AI 输出直接当结论。

第一版稳定并由真实学习者验证后，再另行设计面向青少年或零基础学习者的先修课程。本设计
不提前兼容零基础教材，以免同时服务两类基础差异过大的读者。

## 3. 学习成果

完成核心路径后，学习者应同时具备两类能力：

1. **架构评审能力**：能审查 AI 或他人给出的架构，识别状态、故障、一致性、容量、成本、
   安全和可观测性方面的风险，并指出证据不足的假设。
2. **系统落地能力**：能从需求和约束出发，设计、估算、实现、压测、观察并逐步演进一个
   中大型系统。

课程不以架构师面试题、认证或组件配置记忆为主要目标。相关内容可以作为自检材料，但不能
主导知识组织。

## 4. 课程边界

### 4.1 课程要做的事

- 用少量稳定的底层模型连接读者已有的组件经验；
- 解释组件为什么这样设计、解决了什么问题、付出了什么代价；
- 使用可核验的生产案例说明设计在真实环境中如何失效和演进；
- 让学习者通过实验、容量估算、故障注入和方案评审验证理解；
- 以 AI 内容推荐平台为贯穿项目，让九个主题阶段在同一系统中发生联系；
- 建立清楚的先修关系、阶段挑战和掌握标准；
- 保持内容可公开阅读、可独立复用，不依赖私有 `gulou-agent` 逻辑。

### 4.2 课程不做的事

- 不编写一套从零开始的编程语言、数学或计算机本科教材；
- 不把所有组件的安装、命令和配置项都收入正文；
- 不按产品清单组织课程，不追求覆盖市场上所有数据库、中间件和框架；
- 不要求学习者成为操作系统内核、共识算法或机器学习理论研究者；
- 不把 ML、推荐和 Agent 写成与系统工程脱节的算法大全；
- 不把综合项目变成一个需要长期维护的生产级开源产品；
- 不为面试、证书或岗位晋升承诺结果；
- 不修改 `gulou-agent/config/knowledge-sources.yaml`，也不为本路径添加当前 MVP 的
  `agent_use` 选择；
- 不手工修改 `website/site/`、`word/docx/` 等生成目录。

## 5. 核心教学模型

### 5.1 宏观主线与微观四层

九个主题阶段构成宏观知识依赖；阶段 0 负责基线诊断，阶段 10 负责综合评审。四层内容结构
用于编写主题阶段内的每个具体知识点：

```text
宏观：阶段 → 单元 → 知识点
微观：底层思想 → 组件设计落地 → 生产实践 → 动手验证与架构判断
```

四层定义如下：

1. **底层思想**：解释问题的本质、核心模型、成立条件和关键权衡。
2. **组件设计落地**：比较常用组件如何实现同一思想，以及不同实现为什么不同。
3. **生产实践与真实案例**：说明实际架构选择、性能瓶颈、故障模式、排查证据和演进方案。
4. **动手验证与架构判断**：通过实验、估算、故障注入、方案设计和 AI 输出评审证明掌握。

“底层”不等于从晶体管开始完整重学计算机科学。第一版优先覆盖能解释架构行为的底层模型：

- 状态；
- 时间与顺序；
- 并发；
- 网络与部分失败；
- 分区与复制；
- 一致性；
- 流量、排队与背压；
- 存储与索引；
- 故障恢复；
- 可观测性；
- 容量、成本与权衡。

硬件、操作系统、语言运行时和网络细节只在能够解释上述问题时深入。

### 5.2 双螺旋学习

课程采用“双螺旋学习、体系化存储”：

- **知识螺旋**：概念 → 原理 → 组件比较 → 生产案例 → 阶段挑战；
- **项目螺旋**：需求 → 估算 → 设计 → 实现 → 压测 → 故障注入 → 演进。

知识库按稳定的阶段、单元和知识点组织，学习过程则让同一个综合项目随阶段不断增长。项目
用于验证知识，不决定知识库的分类，也不能把正文绑死在某一种技术栈上。

### 5.3 掌握标准

每个知识点和单元都应区分四个掌握层级：

| 层级 | 可观察表现 |
|---|---|
| 识别 | 能识别术语、适用问题和典型误用，但仍需要提示。 |
| 解释 | 能用自己的话解释运行机制、边界和主要权衡。 |
| 应用 | 能在实验或项目中正确使用，并用指标验证结果。 |
| 掌握 | 能处理新的约束和故障，比较方案，评审 AI 输出并说明不使用某方案的理由。 |

阅读完成不等于掌握。达到“掌握”至少需要一次不照搬正文答案的综合判断任务。

## 6. 十二个月课程结构

第一版按每周 6–8 小时设计。一个学习年度包含 48 个内容周和 4 个复习、补课或中断缓冲周。
周数是课程容量约束，不是向所有学习者承诺的固定完成时间。

### 阶段 0：架构方法与基线诊断（2 周）

建立贯穿全课程的分析框架：

- 需求、约束和质量属性；
- 状态、数据流和故障边界；
- 延迟、吞吐量、可用性、正确性和成本；
- Back-of-the-envelope 容量估算；
- 架构决策记录、架构图和假设清单；
- AI 方案评审方法；
- 初始能力诊断。

项目产出：AI 内容推荐平台的单体版需求、容量假设和第一次架构评审。

### 阶段 1：Computer Systems（5 周）

核心内容：

- 进程、线程、调度和上下文切换；
- 用户态、内核态和系统调用；
- 虚拟内存、Page、Page Fault、Swap 和 Page Cache；
- 文件描述符、Socket、顺序 IO 和随机 IO；
- Buffer、mmap、零拷贝和批处理；
- CPU Cache、局部性和基础性能模型；
- 锁、CAS、内存可见性、线程池和队列；
- 阻塞、非阻塞和异步 IO；
- JVM、GC、JIT 和 Profiling 的架构相关部分。

组件映射：Linux、JVM、Netty、Kafka 和数据库存储引擎。

项目演进：建立单机服务，观察线程、内存、IO、GC 和性能瓶颈。

### 阶段 2：Network（4 周）

核心内容：

- 网络分层、IP、TCP 和 UDP；
- 连接状态、丢包、重传、拥塞和部分失败；
- DNS、HTTP/1.1、HTTP/2、HTTP/3 和 TLS；
- 长连接、连接池、序列化和 RPC；
- L4 与 L7 负载均衡；
- Timeout、Retry、Circuit Breaker、Rate Limit；
- 延迟、带宽、吞吐量和 Tail Latency；
- 网络分区如何改变系统语义。

组件映射：Nginx、Envoy、Netty、gRPC、服务网关和 Service Mesh。

项目演进：拆出第一个远程服务，加入超时、重试、连接池、限流和故障观测。

### 阶段 3：Distributed Systems（8 周）

核心内容：

- 分布式时间、状态和故障模型；
- Partition、Sharding、Hash、Range 和 Consistent Hashing；
- Hot Partition、Data Skew 和 Rebalance；
- Replication、Leader、Follower、Quorum 和 Failover；
- Split Brain 和 Fencing；
- Strong、Eventual、Read-after-write 和 Linearizable Consistency；
- CAP、PACELC 及其适用边界；
- Consensus、Raft、Paxos、Term、Log Replication 和 Leader Election；
- Logical Clock、Ordering 和因果关系；
- Idempotency、Deduplication、Retry 和 Timeout；
- At-most-once、At-least-once 和 Exactly-once；
- 分布式事务、Saga 和 Transactional Outbox；
- Backpressure、故障恢复和状态重建。

组件映射：Kafka、etcd、ZooKeeper、Redis Cluster、MySQL 集群和分布式数据库。

项目演进：引入事件总线、分区、副本、消息语义、幂等处理和故障恢复。

### 阶段 4：Data Systems（5 周）

核心内容：

- OLTP 与 OLAP；
- Row Store 与 Column Store；
- B+ Tree、LSM Tree、WAL 和 MVCC；
- Buffer Pool、Index、Query Planner 和 Execution Engine；
- Compression、Compaction 和 Write Amplification；
- Vectorized Execution；
- Partition、Shard 和 Replica；
- 倒排索引、全文检索和分布式存储；
- 一致性、耐久性、查询延迟和写入吞吐的权衡。

组件映射：MySQL、PostgreSQL、Redis、RocksDB、HBase、Cassandra、Lucene、
Elasticsearch、ClickHouse 和 Doris。组件列表用于比较，不要求逐一部署和精通。

项目演进：为事务、缓存、搜索、分析和特征场景选择不同存储，并用数据与访问模式说明理由。

### 阶段 5：Data Architecture（5 周）

核心内容：

- 从数据源到消费端的数据生命周期；
- Event、CDC、Schema 和数据契约；
- Batch、Stream、ETL 和 ELT；
- Event Time、Processing Time、Window、Watermark 和 Late Event；
- Stateful Processing、Checkpoint 和恢复；
- Exactly-once 的系统边界；
- 数据湖、数据仓库和 Lakehouse；
- Lambda 与 Kappa Architecture；
- 实时数仓、特征管道和 Serving Layer；
- 数据质量、血缘、重放和 Schema 演进。

组件映射：Kafka、Flink、Spark、Iceberg、ClickHouse 和 Doris。

项目演进：建立用户事件采集、实时计算、分析查询和训练数据链路。

### 阶段 6：Cloud Native、SRE 与 Observability（6 周）

核心内容：

- Container、Namespace、cgroup、容器网络和存储；
- Kubernetes 控制面、Pod、Deployment、StatefulSet、Service 和 Ingress；
- Scheduler、Controller、Desired State 和 Reconciliation；
- Operator 与 Service Mesh；
- Logs、Metrics、Tracing 和 OpenTelemetry；
- Prometheus、Grafana、RED 和 USE；
- SLI、SLO、SLA 和 Error Budget；
- RPO、RTO、备份和恢复演练；
- 容量规划、自动扩缩容和资源隔离；
- 灰度发布、回滚、混沌工程、事故响应和复盘；
- 云资源成本和效率。

项目演进：容器化并部署系统，建立指标、追踪、SLO、告警、发布和容量模型。

### 阶段 7：ML Systems（4 周）

核心内容：

- 架构师需要的线性代数、概率和统计基础；
- 特征、标签、训练、推理和数据泄漏；
- Loss、Gradient、Embedding 的基本含义；
- 训练集、验证集、测试集和 Offline Evaluation；
- Online Evaluation、数据漂移和概念漂移；
- Feature Store、Model Registry 和 Model Serving；
- Batch 与 Online Inference；
- 模型版本、发布、监控、回滚、GPU 和成本。

本阶段研究 ML 系统，不扩展成通用机器学习算法课程。

项目演进：建立最小特征、训练、模型服务、版本和监控链路。

### 阶段 8：Recommendation Systems（4 周）

核心内容：

- Candidate Generation、Retrieval、Ranking 和 Re-ranking；
- Collaborative Filtering 和 Content-based Recommendation；
- Matrix Factorization、Embedding、ANN 和 Vector Search；
- Two-tower Model 和基础 CTR 预估；
- 多目标排序、冷启动和实时特征；
- 在线推荐服务、缓存、降级和容量；
- A/B Testing、反馈回路和评估偏差。

项目演进：完成召回、排序、重排、在线服务和实验闭环。

### 阶段 9：AI Engineering（4 周）

核心内容：

- Token、Context Window 和 Structured Output；
- Embedding、Vector Search 和 RAG；
- Tool Calling、Workflow、State Machine 和 Agent Loop；
- Memory、Planning 和状态持久化；
- Evaluation、Guardrails 和回归测试；
- Prompt Injection、权限、工具隔离和数据边界；
- Replay、Observability、模型升级和降级；
- 无限循环、工具失败、延迟、Token 成本和容量。

本阶段必须明确 Workflow 与 Agent 的边界，不以框架 API 作为知识主线。

项目演进：增加内容理解、RAG、工具调用或 Agent 能力，并建立评估、安全、观测和成本控制。

### 阶段 10：综合架构评审（1 周）

学习者提交项目最终架构、容量估算、SLO、故障模型、数据正确性说明、成本估算和演进路线，
并评审一份带有刻意缺陷的 AI 架构方案。四个缓冲周中的至少一个应安排中期综合复盘。

## 7. 跨阶段约束

以下主题不能只放在某一个后期阶段，应随项目反复出现，再在对应阶段系统总结：

- 安全、权限、隐私和供应链风险；
- 可观测性与证据驱动排障；
- 容量估算、Tail Latency 和成本；
- 数据正确性、幂等、重复、乱序和恢复；
- Failure Mode、降级、回滚和演练；
- 测试、发布和变更风险；
- 需求、质量属性、权衡和 ADR；
- AI 输出的事实核验、假设审计和边界判断。

每个阶段结束时，学习者都必须重新回答：

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

## 8. 知识单元统一结构

具体知识点文章默认使用以下结构，允许合并过短的小节，但不得省略四层教学职责：

```markdown
# 知识点名称

## 学习目标
## 先修知识
## 问题场景

## 第一层：底层思想
## 第二层：组件设计落地
## 第三层：生产实践与真实案例
## 第四层：动手验证与架构判断

## 常见误区与适用边界
## 掌握度检查
## 在综合项目中的应用
## 权威来源与延伸阅读
```

### 8.1 底层思想要求

- 先说明问题，再引入术语；
- 明确模型成立的前提和不适用范围；
- 使用最小必要的公式、时序图或数据结构；
- 不以“某组件性能很好”代替机制解释；
- 不从单一组件的行为错误归纳成通用原理。

### 8.2 组件设计落地要求

- 每个重要思想优先比较两种或更多实现；
- 说明组件选择了什么权衡，不写成产品优劣排行榜；
- 区分稳定设计原理、特定版本实现和可变配置；
- 涉及版本行为时引用对应版本的官方文档或源码；
- 不要求所有列举组件都进入综合项目。

### 8.3 生产实践与案例要求

- 案例必须来自可公开核验的事故报告、工程文章、论文或明确标注的模拟场景；
- 不编造公司、流量、事故原因或“业内最佳实践”；
- 案例至少说明现象、证据、原因、处置和预防；
- 区分直接证据、作者推断和事后假设；
- 对仍有争议的结论保留不确定性。

### 8.4 动手验证与架构判断要求

每个知识点至少提供下列一种活动，关键单元应组合多种活动：

- 最小可复现实验；
- 指标观察或 Profiling；
- 容量和成本估算；
- 故障注入或恢复演练；
- 两种方案的 Trade-off 评审；
- AI 生成方案的缺陷识别；
- 将结论应用到综合项目并记录 ADR。

实验必须说明预期观察、成功条件、清理方式和环境限制，不能只给命令清单。

## 9. 综合项目：AI 内容推荐平台

综合项目用于把九个主题阶段连接起来，其概念架构为：

```text
Web / App
    │
API Gateway
    ├── User / Content Services
    └── Recommendation Service
            ├── Recall
            ├── Ranking
            └── Re-ranking

User Events → Kafka → Flink ─┬→ Online Features / Redis
                             ├→ Search / Vector Retrieval
                             ├→ ClickHouse Analytics
                             └→ Data Lake → Training → Model Serving

Runtime → Kubernetes → OpenTelemetry → Metrics / Logs / Traces
AI Layer → RAG / Tools / Workflow or Agent → Evaluation / Guardrails
```

项目约束：

- 从单机、低流量假设开始，按阶段逐步增加复杂度；
- 每次引入组件前先写问题、约束、替代方案和退出条件；
- 依次讨论 1k、10k、100k 和 1M QPS，不要求真的部署同等规模资源；
- 用测量或明确假设进行容量推演，不伪造生产规模测试结果；
- 允许使用轻量替代实现验证思想，不能因部署全套组件拖垮学习；
- 项目代码、实验和课程正文保持边界；第一轮可以只落课程设计和可复现实验规范；
- 不使用真实用户隐私数据或未授权的生产数据。

## 10. 信息架构

新兴趣路径建议放在：

```text
interests/system-architecture/
├── _index.md
├── 00-architecture-method/
├── 01-computer-systems/
├── 02-network/
├── 03-distributed-systems/
├── 04-data-systems/
├── 05-data-architecture/
├── 06-cloud-native-sre/
├── 07-ml-systems/
├── 08-recommendation-systems/
├── 09-ai-engineering/
├── capstone/
└── references/
```

具体实施时，每个阶段先创建 `_index.md` 和单元地图，再决定知识点文件粒度。不要预先为大纲中的
每个术语各建一个空文件。单篇文章应围绕一个可以独立学习、练习和验收的问题组织，而不是按
术语字典机械拆分。

根目录 `interests/_index.md` 增加本兴趣入口。适合成人职业发展的阶段索引可以添加导航链接，
但第一轮不扩写这些人生阶段的职业正文。

## 11. 内容来源与版权边界

- 原始 ChatGPT 对话只作为课程结构种子，不作为事实来源或引用来源；
- 借鉴 Khan Academy 的课程、单元、技能、练习和掌握度组织方式，不复制其正文、视频、题目或
  受限制的课程材料；
- 所有正文和练习重新研究、独立编写并提供来源；
- 优先使用官方文档、公开源码、标准、论文、大学公开课程、公开事故报告和公认专业书籍；
- 引用资料前核对许可、可访问性、版本和发布日期；
- 对可能变化的产品行为记录版本或查询日期；
- 课程可以链接外部资料，但必须保留自身完整的学习目标、解释、活动和掌握标准。

## 12. 内容质量门槛

每个正式知识单元至少满足：

1. 有明确问题、学习目标和先修关系；
2. 四层内容完整，或在索引中明确链接到承担该层职责的材料；
3. 至少比较两个实现或说明为什么只有一个实现适用；
4. 至少包含一个失败模式和一个“不该使用”的场景；
5. 至少包含一个可以观察结果的学习活动；
6. 掌握度问题不能仅靠从正文复制句子回答；
7. 关键事实有可追溯来源，版本相关事实有版本边界；
8. 生产案例可核验，模拟案例有清楚标记；
9. 不以产品宣传、面试口诀或配置清单替代系统解释；
10. 中文表达具体、克制，不用夸张承诺制造学习焦虑。

## 13. 分批实施原则

课程体量较大，实施必须逐批验证，不能一次性生成全部正文：

1. 先建立课程总索引、阶段地图、统一模板、掌握标准和综合项目约束；
2. 选择一个代表性纵向切片，验证四层结构和构建流程；
3. 优先完成 Computer Systems、Network 和 Distributed Systems 主干；
4. 再完成 Data Systems、Data Architecture 和 Cloud Native/SRE；
5. 最后完成 ML Systems、Recommendation Systems 和 AI Engineering；
6. 每一批都由目标读者实际学习、完成活动并反馈，再扩充下一批；
7. 发现范围、顺序或模板需要变化时，先更新本设计或实施计划，不在正文中静默漂移。

代表性纵向切片建议围绕“日志、状态与恢复”展开，因为它能连接：

- 操作系统的文件、Page Cache 和 IO；
- 数据库的 WAL；
- Kafka 的追加日志、分区和副本；
- Flink 的状态与 Checkpoint；
- Kubernetes 中有状态工作负载和恢复；
- 推荐与 AI 流水线中的事件重放和版本回滚。

具体切片仍需在实施计划中拆分和估算。

## 14. 验收标准

设计和后续实施必须满足：

1. 总入口清楚标明目标读者、先修条件、学习成果、九个主题阶段及前后评审阶段的顺序，以及
   十二个月投入假设；
2. 九个主题阶段职责无重复或断层，Data Systems 与 Data Architecture、ML Systems 与算法课程的
   边界清楚；
3. 每个阶段都有知识目标、组件映射、项目演进和阶段挑战；
4. 四层结构在实际样例中可执行，不只是四个空标题；
5. 综合项目随阶段演进，但知识正文不依赖某一个具体框架或部署环境；
6. 安全、可观测性、容量、成本、故障恢复和 AI 评审作为跨阶段主题反复出现；
7. 所有生产案例可核验，所有模拟案例明确标注；
8. Khan Academy 和其他外部材料只按许可引用或链接，不复制受限制内容；
9. 新内容不进入 `gulou-agent` 当前 MVP 知识清单；
10. 内部链接、frontmatter、站点构建和现有仓库检查通过；
11. 至少一名符合目标画像的学习者完成代表性切片，并记录理解、耗时、实验可行性和缺口；
12. 未经设计或计划显式变更，不增加零基础教材、认证训练或无关技术栈。

## 15. 后续流程

本设计经文件审阅确认后，下一步编写分阶段实施计划。实施计划至少需要：

- 列出第一批实际创建和修改的文件；
- 定义课程元数据和知识单元模板；
- 选择并拆解代表性纵向切片；
- 为每个批次定义来源研究、正文、实验、审阅和构建验证；
- 设置范围检查点和停止条件；
- 将一年课程建设拆成可独立验收的增量，而不是一次性生成全部内容。

实施计划确认后才开始新增课程正文。
