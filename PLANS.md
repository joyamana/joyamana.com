# Execution Plans

复杂任务使用可持续更新的 Execution Plan，让后续 Codex 会话无需依赖聊天
历史也能安全继续。计划是执行记录，不是静态提案。

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
- 完成后保留 Outcome，总结实际结果、偏差、遗留项和验证证据。

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

---

# Trust、Policy 与 Product Care 本地页面骨架

状态：Complete  
负责人：Codex  
最后更新：2026-08-14  
关联：D-009、D-021、D-023、D-024；Q-003A–Q-003F；`MVP_PRD.md` P-003/P-007

## Objective

在不接入 Shopify、不虚构运营或法律事实的前提下，完成 Trust/Policy 页面、
Product Care、FAQ、Contact、Accessibility 的本地路由、统一数据契约、页面呈现、
Footer 与 PDP 入口。未来接入 Shopify 时只替换内容 adapter，不重做公开 URL 和 UI。

## Context

现有测试站已有 Shipping、Returns、Privacy、Terms 和 Contact 占位页；Shopify
store、Headless channel、真实政策、客服渠道和商品护理事实尚未准备。测试站全站
默认 `noindex`，当前政策页不在 sitemap。

## Scope

- 包含：统一 draft/published 状态和 source 类型；补充 Disclaimer、Product Care、
  FAQ、Accessibility；更新已有 Policy 页面；四个 locale 路由；Footer 与 PDP 链接；
  文档和验证。
- 不包含：Shopify API 接入、正式政策文案、法律建议、可提交 Contact 表单、
  Policy/FAQ Schema、启用索引或 Checkout。

## Decisions and assumptions

- Accepted：标准 Policy 与普通内容最终由 Shopify Policies/Pages 提供，商品专属
  护理由 Product metafields 提供；Next.js 负责品牌化 URL 和呈现。
- Temporary：所有新增本地内容均为 `draft`，只描述发布前所需输入，不包含期限、
  费用、权利、保证或材料护理承诺。
- Blocking：Q-003A–Q-003F 和 `PRODUCT_INPUTS.md` 的护理相关字段。

## Milestones

1. [x] 建立统一 TrustPage 数据契约与可复用页面。
2. [x] 完成 en-US、es-US、en-CA、fr-CA 路由与导航入口。
3. [x] 完成 PDP 的 Care、Shipping、Returns 摘要链接。
4. [x] 完成 lint、typecheck、tests、build 和初始 HTML 检查。

## Detailed approach

使用本地 typed definitions 表达页面 handle、状态、目标 Shopify source 与待确认
输入；组件只渲染该模型。现有 Policy 页面迁移到同一组件。新增页面保持静态服务端
渲染。Draft 页面不加入 sitemap，未来 adapter 提供已批准内容后再加入发布门禁。

## Validation

- Command：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
- Manual observation：检查四个 locale 的页面路由、Footer 链接和 PDP 内链。
- SEO/Data：全站仍为 noindex；draft trust pages 不进入 sitemap；无虚构政策事实。

## Progress log

- 2026-08-14：建立执行计划并开始盘点现有实现。
- 2026-08-14：新增 typed TrustPage definitions、统一 draft 页面组件、12 个新
  locale 路由，并将既有 Shipping/Returns/Privacy/Terms 迁移到同一模型。
- 2026-08-14：Footer 与 PDP 内链完成；draft trust pages 通过发布状态继续排除
  sitemap；同步 MVP、SEO/GEO 与设计系统文档。
- 2026-08-14：ESLint、TypeScript、14 项测试和 104 页 production build 通过；
  生产服务器 HTML 抽查确认 H1、draft 标记、localized route、PDP 内链和空 sitemap。

## Risks

- Risk：占位文案被误认为正式政策。
  - Mitigation：页面显式显示 Draft / not published，且不包含具体承诺。
- Risk：未来 Shopify 数据结构导致页面返工。
  - Mitigation：页面只依赖统一 TrustPage 模型，Shopify 映射位于内容适配层。

## Outcome

本地 Trust/Policy 页面骨架已完成。新增 `/disclaimer`、`/product-care`、`/faq`、
`/accessibility` 及四个 locale 版本；`/returns` 页面标题统一为 Returns & Refunds。
所有页面仍是 draft，不含运营、护理或法律承诺，不进入 sitemap。未来需接入
Shopify Policies/Pages/Product metafields，并在 Q-003A–Q-003F 与商品护理事实
获批后补正式内容、页面级 metadata、发布状态和 sitemap。
