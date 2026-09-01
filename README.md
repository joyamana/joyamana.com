# Crystal DTC Storefront

面向美国市场的水晶 DTC 品牌独立站。项目采用 `Brand + Content + Commerce`
模式：以品牌体验和可信内容建立认知，以 Shopify 完成交易。

当前状态（截至 2026-09-01）：**Production storefront 已在
`https://www.joyamana.com` 公开运行；Phase 3 与 Commerce hardening 仍在继续**。
`https://checkout.joyamana.com` 已指向 Shopify Online Store，但下单支付、税务/法律、
商品西语本地化和发布验收尚未完成，不能把“域名可访问”解释为完整交易上线。
商品/Cart 事实及已接入的 Policy、About/Accessibility、Blog/Guide 正文来自
Shopify，不再使用本地样本商品或正文 fallback。Home、Contact、导航等界面文案仍由
代码配置维护。全站索引、Shopify Checkout 和 Contact 表单投递分别受独立门禁
保护；当前 Shipping/Returns 和 About 内容已确认，其他法律/隐私、商品西语翻译、
外部账号和发布验收仍未完成。当前输入与
阻塞项分别见 [`docs/BRAND_INPUTS.md`](docs/BRAND_INPUTS.md) 和
[`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md)。

## 已确定方向

- 首发市场：United States
- 启用 Market：United States，en-US `/` + es-US `/es-us`，US Catalog / USD
- Planned Market：Canada 配置保留，但 `/en-ca` 与 `/fr-ca` 第一阶段不公开
- 前端：Next.js App Router + TypeScript
- Commerce：Shopify Headless / Storefront API / Shopify hosted checkout
- 部署：Vercel
- 购买方式：游客结账优先，不强制账户
- 增长基础：品牌体验、CRO、SEO、GEO/AI Search、Email
- 架构原则：简单可靠，不建设无业务必要的独立后端

## 文档阅读顺序

1. [`AGENTS.md`](AGENTS.md)：Codex 的仓库级工作约定。
2. [`docs/DECISIONS.md`](docs/DECISIONS.md)：已接受、拟议与待定的决策。
3. [`docs/BRAND_INPUTS.md`](docs/BRAND_INPUTS.md)：确认、工作假设与待定输入。
4. [`docs/PRODUCT_INPUTS.md`](docs/PRODUCT_INPUTS.md)：系列构思与当前测试商品。
5. [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md)：项目目标、边界与风险。
6. [`docs/MVP_PRD.md`](docs/MVP_PRD.md)：MVP 页面、流程和验收条件。
7. 领域规格：
   - [`docs/TECH_SPEC.md`](docs/TECH_SPEC.md)
   - [`docs/COMMERCE_SPEC.md`](docs/COMMERCE_SPEC.md)
   - [`docs/CONTENT_SEO_GEO_SPEC.md`](docs/CONTENT_SEO_GEO_SPEC.md)
   - [`docs/CUSTOMER_LIFECYCLE.md`](docs/CUSTOMER_LIFECYCLE.md)
   - [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
   - [`docs/ANALYTICS_AND_KPIS.md`](docs/ANALYTICS_AND_KPIS.md)
8. [`docs/ROADMAP.md`](docs/ROADMAP.md)：阶段、依赖与退出条件。
9. [`docs/LAUNCH_RUNBOOK.md`](docs/LAUNCH_RUNBOOK.md)：发布、监控与回滚。
10. [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md)：仍需确认的生产输入。
11. [`docs/REFERENCES.md`](docs/REFERENCES.md)：时效性官方资料索引。
12. [`PLANS.md`](PLANS.md)：复杂开发任务的执行计划模板。

`docs/archive/` 仅保存历史研究，不是当前事实来源。出现冲突时，按
`AGENTS.md` 中的文档优先级处理，并在同一变更中修正文档。

## 开发命令

需要 Node.js 24 LTS 与 pnpm：

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm preflight
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

当前尚未建立 CI 或 format check。Playwright 按 D-043 暂时封存，当前阶段不安装、
不维护 Playwright suite；关键浏览器与支付流程继续使用有记录的人工/合约 smoke，
不得把本地 Vitest 写成已通过浏览器、Preview 或支付端到端验收。

Commerce 与 Shopify-backed 正文的数据路径只使用 Shopify Storefront API；Contact
投递是受独立门禁保护的可选 Resend adapter。仓库示例值及未配置时的代码默认值以
`NEXT_PUBLIC_SITE_INDEXABLE=false` 保持全站不可索引；各部署环境必须单独核验。
不存在本地 Commerce provider 或样本 Catalog fallback；Shopify 缺失、数据无效或
请求失败时页面必须 fail closed。Canada 的 Cart、Catalog 和 Currency context 只保留
未来隔离模型，不生成公开 URL。正式内容、本地化与 SEO 验收完成前不得开启索引；
真实商品/库存、政策和 Shopify 支付/配送/税务验收完成前不得在公开部署开启 Checkout。

已实现的内容路径包括 Shopify Policies、`content_page` 驱动的 About/
Accessibility，以及 Shopify Blog `blog` / `crystals` 驱动的 Blog 和 Crystal
Guide。`Patron Saint` 是当前非空、Headless 可见且标记为 `design_series` 的系列；
description/SEO 与完整 story/lookbook 仍待补齐。Contact 当前正式采用 Email-only，
`info@joyamana.com` 已确认可收信；表单/Resend 后置，负责人/备援和外发流程仍须验收。
当前站内 Search
只检索 Shopify 商品，内容检索、Analytics/consent 和真实浏览器
与支付验收仍是待办；Playwright 按 D-043 暂缓，当前采用有记录的人工 smoke。
Webhook 缓存失效按 D-046 后置，低频内容与导航接受并记录 5 分钟窗口。

2026-08-31 外部检查确认 apex 308 至 `https://www.joyamana.com`、`www` 返回 Vercel
HTTP 200、`checkout` 返回 Shopify HTTP 200。D-044 确认 `www` 是唯一 canonical
origin；Vercel Production 环境值已由业务方配置，当前公开 deployment 的
canonical/OG 已复核为 `https://www.joyamana.com`。Production 仍
`noindex` 且 sitemap 为空。D-045 已将索引控制拆为部署级总开关，以及
`src/config/indexing.ts` 中版本控制的 locale/page-group 矩阵；只为已完成验收的范围开放。

当前代码已实现参数页 noindex、en-US/es-US document-level `<html lang>`、按真实
翻译 readiness 过滤的 Policy/Accessibility hreflang、Product-only Search metadata、
Header 专用轻量 Shopify query 与上游失败降级、细分索引门禁，以及 `pnpm preflight`。Vercel build
会在 `prebuild` 阶段运行 preflight，并对 Production canonical、Preview noindex、
Shopify credential 和启用功能所需 secret fail closed。

## 文档语言

项目文档以中文为主；用户界面、商品内容和 metadata 支持 en-US 与 es-US。
西语必须人工审校，面向客户的政策必须由授权负责人批准。代码标识符、提交
信息和技术注释默认使用英文。
