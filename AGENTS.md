# AGENTS.md

本文件是 Codex 的仓库级长期指令。保持简洁、准确；详细需求放在 `docs/`，
不要把临时任务要求堆入本文件。

## 项目使命

建设一个面向美国市场的水晶 DTC 品牌独立站。优先级依次为：

1. 品牌体验与信任
2. 购买转化与交易可靠性
3. SEO 与可发现性
4. GEO / AI Search 可理解性
5. 未来多市场扩展能力

商业模式是 `Brand + Content + Commerce`，不依赖广告流量变现。

## 开始任务前

先阅读与任务相关的规范。复杂任务的默认顺序是：

1. `docs/DECISIONS.md`
2. `docs/BRAND_INPUTS.md` / `docs/PRODUCT_INPUTS.md`
3. `docs/PROJECT_SPEC.md`
4. `docs/MVP_PRD.md`
5. 对应领域规格
6. `docs/ROADMAP.md`
7. `docs/OPEN_QUESTIONS.md`

`docs/archive/` 只用于历史追溯，不得作为当前实现依据。

若文档冲突，优先级为：

1. 本文件的工作约束
2. `docs/DECISIONS.md` 中状态为 `Accepted` 的较新决策
3. `docs/PROJECT_SPEC.md`
4. `docs/MVP_PRD.md`
5. 领域规格与 Roadmap
6. `Proposed` 决策和开放问题中的推荐默认值

不要自行把 `Proposed` 或 `Pending` 当成已获业务批准。对会实质改变品牌、
商品模型、运营政策、数据合规或系统边界的缺失输入，应说明影响并请求决策。

## 当前已接受的技术边界

- Next.js App Router + TypeScript。
- Shopify 是商品、变体、价格、库存、折扣、购物车、订单、支付和 Checkout
  的商业事实来源。
- 通过 Shopify Headless channel 和 Storefront API 构建自定义 storefront。
- Checkout 跳转至 Shopify 托管结账，不复制支付或订单系统。
- Vercel 是首选部署平台。
- Server Components 优先；仅在真实交互需要时使用 Client Components。
- 索引页面必须在初始响应中提供完整、可理解的 HTML；可按页面需要使用
  静态生成、ISR 或动态服务端渲染，不强制每次请求 SSR。
- 不建设独立业务后端。允许在 Next.js 中使用必要的 Route Handlers、
  Server Actions、缓存失效端点和安全的服务端适配层。
- 当前只启用 US / US Catalog / USD：en-US 根路径、es-US `/es-us/`。
- CA / CA Catalog / CAD 只保留 typed planned 配置；`/en-ca/` 与 `/fr-ca/`
  不生成、不导航并返回 404，直到业务方重新批准启用。
- 同一 Market 内语言共享 Catalog、价格、库存和政策事实；跨 Market 必须隔离
  Pricing、Availability、Cart、Tax、Shipping 和 Legal context。
- Market、Language、URL、Currency 必须分离。Market 是商业运营单元，定义
  Catalog、Pricing、Currency、Tax、Shipping、Legal 和可用语言。
- Currency 不进入 SEO URL；内部保持 typed market context，但不提前生成
  未来 Market URL。
- `/` 保持 en-US，不建立 Global Site 或强制 IP redirect。未来如需地区入口，
  优先增加 noindex `/choose-region`，不得未经 ADR 把 US 根路径迁至 `/en-us/`。

## 产品与客户约束

- 不强制注册；MVP 必须支持游客完成购买。
- Email 交易身份与 Email 营销同意必须分开处理。
- Customer Account 是上线后可选的服务门户，不是购买入口。
- 不得虚构评论、库存紧迫性、折扣、专家、资质、产地或采购承诺。
- 水晶相关传统或精神文化内容不得写成已证实的医疗事实；禁止无可靠依据的
  诊断、治疗、治愈、预防或安全功效承诺。
- Shipping、Returns、Taxes、Privacy 等内容必须来自已确认的真实运营政策。

## SEO、GEO 与内容约束

- 不为 SEO 批量制造重复、薄弱或仅改关键词的页面。
- 不创建隐藏 AI 页面，不做 crawler cloaking，不向机器人输出不同事实。
- UI、metadata、JSON-LD 和 analytics 必须来自同一规范化实体。
- 只输出与页面可见内容一致、对该页面类型适用的结构化数据。
- 参数页、站内搜索、购物车、账户、预览和内部测试页不得进入 sitemap；
  索引规则遵循 `docs/CONTENT_SEO_GEO_SPEC.md`。
- 只为真实上线、内容完整、可运营的市场和语言生成 URL 与 hreflang。
- `llms.txt` 是可选辅助，不能替代 HTML、内链、sitemap、Schema 和内容质量。

## 工程原则

- 选择最小、可读、可测试的实现；避免预建尚未获批的抽象系统。
- 商业关键数据只保存在其事实来源，不在多个系统复制价格、库存或政策。
- Storefront API 私密 token、Admin API token、webhook secret 和客户 PII
  只能在服务端使用，绝不提交、打印或发送到浏览器。
- 新生产依赖、SaaS、CMS、Analytics、Review、Email 或 Search 工具必须说明
  业务价值、数据边界、成本和退出路径。
- 使用明确的类型、集中式配置和薄适配层；不要把国家、货币、canonical、
  Schema 或 tracking 逻辑散落在组件中。
- 代码标识符使用英文；UI 文案支持 en-US 与 es-US，西语发布前必须人工审校；
  项目规划文档可使用中文。
- 保留用户已有的无关改动，不以顺手重构扩大任务范围。

## 架构变更规则

以下变更必须在实施前说明原因、替代方案、迁移影响，并更新
`docs/DECISIONS.md`：

- 更换前端框架、部署平台、Commerce 或内容事实来源
- 新增独立数据库、长期运行服务或自建认证
- 改变公开 URL、locale/market 规则或索引策略
- 引入新的生产级第三方平台或客户数据处理方
- 改变 Checkout、商品、订单、账户或营销同意边界
- 引入与 MVP 范围不一致的大型功能

可逆、局部且不改变系统边界的实现选择无需创建 ADR，但仍需遵守现有规格。

## 计划与完成定义

跨多个领域、预计超过一个工作阶段或包含架构决策的任务使用 `PLANS.md`
格式建立并持续更新执行计划。小型、明确的修改不需要额外计划文件。

代码存在后，一项工作只有在以下条件满足时才算完成：

- 需求和对应验收条件已满足。
- 相关 lint、typecheck、unit/integration/e2e 与 production build 已运行；
  无法运行的检查必须说明原因。
- 关键错误、加载、空状态和移动端行为已检查。
- 涉及索引页面时，已检查初始 HTML、metadata、canonical、Schema、链接和
  sitemap/noindex 行为。
- 涉及 Commerce 时，已检查价格、库存、购物车与 Checkout 数据一致性。
- 涉及用户数据时，已检查 consent、PII、日志和 secret 边界。
- 文档、决策记录、环境变量示例和运行命令与代码同步。
- 最终交付说明变更、验证结果、剩余风险和需要业务方完成的事项。

## 当前仓库状态

截至 2026-08-31，仓库包含 Next.js 16 App Router 测试站、pnpm 配置以及
Shopify-only Storefront API 适配层。US en-US 根路径与 `/es-us/` 已共享同一
Catalog/Cart；商品、Variant、Category、Design Collection、实时价格/可售性/可用数量、
Bag 和独立 Buy now Cart 已接入。Policy、About subtree、Accessibility、Blog/
Crystal Guide 也由 Shopify 驱动；Contact 表单仅在受控配置后才投递。本地 mock
Catalog 和业务正文 fallback 已删除，上游缺失时 fail closed。

Canada 只保留未启用的 typed 规划配置。仓库示例值及未配置时的代码默认值为全站
noindex，并关闭 Shopify Checkout 和 Contact 投递；各部署环境必须单独核验。当前没有
CI、format check 或 Shopify webhook 失效链路。Playwright 按 D-043 暂时封存，只有
复杂度触发后才重新评估；当前必须记录人工浏览器/Checkout smoke 的范围和结果。

Production storefront 已通过 Vercel 在 `https://www.joyamana.com` 公开响应，
`https://checkout.joyamana.com` 已指向 Shopify Online Store；本地 `dev` 分支用于后续
Vercel Preview，但在推送并由 Vercel 构建前不代表 Preview 已建立。Production 当前仍
noindex；D-044 已确认 `https://www.joyamana.com` 为 canonical origin，apex 308 至
`www`，Vercel 环境值已设置但须在新 deployment 复核公开 HTML。参数页 noindex、
document-level locale、Policy/Accessibility hreflang、Search metadata、Header
专用 query/故障降级和环境 preflight 已实现；完整政策、Commerce 西语 readiness、
Analytics/consent、真实支付与发布验收尚未完成。

常用命令：`pnpm dev`、`pnpm preflight`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、
`pnpm build`。不得在实际运行前声称检查已通过。
