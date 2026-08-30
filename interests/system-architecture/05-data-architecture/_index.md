---
stage: all
track: interests
domain: system-architecture
review_status: planned
page_type: route
route_group: system-architecture-core
route_key: data-architecture
route_order: 5
route_label: Data Architecture
route_next: ../06-cloud-native-sre/_index.md
---

# Data Architecture

## 阶段目标

建立从数据源到消费端的可恢复数据生命周期，并说明数据质量与演进边界。

## 核心单元

- Event、CDC、Schema、数据契约、Batch、Stream、ETL 与 ELT。
- Event Time、Processing Time、Window、Watermark、Late Event、Stateful Processing、Checkpoint 与恢复。
- Exactly-once 的系统边界、数据湖、数据仓库、Lakehouse、Lambda/Kappa Architecture、实时数仓、特征管道、Serving Layer、数据质量、血缘、重放与 Schema 演进。

## 组件映射

Kafka、Flink、Spark、Iceberg、ClickHouse 和 Doris。

## 综合项目演进

建立用户事件采集、实时计算、分析查询和训练数据链路。

## 阶段挑战

评审迟到、重复、乱序和重放下的数据正确性、Checkpoint 恢复与 Schema 兼容性。

## 阅读顺序

以明确的数据源、消费端与存储选择为进入条件；完成端到端数据链路挑战后进入 Cloud Native / SRE。
