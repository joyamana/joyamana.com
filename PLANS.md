# Execution Plans

复杂任务使用可持续更新的 Execution Plan，让后续 Codex 会话无需依赖聊天历史也能
安全继续。已完成计划移至
[`docs/archive/execution-plans-2026-08-to-09.md`](docs/archive/execution-plans-2026-08-to-09.md)，
不得把其中的历史 blocker、部署状态或测试结果当成当前事实。

## Current status

截至 2026-09-02，没有 Active Execution Plan。当前状态分别见：

- [`docs/DECISIONS.md`](docs/DECISIONS.md)
- [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md)

## 何时使用

满足任一条件时使用：

- 跨越两个或更多领域规格。
- 包含架构、数据所有权、公开 URL 或第三方平台决策。
- 需要多个里程碑、较长验证或分阶段发布。
- 中断后需要其他人或 Codex 会话继续。

单文件修复、文案微调和明确的小任务不需要创建计划。

## 规则

- 计划必须自包含，写清目标、上下文、非目标、依赖和完成标准。
- 每次完成里程碑后更新进度和发现，不让计划与代码脱节。
- 未决业务问题引用 `docs/OPEN_QUESTIONS.md` 的 ID。
- 架构决定引用 `docs/DECISIONS.md` 的 ID；新架构决定先进入决策日志。
- 不把猜测写成事实。采用临时默认值时，写清可撤销路径。
- 验证必须是可执行或可观察的结果，不能只写“测试一下”。
- 完成后记录 Outcome，再将整个计划移入 `docs/archive/`；根文件只保留模板和 Active
  计划，避免历史状态干扰当前工作。

## 模板

```md
# <计划名称>

状态：Draft | Active | Blocked | Complete
负责人：<name>
最后更新：YYYY-MM-DD
关联：<issue / decision / question / spec>

## Objective

完成后用户或系统能够做到什么。

## Context

相关目录、现状、事实来源和必须先读的文档。

## Scope

- 包含：
- 不包含：

## Decisions and assumptions

- Accepted decision:
- Temporary assumption:
- Blocking question:

## Milestones

1. [ ] <可独立验收的结果>
2. [ ] <可独立验收的结果>

## Detailed approach

按文件、模块、数据流或用户流程说明实现方法，以及选择此方法的原因。

## Validation

- Command:
- Manual observation:
- SEO/Commerce/Data checks:
- Rollback or recovery:

## Progress log

- YYYY-MM-DD: <完成内容、发现、阻塞>

## Risks

- Risk:
  - Mitigation:

## Outcome

实际交付、验证结果、与原计划的差异、剩余工作。
```
