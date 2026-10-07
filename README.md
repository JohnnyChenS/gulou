# 鼓楼 Gulou

> 鼓楼 = grow，译为“成长”。同时“鼓楼”亦是我长大的地方，拨浪鼓(logo) 是童年的声音。

[![License: CC BY-SA 4.0][cc-by-sa-shield]][cc-by-sa]

[cc-by-sa-shield]: https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg
[cc-by-sa]: https://creativecommons.org/licenses/by-sa/4.0/

## 这是什么

一个覆盖全人生阶段的成长知识库。

从出生到老年，每个阶段都有需要学习和成长的课题——语言、运动、职业发展、育儿、健康管理。这些知识分散在学术论文、专业书籍和专家观点中，普通人很难系统获取。

鼓楼做的事情很简单：**把权威的成长发展知识，整理成每个人看得懂、用得上的结构化内容。**

核心是知识内容本身，不是 AI 工具。你可以直接阅读获取指导，也可以在此基础上构建个性化建议。

## 内容结构

### 三条主线

育儿阶段（0-18 岁）按三条主线展开：

- **认知与心理** — 思维发展、情绪管理、社会化能力
- **身体能力** — 大运动、精细动作、感觉统合
- **父母支持** — 照料者自身的心理状态和育儿指导

### 人生阶段

内容按当前处境组织。育儿和部分兴趣有正文与阅读路线，其他人生阶段主要是概览；年龄不是统一的发展时间表：

| 阶段 | 年龄 | 面向 |
|------|------|------|
| 育儿指导 | 0-18 岁 | 家长 |
| 青春期 | 14-18 岁 | 学习者 + 家长 |
| 大学期 | 18-22 岁 | 学习者 |
| 职场开始 | 22-28 岁 | 学习者 |
| 职场发展 | 28-40 岁 | 学习者 |
| 家庭期 | 25-45 岁 | 学习者 |
| 中年期 | 40-60 岁 | 学习者 |
| 老年期 | 60+ 岁 | 学习者 |

### 兴趣副线

除阶段主线外，还规划了跨阶段的兴趣学习路径：

- 语言学习（母语发展 + 英语学习）
- 音乐乐器
- 运动健身
- 艺术创作
- 职业技能

完整规划见 [roadmap.md](roadmap.md)。

## 当前聚焦：育儿指导

作者本人即将成为新手父亲，所以现阶段优先完善 **0-18 岁育儿指导** 内容。

### 从阅读过程进入

[新手父母十五章主线](paths/parenting/new-parent/_index.md)覆盖产前至三岁；之后从[育儿阶段入口](stages/家庭期（25-45岁）/育儿指导/_index.md)选择当前年龄。每个年龄只维护一个目录。[父母支持](stages/家庭期（25-45岁）/育儿指导/父母自身/_index.md)与儿童阶段并行。青少年本人可以直接读[四章自我探索](paths/exploration/youth/_index.md)。

育儿专题覆盖日常照料、身体、认知、关系与父母支持，按问题从阶段目录查阅。存在正文不代表已经取得专业审核；兴趣课程按实践和条件推进，不承诺统一完成时间。

内容分为连续章节、操作查阅、概念专题、阶段概览及来源。共同要求是解释清楚、前后连贯、来源可追溯、边界与求助条件准确，不强制每篇填满相同标题或活动频率。

本轮对全库现有正文进行编辑检查与阅读整合，逐篇改写、接入或保留理由记录在[整理范围](paths/reading-progress.md)和[覆盖清单](docs/reading/editorial-coverage.json)。未展开的长期课程仍是规划，见[内容地图](roadmap.md)。

## 怎么用

**直接阅读：** 在 [gulou.school](https://gulou.school) 浏览，或下载本仓库的 Markdown 文件。

**贡献内容：** 见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 构建工具

本仓库包含两个构建目录，用于将 Markdown 内容转换为网站和 Word 文档。

### website/ — 网站构建

网站由 Node.js 脚本将 Markdown 转成静态 HTML；不使用 MkDocs。构建会解析 frontmatter、将本地 Markdown 链接转成网站路径，并生成章节与阶段导航。

```bash
cd website
npm ci
npm run build
npm run check:all
```

`check:all` 运行现有九项检查，包括阅读回归、内容覆盖、本地链接与锚点。需要先构建，检查才会使用最新页面；GitHub Pages 部署也在上传前执行这些检查。单项检查仍可用于局部修改。

生成后可用静态服务器预览，例如 `python3 -m http.server 8000 --directory site`。生产发布由 `.github/workflows/deploy.yml` 管理；本地构建不会发布。

输出目录 `website/site/` 不纳入版本管理。

### word/ — Word 文档生成

将 Markdown 内容转换为 `.docx` 格式，用于分发或打印。

```bash
cd word
npm install
npm run build                    # 转换所有内容为 Word 文档
python scripts/fix-tables.py     # 修复表格对齐和重复表头
python scripts/gen-reference.py  # 生成 references/reference-list.md
```

输出目录 `word/docx/` 不纳入版本管理。

## 内容与阅读编排

必要元数据随内容用途选择，状态应反映真实审核记录。一般文章保留主题、年龄、来源与审核状态；产品需要的 `agent_use` 按公开知识约定维护，不为网站阅读新增产品逻辑。

连续路线通过 frontmatter 的 `chapters` 显式列出章节。目录、当前位置和上下篇来自这份编排，正文中的来源与延伸链接不计入进度。并列入口使用 `route_group_mode: alternatives`，明确递进的阶段课程使用 `sequence`。

新手父母从[主线目录](paths/parenting/new-parent/_index.md)进入；需要即时操作时使用[照料手册](stages/家庭期（25-45岁）/育儿指导/quick-start.md)。重复入口或正文可以合并删除，更新当前站内引用即可，不维护历史兼容壳页。

正文应先明确读者处境和要解释的问题，首次出现的必要概念在当地讲清楚，并交代前后章节的联系。护理指南可以写步骤，概念文章可以用贯穿的例子；共同要求见[新手父母阅读约定](docs/reading/new-parent-reading-contract.md)及[贡献指南](CONTRIBUTING.md)。

第二轮的实际改写、入口删除、来源范围及工程检查见[二次优化与验证记录](docs/reading/second-pass-verification.md)。当前逐页记录以 [editorial-coverage.json](docs/reading/editorial-coverage.json) 为准，早期审查文档中的文件路径可能已合并或删除。

## 参与贡献

欢迎参与完善内容。贡献前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 当前最需要帮助的

- 补充 12-14 岁和 14-18 岁身体能力内容
- 在明确前置与安全条件后完善兴趣课程，不用统一日历替代学习与实践
- 提供学术来源并验证现有内容的准确性
- 将内容翻译成英文
- **启动其他阶段的内容**（大学期、职场发展、兴趣学习等）

### 你可以

- **提交 Issue** — 报告错误、建议改进、请求新内容
- **提交 PR** — 直接编辑或新增内容
- **分享给朋友** — 让更多人知道这个项目

## 内容质量

- 核心内容优先基于权威来源整理；专业审核状态以后续可追溯记录为准
- 社区贡献内容标记为 `community-contributed`，待审核内容标记为 `review-pending`
- 核对精确数字、临床阈值和因果断言；相关文献不等于直接支持，来源核对不等于专业审核
- 来源用途及记录规范参见 [资料入口](references/_index.md)

## 许可协议

采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可协议。

**鼓楼是一个知识项目，不是一个育儿产品。** 不贩卖焦虑，只传递知识。
