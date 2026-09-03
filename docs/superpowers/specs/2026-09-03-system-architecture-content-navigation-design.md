# 系统架构兴趣副线内容与导航改版设计

## 背景

本次 PR 已经建立了系统架构与 AI 工程兴趣副线的十阶段主干、首批纵向切片和静态站点路由校验。人工 review 发现：入口不显眼、总览页不能形成整体认知、正式内容对基础概念解释不足且中英文混杂、页面之间缺少稳定的阅读关系。

这些问题不是单个页面的措辞问题，而是入口层、路线图层、教学层和导航层之间没有形成一条连续的学习路径。本设计只改 `gulou-core` 当前独立 worktree 中的公开内容和静态站点生成，不改变 `gulou-agent`、育儿主线或现有公开内容的开放边界。

## 目标与非目标

### 目标

1. 从首页或任意内容页都能明确进入兴趣副线，并在两次点击内到达系统架构课程总入口。
2. 课程总入口在首屏同时表达十阶段主干、三段宏观分区和第一条纵向贯通切片。
3. 让有多年开发经验但未系统学习过底层与分布式原理的读者，能够先读懂概念，再理解组件选择、生产边界和验证方法。
4. 让每个阶段页、正式单元和综合评审之间有明确的“当前位置—先修—下一步—返回总地图”关系。
5. 保留现有 `route registry` 的线性主干契约和六个正式单元的结构化校验，降低对既有站点的影响。

### 非目标

- 不在本轮扩写零基础编程教材。
- 不新增视频、交互式课程、账号系统或学习进度服务。
- 不改动 `gulou-agent` 的知识选择、提示词或评估逻辑。
- 不重做所有兴趣领域的内容，只为兴趣索引和首页提供一致的入口框架。
- 不改变十阶段宏观顺序，也不把纵向切片伪装成第二条主干路线。

## 读者体验模型

读者从任意入口进入后，应能沿着以下路径行动：

```text
首页/任意页面
  → 兴趣副线
  → 系统架构与 AI 工程总入口
  → 先看路线地图与学习方法
  → 选择主干阶段或第一条纵向切片
  → 阅读正式单元
  → 完成验证与架构判断
  → 回到总地图，进入下一阶段
```

页面文案采用中文先行原则：概念第一次出现时写成“中文名称（English Name）”，后文使用稳定的中文简称；代码、配置键、协议名和官方产品名保留原文，并在首次出现处解释它在本页的含义。

## 设计方案

### 1. 入口层

#### 共享顶栏

修改 `website/scripts/build-site.js` 的 `renderTopNav()`，在“人生阶段”之后加入“兴趣副线”链接。该函数用于内容页和索引页，保证读者不论从哪一篇文章进入，都能回到兴趣索引。

#### 首页兴趣区域

修改动态首页 `renderHomePageWithRoutes(registry)`：从注册表中收集 `interests/*/_index.md` 的 `page_type: route-index` 页面，渲染独立的“按兴趣探索”区域。系统架构课程固定排在第一张卡片，卡片必须包含目标读者、学习跨度和“从路线地图开始”的指向。

保留现有阶段卡片、首页其他说明和兴趣索引链接，不删除已有入口。旧的静态 `renderHomePage()` 保持兼容，但当前构建仍以动态首页为准。

#### 兴趣索引页

扩充 `interests/_index.md`：在领域表格前增加“正在建设的完整路线”区块，将系统架构课程作为首个 featured entry，明确适合人群、阅读入口和当前内容状态；表格保留作为完整清单。目录结构说明改为面向读者的“如何开始”，作者贡献说明继续保留但下移。

### 2. 总览层

重写 `interests/system-architecture/_index.md` 的正文顺序，首屏按照以下结构组织：

1. **这条路线解决什么问题**：用一段具体的架构评审场景说明课程价值。
2. **一张图看懂路线**：用可点击表格表达三段宏观分区。
   - 基础与方法：0 架构方法、1 计算机系统、2 网络。
   - 分布式与数据：3 分布式系统、4 数据系统、5 数据架构。
   - 生产与智能：6 云原生/SRE、7 ML 系统、8 推荐系统、9 AI 工程。
3. **两种阅读方式**：给出完整主干 `00 → 01 → … → 09` 与第一条纵向切片 `Page Cache → WAL → Replicated Log → Checkpoint/Replay → Stateful Recovery → 综合评审`，并解释两者如何配合而不是互相替代。
4. **每一阶段固定回答的四个问题**：解决什么问题、需要什么先修、产出什么证据、下一步去哪。
5. **四层学习法**：底层思想、组件设计落地、生产实践与真实案例、动手验证与架构判断；每层配一个读者可执行的动作。
6. **如何判断完成**：把“读完”与“掌握”分开，要求能在新约束或故障下解释取舍并给出验证证据。
7. **综合评审与作者材料**：保留现有 capstone、验证协议、作者规范和来源矩阵，但明确它们分别是学习入口、验证材料和作者材料。

总览页不新增独立的学习内容文件；地图、词汇和阅读关系都落在现有 route-index 中，避免产生未纳入路由校验的孤立页面。

### 3. 教学层

#### 阶段索引页

重写十个阶段 `_index.md`，每页统一包含以下小节，顺序固定：

1. `阶段目标`：用一个可观察的能力结果描述，而不是术语集合。
2. `进入条件`：列出读者需要能够描述或测量的前置问题。
3. `这一阶段先把什么讲清楚`：最多五个概念簇，每个概念用中文解释其作用和与下一概念的关系。
4. `组件如何承载这些思想`：将组件名放在解释之后，并说明它改变了哪一层边界。
5. `综合项目产物`：明确需要留下的架构图、估算、实验记录、故障时间线或 ADR。
6. `阶段挑战`：一个可以判断对错或证据是否充分的架构问题。
7. `阅读顺序`：链接正式单元、主干下一阶段和相关纵向切片位置。

阶段标题改为中文先行，例如“计算机系统（Computer Systems）”“分布式系统（Distributed Systems）”。保留 route frontmatter 中的 `route_label` 作为站点导航标识，但正文不再用英文标题作为唯一入口。

#### 六个正式单元

对以下文件做结构化改写，不改变其 frontmatter 合同和四层教学模型：

- `01-computer-systems/page-cache-and-durable-io.md`
- `03-distributed-systems/replicated-log.md`
- `04-data-systems/write-ahead-log.md`
- `05-data-architecture/checkpoint-and-replay.md`
- `06-cloud-native-sre/stateful-recovery.md`
- `capstone/log-state-recovery-review.md`

每个单元在现有 frontmatter 后增加、或将现有内容整理为以下顺序：

1. `一句话理解`：用不超过三句中文说明本单元研究的状态变化。
2. `本页要解决的问题`：给出一个具体的服务场景和读者需要做出的判断。
3. `本页词汇`：列出 6–10 个高频词，格式为“中文｜英文原名｜在本页中的含义”；只在必要处保留英文缩写。
4. `在路线中的位置`：链接所属阶段、纵向切片的上一步、下一步和课程总地图。
5. 四层正文：每层开头先回答“这一层要解决什么”，再进入表格、组件或案例。
6. `掌握度检查`：至少包含解释、应用、迁移、不使用四种判断；题干使用中文，保留配置键或 API 名作为精确对象。
7. `下一步`：说明完成本单元后进入主干哪一页、纵向切片哪一页，以及暂时不需要读什么。

不要求把所有英文术语删除：协议、配置键、API、产品名和论文标题必须保留可检索的原文；但每个术语必须先给出中文解释，且同一页面不在中英文之间来回切换同一概念。

为解决“内容空洞”的问题，每个正式单元必须至少有以下可复用证据：一个端到端因果链、一个边界或故障矩阵、一个可在隔离环境执行的验证活动、一个明确的“不使用/不应推导”结论。现有内容已有的案例、活动和 ADR 优先重写连接句，不重复堆砌更多产品名。

### 4. 关系层

不扩展 `route-registry.js` 的协议。原因是当前主干已经由 route frontmatter 和 `阅读顺序` 链接校验，修改注册表会把内容改版扩大为站点路由重构。

关系通过正文中的稳定导航表达：

- 每个阶段页都链接上一个主干阶段、下一个主干阶段、所属总地图和本阶段正式单元。
- 每个正式单元都链接课程总入口、所属阶段、纵向切片上一步和下一步；没有上一步或下一步时明确写“切片起点/切片终点”。
- 综合评审页链接回总地图，并列出六个正式单元在评审中的顺序。
- 术语表和路线图只在总入口维护，正式单元不再复制十阶段大表。

### 5. 校验与可观测验收

扩充 `website/scripts/check-system-architecture.js` 的静态检查，验证：

- 课程总入口包含三段宏观分区、主干顺序、纵向切片和四层教学法的标记。
- 十个阶段页都包含进入条件、组件落地、综合项目产物和阅读顺序。
- 六个正式单元都包含一句话理解、本页词汇、路线位置和下一步。
- 首页生成逻辑包含兴趣区域，兴趣索引仍链接系统架构总入口。

验收命令：

```text
cd website
npm run check:system-architecture
npm run check:routes
npm run check:breadcrumbs
npm run build
git diff --check
```

人工验收标准：

1. 从首页最多两次点击进入系统架构总入口。
2. 在总入口首屏能说出三段宏观分区、十阶段主干和第一条纵向切片。
3. 从任一正式单元能在一页内找到所属阶段、切片下一步和总地图。
4. 随机抽取一个阶段和一个正式单元，读者能在不查外部资料的情况下解释至少一个基础概念、一个组件取舍和一个验证活动的成功条件。

现有 `npm test` 仍是仓库已有的失败脚本，不把它作为本轮成功标准；若其行为改变，需单独说明原因。

## 文件变更清单

### 必改

- `website/scripts/build-site.js`
- `website/scripts/check-system-architecture.js`
- `interests/_index.md`
- `interests/system-architecture/_index.md`
- `interests/system-architecture/00-architecture-method/_index.md`
- `interests/system-architecture/01-computer-systems/_index.md`
- `interests/system-architecture/02-network/_index.md`
- `interests/system-architecture/03-distributed-systems/_index.md`
- `interests/system-architecture/04-data-systems/_index.md`
- `interests/system-architecture/05-data-architecture/_index.md`
- `interests/system-architecture/06-cloud-native-sre/_index.md`
- `interests/system-architecture/07-ml-systems/_index.md`
- `interests/system-architecture/08-recommendation-systems/_index.md`
- `interests/system-architecture/09-ai-engineering/_index.md`
- 六个正式单元文件（见教学层）

### 不改

- `gulou-agent/`
- `website/scripts/route-registry.js`
- `interests/system-architecture/authoring-guide.md`
- `interests/system-architecture/references/source-matrix.md`
- `interests/system-architecture/capstone/validation-protocol.md`

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| 首页新增兴趣卡片改变既有首页布局 | 复用现有 `stage-card` 和 `stage-grid` 样式，只新增一个独立区块并运行完整构建。 |
| 阶段页扩写后再次变成术语堆 | 校验固定小节，并要求每个概念簇同时写作用、边界和下一步。 |
| 为了补导航而引入第二套路由协议 | 只使用现有 Markdown 链接和正文导航，不改 route registry。 |
| 中英文过度翻译导致无法检索 | 保留官方原名、API、配置键和协议名；中文解释只负责建立语义。 |
| 改动过大掩盖原有安全/来源约束 | 不改 frontmatter 合同、来源矩阵、验证协议和公开/私有边界；每次改动后运行既有检查。 |

## 完成定义

当必改文件完成、静态校验和构建通过、人工四项验收标准均能沿页面实际操作验证，并且 PR 描述中记录了新增入口与内容改版范围，本设计对应的改版才算完成。
