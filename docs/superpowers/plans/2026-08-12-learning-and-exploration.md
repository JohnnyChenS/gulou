# 学习与探索知识路径实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `gulou-core` 中建立覆盖 0–18 岁的“学习与探索”知识主线，补齐学习习惯、好奇心、学校学习、学习能力和兴趣拓展之间的导航与内容缺口。

**Architecture:** 新增一个跨年龄路径入口、六篇年龄补充文章和一篇跨年龄兴趣指南。年龄文章继续放在现有阶段的认知与心理目录中，并通过链接复用已有执行功能、阅读、创新思维、循证学习和学业压力内容；仅修改路径与索引导航，不复制生成目录。

**Tech Stack:** Markdown、YAML frontmatter、相对 Markdown 链接、现有静态网站构建脚本。

## Global Constraints

- 只修改 `gulou-core`，不修改 `gulou-agent` 或其知识清单。
- 新文章保持 `review_status: draft`，直到完成人工内容和安全审阅。
- 0–3 岁写学习地基与探索机会，不写提前识字、算术或坐定训练。
- 不承诺提高智商、保证提分、统一学习时长或错过关键期即无法补救。
- 兴趣建议允许低成本试用、暂停、转向和退出，不提供必报班清单。
- 涉及持续影响学校、家庭或社交功能的困难时，明确建议与老师或专业人员沟通。
- 使用 `humanizer-zh`：具体、自然、少口号，避免破折号堆叠、三段式口号和模糊归因。
- 不手工修改 `website/site/`、`word/docx/` 等生成目录。

---

### Task 1: 建立总入口与兴趣发现框架

**Files:**
- Create: `paths/learning/_index.md`
- Create: `paths/learning/interest-discovery.md`
- Modify: `paths/_index.md`
- Modify: `interests/_index.md`

**Interfaces:**
- Consumes: 现有 `paths/brain-health/evidence-based-learning.md`、`paths/language/*`、`interests/mountaineering/_index.md`。
- Produces: 供六篇年龄文章和各阶段路径引用的学习主线入口与兴趣循环。

- [ ] **Step 1: 写总入口**
  - 包含使用说明、年龄导航表、五个主题的关系、正常差异说明，以及“每次只选一个小动作”的阅读顺序。
  - 为每个年龄段同时链接新文章和至少一篇已有文章。
- [ ] **Step 2: 写兴趣发现指南**
  - 按“观察线索 → 低成本试用 → 过程复盘 → 决定继续 → 逐步深入或退出”组织。
  - 覆盖家庭资源、孩子自主性、兴趣班选择、屏幕兴趣、项目记录和与学校协作的边界。
- [ ] **Step 3: 更新两个索引**
  - 在 `paths/_index.md` 增加学习与探索路径表。
  - 在 `interests/_index.md` 增加跨年龄兴趣发现入口，并保留具体兴趣路径的独立性。
- [ ] **Step 4: 检查链接与格式**
  - 运行 `git diff --check`，并用 `rg` 检查所有新路径目标是否存在。
- [ ] **Step 5: 提交入口变更**
  - `git add paths/learning paths/_index.md interests/_index.md`
  - `git commit -m "docs(learning): Add learning and interest path"`

### Task 2: 补写 0–3 岁与 3–6 岁基础文章

**Files:**
- Create: `stages/家庭期（25-45岁）/育儿指导/0-3岁/认知与心理/learning-foundations-01.md`
- Create: `stages/家庭期（25-45岁）/育儿指导/3-6岁/认知与心理/curiosity-and-learning-01.md`
- Modify: `paths/0-3/cognitive-psychological.md`
- Modify: `paths/3-6/cognitive-psychological.md`
- Modify: 对应年龄段 `_index.md`

**Interfaces:**
- Consumes: 0–3 岁安全依恋、因果关系推理、联合注意、早期阅读、符号思维；3–6 岁执行功能、专注力、前阅读与前数学。
- Produces: 两篇能被总入口和年龄路径引用的学习基础文章。

- [ ] **Step 1: 写 0–3 岁文章**
  - frontmatter 使用 `stage: "0-3"`、`domain: cognitive-psychological`、`review_status: draft`。
  - 写回应、共同注意、语言命名、自由探索、因果游戏、假装游戏、共同阅读和屏幕边界。
  - 明确观察信号和需要儿科/发育行为评估的功能性红旗，不用单次里程碑诊断。
- [ ] **Step 2: 写 3–6 岁文章**
  - 写问题驱动的游戏、短任务、专注保护、转换预告、共同阅读、生活数学和失败后再试。
  - 复用执行功能和专注文章，不重复游戏清单。
- [ ] **Step 3: 更新路径与阶段索引**
  - 在现有步骤后加入新文章作为桥接入口，保留原有步骤顺序。
- [ ] **Step 4: 检查年龄边界和禁用承诺**
  - `rg -n "保证提分|提高智商|越早越好|错过关键期"` 检查新文件。
- [ ] **Step 5: 提交基础文章**
  - `git add 'stages/家庭期（25-45岁）/育儿指导/0-3岁/认知与心理/learning-foundations-01.md' 'stages/家庭期（25-45岁）/育儿指导/3-6岁/认知与心理/curiosity-and-learning-01.md' paths/0-3/cognitive-psychological.md paths/3-6/cognitive-psychological.md`
  - `git commit -m "docs(learning): Add early learning foundations"`

### Task 3: 补写 6–9 岁与 9–12 岁学习文章

**Files:**
- Create: `stages/家庭期（25-45岁）/育儿指导/6-9岁/认知与心理/school-learning-habits-01.md`
- Create: `stages/家庭期（25-45岁）/育儿指导/9-12岁/认知与心理/self-regulated-learning-01.md`
- Modify: `paths/6-9/cognitive-psychological.md`
- Modify: `paths/9-12/cognitive-psychological.md`
- Modify: 对应年龄段 `_index.md`

**Interfaces:**
- Consumes: 独立阅读、口头表达、创造性思维、创新思维、循证学习方法、睡眠与运动文章。
- Produces: 从入学适应过渡到自我调节学习的两篇文章。

- [ ] **Step 1: 写 6–9 岁文章**
  - 覆盖到校、听懂任务、准备环境、开始作业、提出具体问题、阅读理解、基础知识积累和反馈后的修改。
  - 将“作业拖延”拆成启动困难、任务不懂、疲劳或环境干扰，不只归因为懒。
- [ ] **Step 2: 写 9–12 岁文章**
  - 覆盖具体目标、先回忆再看答案、间隔复习、错误分类、知识网络、小项目和简单复盘。
  - 明确“会做练习题”与“能在新情境使用”的差别。
- [ ] **Step 3: 更新路径与索引**
  - 在各路径“待创建内容”中替换为新入口或补充步骤，不删除未覆盖主题。
- [ ] **Step 4: 检查方法边界**
  - 新文链接循证学习方法，避免把番茄钟、奖励或成长型思维写成普遍有效处方。
- [ ] **Step 5: 提交学龄文章**
  - `git add 'stages/家庭期（25-45岁）/育儿指导/6-9岁/认知与心理/school-learning-habits-01.md' 'stages/家庭期（25-45岁）/育儿指导/9-12岁/认知与心理/self-regulated-learning-01.md' paths/6-9/cognitive-psychological.md paths/9-12/cognitive-psychological.md`
  - `git commit -m "docs(learning): Add school learning habits"`

### Task 4: 补写 12–14 岁与 14–18 岁自主学习文章

**Files:**
- Create: `stages/家庭期（25-45岁）/育儿指导/12-14岁/认知与心理/metacognition-learning-strategies-01.md`
- Create: `stages/家庭期（25-45岁）/育儿指导/14-18岁/认知与心理/autonomous-learning-and-interest-01.md`
- Modify: `paths/12-14/cognitive-psychological.md`
- Modify: `paths/parenting/parent-adolescent.md`
- Modify: 对应年龄段 `_index.md`

**Interfaces:**
- Consumes: 学业压力与时间管理、数字素养、升学压力、数字生活、心理健康和循证学习文章。
- Produces: 适合青春期的自我监控、方向探索和兴趣深入入口。

- [ ] **Step 1: 写 12–14 岁文章**
  - 写目标拆分、时间估计、学习后自测、反馈使用、信息来源判断、与老师沟通和压力信号。
  - 让家长从监督者转为共同复盘者，保留安全与健康边界。
- [ ] **Step 2: 写 14–18 岁文章**
  - 写自主计划、学科选择、兴趣项目、作品/过程记录、寻找导师、考试与长期方向平衡。
  - 明确可以调整方向，不用一次选择决定职业；遇到持续拒学、自伤或严重功能下降时沿用现有专业支持提示。
- [ ] **Step 3: 更新青春期路径与索引**
  - 保留既有学业压力和心理健康文章，将新文章作为学习与兴趣的连接入口。
- [ ] **Step 4: 检查心理安全语言**
  - 不把成绩下降或拖延写成品格问题；链接现有危机文章。
- [ ] **Step 5: 提交青春期文章**
  - `git add 'stages/家庭期（25-45岁）/育儿指导/12-14岁/认知与心理/metacognition-learning-strategies-01.md' 'stages/家庭期（25-45岁）/育儿指导/14-18岁/认知与心理/autonomous-learning-and-interest-01.md' paths/12-14/cognitive-psychological.md paths/parenting/parent-adolescent.md`
  - `git commit -m "docs(learning): Add adolescent learning autonomy"`

### Task 5: 全库验证与审阅准备

**Files:**
- Modify only if verification finds broken links or navigation omissions.

- [ ] **Step 1: 校验 frontmatter 与文件目标**
  - 用脚本读取每个新增 Markdown 的 frontmatter，确认 `id`、`stage`、`track`、`domain`、`topic`、`age_range`、`difficulty`、`review_status` 存在。
  - 用 `rg` 列出新文中的相对链接并确认目标文件存在。
- [ ] **Step 2: 扫描不合格表述**
  - `rg -n "保证提分|提高智商|开发大脑|错过关键期|天才|必须每天|一定会" paths/learning stages/家庭期（25-45岁）/育儿指导/*/认知与心理/*learning*.md stages/家庭期（25-45岁）/育儿指导/*/认知与心理/*interest*.md`
  - 对必要的引用性误区逐处改成校准表述。
- [ ] **Step 3: 运行仓库已有检查**
  - 先查看 `package.json` 和 `README` 的构建说明，再运行项目已有的链接/网站构建命令。
  - 若完整构建受环境依赖阻塞，记录具体命令和错误，不把未运行的检查写成通过。
- [ ] **Step 4: 人工复核**
  - 按 `humanizer-zh` 检查标题、段落节奏、破折号、口号、模糊归因和重复三项结构。
  - 按安全标准抽查 0–3、6–9、14–18 三篇，确认正常差异、家庭支持和专业求助边界清楚。
- [ ] **Step 5: 汇总状态**
  - `git diff --check`、`git status --short --branch`、`git log -5 --oneline`。
  - 输出新增文件、验证结果、未解决的环境问题和待人工审阅事项。
