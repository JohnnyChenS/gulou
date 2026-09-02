# 系统架构学习路径首批实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `gulou-core` 建立面向资深开发者的系统架构课程骨架，并以“日志、状态与恢复”纵向切片验证四层教学模型、综合项目和网站发布流程。

**Architecture:** 课程使用 `route-index → phase route → knowledge unit` 的现有静态路由结构；阶段索引保存稳定知识地图，正式知识单元统一按“底层思想 → 组件设计落地 → 生产实践 → 动手验证与架构判断”编写。第一批只建立完整导航骨架和六页纵向切片，不批量生成十二个月全部正文；AI 内容推荐平台只提供贯穿式验证场景。

**Tech Stack:** Markdown、YAML frontmatter、Node.js、`gray-matter`、`marked`、现有静态站点构建器和路由检查脚本。

**Spec:** `docs/superpowers/specs/2026-08-30-system-architecture-learning-path-design.md`

## Global Constraints

- 所有工作只在 `docs/system-architecture-learning-path` 分支及其独立 worktree 中执行。
- 第一版只服务于已有多年开发经验、熟悉至少一种主力语言和常见 Web 基础设施的工程师。
- 首批范围仅包含课程骨架、作者规范、来源矩阵和“日志、状态与恢复”纵向切片。
- 不编写零基础编程教材，不扩展为计算机本科课程，不为面试、认证或岗位晋升承诺结果。
- 不按组件清单组织课程；先解释稳定思想，再比较组件实现和生产权衡。
- 正式知识单元必须包含四层内容、一个失败模式、一个“不该使用”的场景和至少一个可观察的学习活动。
- 生产案例必须可公开核验；无法核验的场景必须明确标注为“模拟案例”。
- 原始 ChatGPT 对话只作为结构种子，不作为事实来源。
- 只链接或按许可引用 Khan Academy 和其他外部材料，不复制受限制的正文、视频或题目。
- 版本相关事实记录产品版本或访问日期；第一批来源访问基线为 `2026-08-30`。
- 不修改 `gulou-agent`、`gulou-agent/config/knowledge-sources.yaml` 或任何当前 MVP 选择。
- 不手工编辑或提交 `website/site/`、`word/docx/` 和 `node_modules/`。
- 不预建没有实际职责的空文章；阶段索引可以声明本阶段边界，但不能包含 `TODO`、`TBD` 或“稍后补充”。
- 新课程正文使用 `review_status: draft`，在目标读者完成学习验证前不得改为 `reviewed` 或 `published`。
- 每项任务只暂存该任务列出的文件；不得捎带当前 worktree 之外的改动。
- 第一批通过技术检查后必须停在真实学习者验证门；未记录验证反馈前，不开始大规模扩写其余阶段。

---

## File Map

### 课程与作者契约

- Create: `interests/system-architecture/_index.md` — 课程总入口、目标读者、十二个月地图和使用方法。
- Create: `interests/system-architecture/authoring-guide.md` — frontmatter、四层结构、案例和活动的作者规范。
- Create: `interests/system-architecture/references/source-matrix.md` — 第一批知识点与第一手资料的映射。
- Modify: `interests/_index.md` — 增加系统架构兴趣入口。

### 阶段索引

- Create: `interests/system-architecture/00-architecture-method/_index.md`
- Create: `interests/system-architecture/01-computer-systems/_index.md`
- Create: `interests/system-architecture/02-network/_index.md`
- Create: `interests/system-architecture/03-distributed-systems/_index.md`
- Create: `interests/system-architecture/04-data-systems/_index.md`
- Create: `interests/system-architecture/05-data-architecture/_index.md`
- Create: `interests/system-architecture/06-cloud-native-sre/_index.md`
- Create: `interests/system-architecture/07-ml-systems/_index.md`
- Create: `interests/system-architecture/08-recommendation-systems/_index.md`
- Create: `interests/system-architecture/09-ai-engineering/_index.md`
- Create: `interests/system-architecture/capstone/_index.md`

### 第一批纵向切片

- Create: `interests/system-architecture/01-computer-systems/page-cache-and-durable-io.md`
- Create: `interests/system-architecture/04-data-systems/write-ahead-log.md`
- Create: `interests/system-architecture/03-distributed-systems/replicated-log.md`
- Create: `interests/system-architecture/05-data-architecture/checkpoint-and-replay.md`
- Create: `interests/system-architecture/06-cloud-native-sre/stateful-recovery.md`
- Create: `interests/system-architecture/capstone/log-state-recovery-review.md`
- Create: `interests/system-architecture/capstone/validation-protocol.md`

### 自动检查

- Create: `website/scripts/check-system-architecture.js` — 课程骨架、路由链、frontmatter、四层标题和范围禁区检查。
- Modify: `website/package.json` — 增加 `check:system-architecture` 命令。

---

### Task 1: 建立课程契约检查和完整导航骨架

**Files:**
- Create: `website/scripts/check-system-architecture.js`
- Modify: `website/package.json`
- Create: `interests/system-architecture/_index.md`
- Create: `interests/system-architecture/00-architecture-method/_index.md`
- Create: `interests/system-architecture/01-computer-systems/_index.md`
- Create: `interests/system-architecture/02-network/_index.md`
- Create: `interests/system-architecture/03-distributed-systems/_index.md`
- Create: `interests/system-architecture/04-data-systems/_index.md`
- Create: `interests/system-architecture/05-data-architecture/_index.md`
- Create: `interests/system-architecture/06-cloud-native-sre/_index.md`
- Create: `interests/system-architecture/07-ml-systems/_index.md`
- Create: `interests/system-architecture/08-recommendation-systems/_index.md`
- Create: `interests/system-architecture/09-ai-engineering/_index.md`
- Create: `interests/system-architecture/capstone/_index.md`
- Modify: `interests/_index.md`

**Interfaces:**
- Consumes: 现有 `page_type: route-index`、`page_type: route`、`route_group`、`route_next` 和 `## 阅读顺序` 路由约定。
- Produces: `system-architecture-core` 路由组；后续知识单元通过各阶段 `## 阅读顺序` 接入；`npm run check:system-architecture` 成为所有后续任务的课程契约检查。

- [ ] **Step 1: 创建会先失败的课程检查脚本**

  创建 `website/scripts/check-system-architecture.js`：

  ```js
  #!/usr/bin/env node

  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');

  const ROOT = path.resolve(__dirname, '../..');
  const COURSE = path.join(ROOT, 'interests/system-architecture');
  const ROUTE_GROUP = 'system-architecture-core';
  const NON_UNIT_FILES = new Set(['validation-protocol.md']);
  const PHASES = [
    ['00-architecture-method', 'architecture-method', '架构方法与基线诊断'],
    ['01-computer-systems', 'computer-systems', 'Computer Systems'],
    ['02-network', 'network', 'Network'],
    ['03-distributed-systems', 'distributed-systems', 'Distributed Systems'],
    ['04-data-systems', 'data-systems', 'Data Systems'],
    ['05-data-architecture', 'data-architecture', 'Data Architecture'],
    ['06-cloud-native-sre', 'cloud-native-sre', 'Cloud Native / SRE'],
    ['07-ml-systems', 'ml-systems', 'ML Systems'],
    ['08-recommendation-systems', 'recommendation-systems', 'Recommendation Systems'],
    ['09-ai-engineering', 'ai-engineering', 'AI Engineering'],
  ];
  const REQUIRED_HEADINGS = [
    '## 学习目标',
    '## 先修知识',
    '## 问题场景',
    '## 第一层：底层思想',
    '## 第二层：组件设计落地',
    '## 第三层：生产实践与真实案例',
    '## 第四层：动手验证与架构判断',
    '## 常见误区与适用边界',
    '## 掌握度检查',
    '## 在综合项目中的应用',
    '## 权威来源与延伸阅读',
  ];

  function fail(message) {
    throw new Error(message);
  }

  function readMarkdown(full) {
    if (!fs.existsSync(full)) fail(`缺少文件：${path.relative(ROOT, full)}`);
    const raw = fs.readFileSync(full, 'utf8');
    const parsed = matter(raw);
    return { raw, fm: parsed.data, content: parsed.content };
  }

  function collectFormalUnits(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collectFormalUnits(full, results);
      else if (entry.name.endsWith('.md') && entry.name !== '_index.md' && !NON_UNIT_FILES.has(entry.name)) results.push(full);
    }
    return results;
  }

  const rootIndex = readMarkdown(path.join(COURSE, '_index.md'));
  if (rootIndex.fm.page_type !== 'route-index') fail('课程总入口必须是 route-index');
  if (rootIndex.fm.route_group !== ROUTE_GROUP) fail('课程总入口 route_group 不正确');
  if (rootIndex.fm.domain !== 'system-architecture') fail('课程总入口 domain 不正确');

  PHASES.forEach(([dir, key, label], index) => {
    const rel = `${dir}/_index.md`;
    const page = readMarkdown(path.join(COURSE, rel));
    if (page.fm.page_type !== 'route') fail(`${rel}: page_type 必须是 route`);
    if (page.fm.route_group !== ROUTE_GROUP) fail(`${rel}: route_group 不正确`);
    if (page.fm.route_key !== key) fail(`${rel}: route_key 应为 ${key}`);
    if (Number(page.fm.route_order) !== index) fail(`${rel}: route_order 应为 ${index}`);
    if (page.fm.route_label !== label) fail(`${rel}: route_label 应为 ${label}`);
    if (!rootIndex.content.includes(`](${rel})`)) fail(`课程总入口未链接 ${rel}`);
    const next = PHASES[index + 1];
    const expectedNext = next ? `../${next[0]}/_index.md` : undefined;
    if (page.fm.route_next !== expectedNext) fail(`${rel}: route_next 应为 ${expectedNext || '空'}`);
    for (const heading of ['## 阶段目标', '## 核心单元', '## 组件映射', '## 综合项目演进', '## 阶段挑战', '## 阅读顺序']) {
      if (!page.content.includes(heading)) fail(`${rel}: 缺少 ${heading}`);
    }
  });

  const interestIndex = fs.readFileSync(path.join(ROOT, 'interests/_index.md'), 'utf8');
  if (!interestIndex.includes('system-architecture/_index.md')) fail('兴趣总索引未链接系统架构课程');

  const formalRoots = PHASES.map(([dir]) => path.join(COURSE, dir));
  formalRoots.push(path.join(COURSE, 'capstone'));
  const formalUnits = formalRoots.flatMap(dir => collectFormalUnits(dir));
  for (const file of formalUnits) {
    const page = readMarkdown(file);
    const rel = path.relative(ROOT, file);
    if (page.fm.track !== 'interests') fail(`${rel}: track 必须是 interests`);
    if (page.fm.domain !== 'system-architecture') fail(`${rel}: domain 必须是 system-architecture`);
    if (page.fm.review_status !== 'draft') fail(`${rel}: review_status 必须是 draft`);
    if (!Array.isArray(page.fm.learning_paths) || !page.fm.learning_paths.includes('system-architecture')) {
      fail(`${rel}: learning_paths 必须包含 system-architecture`);
    }
    for (const heading of REQUIRED_HEADINGS) {
      if (!page.content.includes(heading)) fail(`${rel}: 缺少 ${heading}`);
    }
    if (/\b(TODO|TBD)\b|待补充|稍后补充/i.test(page.raw)) fail(`${rel}: 含占位文本`);
    if (page.raw.includes('gulou-agent')) fail(`${rel}: 公开课程正文不得依赖 gulou-agent`);
  }

  console.log(`System architecture check passed: ${PHASES.length} phases, ${formalUnits.length} formal units.`);
  ```

- [ ] **Step 2: 注册 npm 检查命令**

  在 `website/package.json` 的 `scripts` 中加入：

  ```json
  "check:system-architecture": "node scripts/check-system-architecture.js"
  ```

- [ ] **Step 3: 运行检查并确认缺少课程入口**

  Run:

  ```bash
  cd website
  npm run check:system-architecture
  ```

  Expected: FAIL，首个错误为 `缺少文件：interests/system-architecture/_index.md`。

- [ ] **Step 4: 创建课程总入口**

  `interests/system-architecture/_index.md` 使用以下 frontmatter：

  ```yaml
  ---
  id: system-architecture-learning-path
  name: 系统架构与 AI 工程
  stage: all
  track: interests
  domain: system-architecture
  description: 面向资深开发者的系统架构、数据系统与 AI 工程学习路径
  age_range: 18y+
  estimated_duration: 12个月（每周6–8小时）
  page_type: route-index
  route_group: system-architecture-core
  review_status: draft
  ---
  ```

  正文必须包含：目标读者、非目标读者、两项学习成果、十二个月投入、十个阶段入口、四层教学模型、AI 内容推荐平台说明、掌握层级和“未完成真实验证前不扩写零基础教材”的边界。十个阶段入口使用检查脚本要求的相对链接。

- [ ] **Step 5: 创建十个阶段索引**

  每个阶段 `_index.md` 都使用 `stage: all`、`track: interests`、
  `domain: system-architecture`、`review_status: planned`，路由字段严格按下表填写：

  | 文件 | route_key | route_order | route_label | route_next |
  |---|---|---:|---|---|
  | `00-architecture-method/_index.md` | `architecture-method` | 0 | `架构方法与基线诊断` | `../01-computer-systems/_index.md` |
  | `01-computer-systems/_index.md` | `computer-systems` | 1 | `Computer Systems` | `../02-network/_index.md` |
  | `02-network/_index.md` | `network` | 2 | `Network` | `../03-distributed-systems/_index.md` |
  | `03-distributed-systems/_index.md` | `distributed-systems` | 3 | `Distributed Systems` | `../04-data-systems/_index.md` |
  | `04-data-systems/_index.md` | `data-systems` | 4 | `Data Systems` | `../05-data-architecture/_index.md` |
  | `05-data-architecture/_index.md` | `data-architecture` | 5 | `Data Architecture` | `../06-cloud-native-sre/_index.md` |
  | `06-cloud-native-sre/_index.md` | `cloud-native-sre` | 6 | `Cloud Native / SRE` | `../07-ml-systems/_index.md` |
  | `07-ml-systems/_index.md` | `ml-systems` | 7 | `ML Systems` | `../08-recommendation-systems/_index.md` |
  | `08-recommendation-systems/_index.md` | `recommendation-systems` | 8 | `Recommendation Systems` | `../09-ai-engineering/_index.md` |
  | `09-ai-engineering/_index.md` | `ai-engineering` | 9 | `AI Engineering` | 省略该字段 |

  所有页面另设 `page_type: route` 和 `route_group: system-architecture-core`。每页固定包含：
  `阶段目标`、`核心单元`、`组件映射`、`综合项目演进`、`阶段挑战`、`阅读顺序`。核心单元和
  项目演进逐字依据设计规格第 6 节压缩，不新增规格外组件；没有首批正文的阶段在“阅读顺序”
  中说明进入条件和阶段挑战，不创建空文章链接。

- [ ] **Step 6: 创建综合项目入口**

  `capstone/_index.md` 使用普通兴趣索引 frontmatter，不设置 `page_type: route`。正文固定包含：系统边界、概念架构、从单机到 1M QPS 的估算级演进、十个重复评审问题、隐私数据禁区、实验环境退出与清理要求。它不是正式知识单元，因此不使用四层标题。

- [ ] **Step 7: 把课程加入兴趣总索引**

  在 `interests/_index.md` 的“已收录兴趣领域”表中增加：

  ```markdown
  | [系统架构与 AI 工程](system-architecture/_index.md) | 面向资深开发者，从底层系统思想走向数据、云原生、推荐与 AI 工程 | 原理→组件→生产→验证 | draft |
  ```

- [ ] **Step 8: 运行课程和现有路由检查**

  Run:

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  ```

  Expected: 两个命令均 PASS；课程检查输出 `10 phases, 0 formal units`。

- [ ] **Step 9: 构建并检查生成入口**

  Run:

  ```bash
  cd website
  npm run build
  test -f site/interests/system-architecture/index.html
  rg -n "系统架构与 AI 工程|Computer Systems|Distributed Systems|AI Engineering" site/interests/system-architecture/index.html
  ```

  Expected: 构建成功，课程总页和十个阶段页面均生成；不要暂存 `website/site/`。

- [ ] **Step 10: 提交课程骨架**

  ```bash
  git add interests/_index.md interests/system-architecture website/package.json website/scripts/check-system-architecture.js
  git commit -m "feat(interests): Add system architecture course skeleton"
  ```

### Task 2: 固化作者规范和第一批来源矩阵

**Files:**
- Modify: `website/scripts/check-system-architecture.js`
- Create: `interests/system-architecture/authoring-guide.md`
- Create: `interests/system-architecture/references/source-matrix.md`
- Modify: `interests/system-architecture/_index.md`

**Interfaces:**
- Consumes: Task 1 的课程 frontmatter、四层标题契约和阶段边界。
- Produces: 后续每篇知识单元都必须遵循的作者规范；第一批正文引用的第一手资料清单。

- [ ] **Step 1: 先让检查器要求作者规范和来源矩阵**

  在 `check-system-architecture.js` 读取课程总入口后加入：

  ```js
  const requiredGuides = ['authoring-guide.md', 'references/source-matrix.md'];
  for (const rel of requiredGuides) {
    readMarkdown(path.join(COURSE, rel));
    if (!rootIndex.content.includes(`](${rel})`)) fail(`课程总入口未链接 ${rel}`);
  }
  ```

- [ ] **Step 2: 运行检查并确认作者规范缺失**

  Run: `cd website && npm run check:system-architecture`

  Expected: FAIL with `缺少文件：interests/system-architecture/authoring-guide.md`。

- [ ] **Step 3: 创建作者规范**

  `authoring-guide.md` 必须明确：

  - 完整 frontmatter 示例：`id`、`stage`、`track`、`domain`、`topic`、`age_range`、`difficulty`、`review_status`、`references`、`tags`、`learning_paths`、`related_prompts`；
  - 正式知识单元的十一项固定标题；
  - 四层分别回答的问题；
  - 组件比较不能写成排行榜；
  - 真实案例与模拟案例的标记格式；
  - 活动必须包含环境、步骤、预期观察、成功条件和清理方式；
  - 掌握度问题至少覆盖解释、应用、迁移和“不使用”的判断；
  - 版本事实写法：`组件版本 + 官方页面 + 访问日期`；
  - 禁止 `TODO`、伪造流量、伪造事故、把 ChatGPT 回答当来源、依赖 `gulou-agent`；
  - 单篇建议长度以完整解决一个问题为准，不设机械字数指标。

- [ ] **Step 4: 创建第一批来源矩阵**

  `references/source-matrix.md` 按“知识单元 / 核心问题 / 第一手资料 / 版本或访问日期 / 允许支持的结论 / 不允许外推”建表，至少收录：

  - Linux Kernel DAX：`https://docs.kernel.org/filesystems/dax.html`；
  - Linux Kernel iomap buffered I/O：`https://docs.kernel.org/filesystems/iomap/operations.html`；
  - PostgreSQL 18 WAL introduction：`https://www.postgresql.org/docs/current/wal-intro.html`；
  - Apache Kafka 4.2 Design：`https://kafka.apache.org/42/design/`；
  - Apache Kafka 4.2 topic configuration：`https://kafka.apache.org/42/configuration/topic-configs/`；
  - Apache Flink stable Fault Tolerance：`https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/`；
  - Apache Flink stable large-state checkpoint tuning：`https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/large_state_tuning/`；
  - Kubernetes StatefulSet：`https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/`；
  - Kubernetes Persistent Volumes：`https://kubernetes.io/docs/concepts/storage/persistent-volumes/`；
  - Kubernetes force-delete StatefulSet Pod：`https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/`。

  对 Kafka 4.2 Design 页面仅记录其目录入口；写正文前若具体段落在 4.2 页面不可读取，应退回 Kafka 官方当前版本的具体子页，不得用旧版本行为冒充当前行为。

- [ ] **Step 5: 在课程总入口链接两份规范**

  在 `_index.md` 的“参与编写”区域加入 `authoring-guide.md` 和 `references/source-matrix.md` 链接，并明确它们是作者材料，不是学习阶段。

- [ ] **Step 6: 验证并提交**

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  cd ..
  git add interests/system-architecture/_index.md interests/system-architecture/authoring-guide.md interests/system-architecture/references/source-matrix.md website/scripts/check-system-architecture.js
  git commit -m "docs(learning): Define architecture course authoring contract"
  ```

### Task 3: 编写 Computer Systems 单元——Page Cache 与持久化 IO

**Files:**
- Create: `interests/system-architecture/01-computer-systems/page-cache-and-durable-io.md`
- Modify: `interests/system-architecture/01-computer-systems/_index.md`
- Modify: `interests/system-architecture/references/source-matrix.md`

**Interfaces:**
- Consumes: Linux Kernel 的 Page Cache、buffered I/O、mmap/DAX 资料和作者规范。
- Produces: 后续 WAL、Kafka Log 和 Checkpoint 单元共同依赖的“写入、可见、落盘、恢复”术语边界。

- [ ] **Step 1: 在来源矩阵记录本单元事实边界**

  增加以下可支持结论：Page Cache 通常缓冲文件读写并为文件 `mmap` 提供页；buffered I/O 与直接访问路径不同；`write()` 返回、数据对其他进程可见和介质耐久不是同一事件。明确不能仅凭文档宣称某个具体硬件的掉电保证或固定性能倍数。

- [ ] **Step 2: 创建 frontmatter 和前三个教学入口**

  使用：

  ```yaml
  id: system-architecture-page-cache-durable-io-01
  stage: all
  track: interests
  domain: system-architecture
  topic: Page Cache、写入确认与持久化边界
  age_range: 18y+
  difficulty: foundational
  review_status: draft
  tags: [系统架构, Linux, Page Cache, IO, mmap, fsync]
  learning_paths: [system-architecture]
  related_prompts: [system-architecture-wal-01, system-architecture-replicated-log-01]
  ```

  “问题场景”固定使用：推荐平台事件写入文件后进程立即返回成功，但机器异常重启；要求学习者区分应用 Buffer、系统调用返回、Page Cache、文件系统写回、设备缓存和稳定介质。

- [ ] **Step 3: 编写第一层和第二层**

  第一层必须解释：页、脏页、writeback、顺序/随机 IO、`mmap`、`fsync`、批处理，以及“零拷贝”可能只减少某些复制或上下文切换而不是魔法般没有数据移动。第二层比较 Linux buffered I/O、DAX 的适用边界、Java `FileChannel.force()` 和数据库/Kafka 为什么仍需定义自己的确认语义；不把 DAX 写成通用性能建议。

- [ ] **Step 4: 编写第三层模拟案例**

  标记为“模拟案例”，给出：进程记录“写入成功”后掉电、重启后最后一批事件缺失。按现象、证据、根因、处置、预防写全；证据至少包含应用确认时间、系统调用、`fsync` 策略和恢复后的文件尾部，不编造公司名称和生产流量。

- [ ] **Step 5: 编写第四层 Node.js 实验**

  提供一个临时目录实验，比较每条记录 `fs.fsyncSync(fd)` 与批量写后一次 `fs.fsyncSync(fd)` 的耗时。明确预期是“逐条 fsync 通常增加延迟，但具体比例取决于系统”；实验不能证明真实掉电耐久。清理命令只删除实验创建的明确临时目录，不使用宽泛路径或通配删除。

- [ ] **Step 6: 完成误区、掌握度和项目应用**

  掌握度至少要求学习者解释：为什么 `write()` 成功不等于业务耐久；何时批量 fsync 合理；为什么 Page Cache 不是“浪费内存”；AI 若建议所有写都使用 mmap 或 O_DIRECT 时应追问什么。项目应用形成 ADR：推荐事件接入层的确认点、允许丢失窗口和批量策略。

- [ ] **Step 7: 接入阶段阅读顺序并验证**

  在阶段索引 `## 阅读顺序` 链接本页，运行：

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  npm run build
  test -f site/interests/system-architecture/01-computer-systems/page-cache-and-durable-io.html
  ```

- [ ] **Step 8: 提交本单元**

  ```bash
  git add interests/system-architecture/01-computer-systems interests/system-architecture/references/source-matrix.md
  git commit -m "docs(architecture): Add durable IO learning unit"
  ```

### Task 4: 编写 Data Systems 单元——Write-Ahead Log

**Files:**
- Create: `interests/system-architecture/04-data-systems/write-ahead-log.md`
- Modify: `interests/system-architecture/04-data-systems/_index.md`
- Modify: `interests/system-architecture/references/source-matrix.md`

**Interfaces:**
- Consumes: Task 3 的写入确认和持久化边界；PostgreSQL WAL 官方文档。
- Produces: 后续 replicated log 与 checkpoint 单元使用的“先记录变化、再更新主状态、通过重放恢复”模型。

- [ ] **Step 1: 记录 PostgreSQL 版本边界**

  在来源矩阵记录 PostgreSQL 当前文档显示为 18，并限定本页只用 WAL 基本原则、WAL flush 与数据页关系、checkpoint 和 crash recovery；不从 PostgreSQL 行为直接推导所有数据库实现。

- [ ] **Step 2: 创建知识单元和问题场景**

  frontmatter 使用 `id: system-architecture-wal-01`，`topic: Write-Ahead Log：从提交确认到崩溃恢复`，tags 包含 `WAL`、`PostgreSQL`、`崩溃恢复`，related prompts 指向 Page Cache 和 Replicated Log。问题场景为：推荐平台事务已返回成功，但数据页尚未写回，数据库进程突然退出。

- [ ] **Step 3: 编写第一层和第二层**

  第一层解释日志先行、LSN、redo、checkpoint、恢复起点，以及 WAL 解决的是崩溃恢复而不是自动解决副本、备份和所有业务一致性。第二层以 PostgreSQL 为主，简要对照 InnoDB redo log，只比较共同模型和不同术语；若引用 MySQL 行为，先把 `https://dev.mysql.com/doc/refman/8.4/en/innodb-redo-log.html` 加入来源矩阵。

- [ ] **Step 4: 编写第三层模拟案例**

  场景包含 checkpoint 压力、WAL 持久化延迟和误把备份等同 WAL。要求学习者用提交延迟、WAL 生成速率、checkpoint 频率和恢复时间解释问题，不使用“数据库会自动保证一切”的笼统结论。

- [ ] **Step 5: 编写第四层观察活动**

  提供 PostgreSQL 本地或容器环境下的只读观察步骤：创建测试表、执行事务、查询 `pg_current_wal_lsn()`、执行 `CHECKPOINT`、再次比较 LSN。明确该活动观察 WAL 前进和 checkpoint，不通过强制断电证明耐久；容器名称、端口和清理命令必须固定且可逆。

- [ ] **Step 6: 完成掌握度和项目 ADR**

  要求学习者区分 WAL、业务事件日志和审计日志；解释“提交成功但数据页未落盘”为何仍可恢复；指出禁用同步提交可能改变什么；为推荐平台用户行为元数据选择 RPO 并记录提交策略。

- [ ] **Step 7: 接入、验证并提交**

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  npm run build
  cd ..
  git add interests/system-architecture/04-data-systems interests/system-architecture/references/source-matrix.md
  git commit -m "docs(architecture): Explain WAL and crash recovery"
  ```

### Task 5: 编写 Distributed Systems 单元——Replicated Log

**Files:**
- Create: `interests/system-architecture/03-distributed-systems/replicated-log.md`
- Modify: `interests/system-architecture/03-distributed-systems/_index.md`
- Modify: `interests/system-architecture/references/source-matrix.md`

**Interfaces:**
- Consumes: Tasks 3–4 的本地持久化与 WAL 模型；Kafka 4.2 官方设计和配置文档。
- Produces: “本地日志不等于分布式耐久”“commit 必须结合副本集合和选主规则解释”的模型。

- [ ] **Step 1: 固定 Kafka 事实清单**

  来源矩阵只允许正文陈述官方当前文档可确认的：topic-partition 是有序追加日志；副本单位是 partition；leader/follower、ISR、`acks`、`min.insync.replicas` 和 unclean leader election 共同决定可用性与耐久性。Kafka 数据分区复制与 KRaft 元数据共识必须分开描述。

- [ ] **Step 2: 创建单元和失败场景**

  使用 `id: system-architecture-replicated-log-01`，topic 为“Replicated Log：副本、提交与选主”，问题场景为三 broker、replication factor 3、一个 follower 落后时 leader 故障；要求判断已确认消息是否仍在新 leader 上。

- [ ] **Step 3: 编写底层思想和组件落地**

  第一层解释顺序、复制进度、commit point、quorum overlap、leader 完整性和 fencing。第二层比较 Kafka ISR 与多数派 quorum/Raft 的差异，明确 Kafka partition 数据复制不能简单写成“就是 Raft”；解释 `acks=all` 必须结合最小 ISR 阅读。

- [ ] **Step 4: 编写生产模拟和故障矩阵**

  创建 3 broker × `acks` × `min.insync.replicas` × follower 状态表，逐格判断写入可用性、确认语义和潜在丢失窗口。把 unclean leader election 标为一致性与可用性的显式选择，不把“高可用”当无条件保证。

- [ ] **Step 5: 编写架构评审活动**

  给出一份刻意有缺陷的 AI 建议：“RF=3 且 acks=all，所以任何两台机器同时故障也不会丢数据”。要求学习者列出缺少的 ISR、故障时序、持久化、选主和跨故障域假设，并写出修订后的有限保证。

- [ ] **Step 6: 接入、验证并提交**

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  npm run build
  cd ..
  git add interests/system-architecture/03-distributed-systems interests/system-architecture/references/source-matrix.md
  git commit -m "docs(architecture): Add replicated log learning unit"
  ```

### Task 6: 编写 Data Architecture 单元——Checkpoint 与 Replay

**Files:**
- Create: `interests/system-architecture/05-data-architecture/checkpoint-and-replay.md`
- Modify: `interests/system-architecture/05-data-architecture/_index.md`
- Modify: `interests/system-architecture/references/source-matrix.md`

**Interfaces:**
- Consumes: Tasks 4–5 的日志、offset、重放和提交边界；Flink 2.3 stable fault tolerance 文档。
- Produces: 状态快照、输入位置、barrier、恢复与端到端 exactly-once 条件的统一解释。

- [ ] **Step 1: 记录 Flink 版本和可支持结论**

  来源矩阵记录 stable 文档在访问日指向 2.3.0。允许陈述 snapshot 包含 operator state 与 source position、checkpoint barrier 和 alignment、恢复依赖可重放 source、端到端 exactly-once 还要求 transactional 或 idempotent sink；不能外推为“每条事件在物理上只执行一次”。

- [ ] **Step 2: 创建单元和问题场景**

  使用 `id: system-architecture-checkpoint-replay-01`，问题场景为 Flink 作业处理 Kafka 事件并写下游，在 checkpoint n 完成后、n+1 未完成时 TaskManager 故障。

- [ ] **Step 3: 编写四层主体**

  - 底层思想：状态 + 输入位置、consistent cut、barrier、alignment、replay、RPO/RTO；
  - 组件落地：Flink checkpoint、savepoint、state backend 和 checkpoint storage；对照数据库 checkpoint，但不宣称两者语义相同；
  - 生产案例：大状态 checkpoint 变慢、barrier 在背压下延迟、恢复后追赶输入；明确标注模拟场景；
  - 验证活动：手工跟踪双输入 operator 的 barrier 到达顺序，画出 checkpoint n 包含与不包含的事件，并判断 idempotent sink 与非幂等 sink 的结果。

- [ ] **Step 4: 完成掌握度和项目应用**

  要求学习者解释 checkpoint 间隔的运行开销与恢复时间权衡；区分 checkpoint 与 backup；指出 exactly-once 的系统边界；为推荐特征流水线定义 checkpoint 间隔假设、允许重放窗口和 sink 幂等策略。

- [ ] **Step 5: 接入、验证并提交**

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  npm run build
  cd ..
  git add interests/system-architecture/05-data-architecture interests/system-architecture/references/source-matrix.md
  git commit -m "docs(architecture): Add checkpoint and replay unit"
  ```

### Task 7: 编写 Cloud Native / SRE 单元——有状态恢复

**Files:**
- Create: `interests/system-architecture/06-cloud-native-sre/stateful-recovery.md`
- Modify: `interests/system-architecture/06-cloud-native-sre/_index.md`
- Modify: `interests/system-architecture/references/source-matrix.md`

**Interfaces:**
- Consumes: Tasks 3–6 的本地状态、副本、checkpoint、RPO/RTO；Kubernetes StatefulSet、PV 和 force-delete 官方文档。
- Produces: “编排器恢复进程不等于恢复应用数据或分布式一致性”的运维边界。

- [ ] **Step 1: 固定 Kubernetes 结论边界**

  来源矩阵允许陈述 StatefulSet 提供稳定身份、顺序和持久卷关联；PV 生命周期独立于单个 Pod；控制器协调 desired/current state。明确 Kubernetes 不自动为应用数据提供副本协议、一致性、备份或正确 fencing。

- [ ] **Step 2: 创建单元和问题场景**

  使用 `id: system-architecture-stateful-recovery-01`。问题场景为运行 Kafka/Flink 状态服务的节点网络分区，Pod 长时间 Unknown，操作者考虑 force delete；要求区分节点真的死亡与仍运行但失联。

- [ ] **Step 3: 编写四层主体**

  第一层解释 desired state、身份、存储生命周期、fencing、RPO 和 RTO；第二层比较 Deployment、StatefulSet、PV/PVC 和应用级复制；第三层引用 Kubernetes 官方 force-delete 风险作为可核验案例，说明重复身份可能导致 split brain；第四层要求画出“Pod 重建、卷重新挂载、应用日志恢复、重新加入副本组”的时序并标出每一步所有者。

- [ ] **Step 4: 增加恢复演练检查表**

  检查表必须包括：确认节点状态、确认最后 durable point、阻止旧实例重新写入、验证卷和副本、恢复服务、验证数据、解除降级、记录时间。禁止把 `kubectl delete --force` 写成默认处理步骤。

- [ ] **Step 5: 接入、验证并提交**

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  npm run build
  cd ..
  git add interests/system-architecture/06-cloud-native-sre interests/system-architecture/references/source-matrix.md
  git commit -m "docs(architecture): Add stateful recovery unit"
  ```

### Task 8: 汇总纵向切片、增加学习验证协议并锁定第一批范围

**Files:**
- Modify: `website/scripts/check-system-architecture.js`
- Create: `interests/system-architecture/capstone/log-state-recovery-review.md`
- Create: `interests/system-architecture/capstone/validation-protocol.md`
- Modify: `interests/system-architecture/capstone/_index.md`
- Modify: `interests/system-architecture/_index.md`
- Modify: `interests/system-architecture/01-computer-systems/page-cache-and-durable-io.md`
- Modify: `interests/system-architecture/03-distributed-systems/replicated-log.md`
- Modify: `interests/system-architecture/04-data-systems/write-ahead-log.md`
- Modify: `interests/system-architecture/05-data-architecture/checkpoint-and-replay.md`
- Modify: `interests/system-architecture/06-cloud-native-sre/stateful-recovery.md`

**Interfaces:**
- Consumes: Tasks 3–7 的术语、失败模式、ADR 和活动。
- Produces: 一次端到端架构评审；真实学习者验证表；检查器对首批文件集合的硬性要求。

- [ ] **Step 1: 先让检查器要求完整纵向切片**

  在检查器中加入：

  ```js
  const REQUIRED_SLICE = [
    '01-computer-systems/page-cache-and-durable-io.md',
    '03-distributed-systems/replicated-log.md',
    '04-data-systems/write-ahead-log.md',
    '05-data-architecture/checkpoint-and-replay.md',
    '06-cloud-native-sre/stateful-recovery.md',
    'capstone/log-state-recovery-review.md',
  ];
  for (const rel of REQUIRED_SLICE) readMarkdown(path.join(COURSE, rel));
  readMarkdown(path.join(COURSE, 'capstone/validation-protocol.md'));
  ```

- [ ] **Step 2: 运行检查并确认 capstone 缺失**

  Run: `cd website && npm run check:system-architecture`

  Expected: FAIL with `缺少文件：interests/system-architecture/capstone/log-state-recovery-review.md`。

- [ ] **Step 3: 创建端到端评审单元**

  `log-state-recovery-review.md` 使用正式知识单元 frontmatter，`id: system-architecture-log-state-recovery-capstone-01`。四层内容分别承担：

  - 底层思想：用 state、log、snapshot、replica、replay、fencing、RPO/RTO 画统一模型；
  - 组件落地：串联 Linux Page Cache、PostgreSQL WAL、Kafka replicated log、Flink checkpoint、Kubernetes stateful recovery；
  - 生产模拟：推荐事件从 API 到在线特征的完整故障时序，至少包含五个失败点；
  - 架构判断：提交 state inventory、durability matrix、failure matrix、容量估算、恢复 runbook 和一份 AI 方案评审。

  ML、Recommendation 和 AI Engineering 只在最后说明模型/Prompt/索引版本如何进入 replay 与 rollback；首批不新增这些阶段的正式正文。

- [ ] **Step 4: 创建真实学习者验证协议**

  `validation-protocol.md` 是验证表而非正式知识单元，必须记录：

  - 学习者背景和已知技术；
  - 每页开始/结束时间；
  - 无法解释的术语；
  - 实验环境和是否完成；
  - 预期观察与实际观察差异；
  - 四层中最有用和最薄弱的部分；
  - 能否独立完成综合评审；
  - AI 评审题识别出的缺陷；
  - 建议删除、合并、前移或后移的内容；
  - 结论：通过、需小修后复测、结构需重做。

  验证协议明确：第一位目标学习者可以是项目所有者本人，但不能只勾选“读过”；必须提交综合评审产物和耗时记录。

- [ ] **Step 5: 建立双向链接**

  五个知识单元的“在综合项目中的应用”链接 capstone；capstone 按依赖顺序链接五个单元；课程总入口和 capstone 索引链接验证协议。检查没有形成指向未创建 ML/推荐/AI 正文的链接。

- [ ] **Step 6: 运行全量技术验收**

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  npm run build
  npm run check:breadcrumbs
  ! rg -n "TODO|TBD|待补充|稍后补充" ../interests/system-architecture
  git -C .. diff --check
  ```

  Expected: 所有 npm 检查和构建 PASS；占位文本扫描无匹配；`git diff --check` 无输出。

- [ ] **Step 7: 检查生成页面但不提交生成目录**

  ```bash
  test -f site/interests/system-architecture/capstone/log-state-recovery-review.html
  rg -n "底层思想|组件设计落地|生产实践与真实案例|动手验证与架构判断" site/interests/system-architecture/capstone/log-state-recovery-review.html
  git -C .. status --short
  ```

  Expected: capstone 页面生成并包含四层标题；Git 状态不包含 `website/site/` 或 `node_modules/`。

- [ ] **Step 8: 提交纵向切片汇总**

  ```bash
  git add interests/system-architecture website/scripts/check-system-architecture.js
  git commit -m "docs(architecture): Complete log recovery learning slice"
  ```

### Task 9: 执行第一批发布门和人工验证交接

**Files:**
- Review only: `interests/system-architecture/**`
- Review only: `website/scripts/check-system-architecture.js`
- Review only: `docs/superpowers/specs/2026-08-30-system-architecture-learning-path-design.md`
- Review only: `docs/superpowers/plans/2026-08-30-system-architecture-learning-path.md`

**Interfaces:**
- Consumes: Tasks 1–8 的已提交成果。
- Produces: 可交给目标学习者验证的第一批课程；明确停止，不自动进入其余阶段正文。

- [ ] **Step 1: 对照设计规格逐项审计范围**

  确认第一批只有：总入口、十个阶段索引、capstone 入口、作者规范、来源矩阵、五个知识单元、一个综合评审和一个验证协议。任何额外正式正文都应移出本批或先修改规格与计划。

- [ ] **Step 2: 运行最终验证**

  ```bash
  cd website
  npm run check:system-architecture
  npm run check:routes
  npm run build
  npm run check:breadcrumbs
  cd ..
  git diff --check
  git status --short --branch
  ```

  Expected: 所有检查 PASS；工作区干净；分支为 `docs/system-architecture-learning-path`。

- [ ] **Step 3: 生成交接摘要**

  向项目所有者报告：课程入口、五个单元、capstone、验证协议、验证命令、当前 `review_status`，以及尚未开始的阶段。不得声称课程“已验证有效”。

- [ ] **Step 4: 停在人工验证门**

  项目所有者按 `capstone/validation-protocol.md` 完成实际学习。只有在记录结果为“通过”或“小修后复测通过”，并将反馈转成明确变更后，才能另写下一批 Computer Systems、Network、Distributed Systems 主干扩展计划。

---

## Execution Checkpoints

1. **Task 1 后：骨架检查点** — 审阅课程名称、十阶段顺序、阶段边界和路由体验。
2. **Task 2 后：写作契约检查点** — 审阅四层模板、来源标准和版权边界。
3. **Task 5 后：中段一致性检查点** — 确认 Page Cache、WAL、Replicated Log 没有术语冲突。
4. **Task 8 后：纵向切片检查点** — 技术检查通过，但状态仍是 draft。
5. **Task 9 后：人工验证门** — 停止自动扩写，等待真实学习记录。

## Definition of Done for This Plan

- 课程总入口、十个阶段索引和 capstone 入口可从兴趣总索引访问。
- `npm run check:system-architecture`、现有路由检查、面包屑检查和网站构建全部通过。
- 五个知识单元均包含完整四层、明确来源、失败模式、适用边界、活动和项目应用。
- 综合评审能把 Page Cache、WAL、Replicated Log、Checkpoint 和 Stateful Recovery 串成同一状态恢复模型。
- 没有伪造生产案例、未标记模拟案例、占位内容或对 `gulou-agent` 的依赖。
- 所有正文保持 `review_status: draft`。
- 验证协议可以记录真实学习耗时、实验结果、理解缺口和综合评审表现。
- 实施在人工验证门停止；没有批量生成其余阶段正文。
