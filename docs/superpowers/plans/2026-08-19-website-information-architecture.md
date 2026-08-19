# 网站信息架构重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将鼓楼网站收敛为“人生阶段 → 家庭期场景 → 孩子年龄 → 阶段能力 → 具体内容”的单一主路径，同时保留旧路径的可访问性。

**Architecture:** 首页和顶部导航只负责把用户带到人生阶段；家庭期 Markdown 页面负责场景分流；育儿指导索引负责年龄选择；年龄页负责把能力主线、培养过程和深入文章串起来。现有 `paths/` 路由继续由静态构建器生成，但变为年龄页可引用的辅助索引。

**Tech Stack:** Node.js、`marked`、`gray-matter`、静态 Markdown 构建器、现有 `validate-routes.js` 路由检查。

**Spec:** `docs/superpowers/specs/2026-08-19-website-information-architecture-design.md`

## Global Constraints

- 不删除家庭期之外的未来阶段内容。
- 不把 Agent 的 MVP 选择逻辑放入公开网站；MVP 选择仍由 `gulou-agent` manifest 控制。
- 不手工编辑生成目录 `website/site/`；所有网站输出由 `website/scripts/build-site.js` 生成。
- 新主题必须归入适用年龄页的能力主线或培养过程，不创建新的首页或顶部导航入口。
- 旧 `paths/` 页面继续可访问，并明确指向新的规范入口。
- 涉及健康、心理和发展风险的文字只做结构整理和已有内容链接，不新增未经审核的诊断结论。

---

### Task 1: 收敛首页和顶部导航

**Files:**
- Modify: `website/scripts/build-site.js:235-247` (`renderTopNav`)
- Modify: `website/scripts/build-site.js:436-512` (`renderHomePageWithRoutes`)
- Test: `website/site/index.html`（构建生成，不能手工编辑）

**Interfaces:**
- Consumes: `registry.byRel` 中的 `stages/*/_index.md` 页面，以及现有 `resolvePath()`、`siteUrl()`、`renderPage` 辅助函数。
- Produces: 仍由 `build()` 调用的 `renderHomePageWithRoutes(registry)`，输出人生阶段主入口首页；顶部导航输出阶段、参考、贡献和 GitHub 链接。

- [ ] **Step 1: 先建立当前输出基线**

  在修改前运行：

  ```bash
  cd website
  npm run build
  rg -n "按年龄|按问题|主题路径|孩子现在多大|我现在想解决什么" site/index.html
  ```

  预期：当前首页仍包含这些并列入口，用作后续验证修改确实生效的基线。

- [ ] **Step 2: 定义阶段卡片数据来源**

  在 `build-site.js` 中使用现有 `registry.byRel` 获取根阶段索引，不再硬编码过时的 `stages/family/` 等路径。按现有首页顺序使用以下目录名排序，并用 `resolvePath()` 生成链接：

  ```js
  const stageOrder = [
    '青春期（14-18岁）',
    '大学期（18-22岁）',
    '职场开始（22-28岁）',
    '职场发展（28-40岁）',
    '家庭期（25-45岁）',
    '中年期（40-60岁）',
    '老年期（60+岁）',
  ];
  const stagePages = stageOrder
    .map(name => registry.byRel.get(`stages/${name}/_index.md`))
    .filter(Boolean);
  ```

  卡片标题使用 `stage_name` 和 `age_range`，未完善阶段保留当前“未完善”标记；家庭期卡片链接到 `stages/family/` 的生成路径。

- [ ] **Step 3: 重写顶部导航**

  将 `renderTopNav()` 的并列入口改为以下链接，沿用 `siteUrl()` 处理站内路径：

  ```html
  <a href="${siteUrl('stages/')}">人生阶段</a>
  <a href="${siteUrl('references/')}">知识参考</a>
  <a href="https://github.com/JohnnyChenS/gulou/blob/main/CONTRIBUTING.md">参与贡献</a>
  <a href="https://github.com/JohnnyChenS/gulou">GitHub</a>
  ```

  删除“开始使用”、按年龄、按问题和主题路径的并列链接。

- [ ] **Step 4: 重写首页内容顺序**

  保留“为什么叫鼓楼”，并将 `renderHomePageWithRoutes()` 的主体改为：项目说明、项目动机、项目规划、现阶段目标、人生阶段卡片、参与贡献。删除年龄路线卡片、问题路线卡片和“直接浏览”作为首页入口的区块。

  首页至少应包含以下可检索文案和链接：

  ```html
  <h2>为什么叫鼓楼</h2>
  <h2>鼓楼是什么</h2>
  <h2>项目动机</h2>
  <h2>项目规划</h2>
  <h2>现阶段目标</h2>
  <h2>按人生阶段探索</h2>
  ```

  “现阶段目标”明确 0–3 岁新手父母是当前优先服务对象，并以“观察问题 → 找到下一步行动”描述使用方式。

- [ ] **Step 5: 构建并验证首页导航**

  ```bash
  cd website
  npm run build
  rg -n "人生阶段|知识参考|参与贡献|GitHub|为什么叫鼓楼|现阶段目标|按人生阶段探索" site/index.html
  ! rg -n "按年龄|按问题|主题路径|学习路径|孩子现在多大|我现在想解决什么" site/index.html
  ```

  预期：第一条命令能找到新的主路径文案，第二条命令无匹配；生成首页中的所有阶段卡片链接都指向实际 `stages/` 页面。

- [ ] **Step 6: 提交首页与导航改动**

  ```bash
  git add website/scripts/build-site.js
  git commit -m "ref(website): Make life stages the home entry"
  ```

### Task 2: 重整家庭期场景和育儿指导索引

**Files:**
- Modify: `stages/家庭期（25-45岁）/_index.md`
- Create: `stages/家庭期（25-45岁）/育儿指导/_index.md`
- Review: `stages/家庭期（25-45岁）/育儿指导/父母自身/_index.md`

**Interfaces:**
- Consumes: 六个年龄页、父母自身索引和现有发展评估/深入路径链接。
- Produces: 家庭期场景选择页和明确的年龄选择页，供首页阶段卡片和年龄页返回链接使用。

- [ ] **Step 1: 记录家庭期现有链接清单**

  修改前运行，确认要迁移的公开内容没有遗漏：

  ```bash
  rg -n "\]\(" "stages/家庭期（25-45岁）/_index.md" "stages/家庭期（25-45岁）/育儿指导/父母自身/_index.md"
  ```

  现有年龄页、发展评估、父母支持文章和学习路径链接都必须在新页面或对应年龄页中继续有入口。

- [ ] **Step 2: 将家庭期首页改为场景分流**

  保留 frontmatter 和阶段概述，把首屏改为两个明确入口：

  ```markdown
  ## 先选择你现在要处理的事情

  ### [育儿指导（0–18 岁）](育儿指导/_index.md)

  先选择孩子的年龄，再看该阶段的关注点、能力主线和具体培养内容。

  ### [父母自身支持](育儿指导/父母自身/_index.md)

  关注孕产适应、睡眠剥夺、育儿压力、自我照顾和关系维护。
  ```

  将原来的年龄大表、父母支持大表和路线图改为“详细内容”区域的简短索引或下一级页面链接；不删除链接目标。保留“待创建内容”作为未来规划，但不把空内容变成当前入口。

- [ ] **Step 3: 创建育儿指导年龄索引**

  创建带有 `stage: "family"`、`stage_name: 育儿指导`、`age_range: 0-18岁` 的 `_index.md`，正文按以下顺序提供六张年龄卡片/列表：

  ```markdown
  # 育儿指导（0–18 岁）

  先按孩子当前年龄选择入口。年龄是导航起点，不是硬性分界；遇到跨阶段问题时，可以回到相邻阶段查看。

  - [0–3 岁：依恋、安全感与发展基础](0-3岁/_index.md)
  - [3–6 岁：生活自理、好奇心与游戏中的学习](3-6岁/_index.md)
  - [6–9 岁：学校适应、学习习惯与阅读](6-9岁/_index.md)
  - [9–12 岁：自我调节、理解力与持续探索](9-12岁/_index.md)
  - [12–14 岁：元认知、信息判断与青春期适应](12-14岁/_index.md)
  - [14–18 岁：自主学习、兴趣项目与方向选择](14-18岁/_index.md)
  ```

  页面底部提供父母自身支持和辅助问题索引链接，但不把它们与六个年龄入口混成同一层级。

- [ ] **Step 4: 补充父母自身索引的返回入口**

  在 `父母自身/_index.md` 的概述后增加返回家庭期和进入育儿指导年龄索引的链接，保持现有能力清单和理论依据不变。

- [ ] **Step 5: 检查家庭期层级**

  ```bash
  cd website
  npm run build
  rg -n "育儿指导|父母自身|0–3|3–6|6–9|9–12|12–14|14–18" site/stages/family/index.html site/stages/family/parenting/index.html
  ```

  预期：家庭期页面首先提供两个场景链接，育儿指导页面提供六个年龄链接；详细文章仍可从父母自身和年龄页访问。

- [ ] **Step 6: 提交家庭期内容重整**

  ```bash
  git add "stages/家庭期（25-45岁）/_index.md" "stages/家庭期（25-45岁）/育儿指导/_index.md" "stages/家庭期（25-45岁）/育儿指导/父母自身/_index.md"
  git commit -m "ref(content): Organize family stage entry points"
  ```

### Task 3: 统一六个年龄页的能力主线和培养顺序

**Files:**
- Modify: `stages/家庭期（25-45岁）/育儿指导/0-3岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/3-6岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/6-9岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/9-12岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/12-14岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/14-18岁/_index.md`

**Interfaces:**
- Consumes: 各年龄已有能力表、发展评估、照护文章和 `paths/learning` 辅助路线。
- Produces: 统一顺序的年龄页，并将学习能力、好奇心、兴趣探索和脑科学相关内容放入对应年龄主线。

- [ ] **Step 1: 为每个年龄页加入阶段关注点**

  在阶段概述后、发展评估前加入 `## 阶段关注点`，每页只列 3–5 项当前优先任务：

  ```markdown
  ## 阶段关注点

  - 先处理这个阶段最重要的安全感、关系和身体基础。
  - 把学习与探索放进真实生活，不急着提前进行学科化训练。
  - 通过可观察的日常行为判断是否需要调整支持方式。
  ```

  六个页面分别按以下方向改写具体表述，不复制另一年龄段的整段文字：0–3 岁强调回应式照料、共同注意和安全探索；3–6 岁强调游戏、提问、执行功能和生活自理；6–9 岁强调学校适应、任务启动、阅读和提问；9–12 岁强调目标、检索、错误修正和项目探索；12–14 岁强调元认知、时间规划、信息判断和青春期沟通；14–18 岁强调自主学习、兴趣项目、方向调整和安全边界。

- [ ] **Step 2: 把现有认知表重命名为能力培养主线**

  将各页的 `## 认知与心理主线`（14–18 岁为父母视角）纳入 `## 能力培养主线` 下，保留原有表格和链接。0–3 岁将“月龄速查表”改成 `## 培养过程：月龄速查表`，将原“能力清单”改成 `### 认知与心理`、`### 身体能力`，避免丢失月龄照护细节。

- [ ] **Step 3: 补齐各年龄的学习与探索入口**

  在现有能力表中使用已有文章，不创建新顶层目录：

  - 0–3 岁：保留并突出“学习与探索的地基”、共同注意、早期阅读和自由探索。
  - 3–6 岁：突出好奇心与学习准备、执行功能、前阅读，并补充兴趣尝试的说明。
  - 6–9 岁：突出学校学习习惯、独立阅读、提问和创造性思维。
  - 9–12 岁：突出自我调节学习中的目标、提取、错误修正和小项目。
  - 12–14 岁：突出元认知与学习策略、时间估计、信息判断和压力调节。
  - 14–18 岁：突出自主学习、兴趣深入、项目实践和方向调整。

  对应文章优先使用当前年龄目录下已经存在的 `认知与心理/*.md` 文件；确实需要跨主题索引时，从“深入阅读”链接到 `paths/learning/questions/`，不把问题路线复制进能力表。

- [ ] **Step 4: 为每个年龄页增加培养过程和支持入口**

  在能力主线后添加简短的 `## 培养过程`，按“从日常互动/任务开始 → 观察行为 → 调整下一步”的顺序引用现有文章。每页增加：

  ```markdown
  ## 日常照护与家长支持

  具体照护内容按本页年龄和文章展开；需要先处理照料者状态时，进入[父母自身支持](../父母自身/_index.md)。

  ## 发展观察与风险提示

  参考[发展路线图与评估框架](development-assessment.md)。评估用于持续观察，不替代诊断；如果出现明显倒退、持续担忧或安全风险，应及时咨询合格专业人士。

  ## 深入阅读与辅助路径

  先完成本页的阶段主线，再按需要进入具体文章或[辅助学习路径](../../../../paths/learning/)。
  ```

  0–3 岁保留现有快速入口、月龄表和照护目录；其余年龄页保留现有发展评估、身体能力、推荐兴趣和理论依据。

- [ ] **Step 5: 验证六个年龄页的链接**

  ```bash
  cd website
  npm run check:routes
  npm run build
  for age in 0-3 3-6 6-9 9-12 12-14 14-18; do
    test -f "site/stages/family/parenting/$age/index.html"
    rg -q "阶段关注点|能力培养主线|培养过程|发展观察与风险提示|深入阅读" "site/stages/family/parenting/$age/index.html"
  done
  ```

  预期：路由检查通过，六个年龄页均生成并包含统一结构；0–3 岁的月龄内容仍存在。

- [ ] **Step 6: 提交年龄页整理**

  ```bash
  git add "stages/家庭期（25-45岁）/育儿指导/0-3岁/_index.md" "stages/家庭期（25-45岁）/育儿指导/3-6岁/_index.md" "stages/家庭期（25-45岁）/育儿指导/6-9岁/_index.md" "stages/家庭期（25-45岁）/育儿指导/9-12岁/_index.md" "stages/家庭期（25-45岁）/育儿指导/12-14岁/_index.md" "stages/家庭期（25-45岁）/育儿指导/14-18岁/_index.md"
  git commit -m "ref(content): Align parenting pages by age"
  ```

### Task 4: 将旧学习路径降级为兼容和辅助索引

**Files:**
- Modify: `paths/_index.md`
- Modify: `paths/learning/_index.md`
- Modify: `paths/learning/ages/_index.md`
- Modify: `paths/learning/questions/_index.md`
- Modify: `paths/learning/ages/0-3.md`
- Modify: `paths/learning/ages/3-6.md`
- Modify: `paths/learning/ages/6-9.md`
- Modify: `paths/learning/ages/9-12.md`
- Modify: `paths/learning/ages/12-14.md`
- Modify: `paths/learning/ages/14-18.md`

**Interfaces:**
- Consumes: 新的家庭期育儿指导索引和六个规范年龄页。
- Produces: 旧链接可访问、能解释迁移关系的辅助页面；路由分组和步骤链接保持不变。

- [ ] **Step 1: 给路径总索引增加规范入口提示**

  在 `paths/_index.md` 开头加入：

  ```markdown
  > 这是深入阅读和辅助索引。第一次使用时，建议从[人生阶段](../stages/)进入，再选择[家庭期的育儿指导](../stages/家庭期（25-45岁）/育儿指导/_index.md)或父母自身支持。
  ```

  保留认知、身体、脑健康、语言和父母支持等现有路径表格。

- [ ] **Step 2: 更新学习路线总页和两个索引页**

  将 `paths/learning/_index.md`、`paths/learning/ages/_index.md`、`paths/learning/questions/_index.md` 的开头改为兼容说明，明确它们不再是首页主入口。保留原有 route-index 必须链接的六个年龄路线和三个问题路线，另为每个年龄提供到 `stages/家庭期（25-45岁）/育儿指导/<年龄>/_index.md` 的规范入口。

- [ ] **Step 3: 给六个旧年龄路线增加规范入口**

  在每个 `paths/learning/ages/<age>.md` 的标题下增加对应链接，例如 0–3 岁：

  ```markdown
  > 这是一条保留的学习辅助路线。新的主入口是[家庭期 → 育儿指导 → 0–3 岁](../../../stages/家庭期（25-45岁）/育儿指导/0-3岁/_index.md)。
  ```

  其余五页使用相同位置和各自年龄路径，保留原有路线步骤、`route_next` 和深入阅读链接。

- [ ] **Step 4: 验证兼容路线不破坏路由检查**

  ```bash
  cd website
  npm run check:routes
  npm run build
  rg -n "新的主入口|家庭期.*育儿指导" site/paths/learning/ages/*.html site/paths/learning/index.html site/paths/learning/questions/index.html
  ```

  预期：六个年龄路线和三个问题路线仍生成，且路由检查没有新增错误。

- [ ] **Step 5: 提交兼容路径改动**

  ```bash
  git add paths/_index.md paths/learning/_index.md paths/learning/ages/_index.md paths/learning/questions/_index.md paths/learning/ages/*.md
  git commit -m "docs(paths): Point learning routes to age pages"
  ```

### Task 5: 全量验收和交付前检查

**Files:**
- Test: `website/site/index.html` and generated `website/site/stages/` / `website/site/paths/` pages
- Review: `git diff --check`, route/build output, final Git status

**Interfaces:**
- Consumes: Tasks 1–4 的内容和构建器改动。
- Produces: 可发布的静态站点输出和验证记录，不提交生成目录。

- [ ] **Step 1: 运行路由检查**

  ```bash
  cd website
  npm run check:routes
  ```

  预期：输出 `Route check passed`，无 route error。

- [ ] **Step 2: 运行生产构建**

  ```bash
  npm run build
  ```

  预期：构建成功，首页、家庭期、育儿指导、六个年龄页和旧路径页面均生成。

- [ ] **Step 3: 做主路径静态冒烟检查**

  ```bash
  test -f site/index.html
  test -f site/stages/family/index.html
  test -f site/stages/family/parenting/index.html
  for age in 0-3 3-6 6-9 9-12 12-14 14-18; do test -f "site/stages/family/parenting/$age/index.html"; done
  rg -q "按人生阶段探索" site/index.html
  ! rg -q "按年龄|按问题|主题路径|学习路径" site/index.html
  rg -q "育儿指导" site/stages/family/index.html
  rg -q "父母自身支持" site/stages/family/index.html
  for age in 0-3 3-6 6-9 9-12 12-14 14-18; do
    rg -q "阶段关注点" "site/stages/family/parenting/$age/index.html"
    rg -q "能力培养主线" "site/stages/family/parenting/$age/index.html"
  done
  ```

- [ ] **Step 4: 检查 Markdown 和 Git 状态**

  ```bash
  git diff --check
  /Users/johnny/.local/bin/rtk git status --short --branch
  ```

  预期：没有空白错误；`website/site/` 等生成文件保持忽略；所有预期内容改动均已提交。

- [ ] **Step 5: 记录已知测试边界**

  `website/package.json` 的 `npm test` 目前只是提示尚未配置测试并主动退出 1；本次验收以 `npm run check:routes`、`npm run build` 和主路径冒烟检查为准，不把该脚本报告为通过。

- [ ] **Step 6: 交付前查看提交历史**

  ```bash
  /Users/johnny/.local/bin/rtk git log --oneline -5
  /Users/johnny/.local/bin/rtk git status --short --branch
  ```

  确认每个任务提交保持单一职责，工作树干净后再创建或更新 PR。
