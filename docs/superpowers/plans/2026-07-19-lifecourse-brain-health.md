# Lifecourse Brain Health Knowledge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cited, age-appropriate brain-health and learning-science knowledge path covering the full life course, with detailed 0–18 and 60+ guidance and a transparent audit of the two source interviews.

**Architecture:** Add one cross-life-course path, two focused path articles, one 60+ stage article, and two reference documents. Keep shared health principles centralized, link to existing age-specific parenting content instead of duplicating it, and expose the new material through the existing path, reference, and elder-stage indexes.

**Tech Stack:** Markdown with YAML frontmatter, relative Markdown links, Node.js static-site generator, Node.js Word export scripts, Git.

## Global Constraints

- Modify only `gulou-core`; do not modify `gulou-agent` or its MVP knowledge manifest.
- Do not add `agent_use` metadata in this release.
- Separate brain-health protection, effective learning, ability training, and clinical rehabilitation.
- Use calibrated language such as “may reduce risk,” “on average,” and “in this task”; never promise dementia prevention, IQ increases, or exam-score gains.
- Prefer WHO, national public-health bodies, professional associations, systematic reviews, and directly relevant primary studies.
- Do not use a single case, animal study, cross-sectional association, or neural-activation result as standalone causal evidence for public advice.
- Do not recommend fixed high-fat/high-protein meal ratios, fasting for children, universal supplements, commercial brain training, or “left/right brain” development.
- Distinguish normal variation, actions to try at home, professional assessment, and emergency red flags.
- Keep `review_status: draft` until an independent human medical/content review is completed.
- Make surgical edits to existing content and indexes; do not rewrite unrelated articles.

---

## File Map

**Create:**

- `references/brain-health-evidence-framework.md` — reusable editorial evidence and safety rules.
- `references/brain-science-interview-audit-2026.md` — timestamped claim ledger for both interviews.
- `paths/brain-health/_index.md` — full-life-course brain-health entry and age map.
- `paths/brain-health/0-18-development-and-learning.md` — detailed child and adolescent guide.
- `paths/brain-health/evidence-based-learning.md` — learning methods, transfer limits, exam preparation, and AI use.
- `stages/老年期（60+岁）/认知保持/brain-health-01.md` — normal aging, risk reduction, compensation, and red flags.

**Modify:**

- `references/_index.md` — link the evidence framework and interview audit.
- `paths/_index.md` — link the new brain-health path.
- `stages/老年期（60+岁）/_index.md` — replace the placeholder cognitive-maintenance bullets with a link and calibrated summary.
- Relevant 0–18 indexes only where a single brain-health path link materially improves navigation.

**Do not modify:**

- `gulou-agent/config/knowledge-sources.yaml`
- Existing generated files under `website/site/` or `word/docx/` by hand.

---

### Task 1: Establish the Brain-Health Evidence Framework

**Files:**

- Create: `references/brain-health-evidence-framework.md`
- Modify: `references/_index.md`

**Interfaces:**

- Consumes: the source-priority and wording rules in `docs/superpowers/specs/2026-07-19-lifecourse-brain-health-design.md`.
- Produces: the four editorial labels `可直接行动`, `可选择尝试`, `研究中`, and `不推荐`, which every later content task must apply consistently.

- [ ] **Step 1: Record the pre-change baseline**

Run:

```bash
git status --short
sed -n '1,220p' references/_index.md
```

Expected: only the implementation-plan artifact may be untracked or staged; `references/_index.md` lists the three existing reference files.

- [ ] **Step 2: Create the evidence framework**

Create `references/brain-health-evidence-framework.md` with these exact sections:

```markdown
# 脑健康内容证据与安全框架

## 这个框架解决什么问题
## 四类问题不能混为一谈
## Gulou 编辑证据等级
### 可直接行动
### 可选择尝试
### 研究中
### 不推荐
## 来源优先级
## 从研究到建议的判断步骤
## 不能单独支持因果建议的证据
## 数字、机制和脑区表述规则
## 医疗与营养安全检查
## 内容更新规则
## 核心方法学来源
```

The “四类问题” table must contain brain-health protection, effective learning, ability training, and clinical rehabilitation. State explicitly that this is a Gulou editorial system, not a formal GRADE assessment.

Include these methodological anchors:

- WHO, *Optimizing brain health across the life course* (2022): `https://www.who.int/publications/i/item/9789240054561`
- WHO, *Risk reduction of cognitive decline and dementia*, second edition (2026): `https://www.who.int/publications/i/item/9789240123557`
- WHO healthy diet: `https://www.who.int/news-room/fact-sheets/detail/healthy-diet`
- WHO physical activity: `https://www.who.int/news-room/fact-sheets/detail/physical-activity`

- [ ] **Step 3: Add the framework to the reference index**

Add rows to `references/_index.md`:

```markdown
| brain-health-evidence-framework.md | 脑健康内容的证据分级、因果判断与安全表述规范 |
| brain-science-interview-audit-2026.md | 两期公开脑科学访谈的逐条证据核查 |
```

The audit row may link to the file before Task 2 creates it because Tasks 1 and 2 are executed consecutively on the same branch; do not publish or build between those two tasks.

- [ ] **Step 4: Verify terminology and formatting**

Run:

```bash
rg -n "可直接行动|可选择尝试|研究中|不推荐|不等同于.*GRADE" references/brain-health-evidence-framework.md
git diff --check
```

Expected: all four labels and the non-GRADE disclaimer are present; `git diff --check` emits no errors.

- [ ] **Step 5: Commit the evidence framework**

```bash
git add references/brain-health-evidence-framework.md references/_index.md
git commit -m "docs(brain-health): Add evidence framework"
```

---

### Task 2: Publish the Two-Interview Claim Audit

**Files:**

- Create: `references/brain-science-interview-audit-2026.md`

**Interfaces:**

- Consumes: the four evidence labels from `references/brain-health-evidence-framework.md`.
- Produces: a claim-to-safe-wording ledger used by Tasks 3–6; it is not itself a clinical guide.

- [ ] **Step 1: Add source identity and audit method**

Start the file with:

```markdown
# 两期脑科学访谈证据核查（2026）

> 本文只核查公开主张与引用证据，不评价受访者的个人动机或临床能力。

## 核查范围
## 结论如何分级
## 逐条核查
## 可以安全保留的核心原则
## 不应进入行动指南的说法
## 主要参考资料
```

Under “核查范围,” include both Douyin URLs and the complete Xiaoyuzhou episode URLs:

- `https://v.douyin.com/z67JgZpafrM/`
- `https://v.douyin.com/SyM1dxr6f3w/`
- `https://www.xiaoyuzhoufm.com/episode/6a55b67027a4eec16c405525`
- `https://www.xiaoyuzhoufm.com/episode/6a4b324a3fb7233cbf445e4a`

State that the audit used the complete approximately 30-minute and 63-minute source audio, not only edited Douyin excerpts.

- [ ] **Step 2: Build the timestamped audit table**

Use these columns:

```markdown
| 期数与时间 | 公开主张 | 结论 | 证据说明 | 安全改写 |
|---|---|---|---|---|
```

Include at least these claims, with the indicated classification floor:

1. Pediatric brain-tumor mortality ranking — `方向正确但表述不精确`.
2. Mobile-phone RF causes or probably causes pediatric brain tumors — `现有证据不支持`.
3. Reading guarantees no Alzheimer disease — `错误`; cognitive reserve is the safe replacement.
4. The whole brain starts declining at age 30 — `过度简化`.
5. Blood-pressure, glucose, and lipid management supports brain health — `可直接行动`.
6. “Life becoming a mess” is the earliest specific sign of brain disease — `不推荐`.
7. Lifelong plasticity and rehabilitation after injury — `方向正确但不能保证结果`.
8. Shouting once damages the prefrontal cortex — `夸大`; chronic maltreatment/toxic stress is the supported concern.
9. Instinct/emotional/rational “three brains” — `过时且不准确`.
10. Ages 10–18 develop only the emotional brain and PFC starts after 18 — `错误`.
11. A 30-second hug universally suppresses the amygdala — `证据有限`; consensual supportive touch may reduce stress.
12. Children need about one hour of daily physical activity — `可直接行动`; guaranteed grades/neurogenesis claims are excluded.
13. Exercise followed immediately by study preserves new neurons — `现有证据不支持`.
14. Innate differences do not contribute to intelligence — `错误`; genes and environment both contribute.
15. The parietal skull is thick to protect a mathematics area — `错误`.
16. Morning water “flushes brain toxins” — `现有证据不支持`.
17. One sip of water raises exam scores by 4.8% — `因果结论不成立`.
18. Children should eat 80% fat/protein and no more than 20% carbohydrate at lunch/dinner — `不安全且与指南冲突`.
19. ARA is omega-3 and dark vegetables provide substantial EPA/DHA — `事实错误`.
20. An 11.5-hour fast and studying before breakfast activate BDNF and memory — `研究误读且不推荐`.
21. Four days of sugary drinks causes hippocampal atrophy in children — `研究对象和结局被误述`.
22. Retrieval practice is more effective than repeated passive review — `可直接行动`.
23. Output/teaching is always the best input — `方向正确但绝对化`.
24. AI use reduces prefrontal function by 53% and makes people dumber — `研究过度解读`.
25. Well-designed AI tutoring may improve learning efficiency — `可选择尝试`.
26. Every small learning step requires a random material reward — `不推荐作为普遍规则`.

- [ ] **Step 3: Attach direct evidence to each high-risk claim**

Use direct links beside the relevant rows, including:

- NCI mobile-phone fact sheet: `https://www.cancer.gov/about-cancer/causes-prevention/risk/radiation/cell-phones-fact-sheet`
- WHO/IARC Group 2B explanation: `https://www.who.int/india/health-topics/electromagnetic-fields`
- 2024 RF systematic review: `https://www.sciencedirect.com/science/article/pii/S0160412024005695`
- WHO 2026 dementia guideline: `https://www.who.int/publications/i/item/9789240123557`
- Cognitive peak heterogeneity: `https://pmc.ncbi.nlm.nih.gov/articles/PMC4441622/`
- Adaptive-not-triune review: `https://pubmed.ncbi.nlm.nih.gov/35432041/`
- WHO child maltreatment: `https://www.who.int/news-room/fact-sheets/detail/child-maltreatment`
- WHO physical activity: `https://www.who.int/news-room/fact-sheets/detail/physical-activity`
- Four-day high-fat/high-sugar experiment: `https://pmc.ncbi.nlm.nih.gov/articles/PMC5322971/`
- Water/exam observational study: `https://eric.ed.gov/?id=EJ1013601`
- Shanghai meal-timing cross-sectional study: `https://pubmed.ncbi.nlm.nih.gov/39632366/`
- Retrieval-practice review: `https://eric.ed.gov/?id=EJ1319572`
- MIT LLM-writing preprint: `https://arxiv.org/abs/2506.08872`
- Harvard AI-tutor RCT: `https://www.nature.com/articles/s41598-025-97652-6`
- Extrinsic-reward meta-analysis: `https://pubmed.ncbi.nlm.nih.gov/10589297/`

For every study-misinterpretation row, explicitly name the actual population, design, and measured outcome.

- [ ] **Step 4: Verify audit coverage and prohibited causal wording**

Run:

```bash
rg -n "手机|阿尔茨海默|30 岁|三脑|空腹|4\.8%|80%|检索练习|AI|奖励" references/brain-science-interview-audit-2026.md
rg -n "一定不会|必然导致|保证提分|普遍提高智商" references/brain-science-interview-audit-2026.md
git diff --check
```

Expected: every audit topic is present; prohibited phrases appear only when clearly marked as quoted or rejected claims; formatting check passes.

- [ ] **Step 5: Commit the interview audit**

```bash
git add references/brain-science-interview-audit-2026.md
git commit -m "docs(brain-health): Audit interview claims"
```

---

### Task 3: Create the Lifecourse Brain-Health Entry

**Files:**

- Create: `paths/brain-health/_index.md`

**Interfaces:**

- Consumes: evidence labels from Task 1 and safe formulations from Task 2.
- Produces: the canonical entry point linked by `paths/_index.md` in Task 7.

- [ ] **Step 1: Add path frontmatter**

Use this exact frontmatter:

```yaml
---
id: lifecourse-brain-health
name: 终身脑健康与循证学习路径
stage: lifecourse
domain: brain-health
description: 从婴幼儿到老年，以现代证据保护脑健康并培养可迁移的学习能力
estimated_duration: 持续实践
review_status: draft
---
```

Do not add `agent_use`.

- [ ] **Step 2: Write the conceptual boundary and priority order**

Use these sections:

```markdown
# 终身脑健康与循证学习路径
## 先分清四件事
## 优先级：先保护，再学习，再训练
## 全年龄地图
## 七个贯穿一生的行动维度
## 选择适合你的下一篇
## 常见误区
## 需要专业帮助的情况
## 主要依据
```

The priority order must place sleep, physical activity, balanced diet, safety, social connection, sensory/medical care, and meaningful learning before supplements or commercial training.

- [ ] **Step 3: Add the eight-band age map**

The table must contain these rows and emphases:

| Age | Primary emphasis |
|---|---|
| 0–2 | health, responsive caregiving, nutrition, safety, language interaction, movement |
| 3–5 | play, language, executive-function opportunities, emotion co-regulation, movement |
| 6–12 | sleep, movement, reading, foundational knowledge, retrieval and feedback |
| 13–18 | sufficient sleep, autonomy with boundaries, social-emotional skills, learning strategy |
| 18–29 | deep domain learning, physical and mental health, safe AI/tool use |
| 30–44 | sustainable learning, sleep, stress, cardiovascular-risk prevention |
| 45–59 | blood pressure/glucose/lipids, hearing, movement, social and cognitive activity |
| 60+ | function, multidomain risk reduction, compensation, social connection, early assessment |

Avoid a single “peak” or “decline starts” age.

- [ ] **Step 4: Add the seven action dimensions**

Cover sleep, physical activity, diet, relationships/stress, learning, digital tools, and medical/sensory risk. Each dimension must include one “do” and one evidence boundary.

Link to:

```markdown
[0–18 岁大脑发育与学习](0-18-development-and-learning.md)
[循证学习方法](evidence-based-learning.md)
[60+ 岁脑健康与认知保持](../../stages/老年期（60+岁）/认知保持/brain-health-01.md)
```

- [ ] **Step 5: Verify the path structure**

Run:

```bash
rg -n "^## " paths/brain-health/_index.md
rg -n "0–2|3–5|6–12|13–18|18–29|30–44|45–59|60\+" paths/brain-health/_index.md
rg -n "agent_use" paths/brain-health/_index.md
git diff --check
```

Expected: all required headings and eight age bands are present; the `agent_use` search returns no matches; formatting check passes.

- [ ] **Step 6: Commit the lifecourse entry**

```bash
git add paths/brain-health/_index.md
git commit -m "docs(brain-health): Add lifecourse path"
```

---

### Task 4: Write the 0–18 Development and Learning Guide

**Files:**

- Create: `paths/brain-health/0-18-development-and-learning.md`
- Modify only if navigation requires it: selected `_index.md` files under `stages/家庭期（25-45岁）/育儿指导/`

**Interfaces:**

- Consumes: the age-map conventions from Task 3 and existing age-specific articles.
- Produces: detailed child/adolescent guidance linked from the lifecourse entry; it delegates operational details to existing articles.

- [ ] **Step 1: Add frontmatter and reader contract**

Use:

```yaml
---
id: brain-health-0-18
name: 0–18 岁大脑发育与学习支持
stage: 0-18
domain: brain-health
description: 以健康、关系、游戏、运动和有效学习支持儿童与青少年发展
estimated_duration: 按年龄持续实践
review_status: draft
---
```

Open with three explicit promises:

1. Do not rank a child by “brain development level.”
2. Treat milestones as ranges, not deadlines.
3. Separate normal variation, home support, professional assessment, and emergencies.

- [ ] **Step 2: Write the 0–2 section**

Cover good health, adequate nutrition, safety, responsive caregiving, early learning, sleep, movement, talking, singing, and shared reading. Use WHO nurturing care as the primary framework:

`https://www.who.int/publications/i/item/9789241514064`

Link to these existing files instead of repeating their instructions:

```markdown
../../stages/家庭期（25-45岁）/育儿指导/0-3岁/认知与心理/attachment-01.md
../../stages/家庭期（25-45岁）/育儿指导/0-3岁/认知与心理/early-reading-01.md
../../stages/家庭期（25-45岁）/育儿指导/0-3岁/身体能力/gross-motor-01.md
../../stages/家庭期（25-45岁）/育儿指导/0-3岁/日常护理/feeding-guide-01.md
../../stages/家庭期（25-45岁）/育儿指导/0-3岁/日常护理/newborn-sleep-01.md
../../stages/家庭期（25-45岁）/育儿指导/0-3岁/认知与心理/screen-time-01.md
```

- [ ] **Step 3: Write the 3–5 section**

Focus on play, language-rich interaction, co-regulation, executive-function opportunities, basic movement, and early literacy/numeracy without academic acceleration claims.

Link to:

```markdown
../../stages/家庭期（25-45岁）/育儿指导/3-6岁/认知与心理/executive-function-01.md
../../stages/家庭期（25-45岁）/育儿指导/3-6岁/认知与心理/emotion-regulation-01.md
../../stages/家庭期（25-45岁）/育儿指导/3-6岁/认知与心理/reading-habits-01.md
../../stages/家庭期（25-45岁）/育儿指导/3-6岁/认知与心理/pre-literacy-math-01.md
../../stages/家庭期（25-45岁）/育儿指导/3-6岁/身体能力/basic-movement-01.md
```

- [ ] **Step 4: Write the 6–12 section**

Cover sleep, daily physical activity, reading, foundational knowledge, retrieval, spaced review, feedback, friendships, and screen routines. Avoid claiming that exercise guarantees grades.

Link to:

```markdown
../../stages/家庭期（25-45岁）/育儿指导/6-9岁/身体能力/sleep-management-01.md
../../stages/家庭期（25-45岁）/育儿指导/6-9岁/身体能力/sports-habits-01.md
../../stages/家庭期（25-45岁）/育儿指导/6-9岁/认知与心理/independent-reading-01.md
../../stages/家庭期（25-45岁）/育儿指导/6-9岁/认知与心理/screen-game-management-01.md
evidence-based-learning.md
```

- [ ] **Step 5: Write the 13–18 section**

Explain that social-affective sensitivity and cognitive-control networks develop together across adolescence. Cover sleep, movement, emotion skills, autonomy, relationships, academic pressure, digital life, and mental-health support without using the triune-brain model.

Link to:

```markdown
../../stages/家庭期（25-45岁）/育儿指导/14-18岁/认知与心理/adolescent-mental-health-01.md
../../stages/家庭期（25-45岁）/育儿指导/14-18岁/认知与心理/academic-pressure-01.md
../../stages/家庭期（25-45岁）/育儿指导/14-18岁/认知与心理/digital-life-01.md
../../stages/家庭期（25-45岁）/育儿指导/14-18岁/认知与心理/parent-teen-communication-01.md
```

- [ ] **Step 6: Add nutrition, training limits, observations, and red flags**

Include:

- Balanced, varied diet; no fixed macronutrient percentage or universal omega-3 supplement.
- Normal hydration according to thirst, climate, activity, health, and age; no “brain detox” or point-gain claim.
- Specific skills improve mainly through relevant practice; commercial brain games should not be sold as general intelligence training.
- Observable metrics: sleep consistency, active play/activity, reading/learning routine, functional participation, and recovery after stress—not IQ-like daily scoring.
- Red flags from the approved spec: skill regression; new seizures or altered consciousness; unilateral weakness or gait change; worsening headache with repeated vomiting or neurological/visual change; persistent functional impairment; self-harm or suicidal thoughts.

- [ ] **Step 7: Verify links and unsafe phrases**

Run:

```bash
rg -n "正常变化|在家支持|专业评估|紧急|技能.*倒退|自伤|自杀" paths/brain-health/0-18-development-and-learning.md
rg -n "80%|空腹学习|排脑毒|长出新神经|三脑|左右脑开发|保证提分" paths/brain-health/0-18-development-and-learning.md
git diff --check
```

Expected: all four safety levels and red flags are present; unsafe phrases appear only in a clearly labeled myth section, if at all; formatting passes.

- [ ] **Step 8: Commit the 0–18 guide**

```bash
git add paths/brain-health/0-18-development-and-learning.md
git commit -m "docs(brain-health): Add child development guide"
```

---

### Task 5: Write the Evidence-Based Learning Guide

**Files:**

- Create: `paths/brain-health/evidence-based-learning.md`

**Interfaces:**

- Consumes: the evidence framework and the child-guide age adaptations.
- Produces: the canonical learning-method reference for school-age learners and adults.

- [ ] **Step 1: Add frontmatter and outcome boundary**

Use:

```yaml
---
id: evidence-based-learning
name: 循证学习方法
stage: school-age-to-adult
domain: learning-science
description: 用检索、间隔、反馈和主动生成提高具体知识与技能的掌握
estimated_duration: 持续实践
review_status: draft
---
```

State that the goal is durable mastery of a defined subject or skill, not a promise to raise general intelligence.

- [ ] **Step 2: Write the high-evidence learning loop**

Use this reusable loop:

```text
明确目标 → 尝试回忆或解决 → 对照答案 → 纠正错误 → 间隔后再次检索 → 在新情境应用
```

Cover retrieval practice, spacing, feedback/correction, generation/elaboration, and conditional interleaving. Use:

- Nature Reviews Psychology spacing/retrieval review: `https://doi.org/10.1038/s44159-022-00089-1`
- Retrieval-practice classroom review: `https://eric.ed.gov/?id=EJ1319572`
- Testing meta-analysis: `https://pubmed.ncbi.nlm.nih.gov/33683913/`

- [ ] **Step 3: Add practical protocols**

Include concrete, non-prescriptive examples:

- After a short section, close the material and write three main points.
- Revisit missed items after a delay instead of rereading immediately multiple times.
- Mix problem types after each type is initially understood.
- Explain a solution, then verify every step against a source or worked answer.
- Use single-task blocks and remove avoidable notifications; do not claim the brain can literally process only one task.

Add age adaptation: younger children use brief oral/game-like recall with adult support; adolescents and adults gradually manage schedules and error logs independently.

- [ ] **Step 4: Add exam preparation and nutrition boundaries**

Use these conclusions:

- Sleep and prior learning matter more than a single “brain food.”
- Maintain normal meals and hydration; do not introduce fasting, extreme diets, supplements, or unfamiliar stimulants for an exam.
- A small observational study associating water availability with 4.8% higher marks does not prove a sip of water raises a student’s score.
- Physical activity supports general health and may modestly support cognition, but it does not guarantee a mark increase or require immediate post-exercise studying.

- [ ] **Step 5: Add transfer and commercial brain-training limits**

Define:

- **Task improvement**: better performance on the practiced task.
- **Near transfer**: benefit on a very similar task.
- **Far transfer**: benefit on a substantially different ability or real-world outcome.

State that commercial training often improves practiced tasks, while robust far transfer to general intelligence, school achievement, or dementia prevention is uncertain. Cite:

- `https://pubmed.ncbi.nlm.nih.gov/27697851/`
- `https://pubmed.ncbi.nlm.nih.gov/34251578/`

- [ ] **Step 6: Add AI-as-coach guidance**

Use the sequence:

```text
先独立尝试 → 让 AI 提问或提示 → 自己解释答案 → 用教材/原始来源核验 → 间隔后无辅助重做
```

Explain:

- The MIT essay-writing study is a small preprint about a specific task and EEG connectivity, not proof that AI causes brain damage or lower intelligence.
- The Harvard AI-tutor RCT supports the possibility that well-designed guided tutoring improves learning efficiency in one physics context; it does not prove every chatbot or subject works equally well.
- Children require age-appropriate adult/school oversight, privacy protection, and independent reasoning opportunities.

- [ ] **Step 7: Add rewards and feedback boundaries**

Recommend specific, informational feedback and achievable process goals. Explain that expected tangible rewards can sometimes undermine intrinsic motivation, so there is no universal rule to reward every micro-step or use random prizes. Link:

- Reward meta-analysis: `https://pubmed.ncbi.nlm.nih.gov/10589297/`
- Process-versus-person praise experiment: `https://pubmed.ncbi.nlm.nih.gov/10380873/`

- [ ] **Step 8: Verify scope and wording**

Run:

```bash
rg -n "检索|间隔|反馈|交错|近迁移|远迁移|先独立尝试|原始来源核验" paths/brain-health/evidence-based-learning.md
rg -n "提高智商|保证提分|脑损伤|53%|4\.8%" paths/brain-health/evidence-based-learning.md
git diff --check
```

Expected: the complete learning loop, transfer definitions, and AI verification loop are present; risky numeric claims are explicitly rejected or contextualized; formatting passes.

- [ ] **Step 9: Commit the learning guide**

```bash
git add paths/brain-health/evidence-based-learning.md
git commit -m "docs(learning): Add evidence-based learning guide"
```

---

### Task 6: Write the 60+ Brain-Health and Cognitive-Maintenance Guide

**Files:**

- Create: `stages/老年期（60+岁）/认知保持/brain-health-01.md`
- Modify: `stages/老年期（60+岁）/_index.md`

**Interfaces:**

- Consumes: the risk-reduction wording and evidence levels from Task 1.
- Produces: the detailed 60+ guide linked by the lifecourse entry and elder-stage index.

- [ ] **Step 1: Add frontmatter**

Use:

```yaml
---
id: elder-brain-health-01
stage: elder
track: core
domain: cognitive-health
topic: 脑健康与认知保持
age_range: 60+y
difficulty: foundational
review_status: draft
tags: [脑健康, 认知保持, 痴呆风险降低, 认知补偿]
---
```

Do not include `agent_use`.

- [ ] **Step 2: Separate normal aging from concerning change**

Explain that processing speed and effortful recall may change with age, while knowledge, vocabulary, judgment based on experience, and individual trajectories vary. Normal aging does not equal dementia.

Use these headings:

```markdown
# 脑健康与认知保持
## 先区分正常变化与需要评估的变化
## 最值得优先做的事
## 认知活动与认知储备
## 用补偿策略维持独立生活
## 可以尝试但不要夸大
## 常见误区
## 观察指标
## 何时就医
## 主要依据
```

- [ ] **Step 3: Add multidomain risk-reduction actions**

Cover:

- regular physical activity plus strength/balance as appropriate;
- blood-pressure, glucose, lipid, tobacco, alcohol, medication, and weight management with clinicians;
- hearing and vision assessment/correction;
- sleep problems and depression assessment;
- social connection, meaningful roles, and continued learning;
- healthy, balanced dietary pattern rather than a supplement or single food;
- fall and head-injury prevention.

Use WHO 2026 as the primary anchor and the Lancet 2024 Commission as a secondary synthesis:

- `https://www.who.int/publications/i/item/9789240123557`
- `https://pubmed.ncbi.nlm.nih.gov/39096926/`

- [ ] **Step 4: Add cognitive reserve and compensation without guarantees**

Explain that education and cognitively engaging activities may contribute to reserve and function but cannot guarantee prevention. Include practical compensation:

- fixed locations for keys and medicines;
- calendars, alarms, written steps, and pill organizers used safely;
- simplify one task at a time;
- focus on valued activities and adapt the environment;
- involve trusted family or professionals when safety-sensitive tasks change.

- [ ] **Step 5: Add red flags and emergency actions**

Separate:

- **Emergency:** sudden facial droop, unilateral weakness, speech difficulty, acute severe headache, new seizure, or acute altered consciousness — call local emergency services.
- **Prompt medical assessment:** changes over hours/days in attention or awareness; progressive difficulty with medicines, money, driving, cooking, appointments, or personal safety.
- **Potentially treatable contributors:** depression, hearing loss, sleep disorder, infection, pain, medication effects, thyroid/nutritional issues as assessed by clinicians.

Do not label “life becoming messy” as a specific brain-disease sign.

- [ ] **Step 6: Replace the elder-index placeholder**

In `stages/老年期（60+岁）/_index.md`:

- change `## 规划内容（待创建）` to `## 阶段内容`;
- replace the loose “神经可塑性训练、认知刺激” bullet with a link:

```markdown
- [脑健康与认知保持](认知保持/brain-health-01.md)：多领域风险降低、认知储备、补偿策略与就医红旗
```

- retain unrelated health, social-connection, and life-narrative planning bullets;
- remove any implication that cognitive decline can be fully prevented.

- [ ] **Step 7: Verify safety language**

Run:

```bash
rg -n "正常变化|不等于痴呆|降低风险|听力|社会连接|补偿|急救|面歪|单侧无力|言语" 'stages/老年期（60+岁）/认知保持/brain-health-01.md'
rg -n "保证预防|一定不会|生活变乱.*脑病" 'stages/老年期（60+岁）/认知保持/brain-health-01.md'
git diff --check
```

Expected: normal/concerning distinction, multidomain actions, compensation, and red flags are present; guarantee language is absent; formatting passes.

- [ ] **Step 8: Commit the 60+ guide**

```bash
git add 'stages/老年期（60+岁）/认知保持/brain-health-01.md' 'stages/老年期（60+岁）/_index.md'
git commit -m "docs(brain-health): Add older-adult guidance"
```

---

### Task 7: Integrate Navigation and Cross-Links

**Files:**

- Modify: `paths/_index.md`
- Modify: `references/_index.md` only if Task 1’s provisional audit row needs correction.
- Modify: `paths/brain-health/_index.md` only for final link corrections.
- Modify selected 0–18 index files only when necessary for a single canonical backlink.

**Interfaces:**

- Consumes: all content files from Tasks 1–6.
- Produces: discoverable navigation without adding content to the Agent MVP manifest.

- [ ] **Step 1: Add the brain-health path to `paths/_index.md`**

Insert a section before interest-learning paths:

```markdown
## 终身脑健康与学习

| 路径 | 覆盖范围 | 重点内容 |
|------|---------|---------|
| [终身脑健康与循证学习](brain-health/_index.md) | 0 岁至老年 | 脑健康保护、0–18 岁发展、循证学习、60+ 认知保持 |
```

- [ ] **Step 2: Check all planned cross-links**

Run:

```bash
rg -n "brain-health" paths/_index.md references/_index.md 'stages/老年期（60+岁）/_index.md' paths/brain-health
```

Expected: the main path, both references, and elder guide are reachable from an index; no link points to `gulou-agent`.

- [ ] **Step 3: Run a local Markdown-link existence check**

Run this repository-local checker without creating a new dependency or tracked script:

```bash
node -e 'const fs=require("fs"),p=require("path");const roots=["paths/brain-health","references/brain-health-evidence-framework.md","references/brain-science-interview-audit-2026.md","stages/老年期（60+岁）/认知保持/brain-health-01.md","paths/_index.md","references/_index.md","stages/老年期（60+岁）/_index.md"];let files=[];for(const r of roots){const s=fs.statSync(r);if(s.isDirectory())files.push(...fs.readdirSync(r).filter(x=>x.endsWith(".md")).map(x=>p.join(r,x)));else files.push(r)}let miss=[];for(const f of files){const t=fs.readFileSync(f,"utf8");for(const m of t.matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]+)?\)/g)){const q=p.resolve(p.dirname(f),decodeURI(m[1]));if(!fs.existsSync(q))miss.push(`${f} -> ${m[1]}`)}}if(miss.length){console.error(miss.join("\n"));process.exit(1)}console.log(`Checked ${files.length} Markdown files; missing local links: 0`)'
```

Expected: `missing local links: 0`.

- [ ] **Step 4: Confirm the open-core boundary**

Run:

```bash
git diff --name-only main...HEAD
git -C ../gulou-agent status --short
```

Expected: only `gulou-core` Markdown files are changed; `gulou-agent` has no changes from this task.

- [ ] **Step 5: Commit navigation integration**

```bash
git add paths/_index.md references/_index.md 'stages/老年期（60+岁）/_index.md' paths/brain-health
git commit -m "docs(brain-health): Link new knowledge path"
```

If some listed files have no changes, omit them from `git add`; do not manufacture edits merely to match the command.

---

### Task 8: Run Full Content and Build Verification

**Files:**

- Verify: all files created or modified by Tasks 1–7.
- Do not hand-edit: `website/site/` or `word/docx/`.

**Interfaces:**

- Consumes: the complete knowledge release.
- Produces: a verified branch ready for review or integration.

- [ ] **Step 1: Run placeholder and frontmatter scans**

```bash
rg -n "TBD|TODO|待补|待核实|placeholder" paths/brain-health references/brain-health-evidence-framework.md references/brain-science-interview-audit-2026.md 'stages/老年期（60+岁）/认知保持/brain-health-01.md'
rg -n "^id:|^name:|^stage:|^domain:|^review_status:" paths/brain-health/*.md 'stages/老年期（60+岁）/认知保持/brain-health-01.md'
```

Expected: no placeholders; every public guide contains the planned metadata fields, while reference files follow the repository’s reference style without frontmatter.

- [ ] **Step 2: Scan for unsafe or pseudoscientific claims**

```bash
rg -n "左右脑开发|大脑开发率|只用了.*%|三位一体脑|本能脑|情感脑|排脑毒|保证提分|保证预防|运动后.*新神经细胞|80%.*脂肪|空腹.*BDNF" paths/brain-health 'stages/老年期（60+岁）/认知保持/brain-health-01.md'
```

Expected: no matches, except clearly labeled myth quotations that immediately state the claim is unsupported.

- [ ] **Step 3: Re-run local-link and formatting checks**

Repeat Task 7 Step 3, then run:

```bash
git diff --check main...HEAD
```

Expected: zero missing local links and no whitespace errors.

- [ ] **Step 4: Build the public website**

```bash
npm --prefix website run build
```

Expected: exit code 0 and generated pages for `paths/brain-health/` plus the elder and reference documents.

- [ ] **Step 5: Build Word exports**

```bash
npm --prefix word run build
```

Expected: exit code 0; the content-discovery process completes without errors for the new directory and Chinese path.

- [ ] **Step 6: Inspect generated discovery results**

```bash
find website/site/paths/brain-health -maxdepth 2 -type f -print
find 'website/site/stages/老年期（60+岁）/认知保持' -maxdepth 2 -type f -print
find word/docx/paths/brain-health -maxdepth 2 -type f -print
```

Expected: generated outputs exist for the path index, 0–18 guide, learning guide, and 60+ guide. If the generator slugifies Chinese directories, locate the exact output with `rg --files website/site word/docx | rg 'brain-health|认知保持'` and record the generated path.

- [ ] **Step 7: Review the final diff and repository boundaries**

```bash
git diff --stat main...HEAD
git diff --name-only main...HEAD
git status --short
git -C ../gulou-agent status --short
```

Expected: only the approved `gulou-core` Markdown/spec/plan files are tracked changes; generated outputs remain ignored; both worktrees are otherwise clean.

- [ ] **Step 8: Commit any verification-only link or wording fixes**

If verification required content corrections:

```bash
git add <only-the-files-corrected-during-verification>
git commit -m "docs(brain-health): Fix verification findings"
```

If no corrections were needed, do not create an empty commit.

- [ ] **Step 9: Prepare the completion handoff**

Report:

- created and modified files;
- major claims retained, downgraded, or rejected from the interviews;
- evidence and safety model used;
- exact website and Word build commands and outcomes;
- branch name and commit list;
- confirmation that `gulou-agent` was not changed.
