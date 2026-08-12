# Paths Navigation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `paths/` 从知识目录整理成可按年龄或问题进入、按步骤阅读并能回到下一步的网站路线层。

**Architecture:** Markdown 路线页继续作为人工维护的内容源，使用少量 frontmatter 标识路线类型、分组和顺序。网站构建器在一次扫描中建立页面和路线注册表，再据此生成首页入口、路线侧栏、文章返回路线和上一步/下一步导航；不引入客户端状态或自动推断内容关系。

**Tech Stack:** Markdown + gray-matter frontmatter, Node.js, `marked`, 静态 HTML, CSS, 原生 JavaScript, npm scripts。

## Global Constraints

- `paths/` 是网站唯一的路线层，不新增平行的“使用指南”目录。
- 年龄路线保留 2–4 个主步骤；问题路线保留 3–5 个主步骤。
- 主步骤必须同时有阅读链接、一个动作和一个观察点；其余文章放入补充阅读。
- 现有知识文章和深入领域路径继续可访问，不复制正文，也不以导航重构替代医学、安全或发展内容审核。
- 不实现登录、阅读进度持久化、个性化推荐、全文搜索服务或自动推断文章前置关系。
- 导航文案使用直接、克制的中文，例如“先看这里”“今天做一件事”“下一步”。
- 移动端必须显示当前路线和下一步，不能依赖隐藏的桌面侧栏。
- 验证以 `cd website && npm run build` 和路线检查脚本为准；当前 `npm test` 未配置测试，不将其视为成功依据。

---

## Task 1: 重组学习路线内容

**Files:**
- Modify: `paths/_index.md`
- Modify: `paths/learning/_index.md`
- Create: `paths/learning/ages/_index.md`
- Create: `paths/learning/ages/0-3.md`
- Create: `paths/learning/ages/3-6.md`
- Create: `paths/learning/ages/6-9.md`
- Create: `paths/learning/ages/9-12.md`
- Create: `paths/learning/ages/12-14.md`
- Create: `paths/learning/ages/14-18.md`
- Create: `paths/learning/questions/_index.md`
- Create: `paths/learning/questions/learning-habits.md`
- Create: `paths/learning/questions/school-learning.md`
- Move: `paths/learning/interest-discovery.md` → `paths/learning/questions/interest-discovery.md`
- Modify: `interests/_index.md`
- Modify: learning-related links in `stages/家庭期（25-45岁）/育儿指导/*/认知与心理/*.md`

**Interfaces:**
- Produces route Markdown pages with `page_type: route`, `route_group`, `route_key`, `route_order`, `route_label`, and (when applicable) `route_next`.
- Produces the stable links consumed by the website registry in Tasks 2–3.

- [ ] **Step 1: Replace the top-level path index with entry choices**

  Rewrite `paths/_index.md` so its first screen offers “按年龄开始”“按问题开始”“主题路径”和“直接浏览知识”。Remove the long path-format specification, manually maintained article counts, and future-stage backlog from the user-facing page. Keep a short explanation of what a route is and links to the deeper path families.

- [ ] **Step 2: Reduce the learning index to a route hub**

  Rewrite `paths/learning/_index.md` around two choices: age routes and question routes. Keep the existing safety note, the distinction between curiosity, school learning, learning ability, and interest exploration, and a short “每次只选一个动作” rule. Move the six-age table and long topic explanations into the new route pages or compact cards.

- [ ] **Step 3: Add the age route index and six age route pages**

  Create `paths/learning/ages/_index.md` with six cards. Each age page must use this frontmatter shape and route body order:

  ```yaml
  page_type: route
  route_group: learning-age
  route_key: 0-3
  route_order: 1
  route_label: 0–3 岁
  route_next: ../3-6.md
  ```

  The body must contain `先判断`, `阅读顺序`, `本周只做一件事`, `什么时候进入下一步`, and `补充阅读`. Choose 2–4 main links from the already-authored age-specific learning articles, and make every main step state one action and one observation. Do not turn age into a diagnostic cutoff; include the existing normal-variation language.

- [ ] **Step 4: Add the question route index and three initial question routes**

  Create `paths/learning/questions/_index.md` and route pages for learning habits, school learning, and interest discovery. Migrate the existing interest-discovery page without copying it, then revise its headings to the shared template. Each question route should link back to the relevant age route and use 3–5 main steps.

- [ ] **Step 5: Repair links after the interest route move**

  Update all Markdown references from `paths/learning/interest-discovery.md` to `paths/learning/questions/interest-discovery.md`, including `interests/_index.md` and the age-specific learning articles. Use `rg` to confirm the old path no longer appears except in migration notes, then run the existing link check or a targeted relative-link script.

- [ ] **Step 6: Check the content deliverable**

  Run:

  ```bash
  rg -n 'page_type: route|route_group:|## 先判断|## 阅读顺序|## 本周只做一件事|## 什么时候进入下一步' paths/learning
  ```

  Expected: all six age pages and all three question pages contain route metadata and the shared action sections; the two route indexes link to every page.

- [ ] **Step 7: Commit the content layer**

  ```bash
  git add paths/_index.md paths/learning paths/0-3 paths/3-6 paths/6-9 paths/9-12 paths/12-14 paths/parenting interests/_index.md stages
  git commit -m "docs(paths): Organize age and question learning routes"
  ```

## Task 2: Build a reusable route registry and validator

**Files:**
- Create: `website/scripts/route-registry.js`
- Create: `website/scripts/validate-routes.js`
- Modify: `website/package.json`

**Interfaces:**
- `buildPageRegistry(pages)` returns `{ byRel, routes, routesByGroup, routeRefsByPage }`.
- `getRouteContext(rel, registry)` returns either `null` or `{ route, steps, previous, next, referencedBy }`.
- `validateRoutes(root)` returns `{ errors, warnings }` and exits with status 1 only for invalid route metadata or missing main-step targets.

- [ ] **Step 1: Define the page record consumed by the registry**

  In `website/scripts/build-site.js`, during the existing file scan, parse each Markdown file once with `safeMatter` and pass records shaped like:

  ```js
  { full, rel, fm, content }
  ```

  Keep `allFiles` available for asset copying, but use the parsed page records for route work so the builder does not reread every file for every sidebar.

- [ ] **Step 2: Implement `buildPageRegistry(pages)`**

  In `website/scripts/route-registry.js`, index records by relative path. Select route pages using `fm.page_type === 'route'`, group them by `fm.route_group`, and sort each group by numeric `route_order` followed by `route_label`. Validate that each route has a unique `route_key` within its group.

  Parse Markdown links in route bodies, resolve each relative `.md` target against the route file directory, and store reverse references in `routeRefsByPage`. Only links inside a section titled `阅读顺序` count as main-step references; links elsewhere remain ordinary related links.

- [ ] **Step 3: Implement `getRouteContext`**

  Return the current route, its ordered steps, adjacent route pages, and the routes that reference the current page. Use explicit `route_next` when present; otherwise use the next item in the same group. A non-route knowledge article gets `route: null` and only its reverse references.

- [ ] **Step 4: Add `validate-routes.js`**

  The CLI must report:

  - duplicate `(route_group, route_key)` pairs;
  - missing or invalid `route_order` on route pages;
  - `route_next` targets that do not exist or are not in the same route group;
  - main-step Markdown links that do not resolve to a collected page;
  - route indexes that omit a route page in their group.

  Warnings are allowed for non-route pages that have no route reference. Errors print the source path and a concise reason, then exit 1.

- [ ] **Step 5: Add the route check command**

  Add this script to `website/package.json` without changing the existing build command:

  ```json
  "check:routes": "node scripts/validate-routes.js"
  ```

- [ ] **Step 6: Run the validator before renderer changes**

  Run `cd website && npm run check:routes`. Expected: the new route pages pass metadata and target checks. Fix source Markdown errors before proceeding to rendering.

- [ ] **Step 7: Commit the registry layer**

  ```bash
  git add website/scripts/route-registry.js website/scripts/validate-routes.js website/package.json
  git commit -m "build(website): Add route registry validation"
  ```

## Task 3: Render semantic navigation and route-aware pages

**Files:**
- Modify: `website/scripts/build-site.js`
- Modify: `website/scripts/route-registry.js` if renderer-facing helpers need a small adjustment

**Interfaces:**
- `renderTopNav(currentSection)` returns the shared top navigation HTML.
- `buildSidebar(currentRelPath, pageRegistry, routeRegistry)` returns a route-grouped sidebar or an empty string.
- `renderRouteNav(routeContext)` returns the current route summary, step links, and previous/next links.
- `renderPage({ title, description, sidebar, routeNav, metaCard, content, references, isHome })` renders route navigation in a stable location before article content.

- [ ] **Step 1: Extract shared top navigation**

  Replace the duplicated top-nav markup in `renderPage` and `renderHomePage` with `renderTopNav`. Use the labels `开始使用`, `按年龄`, `按问题`, `主题路径`, and `知识参考`. Keep the project roadmap accessible as a secondary link rather than the primary reading flow.

- [ ] **Step 2: Make generated links respect `BASE_PATH`**

  Add one helper for generated internal URLs and use it for sidebar links, route links, top-nav links, and the `nav.js` script tag. Preserve the existing slug mapping and ensure both `/` local output and a non-root `BASE_PATH` produce valid URLs.

- [ ] **Step 3: Replace same-directory sidebar logic**

  Update `buildSidebar` to prefer the current route context. For a route page, show a back link to the route index, a labeled list of ordered route steps, and the active step. For a referenced knowledge article, show the referencing route(s) and the current article as active. If no route context exists, retain a compact same-directory fallback so unrelated content remains navigable.

- [ ] **Step 4: Render route navigation cards**

  Implement `renderRouteNav` with a short route label, “第 N 步 / 共 M 步”, a list or `<details>` block for the route steps, and explicit previous/next links. Render “返回当前路线” on referenced knowledge pages. Do not render a fake next link when the route has reached its final step.

- [ ] **Step 5: Feed parsed records and registry into the build loop**

  Collect and parse pages before writing the home page, build the registry once, and pass route context into every `renderPage` call. Keep empty `_index.md` handling and static asset copying intact. Route validation warnings should be printed once before page generation rather than once per page.

- [ ] **Step 6: Generate home entry cards from route metadata**

  Change `renderHomePage` to accept the route registry and render age cards from `learning-age` routes and question cards from `learning-question` routes. Keep a compact secondary link to full stage, interest, and reference browsing. Remove the long explanatory sections from the first screen; the project background can remain below the route choices.

- [ ] **Step 7: Build and inspect generated navigation**

  Run:

  ```bash
  cd website
  npm run check:routes
  npm run build
  rg -n '开始使用|按年龄|按问题|route-nav|下一步|interest-discovery' site/index.html site/paths/learning/ages/0-3/index.html
  rg -n '返回当前路线|下一步|route-nav' site --glob 'school-learning-habits-01.html'
  ```

  Expected: the home page exposes both entry types, the age route has ordered route navigation, and the knowledge page links back to its route without displaying a raw filename as its label.

- [ ] **Step 8: Commit the renderer layer**

  ```bash
  git add website/scripts/build-site.js website/scripts/route-registry.js
  git commit -m "build(website): Render route-aware navigation"
  ```

## Task 4: Update visual layout for route and mobile navigation

**Files:**
- Modify: `website/site-template/style.css`
- Modify: `website/site-template/nav.js`

**Interfaces:**
- CSS classes emitted by Task 3: `.route-nav`, `.route-summary`, `.route-steps`, `.route-step`, `.route-next`, `.entry-grid`, `.mobile-route-nav`.
- `nav.js` must preserve active-link highlighting while accepting the generated base path.

- [ ] **Step 1: Style route summaries and entry cards**

  Add restrained styles for route cards, step labels, current-step state, and previous/next actions. Reuse the existing colors, borders, spacing, and `.stage-card` visual language rather than introducing a second design system.

- [ ] **Step 2: Keep route navigation visible on small screens**

  Replace the current mobile rule that hides `.sidebar` with a layout that leaves the route summary in the document flow. The desktop sidebar may remain hidden below 768px, but `.mobile-route-nav` must remain visible above content and include the next action.

- [ ] **Step 3: Update active-link handling**

  In `nav.js`, normalize both the current pathname and generated link pathname by removing the configured base prefix and optional trailing slash. Highlight the current route step and do not rely on an absolute `/` link.

- [ ] **Step 4: Verify desktop and mobile HTML/CSS hooks**

  Rebuild with `npm run build`, then inspect the generated HTML for the route classes at desktop and mobile viewport assumptions. If a browser preview is available, check one route page and one knowledge page; otherwise verify the rendered structure with `rg` and ensure no sidebar-only navigation remains on mobile.

- [ ] **Step 5: Commit the visual layer**

  ```bash
  git add website/site-template/style.css website/site-template/nav.js
  git commit -m "style(website): Keep route navigation visible on mobile"
  ```

## Task 5: Final verification and content-link audit

**Files:**
- Modify: only files found necessary by the checks above; do not edit generated `website/site/` output by hand.

- [ ] **Step 1: Run route validation and site build**

  ```bash
  cd website
  npm run check:routes
  npm run build
  ```

  Expected: route validation exits 0 and the build reports generated pages without missing-target warnings.

- [ ] **Step 2: Check stale paths and raw labels**

  ```bash
  cd ..
  rg -n 'paths/learning/interest-discovery\.md' --glob '*.md' .
  rg -n '>interest-discovery<|>learning-habits<|>school-learning<' website/site
  ```

  Expected: no Markdown link uses the old interest path, and route navigation uses frontmatter labels instead of raw basenames. A raw filename in ordinary fallback navigation is a follow-up issue only if it appears on a main route.

- [ ] **Step 3: Check required entry links in generated HTML**

  ```bash
  rg -n '按年龄|按问题|0–3 岁|学习习惯|学校学习|发现兴趣' website/site/index.html website/site/paths/index.html website/site/paths/learning/index.html
  ```

  Expected: the home page, paths index, and learning hub each expose the intended entry choices without a large unstructured article list preceding them.

- [ ] **Step 4: Review the diff and commit verification fixes**

  ```bash
  /Users/johnny/.local/bin/rtk git diff --check
  /Users/johnny/.local/bin/rtk git status --short
  git add paths interests website/scripts website/site-template website/package.json
  git commit -m "fix(website): Resolve route navigation verification findings"
  ```

  Do not commit ignored generated output under `website/site/` unless the repository configuration explicitly changes.

## Execution Notes

- Work in the existing feature branch and preserve unrelated user changes.
- Complete each task's verification before starting the next task.
- If a route validation failure repeats twice, stop editing source content and diagnose whether the failure is in link resolution, slug mapping, or the validator before making another change.
- After all tasks, run the full build once more and report the exact command results. Do not claim tests pass when the repository still reports “Error: no test specified”.
