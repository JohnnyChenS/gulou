# 脑健康阶段反向导航实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除不适合作为公开参考的访谈审计，并让 13 个主要年龄入口能反向发现适龄的循证脑健康与学习内容。

**Architecture:** 保留 `paths/brain-health/` 作为专题正文的单一来源，在阶段 `_index.md` 中只添加短摘要和相对链接。访谈审计文件及其全部入口一起删除，现有通用证据框架继续保留。

**Tech Stack:** Markdown、Eleventy 网站构建、Node.js Word 导出脚本、Git。

## Global Constraints

- 只修改 `gulou-core`，不得修改 `gulou-agent` 或其知识清单。
- 阶段卡片标题统一为 `## 脑健康与学习`，每张卡片 2–4 句并含 1–3 个读者正文链接。
- 顶层阶段入口使用 `../../paths/brain-health/...`；育儿年龄入口使用 `../../../../paths/brain-health/...`。
- 阶段入口不得直接链接 `references/`。
- 不在脑健康正文中提及两期访谈、受访者或视频核查过程。
- 不修改 `育儿指导/0-3岁/日常护理/_index.md` 和 `育儿指导/父母自身/_index.md`。

---

### Task 1: 移除访谈审计及公开入口

**Files:**
- Delete: `references/brain-science-interview-audit-2026.md`
- Modify: `references/_index.md`
- Modify: `paths/brain-health/_index.md`
- Modify: `paths/brain-health/evidence-based-learning.md`

**Interfaces:**
- Consumes: `references/brain-health-evidence-framework.md` 作为继续保留的证据规范。
- Produces: 不包含访谈审计入口的公开脑健康路径和参考资料索引。

- [ ] **Step 1: 建立删除前基线**

Run:

```bash
rg -n "brain-science-interview-audit|两期脑科学访谈|黄翔|041对谈|042 30岁" paths/brain-health references/_index.md stages
```

Expected: 只显示现有审计链接或访谈相关文字，作为本任务需要清除的基线。

- [ ] **Step 2: 删除审计文件和三个入口**

使用补丁删除 `references/brain-science-interview-audit-2026.md`；从参考资料索引、脑健康总入口和循证学习页删除审计条目或链接。不要删除 `references/brain-health-evidence-framework.md`，也不要改写其中关于访谈和社交媒体证据等级的一般规则。

- [ ] **Step 3: 验证审计及叙事已退出公开内容**

Run:

```bash
test ! -e references/brain-science-interview-audit-2026.md
rg -n "brain-science-interview-audit|两期脑科学访谈|黄翔|041对谈|042 30岁" paths/brain-health references/_index.md stages
```

Expected: `test` 退出码为 0；`rg` 无输出并以 1 退出。

### Task 2: 为七个顶层人生阶段加入摘要卡片

**Files:**
- Modify: `stages/青春期（14-18岁）/_index.md`
- Modify: `stages/大学期（18-22岁）/_index.md`
- Modify: `stages/职场开始（22-28岁）/_index.md`
- Modify: `stages/职场发展（28-40岁）/_index.md`
- Modify: `stages/家庭期（25-45岁）/_index.md`
- Modify: `stages/中年期（40-60岁）/_index.md`
- Modify: `stages/老年期（60+岁）/_index.md`

**Interfaces:**
- Consumes: `paths/brain-health/_index.md`、`0-18-development-and-learning.md`、`evidence-based-learning.md`，以及老年期本地专题 `认知保持/brain-health-01.md`。
- Produces: 七个阶段入口中的适龄导航卡片。

- [ ] **Step 1: 添加七张卡片**

每个文件新增 `## 脑健康与学习`：青春期说明睡眠、运动、情绪关系和自主学习，并澄清控制系统仍在发展不等于“不理性”；大学期覆盖睡眠、心理健康、检索反馈与 AI 边界；职场开始覆盖久坐、压力恢复和技能迁移；职场发展覆盖心血管代谢基础并明确不采用“30 岁整体衰退”；家庭期同时链接成人自身、儿童支持和学习；中年期强调血压血糖血脂、运动、睡眠和听视力且只承诺降低风险；老年期覆盖正常变化、功能维持、补偿和就医红旗，并保留本地 `认知保持/brain-health-01.md` 入口。

链接严格采用：

```markdown
[0–18 岁大脑发育与学习支持](../../paths/brain-health/0-18-development-and-learning.md)
[循证学习与能力培养](../../paths/brain-health/evidence-based-learning.md)
[终身脑健康总纲](../../paths/brain-health/_index.md)
```

- [ ] **Step 2: 验证顶层覆盖和相对链接**

Run:

```bash
rg -l '^## 脑健康与学习$' stages/*/_index.md
```

Expected: 输出本任务指定的七个顶层阶段入口。

### Task 3: 为六个育儿年龄入口加入摘要卡片

**Files:**
- Modify: `stages/家庭期（25-45岁）/育儿指导/0-3岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/3-6岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/6-9岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/9-12岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/12-14岁/_index.md`
- Modify: `stages/家庭期（25-45岁）/育儿指导/14-18岁/_index.md`

**Interfaces:**
- Consumes: `paths/brain-health/0-18-development-and-learning.md`、`evidence-based-learning.md`、`_index.md`。
- Produces: 六个育儿年龄入口中的适龄导航卡片。

- [ ] **Step 1: 添加六张卡片**

每个文件新增 `## 脑健康与学习`：0–3 岁强调安全、回应性照料、语言互动、自由活动和睡眠，不做“大脑开发率”训练；3–6 岁强调游戏、共同调节、基本动作、语言和早期数概念，不以提前学科加速为目标；6–9 岁强调睡眠、运动、阅读、检索与反馈，不承诺技巧直接提分；9–12 岁覆盖自我调节、同伴关系、屏幕习惯和知识结构；12–14 岁覆盖睡眠变化、情绪社会敏感性、自主性与学习策略；14–18 岁覆盖心理健康、关系、自主性、学业压力、数字生活和 AI 边界。

链接严格采用：

```markdown
[0–18 岁大脑发育与学习支持](../../../../paths/brain-health/0-18-development-and-learning.md)
[循证学习与能力培养](../../../../paths/brain-health/evidence-based-learning.md)
[终身脑健康总纲](../../../../paths/brain-health/_index.md)
```

- [ ] **Step 2: 验证育儿覆盖及排除项**

Run:

```bash
rg -l '^## 脑健康与学习$' stages/家庭期（25-45岁）/育儿指导/*/_index.md
rg -n '^## 脑健康与学习$' stages/家庭期（25-45岁）/育儿指导/0-3岁/日常护理/_index.md stages/家庭期（25-45岁）/育儿指导/父母自身/_index.md
```

Expected: 第一条命令只输出六个年龄入口；第二条命令无输出并以 1 退出。

### Task 4: 全量验收和范围复核

**Files:**
- Verify: Task 1–3 的全部变更文件
- Verify unchanged: `../gulou-agent`

**Interfaces:**
- Consumes: 所有新增 Markdown 相对链接和现有构建脚本。
- Produces: 可构建、无断链、没有越界修改的最终变更集。

- [ ] **Step 1: 检查格式、标题数量和本地链接**

Run:

```bash
git diff --check
rg -l '^## 脑健康与学习$' stages | wc -l
node -e "const fs=require('fs'),path=require('path');const files=require('child_process').execFileSync('git',['diff','--name-only','--','*.md'],{encoding:'utf8'}).trim().split('\\n').filter(Boolean);let bad=[];for(const f of files){if(!fs.existsSync(f))continue;const s=fs.readFileSync(f,'utf8');for(const m of s.matchAll(/\\[[^\\]]+\\]\\(([^)#]+)(?:#[^)]+)?\\)/g)){const u=m[1];if(!/^(?:https?:|mailto:|\/)/.test(u)&&!fs.existsSync(path.resolve(path.dirname(f),decodeURI(u))))bad.push(f+': '+u)}}if(bad.length){console.error(bad.join('\\n'));process.exit(1)}console.log('all changed Markdown links resolve')"
```

Expected: `git diff --check` 无输出；标题数量为 13；链接检查输出 `all changed Markdown links resolve`。

- [ ] **Step 2: 构建网站和 Word 导出**

Run:

```bash
npm --prefix website run build
npm --prefix word run build
```

Expected: 两个命令退出码均为 0；删除的审计页面不再生成，13 个阶段页面仍正常生成。Word 构建现有的默认样式回退警告可以保留，但不得出现新的失败。

- [ ] **Step 3: 做最终范围审查**

Run:

```bash
git diff --stat
git status --short
git -C ../gulou-agent status --short
```

Expected: `gulou-core` 只包含计划内文档变更；`gulou-agent` 无变化。逐项对照设计验收标准，确认没有新增访谈叙事、没有直接链接参考资料、没有修改两个排除入口。

- [ ] **Step 4: 提交内容变更**

Run:

```bash
git add references paths/brain-health stages
git commit -m "docs(brain-health): Integrate stage navigation" -m "Remove the interview audit from public references and add evidence-based brain-health summaries to the 13 primary life-stage entry pages.\n\nCo-Authored-By: Codex <codex@openai.com>"
```

Expected: 提交成功，工作区仅可能保留被 Git 忽略的计划文件。
