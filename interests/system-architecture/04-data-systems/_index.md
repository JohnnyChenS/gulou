---
stage: all
track: interests
domain: system-architecture
review_status: planned
page_type: route
route_group: system-architecture-core
route_key: data-systems
route_order: 4
route_label: Data Systems
route_next: ../05-data-architecture/_index.md
---

# Data Systems

## 阶段目标

按数据与访问模式选择存储，并说明一致性、耐久性、查询延迟和写入吞吐的权衡。

## 核心单元

- OLTP/OLAP、Row Store/Column Store、B+ Tree、LSM Tree、WAL、MVCC、Buffer Pool、Index、Query Planner 与 Execution Engine。
- Compression、Compaction、Write Amplification、Vectorized Execution、Partition、Shard、Replica。
- 倒排索引、全文检索与分布式存储。

## 组件映射

MySQL、PostgreSQL、Redis、RocksDB、HBase、Cassandra、Lucene、Elasticsearch、ClickHouse 和 Doris；用于比较，不要求逐一部署和精通。

## 综合项目演进

为事务、缓存、搜索、分析和特征场景选择不同存储，并用数据与访问模式说明理由。

## 阶段挑战

评审索引、分区和副本选择在读写负载、数据丢失与成本上的边界。

## 阅读顺序

以已定义的事件和访问模式为进入条件；完成存储选择的证据化说明后进入 Data Architecture。
