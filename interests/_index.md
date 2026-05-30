# 兴趣领域索引

本目录按兴趣领域组织跨阶段学习路径。每个兴趣领域的 Prompt 按学习路线（入门→进阶→高阶）组织，用户可从当前水平进入，按路线持续深入。

兴趣是跨阶段的独立学习路径——一个人学登山，从入门到进阶是一条完整的纵向路径，不因人生阶段变化而中断。阶段目录通过链接引用本目录下适合该阶段的兴趣内容。

## 已收录兴趣领域

| 兴趣领域 | 说明 | 学习路线 | 状态 |
|---------|------|---------|------|
| [登山](mountaineering/_index.md) | 户外登山从入门到自主攀登 | 入门→进阶→高阶 | draft |
| （待贡献） | | | |

## 兴趣目录结构

每个兴趣领域包含：

```
interests/<兴趣名>/
├── _index.md          # 兴趣概述 + 学习路线总览 + 阶段映射
├── beginner.md        # 入门 Prompt
├── intermediate.md    # 进阶 Prompt（可选）
└── advanced.md        # 高阶 Prompt（可选）
```

## 兴趣 Prompt 格式

兴趣 Prompt 的 frontmatter 与核心 Prompt 格式一致，关键差异：

| 字段 | 兴趣 Prompt | 核心 Prompt |
|------|-----------|-----------|
| `stage` | `all`（跨阶段） | 具体阶段 |
| `track` | `interests` | `core` |
| `domain` | 兴趣名称（如 `mountaineering`） | `cognitive-psychological` 等 |
| `age_range` | 适合开始的年龄（如 `14y+`） | 具体年龄范围 |

## 如何贡献新兴趣领域

1. 在 `interests/` 下创建以兴趣名称命名的目录
2. 创建 `_index.md`：兴趣概述、学习路线总览、阶段映射表
3. 创建入门 Prompt（`beginner.md`），格式遵循项目 Prompt 规范
4. 如有进阶/高阶内容，创建对应的 `.md` 文件
5. 在适合开始该兴趣的阶段 `_index.md` 中，添加指向该兴趣的链接
6. 提交 Pull Request
