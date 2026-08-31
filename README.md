# Crystal DTC Storefront

面向美国市场的水晶 DTC 品牌独立站。项目采用 `Brand + Content + Commerce`
模式：以品牌体验和可信内容建立认知，以 Shopify 完成交易。

当前状态（截至 2026-08-31）：**Phase 3 实施中；Phase 2 的 Catalog/Cart 核心纵切面
已完成，Commerce hardening 与生产数据仍未完成**。
商品/Cart 事实及已接入的 Policy、About/Accessibility、Blog/Guide 正文来自
Shopify，不再使用本地样本商品或正文 fallback。Home、Contact、导航等界面文案仍由
代码配置维护。全站索引、Shopify Checkout 和 Contact 表单投递分别受独立门禁
保护；生产商品内容、政策、西语翻译、外部账号和发布验收尚未完成。当前输入与
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
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

当前尚未建立 CI、format check 或 Playwright/E2E；不得把本地 Vitest 结果写成已通过浏览器、
Preview 或支付端到端验收。

Commerce 与 Shopify-backed 正文的数据路径只使用 Shopify Storefront API；Contact
投递是受独立门禁保护的可选 Resend adapter。仓库示例值及未配置时的代码默认值以
`NEXT_PUBLIC_SITE_INDEXABLE=false` 保持全站不可索引；各部署环境必须单独核验。
不存在本地 Commerce provider 或样本 Catalog fallback；Shopify 缺失、数据无效或
请求失败时页面必须 fail closed。Canada 的 Cart、Catalog 和 Currency context 只保留
未来隔离模型，不生成公开 URL。正式内容、本地化与 SEO 验收完成前不得开启索引；
真实商品/库存、政策和 Shopify 支付/配送/税务验收完成前不得在公开部署开启 Checkout。

已实现的内容路径包括 Shopify Policies、`content_page` 驱动的 About/
Accessibility，以及 Shopify Blog `blog` / `crystals` 驱动的 Blog 和 Crystal
Guide。Contact 表单具备服务端校验和可关闭的 Resend 薄适配层；页面当前展示
Email 入口，但 inbox、负责人/备援和服务流程仍须在公开上线前验收。当前站内 Search
只检索 Shopify 商品，内容检索、Analytics/consent、webhook 缓存失效和真实浏览器
E2E 仍是待办。

## 文档语言

项目文档以中文为主；用户界面、商品内容和 metadata 支持 en-US 与 es-US。
西语必须人工审校，面向客户的政策必须由授权负责人批准。代码标识符、提交
信息和技术注释默认使用英文。
