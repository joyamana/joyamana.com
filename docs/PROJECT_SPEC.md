# Project Specification

Status: Working — 核心技术切片已实现，生产输入与发布验收未完成
Owner: Business owner  
Last updated: 2026-09-01
Supersedes: 2026-08-02 之前的简版 `PROJECT_SPEC.md`

## 1. 项目定义

本项目是面向美国市场的自有水晶 DTC 品牌独立站，采用：

> Brand + Content + Commerce

网站不是单纯商品目录，也不是依赖广告变现的内容站。它需要同时完成：

- 用一致的品牌体验建立信任和差异化。
- 帮助消费者理解商品、材料、来源、护理和购买选择。
- 用低摩擦流程完成浏览、加购与 Shopify Checkout。
- 累积可持续的自然搜索、AI Search 与 Email 客户关系资产。

品牌名称已确认为 `Joya Mana`，`www.joyamana.com` 与 `checkout.joyamana.com` 已完成
Production DNS/平台指向；Shipping/Returns 与 About 已确认，`info@joyamana.com` 可收信。
美国商标/社交账号、价格带、正式首发 assortment、品牌资产及剩余税务/法律/隐私事项
仍未确认。完整输入见
`docs/BRAND_INPUTS.md`。

### 当前实施快照

- Next.js 16 / React 19 / TypeScript storefront 已运行，en-US 根路径和
  `/es-us/` 使用同一 US Catalog/USD context；Canada 规划路径返回 404。
- Vercel Production 已在 `https://www.joyamana.com` 返回 200；Shopify Online Store
  已在 `https://checkout.joyamana.com` 返回 200。Production 仍 noindex、sitemap
  为空；D-044 已确认 `www` 为唯一 canonical origin，apex 308 至 `www`。Vercel
  环境值已配置，当前公开 canonical/OG 已复核为 `www`；
  下单支付等能力尚未完整验收。
- Runtime Commerce 与 Shopify-backed 业务正文已是 Shopify-only：Catalog、Policy、
  About/Accessibility、Blog/Guide 通过服务端查询读取，Bag/Buy now 通过 Shopify Cart
  mutations 创建和更新 Cart；这些路径均无本地业务数据 fallback。Home、Contact、
  导航和 Category 的界面/结构文案仍由 Next.js 代码配置维护。
- `Patron Saint` 已是非空且标记为 `design_series` 的 Headless Collection；基础系列页
  可用，但 description/SEO 和 Design Series Metaobject story/lookbook 尚未完成。
- Shipping/Returns 与 About EN/ES 正文已获业务方确认，商品专属 guidebook 是已确认
  package contents。Contact 当前正式采用 Email-only，表单/Resend 后置；Blog/Crystal
  Guide 的测试 Article 因暂无正式内容暂不处理并继续排除索引。
- Product、Shop/Category/Collection、About 和 Article 的 metadata/部分适用 Schema
  与 sitemap 门禁已实现；Home Organization/WebSite/WebPage、ContactPage、Policy
  Schema、内容搜索、Analytics/consent、CI 与支付 E2E 仍未完成；webhook 按 D-046
  后置并接受 5 分钟内容/导航缓存窗口。Playwright
  按 D-043 暂时封存，浏览器/支付验收当前采用有记录的人工 smoke。
- Product `custom.product_model` 已映射，并只在明确 repeatable 模型和可靠的 1–3 件
  库存条件下用于 PDP 准确低库存披露；正式商品仍需在 Shopify 填充该字段。
  其他 Product knowledge metafields（除已确认 guidebook 事实外）、exact/representative
  image 披露、内容到商品的关系和 Home Email opt-in 尚未接入；Product Offer
  availability 与 UI 的最小可履约数量边界也仍需统一验收。
- en-US 与 es-US 已各自输出正确的 document-level `<html lang>`；参数请求会 noindex
  并 canonical 回干净路径，Policy/Accessibility hreflang 也按真实翻译 readiness
  过滤。商品与 Collection 的 Spanish Storefront fallback 尚无可重复检测；业务方已
  明确批准 es-US Commerce scope，但正式部署前仍需人工逐页验证真实西语正文和 metadata。
- `NEXT_PUBLIC_SITE_INDEXABLE` 保留为部署级索引总开关，并按 D-045 叠加版本控制的
  `src/config/indexing.ts` locale/page-group 矩阵；当前双语言 Core/Commerce/Policies
  开放，双语言 Editorial 关闭；
  `SHOPIFY_CHECKOUT_ENABLED` 和
  `CONTACT_FORM_ENABLED` 是三个独立发布门禁；仓库示例值及未配置时的代码默认值
  均为关闭，各 Preview/Production 部署必须分别核验实际环境值。

## 2. 目标优先级

1. 品牌可信度与体验完整性
2. 交易可靠性与购买转化
3. SEO 基础和非品牌自然需求覆盖
4. GEO / AI Search 的实体清晰度与可引用性
5. 在不增加当前运营负担的前提下支持未来全球扩展

当目标冲突时，不为 SEO/GEO 制造损害品牌、误导客户或增加购买摩擦的实现。

## 3. 市场与商业边界

### MVP

| 维度 | 决定 |
|---|---|
| 市场 | United States |
| 语言 | English (`en-US`) + US Spanish (`es-US`) |
| 货币 | USD |
| 收入 | 自有商品销售 |
| Checkout | Shopify hosted checkout |
| 账户 | 不强制；MVP 不建设自定义账户门户 |
| URL | en-US 使用根路径；es-US 使用 `/es-us/` |

### Planned Market

Canada 只保留为未启用的 typed Market 配置：

| 维度 | 测试值 |
|---|---|
| Market / Catalog | CA / `ca` |
| 语言 URL | en-CA `/en-ca/`；fr-CA `/fr-ca/` |
| Currency | CAD |
| 商品 | 未发布；未来可复用商品身份，但价格、库存和 Cart context 必须与 US 隔离 |
| 政策 / Checkout | 未确认；不公开页面且不可购买 |

第一阶段不显示 Canada 入口，不生成上述 URL、hreflang 或 sitemap 项；直接访问
返回 404。该规划配置不等于 Canada 上线承诺。

### 未来

Canada 正式上线以及 United Kingdom、France、Germany、Spain、Switzerland、
Australia 等是候选扩展，不是已承诺生产 Market。Market 是商业运营单元而非国家或货币；
它定义 Catalog、Pricing、Currency、Tax、Shipping、Legal 和可用语言。
只有这些运营能力和本地化内容均准备好后，才为对应 language-region 创建
公开 URL。Currency 不作为 SEO URL 维度。

## 4. Working customer definition

业务方已授权下列购买任务指导测试站，但仍需未来客户研究验证：

- 为自己购买与日常佩戴：看重外观、材质、象征意义、搭配和可信商品信息。
- 礼赠购买：需要清晰的礼物场景、包装、配送时效和退换政策。
- 水晶爱好者或收藏者：关注具体晶体、尺寸、独特性、来源、处理方式与库存。
- 内容驱动访客：先搜索晶体知识、护理或选购问题，再进入商品页。

品牌可支持个人 spiritual practice，但不作医疗、科学或人生结果承诺。
未经证据，不使用 luxury、premium、rare、ethical、healing、sustainable、
certified 等词。

## 5. Working positioning

> A design-led crystal brand offering modern jewelry and one-of-a-kind
> pieces selected for their natural character, symbolism, and giftability.

工作差异方向：

- 现代设计、佩戴方式、配色和赠礼场景。
- 天然独件一物一图、一物一库存；标准商品诚实披露天然差异。
- 清楚区分材料事实、传统文化含义和个人实践。

品牌语气：Modern、Mysterious、Refined、Warm、Trustworthy。视觉避免杂乱、
强玄学、恐惧营销、假奢侈和过量装饰。价格带仍待确认。

## 6. MVP 范围

### 必须交付

- 响应式品牌首页。
- `/shop` 全商品浏览、按 Shopify Product Category 的商品类别浏览，以及独立原创
  Design Collection 浏览。
- 商品详情、变体选择、价格、库存和加购。
- Cart 管理与跳转 Shopify Checkout。
- 游客结账路径、订单确认和 Shopify Order Status。
- About、Contact、Shipping、Returns、Privacy、Terms、Accessibility。
- Crystal Guide 知识枢纽和可持续的晶体实体页模型。
- `/blog` 内容模型；首发目标 5–10 篇经人工审核的 Guide/Article。
- 基础站内 Search、Catalog/Category/Design Collection 与导航。
- 商品、内容、品牌和政策的统一数据映射。
- Metadata、canonical、必要 Schema、sitemap、robots、Open Graph。
- 基础 Analytics、Search Console、错误监控、性能和无障碍验证。
- US market typed configuration，为未来扩展预留而不生成未来 URL。
- 同一 US Catalog 的 en-US 根路径与 `/es-us/` 语言版本；语言切换不改变
  商品、库存、价格或政策事实来源。

### 明确不在 MVP

- 强制注册或自建身份系统。
- 自定义 Customer Account UI、Wishlist、Rewards、Referral、VIP。
- Subscription / Monthly Crystal Box。
- US 之外的 Market、Catalog、税务、配送和法律配置。
- 货币专属 URL 或只因币种不同而复制的页面。
- 实时 Custom Crystal 配置器。
- 社区、任务、等级、签到、勋章。
- 独立业务后端、独立数据库、PIM、ERP 或自建搜索平台。
- 程序化生成的晶体 × 功效 × 星座 × 颜色 × 产品类型组合页。
- AdSense、隐藏 AI 内容、虚构评论或未证实功效内容。

后续能力必须满足 `docs/ROADMAP.md` 中的进入条件，并通过决策记录批准。

## 7. 成功结果

### 发布结果

- 美国客户可从首页或内容页发现商品，完成加购并进入 Shopify Checkout。
- 价格、库存、政策和结构化数据在页面与 Shopify 之间保持一致。
- 主要内容在禁用 JavaScript 时仍可读取。
- 移动端、键盘和辅助技术用户可完成核心流程。
- 搜索引擎和获准的 AI Search crawler 可访问公开索引内容。
- 运营人员能在确定的事实来源中维护商品、内容和政策。

### 指标体系

不在没有流量、价格和商品数据时编造数值目标。使用四层指标：

- 商业：Revenue、conversion rate、AOV、refund/cancellation、repeat purchase。
- 漏斗：PDP view → add to cart → begin checkout → purchase。
- 获取：非品牌 impressions/clicks、landing page conversion、Email opt-in。
- 质量：Core Web Vitals、错误率、Schema/索引错误、Accessibility 缺陷。

上线后先建立 30 天有效基线，再由业务方批准季度目标。详见
`docs/ANALYTICS_AND_KPIS.md`。

## 8. 核心约束

- Shopify 是 Commerce 事实来源；不复制价格、库存、订单和支付逻辑。
- Shopify Pages/Blog/Metafields/Metaobjects 是 MVP 内容来源；不进行无所有权
  规则的双写，独立 CMS 后置。
- 所有健康、疗效、采购、产地、稀缺性和可持续性声明必须可验证。
- 交易 Email 与营销订阅同意分离。
- 不因未来扩展预建未运营页面、Store 或前端项目。
- 第三方工具必须证明业务价值、隐私边界和性能成本。
- 法律政策内容需由合格专业人士或业务方最终批准；项目文档不是法律意见。

## 9. 依赖

### 业务依赖

- 美国商标/社交账号核验、法律实体、支持邮箱负责人/备援和剩余政策审批责任人。
- 价格带和最终视觉资产。
- 首发商品、SKU、图片、材料、尺寸、来源与处理信息。
- 发货地、特殊覆盖地区、Checkout 运费、税费和客服操作流程；Shipping/Returns 正文
  已确认。
- 真实内容、作者背景与引用。
- Shopify Checkout/Payment/Market 运营验收；Vercel Production 与 store/
  Headless channel 已具备测试读取能力。

### 技术依赖

- Shopify 生产 Catalog/内容/翻译完整度与最小 Storefront API 权限；测试
  Product/Cart 读写和库存数量 scope 已验证。
- 可用的开发与 Preview 环境；Production 与 canonical 环境值已建立，仍需新 deployment
  的公开 HTML 和 release gate 复核。
- 最小 Analytics 与 consent 方案。
- 交易 Email 和支持邮箱配置；Production canonical origin 与域名/DNS 已建立。

## 10. 主要风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| 已确认品牌名被误解为域名/商标/定位均已批准 | 域名、文案、资产返工 | 集中 brand config + 发布门禁 |
| Hydrogen 与 Next.js 旧指令并存 | 架构分叉 | 旧文档归档；`D-003` 固化 |
| 独件与标准 SKU 模型不清 | PDP、库存、Schema 错误 | 先确认 Catalog worksheet |
| 水晶功效被写成医疗事实 | 信任与合规风险 | Claims policy、引用和发布审核 |
| 内容系统过早复杂化 | 双写、成本、维护负担 | Shopify-first；达到触发条件再引 CMS |
| 未来市场页面提前上线 | 重复/薄内容与运营错误 | Current-market-only URLs |
| 第三方脚本累积 | 性能、隐私、CRO 受损 | Vendor gate 与脚本预算 |
| Checkout 追踪不完整 | 漏斗误判 | Shopify 与 analytics 对账 |

## 11. Phase 0 业务退出条件

工程边界、测试店与样例数据流已足够支持后续实施，但 Phase 0 仍未达成下列
业务退出条件，不得因代码进展把它们标记为已批准：

- 工作品牌、Catalog 类型、内容和测试站边界已确认。
- 生产阻塞问题集中记录在 `docs/OPEN_QUESTIONS.md`。
- 正式首发商品和内容足以验证生产数据与发布流程。
- 真实 Shipping、Returns、Privacy 等政策有负责人。
- Shopify、Vercel、域名和内容维护责任明确。
- MVP PRD 与技术规格不再包含阻塞性占位信息。
