---
stage: all
track: interests
domain: system-architecture
review_status: planned
page_type: route
route_group: system-architecture-core
route_key: ml-systems
route_order: 7
route_label: ML Systems
route_next: ../08-recommendation-systems/_index.md
---

# ML Systems

## 阶段目标

构建可评估、可发布、可监控且可回滚的训练与推理链路，不扩展为通用机器学习算法课程。

## 核心单元

- 架构师需要的线性代数、概率和统计基础；特征、标签、训练、推理、数据泄漏、Loss、Gradient、Embedding。
- 训练/验证/测试集、Offline/Online Evaluation、数据漂移与概念漂移。
- Feature Store、Model Registry、Model Serving、Batch/Online Inference、模型版本、发布、监控、回滚、GPU 与成本。

## 组件映射

Feature Store、Model Registry、Model Serving、批处理与在线推理组件。

## 综合项目演进

建立最小特征、训练、模型服务、版本和监控链路。

## 阶段挑战

评审数据泄漏、评估偏差、模型漂移、发布回滚和 GPU 成本如何影响线上系统。

## 阅读顺序

以可观测的数据与部署链路为进入条件；完成模型版本和监控挑战后进入 Recommendation Systems。
