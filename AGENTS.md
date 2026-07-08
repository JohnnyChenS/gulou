# Gulou Education Workspace

## Workspace Purpose

This directory is the top-level workspace for the Gulou education project family.
It is not intended to remain a single product repository.

The target structure is:

```text
education/
├── AGENTS.md
├── CLAUDE.md
├── gulou-core/
└── gulou-agent/
```

## Repositories

### `gulou-core`

Public/open-source repository.

Responsibilities:

- Markdown knowledge base for lifelong growth and education.
- Parenting guidance, development-stage content, interest learning paths, and references.
- `agent_use` metadata that makes selected content usable by AI Agent products.
- Static knowledge website generation under `website/`.
- Word/document export tooling under `word/`.

Current MVP knowledge focus:

- 0-3 岁新手父母.
- 日常护理基础操作：哭闹排查、抱新生儿、喂养、拍嗝、换尿不湿、睡眠、肠胀气、洗澡与脐带护理.
- 成长发展基础：安全依恋、粗大动作.
- 父母支持：睡眠剥夺与产后适应.

`gulou-core` should remain valuable as a public knowledge base. Do not delete future-stage
content just because it is outside the current Agent MVP. Use product-side manifests to
select what the Agent consumes.

### `gulou-agent`

Private/closed-source product repository.

Responsibilities:

- User onboarding and profile collection.
- Child/profile state management.
- Knowledge ingestion from `../gulou-core`.
- MVP content selection through a manifest.
- Agent workflow orchestration.
- Prompt composition, evaluation cases, and report generation.
- 4-week growth plans and weekly reviews.
- User data, memory, and product logic.

`gulou-agent` should not copy the entire public knowledge base. It should read selected
content from `gulou-core`, parse frontmatter and `agent_use`, and construct product-specific
outputs.

## Product Direction

The near-term product is not a generic static website and not a full lifelong Agent.

The current MVP loop is:

```text
user context -> stage/problem identification -> 4-week plan -> weekly action ->
weekly review -> adjusted next step
```

First validation scenario:

- User: new parents.
- Subject: 0-3 month / 0-3 year child depending on content coverage.
- Primary pain: practical care anxiety and early development uncertainty.
- Output: low-anxiety, evidence-aware, actionable weekly plan.

## Open-Core Boundary

Public in `gulou-core`:

- General knowledge content.
- Stage frameworks.
- References.
- Human-readable care guides.
- `agent_use` metadata schema and examples.
- Static website.

Private in `gulou-agent`:

- User data.
- Personalization logic.
- Agent workflow and prompt orchestration.
- Scoring or prioritization rules.
- Product UX and commercial logic.
- Evaluation datasets that include user-like private scenarios.

## Development Rules

- Keep `gulou-core` and `gulou-agent` as separate Git repositories.
- Do not solve product focus by deleting unrelated public knowledge from `gulou-core`.
- Add Agent-facing metadata to `gulou-core` only when the content is actually used or being prepared for use.
- Keep product MVP selection in `gulou-agent` manifests, not in the public website build.
- The public website may continue exposing the broader knowledge base.
- For content touching medical, safety, or mental-health risk, keep red flags explicit and cite authoritative sources.

## Current Structural Migration Plan

1. Commit current `gulou-core` MVP content changes.
2. Move the existing repository into `education/gulou-core/`.
3. Keep this file and `CLAUDE.md` at `education/` as workspace-level guidance.
4. Create `education/gulou-agent/` as a separate private repository skeleton.
5. Configure `gulou-agent` to read selected knowledge from `../gulou-core`.
