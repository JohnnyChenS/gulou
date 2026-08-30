---
stage: all
track: interests
domain: system-architecture
review_status: planned
page_type: route
route_group: system-architecture-core
route_key: computer-systems
route_order: 1
route_label: Computer Systems
route_next: ../02-network/_index.md
---

# Computer Systems

## 阶段目标

用单机运行时模型解释服务的线程、内存、IO、GC 与性能瓶颈。

## 核心单元

- 进程、线程、调度、上下文切换、用户态、内核态与系统调用。
- 虚拟内存、Page、Page Fault、Swap、Page Cache、文件描述符、Socket 与顺序/随机 IO。
- Buffer、mmap、零拷贝、批处理、CPU Cache、局部性、锁、CAS、内存可见性、线程池、队列与异步 IO。
- JVM、GC、JIT 与 Profiling 的架构相关部分。

## 组件映射

Linux、JVM、Netty、Kafka 和数据库存储引擎。

## 综合项目演进

建立单机服务，观察线程、内存、IO、GC 和性能瓶颈。

## 阶段挑战

说明阻塞、队列与背压如何影响延迟和吞吐，并用证据定位单机瓶颈。

## 阅读顺序

以阶段 0 的需求与容量假设为进入条件；完成单机观察和阶段挑战后进入 Network。
