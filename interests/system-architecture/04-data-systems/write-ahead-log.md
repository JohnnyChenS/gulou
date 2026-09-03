---
id: system-architecture-wal-01
stage: 04-data-systems
track: interests
domain: system-architecture
topic: Write-Ahead Log：从提交确认到崩溃恢复
age_range: 18y+
difficulty: advanced
review_status: draft
references:
  - ../references/source-matrix.md
tags: [WAL, PostgreSQL, 崩溃恢复]
learning_paths: [system-architecture]
related_prompts: [system-architecture-page-cache-durable-io-01, system-architecture-replicated-log-01]
---

# 预写日志（Write-Ahead Log，WAL）：从提交确认到崩溃恢复

## 一句话理解

预写日志先把状态变化追加并刷新到可恢复边界，再允许主数据页延后写回；崩溃后由日志重放补齐已提交变化。

## 本页要解决的问题

当 PostgreSQL 事务已经返回成功、对应数据页却尚未写回时，数据库进程异常退出后凭什么恢复这笔事务，又有哪些状态不在这个保证内？

## 本页词汇

| 中文 | English | 在本页中的含义 |
|---|---|---|
| 预写日志 | Write-Ahead Log (WAL) | 在主数据页写出前先记录状态变化的追加日志 |
| 日志序列号 | Log Sequence Number (LSN) | 标识日志推进位置的单调坐标 |
| 重做 | REDO | 恢复时向前重放日志中尚未反映到数据页的变化 |
| 检查点 | Checkpoint | 限定恢复起点并协调此前脏页写出的记录点 |
| 数据页 | Data Page | 保存表或索引主状态、可晚于日志写回的页面 |
| 同步提交 | Synchronous Commit | 成功响应等待相应日志刷新边界的提交策略 |
| 异步提交 | Asynchronous Commit | 允许成功响应早于日志实际持久化的提交策略 |
| 恢复点目标 | Recovery Point Objective (RPO) | 业务允许恢复后丢失数据的最大窗口 |

## 在路线中的位置

这是纵向切片的第二步，先修是[页缓存（Page Cache）、写入确认与持久化边界](../01-computer-systems/page-cache-and-durable-io.md)，下一步是[复制日志（Replicated Log）](../03-distributed-systems/replicated-log.md)，完整地图见[系统架构与 AI 工程](../_index.md)。

## 在全景业务链中的深入落点

本页负责数据库写入分支：事务写入先形成 WAL/redo 记录，以 LSN 记录位置，再由提交策略、日志刷新和 checkpoint 共同决定本地崩溃恢复边界。课程的贯穿案例以 PostgreSQL 18 为主，MySQL 8.4 的 InnoDB redo log 只用于比较共同模型和专属差异；数据库读路径的 Buffer Pool 命中、查询计划和物理读取不在本页假定为同一条固定链。

## 学习目标

完成本单元后，你能用“先记录变化、再更新主状态、通过重放恢复”解释本地数据库的崩溃恢复链路；把事务成功、WAL 刷新和数据页写回分成不同事件；并在恢复时间、写入 I/O 与允许丢失窗口之间作出有证据的选择。这里的具体实现以 PostgreSQL 18 为主，不把它的行为当作所有数据库的保证。

## 先修知识

- 已完成 [Page Cache、写入确认与持久化边界](../01-computer-systems/page-cache-and-durable-io.md)，能区分系统调用返回、缓存、同步请求和业务确认。
- 熟悉事务提交、脏页、追加写与基本的 RPO（可接受数据丢失窗口）。
- 能在隔离的 PostgreSQL 实例中执行 SQL；不要求掌握存储引擎源码或页面格式。

## 问题场景

推荐平台的一笔用户行为元数据事务已经向调用方返回成功；其表或索引对应的数据页尚未写回。随后数据库进程突然退出。若没有每次提交都写回全部数据页，恢复凭什么知道应补上什么？成功响应究竟绑定在数据页、WAL，还是某个更高层的业务协议？

## 第一层：底层思想

读完这一层，你应能回答：预写日志如何把提交确认与数据页写回解耦，并由重做和检查点建立本地恢复链路？

**预写日志（Write-Ahead Log，WAL）**把对主状态的变化先编码为按顺序追加的日志记录。基本约束不是“只要写日志就安全”，而是：在 PostgreSQL 18 中，数据文件（表和索引所在处）的变更只能在描述该变更的 WAL 记录已刷新到永久存储之后写入数据文件。[PostgreSQL WAL 介绍](../references/source-matrix.md)由此允许提交时优先同步顺序写的 WAL，而不要求把该事务触及的每个数据页立即写回。

**日志序列号（Log Sequence Number，LSN）**是日志位置的单调推进坐标。它让“变化已被记录到哪里”“恢复应从哪里开始”成为可交流、可观察的问题，而不是一个模糊的“已经写了”。LSN 本身不是业务事件 ID，也不能证明外部系统、备份或副本已经收到同一变化。

**重做（REDO）**是崩溃后的前滚：若某个已记录的变化尚未更新到数据页，恢复读取 WAL 并重做该变化。这个模型解释了“提交成功但数据页尚未落盘”仍可能恢复：关键证据是相应 WAL 已跨过该实现定义的刷新边界，而不是页面已立即写回。反过来，若成功在 WAL 刷新之前报告，恢复可得到自洽状态，却可能没有最近的那些事务；PostgreSQL 的异步提交正把这段风险窗口暴露为吞吐与耐久的取舍。

**检查点（checkpoint）**是让恢复不必从无限久远日志开始的协调点。在 PostgreSQL 18 中，checkpoint 会把此前脏数据页写出并在 WAL 中写入 checkpoint 记录；崩溃恢复据最近 checkpoint 的 redo record 确定 REDO 起点。更频繁的 checkpoint 可减少恢复要重做的工作，却会更频繁地推动脏页 I/O，并可能增加后续 WAL 工作。它不是“已经备份完成”的同义词。

这条链路的失败模型应明确为：进程或服务器崩溃发生在数据页写回之前、但已被 WAL 覆盖之后。WAL 处理的是此模型下的**本地崩溃恢复**，不自动产生远端副本，不替代可独立保存和恢复的备份，也不自动实现跨服务业务一致性。它同样不等于业务事件日志（面向领域消费者的语义记录）或审计日志（面向责任追溯的记录）；这三类日志可以相互关联，却服务不同的读者、保留策略与正确性问题。

## 第二层：组件设计落地

读完这一层，你应能回答：PostgreSQL 的提交与检查点配置怎样改变确认窗口、恢复成本和 I/O 压力？

**PostgreSQL 18：提交与页写回分离。** PostgreSQL WAL 的顺序写使提交无需同步每个受影响的数据页；崩溃时可 REDO 未反映到页上的 WAL 变更。通常的同步提交会在向客户端报告成功前等待该事务的 WAL 记录刷新到永久存储。它回答的是 PostgreSQL 在其配置与故障模型下的本地提交边界，并不声称调用方的下游 HTTP 请求、消息投递或另一台机器也已完成。

**PostgreSQL 18：checkpoint 是恢复起点与 I/O 预算的共同约束。** checkpoint 要求把其之前的脏堆和索引页更新到磁盘，并留下 checkpoint 记录；恢复从最近的 redo record 向前处理。因而评审 checkpoint 时同时看 WAL 生成速率、发生频率、脏页写出 I/O 和可接受恢复时间，不能只以“降低恢复时间”或“减少写入”为唯一指标。大批量写入、短周期 checkpoint 或容量边界触发都可能改变这些指标；需要在目标工作负载上观测。

**PostgreSQL 18：异步提交改变确认含义。** 将 `synchronous_commit` 设为关闭会让事务在其 WAL 尚未实际到盘时先向客户端返回成功；进程崩溃后数据库可恢复为自洽状态，但最近的事务可能丢失。因此不能让这类成功响应直接驱动不可撤销的外部动作，除非业务已把该 RPO 和补偿路径写入协议。此处讨论的是 `synchronous_commit` 的确认风险；它不等同于关闭 `fsync`，后者属于更宽、更高风险的服务器级行为，不能作为普通性能调优捷径。

**简要对照：InnoDB redo log。** MySQL 8.4 的 InnoDB 使用名称为 **redo log** 的磁盘结构：更新先形成 redo，异常关闭前未完成写入数据文件的变更可在初始化时重放；其 redo 同样以递增 LSN 表示，checkpoint 推进时旧 redo 可截断，恢复从最新 checkpoint LSN 开始。共同模型是“日志覆盖变更、主数据页可稍后更新、恢复重放”；术语与具体契约则是引擎专属的。不要从这个对照推断 PostgreSQL WAL 和 InnoDB redo log 的提交确认、复制、备份、页格式、默认配置或性能相同。

**不使用场景。** 若需求是跨可用区 RPO、长期可恢复副本、业务事件分发或合规审计，不能把单机 WAL 当作所需组件；应分别采用经过恢复演练的备份/归档与复制方案、具有幂等与消费语义的事件日志、或满足保留和访问控制要求的审计系统。若业务不能接受异步提交窗口中的最近事务丢失，也不应为了吞吐把成功响应提前到 WAL 刷新前；保留同步提交或选择明确的上游重试/补偿协议。

## 第三层：生产实践与真实案例

读完这一层，你应能回答：如何用提交时间、日志位置、检查点与恢复证据区分性能现象、允许的数据窗口和错误的备份假设？

案例类型：模拟案例（假设：推荐平台的 PostgreSQL 18 实例持续写入用户行为元数据；应用启用异步提交以降低提交等待；写入负载使 WAL 快速增长，并因配置边界频繁触发 checkpoint；该团队另有周期性备份，但误把 WAL 当作备份本身。）

**症状与故障。** 提交延迟偶发升高，监控显示 WAL 生成速率上升、checkpoint 变密；一次数据库进程异常退出后，业务发现一小段“已收到成功”的行为元数据未出现。团队又试图仅凭本地 `pg_wal` 内容恢复到任意时间点，忽略它不是独立可还原的备份。

**解释路径。** 先将观察分开：

- 提交延迟是从事务发起到应用收到成功的时间，可能受 WAL 刷新、并发与存储条件影响；不能只归因于 checkpoint。
- WAL 生成速率描述日志位置推进速度；它与写入模式、页修改和 checkpoint 周期共同决定保留及 I/O 压力，不是用户行为吞吐的替代指标。
- checkpoint 频率越高，恢复起点通常离当前越近，但写出脏页更频繁；频率过低则可能积累更多需 REDO 的工作。应同时看恢复时间目标和写出压力。
- 异步提交的成功早于对应 WAL 实际持久化，进程崩溃可使这段窗口内的事务丢失；这不是“数据库自动保证一切”能够掩盖的协议选择。
- WAL 支持本地 REDO；它不单独构成可保存、可验证、可恢复到目标点的备份工件，也没有创建远程副本。

**处置与判断。** 团队应从事务 ID、成功响应时间、提交延迟、WAL 生成速率、checkpoint 频率和实际恢复时长建立同一时间线；将丢失窗口与已声明 RPO 对照。若用户行为允许有限重放，可由上游幂等事件 ID 补齐缺口；若外部动作依赖“数据库已记住”，该路径应切回同步提交或先引入可撤销/补偿设计。调整 checkpoint 前必须以目标工作负载验证对恢复时间和 I/O 的合计影响。该模拟不声称发生过真实客户事故，也不把任一指标当成唯一根因。

## 第四层：动手验证与架构判断

读完这一层，你应能回答：如何观察日志位置和检查点推进，并据此为不同数据类别选择同步或异步提交？

### 活动：观察 WAL LSN 前进与 checkpoint

- **环境：** 具有 Docker 的本机；仅使用本活动固定名称为 `gulou-wal-lab` 的 PostgreSQL 18 容器和主机端口 `55432`。开始前执行 `docker ps -a --filter 'name=^/gulou-wal-lab$'`；若已有同名容器，停止活动并先确认其归属，不要删除或复用它。
- **步骤：**

  1. 启动隔离实例：`docker run --name gulou-wal-lab --label gulou.wal-lab=true -e POSTGRES_PASSWORD=gulou-wal-lab-only -p 127.0.0.1:55432:5432 -d postgres:18`。固定端口只绑定本机 loopback；等待 `docker logs gulou-wal-lab` 显示可接受连接后再继续。
  2. 在容器内创建表并执行一个事务：

     ```bash
     docker exec -i -u postgres gulou-wal-lab psql -d postgres <<'SQL'
     CREATE TABLE wal_lab_events (id bigint PRIMARY KEY, note text NOT NULL);
     BEGIN;
     INSERT INTO wal_lab_events VALUES (1, 'wal observation');
     COMMIT;
     SELECT pg_current_wal_lsn() AS lsn_after_transaction;
     SQL
     ```

  3. 要求 PostgreSQL 执行 checkpoint，再读取当前位置：

     ```bash
     docker exec -i -u postgres gulou-wal-lab psql -d postgres <<'SQL'
     CHECKPOINT;
     SELECT pg_current_wal_lsn() AS lsn_after_checkpoint;
     SQL
     ```

  4. 用 `docker inspect --format '{{ index .Config.Labels "gulou.wal-lab" }}' gulou-wal-lab` 确认输出为 `true`，然后执行固定、可逆的清理：`docker rm -f gulou-wal-lab`。

- **预期观察：** 事务后可取得一个 WAL LSN；执行 `CHECKPOINT` 后可再次取得 LSN，位置可能继续推进。活动说明 WAL 记录与 checkpoint 都是可观察的状态推进；LSN 数值和两次差值受运行环境及后台活动影响，不能据此推导固定性能。
- **成功条件：** 创建表和事务完成；两个 `pg_current_wal_lsn()` 查询均返回 LSN；`CHECKPOINT` 成功返回；清理前标签检查为 `true`，清理后 `docker ps -a --filter 'name=^/gulou-wal-lab$'` 不返回该容器。
- **清理方式：** 只在确认同名容器由本活动创建且标签为 `gulou.wal-lab=true` 后，运行 `docker rm -f gulou-wal-lab`。不要使用通配符、不要删除 Docker 卷，也不要删除任何其他容器。

本活动**只观察** WAL LSN 前进和 checkpoint；它不强制断电、不杀进程，也不能证明真实硬件、虚拟化层、文件系统或设备缓存下的耐久性。真实崩溃恢复演练必须另行在可丢弃环境中设计故障模型和恢复证据。

### 架构判断题

推荐平台要求为用户行为元数据定义 RPO。请写下：该数据是否允许在异常退出后重放；允许丢失的最大时间窗口；事务应使用同步提交还是异步提交；成功响应是否会驱动不可撤销外部动作；以及要保留哪些提交时间、上游事件 ID、WAL/恢复和备份证据。若无法说明这些条件，不能以“已有 WAL”为理由发布耐久承诺。

## 常见误区与适用边界

- **误区：** 事务返回成功就表示数据页已落盘。**边界：** 对 PostgreSQL 的同步提交，成功依赖相应 WAL 的刷新而非每个数据页已立即写回；恢复可 REDO 页面尚未反映的变化。
- **误区：** WAL 是备份。**边界：** WAL 是恢复链路的一部分；备份还需要独立可用的基础副本、保留、校验和恢复演练。单独保留本地 WAL 不能证明满足 RPO。
- **误区：** WAL 是复制、业务事件日志或审计日志。**边界：** WAL 的直接读者是数据库恢复机制；复制、领域事件和审计各有自己的传递、语义、保留、访问控制与消费契约。
- **误区：** checkpoint 越频繁越好。**边界：** 更短恢复工作量与更频繁脏页 I/O、后续 WAL 工作之间存在条件性取舍，应以 WAL 生成速率、checkpoint 频率、恢复时间和 I/O 证据共同评审。
- **误区：** 关闭同步提交只会提高性能。**边界：** 它把成功响应提前到 WAL 实际落盘前，最近事务可能丢失；若成功将触发不可撤销动作，或没有上游重放和补偿路径，就不应使用该确认策略。

## 掌握度检查

1. **解释：** 为什么“提交成功但数据页未落盘”在 PostgreSQL WAL 模型下仍可恢复？请分别说明 WAL 刷新、数据页写回、REDO 与 checkpoint 的角色，并指出此解释不覆盖什么。
2. **应用：** 推荐平台的用户行为元数据允许 RPO 为 30 秒、上游可按幂等事件 ID 重放。你会采用同步提交还是异步提交？写出成功响应内容、RPO 证据和恢复后补齐步骤，不能只说“更快”。
3. **迁移：** 将“日志先行、主状态延后、从受控起点重放”迁移到 InnoDB redo log 或后续 replicated log 讨论中。哪些共同模型仍成立，哪些提交、复制或成员资格证据不能从 PostgreSQL WAL 继承？
4. **不使用：** 何时不应把本地 WAL 当作解决方案？至少给出一个需要独立备份/恢复演练的场景、一个需要跨节点复制的场景，以及一个需要业务事件或审计记录的场景，并为每个场景提出替代组件或协议。

## 在综合项目中的应用

[进入日志、状态与恢复纵向切片综合评审](../capstone/log-state-recovery-review.md)，把 PostgreSQL WAL 的本地 REDO 边界与副本提交、流处理 replay 和编排恢复串联。

### ADR：推荐平台用户行为元数据的 RPO 与提交策略

**状态：** 建议采用，须经目标部署环境的恢复演练和业务所有者确认后生效。

**上下文：** 用户行为元数据可用于推荐特征、分析和重放；不同类别对最近数据丢失的容忍度不同。将 PostgreSQL WAL 的本地崩溃恢复误写成“已有备份和复制”会使产品的 RPO 承诺失真。

**决策：** 对可由上游按幂等事件 ID 重放、且不直接触发不可撤销动作的普通点击/曝光元数据，选择 **RPO 为 30 秒**，采用 PostgreSQL 18 异步提交。该目标的配置契约为 `wal_writer_delay <= 10s`：PostgreSQL 18 文档给出的异步提交最大风险窗口是 `3 × wal_writer_delay`，因此配置上限对应不超过 30 秒的该窗口。成功响应只表示该事务已逻辑完成，不能表示已跨过 WAL 持久化边界。为这类数据记录提交策略、提交时间、上游事件 ID、实际 `wal_writer_delay` 与计算出的 `3 × wal_writer_delay` 风险窗口；上线配置校验和配置漂移告警必须在 `wal_writer_delay > 10s` 时失败或告警，验收须确认此窗口不超过 30 秒且恢复演练能由上游补齐缺口。对会影响用户可见状态、结算或不可撤销动作的元数据，RPO 为 0，使用 PostgreSQL 同步提交；这个 RPO 只针对已定义的本地 PostgreSQL 崩溃模型。节点或可用区丢失仍须由已验证的复制与独立备份恢复契约覆盖，不能由本地同步提交承诺。WAL 只承担 PostgreSQL 本地 REDO 证据；备份/恢复、跨节点副本、领域事件与审计另立契约和验收。

**后果：** 同步提交通常增加提交等待，但让该 PostgreSQL 提交成功与 WAL 刷新边界一致；异步提交可降低等待，却需要把实际 RPO、重放和补偿成本放进产品协议。checkpoint 参数只在恢复时间与写出 I/O 的整体评审中调整，不以单一指标决策。

**验证与回滚：** 对每个数据类保存提交时间、提交策略、上游事件 ID、实际 `wal_writer_delay`、`3 × wal_writer_delay` 风险窗口、恢复结果、恢复耗时、WAL 生成速率和 checkpoint 频率；定期从独立备份执行恢复演练，并分别验证复制与事件/审计链路。异步提交验收要求实际配置不大于 10 秒、计算窗口不大于 30 秒、配置漂移告警有效，且演练能在声明的 RPO 内补齐数据。任一条件不满足、上游无法可靠重放，或成功响应被下游用作不可撤销依据时，停止异步提交策略，改用同步提交或降低该响应的承诺级别。

## 权威来源与延伸阅读

- [来源矩阵：PostgreSQL 18 WAL、异步提交与 checkpoint；MySQL 8.4 InnoDB redo log](../references/source-matrix.md)
- [PostgreSQL 18：Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html)（PostgreSQL 18；访问日期：2026-08-30）
- [PostgreSQL 18：Asynchronous Commit](https://www.postgresql.org/docs/current/wal-async-commit.html)（PostgreSQL 18；访问日期：2026-08-30）
- [PostgreSQL 18：WAL Configuration](https://www.postgresql.org/docs/current/wal-configuration.html)（PostgreSQL 18；访问日期：2026-08-30）
- [MySQL 8.4：InnoDB Redo Log](https://dev.mysql.com/doc/refman/8.4/en/innodb-redo-log.html)（MySQL 8.4；访问日期：2026-08-30）

## 下一步

继续学习[复制日志（Replicated Log）：副本、提交与选主](../03-distributed-systems/replicated-log.md)，把单节点的日志恢复边界扩展到副本进度、提交规则和新 leader 资格。
