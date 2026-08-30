---
stage: all
track: interests
domain: system-architecture
review_status: planned
page_type: route
route_group: system-architecture-core
route_key: network
route_order: 2
route_label: Network
route_next: ../03-distributed-systems/_index.md
---

# Network

## 阶段目标

理解远程调用的连接状态、流量限制、尾延迟与部分失败如何改变系统语义。

## 核心单元

- 网络分层、IP、TCP、UDP、DNS、HTTP/1.1、HTTP/2、HTTP/3 与 TLS。
- 连接状态、丢包、重传、拥塞、长连接、连接池、序列化与 RPC。
- L4/L7 负载均衡、Timeout、Retry、Circuit Breaker、Rate Limit。
- 延迟、带宽、吞吐量、Tail Latency 与网络分区。

## 组件映射

Nginx、Envoy、Netty、gRPC、服务网关和 Service Mesh。

## 综合项目演进

拆出第一个远程服务，加入超时、重试、连接池、限流和故障观测。

## 阶段挑战

评审重试、超时与限流是否会放大故障，并解释网络分区下的数据语义。

## 阅读顺序

以可观察的单机服务为进入条件；完成远程服务的故障观测和阶段挑战后进入 Distributed Systems。
