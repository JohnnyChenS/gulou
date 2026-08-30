---
stage: all
track: interests
domain: system-architecture
review_status: planned
page_type: route
route_group: system-architecture-core
route_key: cloud-native-sre
route_order: 6
route_label: Cloud Native / SRE
route_next: ../07-ml-systems/_index.md
---

# Cloud Native / SRE

## 阶段目标

将系统容器化并以可观测性、可靠性、发布、恢复、容量与成本约束运营。

## 核心单元

- Container、Namespace、cgroup、容器网络和存储；Kubernetes 控制面、Pod、Deployment、StatefulSet、Service、Ingress、Scheduler、Controller、Desired State、Reconciliation、Operator 与 Service Mesh。
- Logs、Metrics、Tracing、OpenTelemetry、Prometheus、Grafana、RED、USE、SLI、SLO、SLA、Error Budget。
- RPO、RTO、备份、恢复演练、容量规划、自动扩缩容、资源隔离、灰度发布、回滚、混沌工程、事故响应、复盘与云资源成本。

## 组件映射

Kubernetes、OpenTelemetry、Prometheus、Grafana，以及控制面、工作负载、服务和发布相关组件。

## 综合项目演进

容器化并部署系统，建立指标、追踪、SLO、告警、发布和容量模型。

## 阶段挑战

证明如何发现故障、遵守 Error Budget、恢复或回滚，并评审资源隔离和成本。

## 阅读顺序

以可部署且带数据链路的系统为进入条件；完成 SLO、告警和恢复演练后进入 ML Systems。
