# AI 教育图谱项目

## 项目概述

开源教育项目，按人生阶段组织能力培养路径，核心交付物为结构化 Prompt，用户可复制到任何 AI 模型获得个性化教育内容和指导。

## 核心设计决策

- **双主线**：认知心理 + 身体能力，每个阶段并行
- **双入口**：主线（年龄→必备技能）、副线（兴趣→跨年龄路径）
- **Prompt 归属年龄层**：`interests/` 仅存索引，实际 Prompt 在 `stages/` 中
- **分层治理**：核心内容专家审核，社区贡献标记"community-contributed"
- **模型无关**：Prompt 不引用特定 AI 功能
- **中文优先**，后续国际化
- **纯内容仓库**：Markdown + Prompt 文件，无代码工具

## 目录结构

```
stages/<年龄>/core/cognitive-psychological/  # 认知心理主线 Prompt
stages/<年龄>/core/physical/                 # 身体能力主线 Prompt
stages/<年龄>/interests/<兴趣名>/            # 兴趣副线 Prompt
stages/<年龄>/_index.md                      # 阶段概述+能力清单
interests/<兴趣名>/_index.md                 # 跨年龄索引
references/                                  # 权威文献库
```

年龄阶段：0-3、3-6、6-9、9-12、12-15、15-18、18-25、25-40、40-60、60+

## Prompt 文件格式

每个 Prompt 文件必须包含：
- frontmatter：id、stage、track、domain、topic、age_range、difficulty、review_status、references、tags
- 双模式 Prompt：单轮模式（一次性输出）+ 多轮互动模式（对话式引导）
- 占位符 `[填写：xxx]` 供用户个性化
- 延伸探索：关联其他 Prompt

完整规范见 README.md。

## 提交规范

- Commit：`<type>(<scope>): <description>`
- 类型：content、index、refs、roadmap、docs、fix、i18n
- scope 为年龄阶段或目录名
- 一个 PR 做一件事

## 当前进度

- [x] 教育图谱框架（roadmap.md）
- [x] 目录结构和阶段索引（10个 _index.md）
- [x] 参考文献库（3个文件）
- [x] 项目文档（README、CONTRIBUTING）
- [ ] 核心 Prompt 编写（所有阶段均未开始）
- [ ] 兴趣副线内容（索引占位，待贡献）
- [ ] 国际化

## 理论依据优先级

能力划分基于成熟发展心理学理论：皮亚杰认知发展、埃里克森心理社会发展、蒙台梭利敏感期、Bowlby依恋理论、Gallahue动作发展模型、LTAD长期运动员发展模型等。所有内容须有权威引用，禁止凭空编造。
