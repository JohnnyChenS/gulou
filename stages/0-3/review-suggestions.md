---
stage: "0-3"
stage_name: 婴幼儿
review_date: 2026-05-17
reviewer: Sisyphus (AI review)
target_files: 12 core prompts (8 cognitive-psychological + 4 physical)
current_status: all draft
---

# 0-3 岁阶段核心 Prompt 审查报告

12 篇 Prompt 均遵循规范格式（frontmatter + 双模式 Prompt + 延伸探索），内容扎实，理论引用准确，编排逻辑清晰。以下为逐项审查结果。

---

## 一、全局问题（所有文件）

### 1. `review_status` 全量升级

12 篇 Prompt 统一标注 `review_status: draft`，但内容深度、引用严谨性、结构规范度已远超草稿阶段。建议升级为 `community-contributed`，如需最终确定可升级至 `expert-reviewed`。

### 2. `related_prompts` 双向引用确认

当前每篇引用 2 个关联，需要系统检查 12×12 矩阵确保所有反向链接存在。部分"延伸探索"引用了第 3 个关联但 `related_prompts` 前文只列了 2 个，存在不一致。

### 3. 单轮 Prompt 中的数字准确性

有篇章的游戏/方法数量描述与正文示例数量不一致（如 joint-attention-01 说"5个日常互动方法"但只列出了 4 个场景）。

---

## 二、逐篇审查

### 1. `cognitive-psychological/object-permanence-01.md` — 客体永久性

**质量评分：A**

**问题：**

- **参考文献遗漏**：只引用了 Piaget (1952) 和 Baillargeon (1987)。Baillargeon 的违背期望范式是 80 年代的发现，过去 20 年该领域有重要进展。建议补充：
  - Spelke, E. S., & Kinzler, K. D. (2007). Core knowledge. *Developmental Science*, 10(1), 89-96.
  - Xu, F., & Carey, S. (1996). Infants' metaphysics: The case of numerical identity. *Cognitive Psychology*, 30(2), 111-153.
- **"6个阶梯游戏"缺乏方向性示例**：Prompt 正文只说了"6个"，建议给出游戏类型的引导词（如：遮挡→部分露出→完全隐藏→转移隐藏→跨房间寻找→延迟寻找），帮助 AI 输出更精准的内容。
- **分离焦虑关联可加强**："与分离焦虑的关联"段落已存在，但在 Prompt 正文中可更明确地引用 `attachment-01.md` 的延伸。

---

### 2. `cognitive-psychological/cause-effect-01.md` — 因果关系推理

**质量评分：A-**

**问题：**

- **参考文献偏旧**：Gopnik et al. (2001) 好引用，但她的因果贝叶斯模型系列研究（2007 年后）更完整。建议补充：
  - Gopnik, A. (2012). Scientific thinking in young children. *Science*, 337(6102), 1623-1627.
- **"6个因果探索活动"缺乏示例**："从简单的感官因果到复杂的工具性因果"方向正确，但建议在 Prompt 正文增加示例引导词（如：摇晃→发声、拉绳子→玩具靠近、按钮→灯光、推开障碍→拿到物体、敲击不同表面→不同声音、倾斜容器→液体流出）。

**亮点：**
- 第 4 点"过度干预与适度放手"直击家长常见痛点，表述到位。

---

### 3. `cognitive-psychological/joint-attention-01.md` — 联合注意

**质量评分：A**

**问题：**

- **数字不一致**：正文说"5个日常互动方法"，但只列出了 4 个场景（亲子阅读、户外散步、玩具玩耍、日常护理）。需统一为 4 个或补充第 5 个。
- **参考文献缺口**：未引用 Charman 关于联合注意与语言发展的经典纵向研究。建议补充：
  - Charman, T., Baron-Cohen, S., Swettenham, J., Baird, G., Cox, A., & Drew, A. (2000). Testing joint attention, imitation, and play as infancy precursors to language and theory of mind. *Cognitive Development*, 15(4), 481-498.

**亮点：**
- 第 3 点"回应指物 vs 要求指物"的内容深度在同类材料中少见。
- 联合注意缺陷作为自闭症早期核心指标的说明准确且克制。

---

### 4. `cognitive-psychological/symbolic-thinking-01.md` — 符号思维萌芽

**质量评分：A**

**问题：**

- **参考文献建议**：McCune (1995) 引用不错，建议补充 Fein 关于假装游戏发展的经典综述：
  - Fein, G. G. (1981). Pretend play in childhood: An integrative review. *Child Development*, 52(4), 1095-1118.
- **第 5 点"常见误区"可更清晰**：当前三个误区中"过度主导"和"纠正'不对'"方向相近。建议表述为三个独立误区：
  1. 家长主导剧情而非跟随孩子
  2. 纠正孩子"不对"的假装方式（如"这不是电话，是积木"）
  3. 用造型固定的成品玩具替代开放性材料（积木、盒子、碎布）

**亮点：**
- 假装游戏分阶描述（自我导向→他人导向→替换物假装）准确清晰。

---

### 5. `cognitive-psychological/self-awareness-01.md` — 自我意识觉醒

**质量评分：A**

**问题：**

- **参考文献缺口**：自意识情绪部分（尴尬、自豪、羞愧）建议补充：
  - Tracy, J. L., & Robins, R. W. (2004). Putting the self into self-conscious emotions. *Psychological Inquiry*, 15(2), 103-125.

**亮点：**
- "我的！不是自私"的解释非常必要且到位。
- 第 5 点与共情和自主意志的关联形成完整闭环。

---

### 6. `cognitive-psychological/autonomy-01.md` — 自主意志

**质量评分：A**

**问题：**

- **无重大修改建议**。这篇是 12 篇中理论厚度最好的一篇（Erikson + Kopp + Ryan/Deci 三层嵌套）。
- 第 2 点"5个支持自主性的策略"在 Prompt 正文中直接给出了具体话术示例（"穿红色还是蓝色？"），这一做法建议推广到其他 Prompt 正文中，以提升输出质量。

**亮点：**
- "在爱中设边界"的具体话术示例非常实用。

---

### 7. `cognitive-psychological/empathy-01.md` — 共情萌芽

**质量评分：A-**

**问题：**

- **参考文献缺口**：共情领域最重要学者之一的 Eisenberg 未引用。建议补充：
  - Eisenberg, N., & Fabes, R. A. (1998). Prosocial development. In W. Damon & N. Eisenberg (Eds.), *Handbook of Child Psychology* (5th ed., Vol. 3, pp. 701-778). Wiley.
- **第 4 点"常见误区"缺少"家长先冷静"**：家长在回应孩子情绪前，自身情绪的调节同样关键（情绪传染的二元模型），这是一个重要的补充方向。

**亮点：**
- Hoffman 四阶段模型的交代清晰，Zahn-Waxler 引用到位。

---

### 8. `core/physical/gross-motor-01.md` — 粗大动作链

**质量评分：A**

**问题：**

- **参考文献缺口**：Hadders-Algra 还有一篇关于自发性运动质量的更早期经典，建议补充：
  - Hadders-Algra, M. (2004). General movements: A window for early identification of children at high risk for developmental disorders. *The Journal of Pediatrics*, 145(2), S12-S18.

**亮点：**
- WHO 六大里程碑引用精确。"不要跳过爬行"专题非常实用且有理论依据。
- 第 5 点"过度保护的平衡"提出了学步车等典型问题，贴合实际。

---

### 9. `core/physical/fine-motor-01.md` — 精细动作链

**质量评分：A-**

**问题：**

- **"左利手还是右利手"段落位置不当**：插在"自主进食"和"电子屏幕"之间，建议移到"发展特征"部分或与"发育警示信号"合并。
- **电子屏幕与精细动作的引证不足**：第 5 点话题及时但缺少直接引用。建议在 Prompt 正文中明确"目前缺乏高质量证据表明触摸屏能替代真实手部操作"的立场。
- **参考文献建议**：精细动作发展部分可补充：
  - Case-Smith, J., & O'Brien, J. C. (2015). *Occupational Therapy for Children and Adolescents* (7th ed.). Mosby.（精细动作评估与干预的权威教材）

**亮点：**
- 抓握方式时间线清晰（全掌→尺侧→桡侧→对捏）。

---

### 10. `core/physical/sensory-integration-01.md` — 感觉统合

**质量评分：A**

**问题：**

- **Dunn 四象限表述不准确**：正文提到三个类型（感觉寻求、感觉回避、感觉反应迟钝），但 Dunn 的四象限模型包括：感觉寻求、感觉回避、感觉敏感、感觉反应迟钝。第 4 点表述与四象限不完全对应。建议统一描述或明确"以下三种常见类型"。
- **参考文献缺口**：感觉统合失调与 ASD/ADHD 关联缺少引用。建议补充：
  - Miller, L. J., Anzalone, M. E., Lane, S. J., Cermak, S. A., & Osten, E. T. (2007). Concept evolution in sensory integration. *American Journal of Occupational Therapy*, 61(2), 135-140.

**亮点：**
- 将 Ayres 理论与 Dunn 个体差异框架并置，避免了"一刀切"的指导倾向。

---

### 11. `core/physical/oral-motor-01.md` — 口部运动

**质量评分：B+**

**问题：**

- **Boshart (1998) 引用非同行评审**：该书是口部运动治疗师手册，建议补充同行评审论文：
  - Green, J. R., Moore, C. A., & Reilly, K. J. (2002). The sequential development of oromotor coordination. *Journal of Speech, Language, and Hearing Research*, 45(3), 504-520.
- **"为什么重要"缺少喂养困难的社会情感维度**：口部运动困难除影响语言外，也常导致挑食及亲子喂养冲突。建议在该部分末尾呼应喂养困难的社会情感影响。
- **第 3 点"5个口部运动促进活动"**：罗列顺序可体现从简单到复杂的递进（唇→舌→咀嚼→吸饮→面部）。

**亮点：**
- "总是打成泥会阻碍咀嚼发展"是非常实用的具体建议。
- Straw 吸饮过渡（杯饮→吸管→不同稠度）的提及填补了一个常见盲区。

---

## 三、跨篇一致性检查摘要

| 检查项 | 结论 |
|--------|------|
| frontmatter 格式统一 | ✅ 完全一致 |
| 双模式 Prompt 结构统一 | ✅ 一致，长度控制优秀 |
| `id` 命名格式 (`0-3-core-xxx-01`) | ✅ 统一 |
| `related_prompts` 双向引用 | ⚠️ 基本双向一致，需系统确认 12×12 矩阵 |
| 参考文献覆盖 | 🟡 每篇 3-4 个引用，质量好但部分领域有遗漏 |
| 占位符 `[填写：xxx]` | ✅ 统一，格式一致 |
| 延伸探索双向链接 | ⚠️ 部分篇章仅有单向链接 |

---

## 四、优先级排序

| 优先级 | 修改项 | 涉及文件 |
|--------|--------|----------|
| 🔴 P0 | `review_status` 全量升级 | 全部 12 篇 |
| 🔴 P0 | 补充 4 处关键遗漏文献 | object-permanence、joint-attention、empathy、oral-motor |
| 🟡 P1 | `related_prompts` 双向确认 | 全部 12 篇 |
| 🟡 P1 | 单轮 Prompt 中数字不一致 | joint-attention（5→4） |
| 🟡 P1 | Dunn 四象限表述准确性 | sensory-integration |
| 🟡 P1 | fine-motor 段落顺序调整 | fine-motor |
| 🟢 P2 | 在 Prompt 正文增加游戏示例引导词 | object-permanence、cause-effect |
| 🟢 P2 | symbolic-thinking 常见误区重新表述 | symbolic-thinking |
| 🟢 P2 | 推广具体话术示例到其他 Prompt | 全部 |
