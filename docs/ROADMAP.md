# Project Roadmap

Status: Active planning  
Owner: Project owner  
Last updated: 2026-09-01

Roadmap 按依赖和可验证结果排序，不承诺未经资源评估的日历日期。详细功能以
MVP PRD 和领域规格为准。

当前阶段判断：Phase 2 的 Catalog/Cart 核心纵切面已完成，但 Commerce hardening、
生产数据与退出条件未完成；Phase 3 的 Shopify 内容、路由与 SEO 技术基础正在进行。
Phase 4 已有 Vercel Production 与正式域名这一部署基础，但 measurement、hardening、
真实支付和完整发布验收尚未完成。

## Phase 0 — 决策与资料准备（测试站所需部分完成）

### 目标

把绿地项目变成可以安全初始化的工程规格。

### 工作

- 将 2026-08-03 业务回复同步到规范。
- 接受 D-009、D-011、D-015、D-020 至 D-023。
- 确认首发商品样本、图片、Collection 和库存模型。
- 确认 Shipping、Returns、Privacy、Terms、claims 负责人。
- 准备 Shopify development/store、Headless channel、Vercel 和域名。
- 审核 MVP PRD、Commerce、Content/SEO 和 Design 规格。

### 退出条件

- Project Spec 的核心品牌、Catalog 和运营字段不再是阻塞占位。
- 至少有一组代表性 Product/Variant/Collection 和一篇 Guide 内容样本。
- 技术与内容事实来源均为 Accepted。
- 有明确的上线窗口、角色和验收负责人。

## Phase 1 — 工程基础（测试站本地基线完成，外部集成待办）

### 目标

建立可部署、可测试、可连接 Shopify 的最小 Next.js 骨架。

### 工作

- 初始化 Git、Next.js App Router、TypeScript、pnpm 与 Node 版本。
- 建立 lint、typecheck、unit test 与 production build。
- 建立 CI 和 format check（待办）；Playwright 按 D-043 暂缓，复杂度触发后再评估。
- 建立环境变量验证、`.env.example` 和 secret 边界；`pnpm preflight` 已接入 prebuild。
- 配置 Vercel Preview/Production，Preview 全站 `noindex`。
- 建立 Shopify Storefront API client、GraphQL types 与错误处理。
- 建立 typed US market context、统一 path helper 和 money formatter。
- 建立基础 layout、tokens、可访问导航和错误页。

当前本地结果：Next.js 骨架、已启用的 US Market 路由、保留但不公开的 CA
typed 配置、noindex/robots/sitemap、lint、typecheck、unit tests 和 production build
已建立。Shopify Headless private token 与 Storefront API 已连接；Product、Variant、
Money、Availability、Search 和非空 Collection 均通过 Shopify-only adapter 读取，
本地 provider/fallback 已删除。
2026-08-31 Storefront 已可见多个 Headless 商品；`Patron Saint` Collection 已非空、
已加入 Headless channel，并确认 `custom.collection_kind=design_series`。Shopify
Cart 的创建、恢复、增改删、HttpOnly cookie、独立 Buy now Cart 与最新 Checkout URL
代码已完成；因剩余履约费率、税务、法律、支付和 Checkout 运营配置未完成，仓库示例值、未配置时
默认值和任何未获批公开部署都必须保持跳转门禁关闭；各环境值单独验收。
Vercel Production 已在 `https://www.joyamana.com` 公开响应，
`https://checkout.joyamana.com` 已指向 Shopify Online Store；本地 `dev` 分支已建立，
并已构建 Vercel Preview。CI 仍待建立，Playwright 按 D-043 暂缓。
Production 当前仍 noindex、sitemap 为空。D-044 已确认 `www` canonical 与 apex 308；
当前 Production 的 canonical 与 `og:url` 已输出 `www` origin。

### 退出条件

- 本地、CI、Preview 的 install/lint/typecheck/test/build 通过。
- Preview 可安全读取测试 Shopify 数据且不被索引。
- 无 token 暴露到客户端 bundle 或日志。

## Phase 2 — Commerce vertical slice（核心切片完成，hardening/生产验收阻塞）

### 目标

先证明完整交易链路，再扩展内容和视觉细节。

### 工作

- Collection 查询和商品卡。
- `/shop`、Product Category 与 Design Collection 双轴浏览。
- PDP 数据映射、图库、Variant、Price、Availability。
- Storefront Cart 创建、恢复、更新、删除和错误状态。
- 获取最新 checkout URL 并跳转 Shopify hosted checkout。
- 处理售罄、价格变化、库存冲突与 API 失败。
- 低频内容与导航按 D-046 接受并记录 5 分钟缓存窗口；Webhook 仅在触发条件出现后重评。
- Commerce integration 与 E2E 测试。

2026-09-01 阶段结果：Catalog/PDP/Bag/Buy now/Checkout adapter 已完成；仓库共有
183 项 Vitest unit/integration-style tests。Catalog/Variant 已全量分页并遵循 Shopify quantity rule；
真实 Cart 合约 smoke 已覆盖 create、库存冲突 warning、update/remove 与 HTTPS
Checkout URL。Storefront 现会读取 `quantityAvailable` 与 `currentlyNotInStock`，
并把它们与 contextual quantity rule 用于 PDP/Bag 数量上限；PDP 仅对明确商品模型且
符合严格可靠性条件的 1–3 件库存作准确披露，不在商品卡制造广泛稀缺提示。
仍需定义/映射 Product knowledge metafields（材料、尺寸/护理、来源/处理、包装与关联内容）、
为正式商品填充 `custom.product_model`，并定义 exact/representative image disclosure、
补全 `Patron Saint` 的 description/SEO、Design Series Metaobject/reference 与 story/lookbook，
审核当前商品正文、发布人工审核的
西语翻译、完成政策和 Checkout 运营验收，并补有记录的浏览器/支付验证；
Playwright 按 D-043 暂缓。
Header 导航已使用专用轻量 query/projection，并在 Shopify 导航上游失败时保留基础
导航和页面主体，不缓存或复用价格、可售性与库存字段。
2026-08-30 已批准 D-036：商品类别迁至 `/category/*`，原创设计系列保留
`/collections/*`；实现与 Shopify Admin 结构化字段配置进入当前工作流。

2026-08-31 Policy follow-up：Shipping、Returns、Privacy 与 Terms 已由 Shopify Policy
服务端驱动，包含默认语言回退识别、安全 HTML 输出和按真实翻译状态控制索引；
Shipping/Returns 的已公开运营承诺已确认，Terms 占位符已在 Shopify 修复并经直接
Storefront API 验证。Headless `Your Privacy Choices`、Customer Privacy API 同步及
税务/法律发布复核仍是公开索引/交易前待办；更及时的缓存失效按 D-046 后置。

### 退出条件

- Home/Category/Design Collection → PDP → Bag → Checkout 路径通过。
- UI、Cart、Shopify 的价格和库存一致。
- 游客无需账户即可进入 Checkout。
- Commerce 关键失败均有可恢复体验。

## Phase 3 — Brand, content and discovery（实施中）

### 目标

完成品牌体验、可信内容以及 SEO/GEO 基础。

### 工作

- 按获批设计系统完成 Home、About、Contact 和 trust pages。
- 实现 Crystal Guide、Article 与作者/引用模型。
- 完成 metadata、canonical、Open Graph、Schema mapper。
- 完成 sitemap、robots、redirects 和索引控制。
- 建立 Product ↔ Crystal ↔ Article 的人工关联与内链。
- 配置 Search Console、Merchant Center 和获批 crawler policy。
- 只有核心基础全部通过后再评估 `llms.txt`。

2026-08-31 实施结果：

- Shipping/Returns/Privacy/Terms 已从 Shopify Policies 服务端读取；Shipping/Returns
  的运营承诺已确认，Terms 占位符已修复。剩余税务/法律发布复核独立跟踪。
- About hub/direct children 与 Accessibility 已使用 Shopify `content_page`；
  Blog 和 Crystal Guide 已使用 Shopify Blog/Article。不完整、未引用或未翻译内容
  fail closed/noindex，本地正文 fallback 已删除。
- Product、Shop/Category/Design Collection、About 与 Article 的 metadata/
  适用 Schema/sitemap 映射已完成并受总开关、语言和页面组索引门禁保护。
- `info@joyamana.com` 已确认可以收信，当前正式支持方式为 Email-only；Contact 表单、
  Resend 与滥用防护延后，负责人/备援、出站投递与服务流程仍待验收。
- 当前 Search 仅检索 Product；Home Organization/WebSite、ContactPage Schema、
  完整 Design Series Metaobject 故事模块、正式 Article/Crystal Guide 内容与西语审核、GSC/Merchant Center
  与 crawler policy 仍待完成。
- Commerce Product/Collection 的 Spanish fallback 仍无自动识别；这是当前剩余的
  translation/index blocker。document-level `<html lang>`、Policy/Accessibility
  readiness hreflang、Product-only Search metadata 和参数页 noindex 已完成并有测试。

### 退出条件

- 所有预期索引页面输出完整 HTML 和准确实体。
- Sitemap、canonical、noindex 与 Schema 自动测试通过。
- 真实内容通过 claims、作者、引用和业务审核。

## Phase 4 — Measurement, hardening and launch

### 目标

在真实设备、真实数据和可回滚条件下上线。

### 工作

- 实现最小 Analytics/consent，完成 Shopify 订单对账。
- 完成 Accessibility、性能、响应式、SEO 和安全审计。
- 检查第三方脚本、CSP、安全响应头、PII 和日志。
- 全量检查链接、404、redirect、售罄与永久下架策略。
- 完成 Shipping、Returns、Privacy、Terms 和客服流程签署。
- 建立发布、回滚、告警、值守和上线后验证清单。
- Soft launch，再根据数据正式发布。

### 退出条件

- `MVP_PRD.md` 的发布验收全部通过或有书面接受的例外。
- 生产域名、Checkout、Email、Analytics、robots、sitemap 正确。
- 有明确的回滚版本、负责人和事故响应方式。

## Phase 5 — 上线后优化

只根据数据选择，不预先承诺：

- 内容更新、搜索需求覆盖和 Collection 优化。
- 真实 Reviews、Email 生命周期、Recently Viewed、Reorder。
- Shopify Customer Account、订单历史和地址管理。
- Wishlist、Gift Card、Referral、Loyalty。
- 经表单/人工服务验证后的 Custom Crystal。
- 目录规模证明需要时的高级搜索或推荐。

进入条件：至少有可靠的漏斗、客服、搜索和复购数据，能说明问题规模与预期
价值。

## Phase 6 — 国际扩展

一次只启用一个业务已准备好的 Market，并仅开放已审核的 language-region：

- Shopify Market/Catalog、Pricing、Currency、库存、支付、税务、配送和法律
  要求就绪。
- 客服、退换、隐私和当地政策就绪。
- 关键页面与商品内容经过人工本地化和 QA。
- URL、currency、canonical、hreflang、sitemap 和 analytics 单独验收。

不得通过复制相同内容来“上线”新 Market；不得为 Currency 生成 SEO URL。
