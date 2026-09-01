# Project Roadmap

Status: Active planning — Production 已公开，当前聚焦数据完整度、privacy/measurement 与 hardening
Owner: Project owner  
Last updated: 2026-09-02

本文件只记录当前及未来优先级。已完成阶段与日期化实施记录见
[`archive/roadmap-2026-08-to-09.md`](archive/roadmap-2026-08-to-09.md)。详细验收以
`MVP_PRD.md` 和对应领域规格为准。

## Current release state

- Production storefront 与 Shopify Checkout 已使用正式域名公开。
- 下单支付完整支持；Shopify Payment test mode 流程测试未发现问题。
- en-US/es-US Core、Commerce、Policies 已开放索引；Editorial 关闭，Cart、Search、
  Preview 和参数页继续 noindex。
- Catalog、价格、库存、Bag、Buy now、Policy、About、Accessibility 与 Editorial adapter
  均为 Shopify-only，缺失或异常时 fail closed。
- Contact 正式采用 Email-only；客服 inbox、负责人/备援、外发认证和投递表现已确认。
- Playwright 按 D-043 后置；当前使用 Vitest、build、contract smoke 和人工浏览器/
  Checkout 验收。内容/导航按 D-046 接受最多 5 分钟缓存窗口。

## Completed foundation

- Next.js App Router、TypeScript、pnpm/Node 基线、Vercel Preview/Production。
- US en-US `/` 与 es-US `/es-us` 共享 US Catalog、USD、库存和政策上下文。
- Shopify Product/Variant/Category/Design Collection、Cart 与 hosted Checkout。
- PDP 格式化描述、Variant/quantity rule、库存上限和严格条件下的准确低库存披露。
- Shopify Policies、About subtree、Accessibility、Blog 与 Crystal Guide adapter。
- Canonical、metadata、参数页保护、document locale、Policy/Accessibility hreflang、
  sitemap 和 locale/page-group 索引矩阵。
- Header 最小导航 query、上游失败降级、环境 preflight 与 secret 边界。

## Priority 1 — Product and Commerce completeness

- 为正式商品完整填充并映射 Product knowledge metafields：materials、dimensions/fit、
  care、origin/treatment、package contents 与 related content。
- 为所有正式商品填充 `custom.product_model`，并实现 exact item / representative image
  disclosure。
- 补全 `Patron Saint` description/SEO；完成 Design Series Metaobject、reference、
  story/lookbook 和商品关联。
- 复核 Shopify Standard Product Category、商品正文、媒体、SKU、价格、库存和售罄行为。
- 解决 `OPEN_QUESTIONS.md` 中仍适用的特殊地址覆盖、配送费率/免邮与税费/进口责任；
  不把这些范围扩大成全站 blocker。
- 保持 Commerce 西语逐页人工验收，直到建立可靠的 default-language fallback 检测。

## Priority 2 — Privacy, discovery and structured entities

- 建立 Organization/Site Settings 规范化实体，使用获批公开字段实现 Home
  Organization/WebSite/WebPage 与 ContactPage；不得复制非公开主体记录。
- 决定并实现 Headless `Your Privacy Choices`、consent 分类与 GPC 行为；上线任何
  analytics/marketing script 前先完成数据边界。
- 配置并验收 GA4、Google Search Console 和 Merchant Center；建立最小可解释基线。
- 当前 Search 保持 Product-only/noindex；只有内容规模证明需要时才接入 About、Blog、
  Crystal Guide，不提前引入独立搜索服务。
- Blog/Crystal Guide 测试 Article 保持 Editorial noindex；有正式内容时再完成 claims、
  author/source、SEO、图片和 EN/ES 审核。
- D-016 的 Search/User crawler 与 training crawler 策略单独决策。

## Priority 3 — Engineering and launch hardening

- 建立 CI 与 format check，在固定 Node 24 环境运行 install、preflight、lint、typecheck、
  tests 和 production build。
- 完成关键设备/浏览器的 Accessibility、响应式、性能、链接、404、redirect、售罄与
  API 故障人工验收；达到 D-043 触发条件后再启用 Playwright。
- 复核 CSP、安全响应头、日志/PII、第三方脚本和生产/Preview secret 隔离。
- 完成监控告警、owner、保留策略、rollback target 和发布值守记录。
- 按内容/运营变化持续复核索引矩阵、sitemap、hreflang、Schema 与 Checkout smoke。

## Post-launch optimization

只根据真实漏斗、客服、搜索和复购数据选择：

- 正式 Editorial 内容与商品/Guide 内链。
- 真实 Reviews、Email lifecycle、Recently Viewed、Reorder。
- Customer Account、Wishlist、Gift Card、Referral、Loyalty。
- 经人工服务验证后的 Custom Crystal。
- 目录规模证明需要时的高级搜索或推荐。

## Future markets

Canada 和其他 Market 只有在 Catalog、Pricing、Currency、库存、支付、税务、配送、
法律、客服和本地化内容全部就绪后才启用。一次只开放一个真实运营 Market，并单独验收
URL、canonical、hreflang、sitemap、Cart 与 Analytics；不得复制薄内容或为 Currency
生成 SEO URL。

## Current completion criteria

- `MVP_PRD.md` 对当前公开 scope 的验收全部通过，或有书面接受的具体例外。
- 商品、价格、库存、Cart 与 Checkout 在 Shopify、UI 和测试记录中一致。
- 已开放索引页面输出准确 HTML、metadata、canonical、hreflang、Schema 和 sitemap。
- Consent、PII、日志和第三方数据接收方与实际运行功能一致。
- 每次发布有可复现检查、人工 smoke、负责人和 rollback target。
