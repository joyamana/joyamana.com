# Project Specification

Status: Active — Production 已公开，数据完善与发布验收持续进行
Owner: Business owner  
Last updated: 2026-09-21

## 1. 项目定义

本项目是面向美国市场的自有水晶 DTC 品牌独立站，采用：

> Brand + Content + Commerce

网站不是单纯商品目录，也不是依赖广告变现的内容站。它需要同时完成：

- 用一致的品牌体验建立信任和差异化。
- 帮助消费者理解商品、材料、来源、护理和购买选择。
- 用低摩擦流程完成浏览、加购与 Shopify Checkout。
- 累积可持续的自然搜索、AI Search 与 Email 客户关系资产。

品牌与运营输入见 [BRAND_INPUTS.md](BRAND_INPUTS.md)；本文是当前实施状态的统一摘要。
未解决输入集中在 [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md)，具体工作优先级见 Roadmap。

### 当前实施状态

- Production：Vercel `https://www.joyamana.com`；apex 308 至 www。
  Checkout 由 Shopify 托管；域名配置与实际跳转按各部署验收。
- US en-US 根路径、es-US `/es-us` 与 zh-Hant-US `/zh-hant-us` 共享 Catalog/USD；Canada 仅保留 typed planned
  配置，停用与未知市场路径统一 404，无预建业务模板。
- Shopify-only：Product/Variant/Category/Design Collection、实时价格/可售性/数量、
  Bag/独立 Buy now，以及 Policy、About subtree、Accessibility、Blog/Guide。
  不完整或异常时 fail closed；界面结构和导航文案由代码维护。
- 当前代码已接入正式 SVG 与浅紫/赭棕视觉，首页为品牌文案/真实商品图、精选、真实类别和
  品牌主张；Header/Footer 切语言保留当前页，金额统一单一 USD code。本轮代码发布另行验收。
- PDP 已接可选 Product/Variant knowledge、图片代表性及 Article 关联，真实填充/译文见
  [OPEN_QUESTIONS](OPEN_QUESTIONS.md)。完整短事实就绪才下移正文；缺字段保持原披露在购买前。
  数量/低库存/独立 Buy now 保留；Product Offer 现按同一最小可履约边界输出库存语义。
- 首页和 PDP 推荐使用有限结果查询，推荐失败不阻断主商品。Shop/Category/系列保留完整
  服务端列表，提供 GET 在售筛选与价格排序；没有增加分页或参数索引。
- `Patron Saint` 已满足非空、Headless 可见和 design_series 门禁；
  description/SEO 与 Metaobject story/lookbook 尚未完成。
  系列详情的 metadata、sitemap 与 Schema 共用内容就绪判断，缺少有效描述时排除索引。
- Shipping/Returns、About EN/ES、专属 guidebook、品牌资产/真实摄影与客服运营已确认。
  Contact 当前 Email-only，表单/Resend 后置。
- 业务方确认下单支付完整支持，Payment test mode 流程未发现问题；
  live provider/payout 等后续证据单独记录，不推断已执行。
- 三语言 Core、Commerce、Policies 矩阵已获批准；Editorial、Cart、Search、参数页、Preview
  与不满足 readiness 的条目排除。2026-09-21 公开 HTTP 取样中，繁中首页为 200/index，
  首页 hreflang 含繁中，sitemap 138 条中有 46 条繁中 URL；这修正此前“尚未公开”的状态摘要，
  不证明部署 SHA、全部译文或 Checkout 本地化通过。部署核对与内容待办统一见 OPEN_QUESTIONS。
- 已实现 document-level locale、参数 noindex、canonical/OG、metadata、部分 Schema、
  hreflang/readiness 与动态 sitemap。Commerce ES/繁中 fallback 尚无自动检测，
  现按业务批准范围进行逐页人工发布验收。
- Home/Contact 已接最小 OnlineStore/WebSite/页面 Schema，仅使用名称、正式 Logo、域名与客服
  邮箱。Node 24 CI 已配置 install/preflight/lint/typecheck/tests/build；GitHub 实际运行待发布验收。
  Policy Schema 扩展、consent/Analytics、format 与剩余设备/运营验收仍待完成；
  独立 Site Settings 和内容搜索只在实际维护/检索需求出现时扩展。
- 工程基线是 Node 24 + 相互兼容的稳定依赖。Header 使用独立轻量查询、故障降级和
  单层五分钟 fetch 再验证缓存；商业数据 no-store。
  错误页使用 Next `retry()` 重新获取服务端内容，类型检查先生成路由类型。
- 三个独立发布门禁为索引总开关、Checkout 与 Contact form；仓库缺省值均关闭，
  各部署按批准范围单独配置。Preview 总索引门禁必须关闭。

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
| 语言 | en-US、es-US、zh-Hant-US（香港书面语） |
| 货币 | USD |
| 收入 | 自有商品销售 |
| Checkout | Shopify hosted checkout |
| 账户 | 不强制；MVP 不建设自定义账户门户 |
| URL | en-US 根路径；es-US `/es-us/`；zh-Hant-US `/zh-hant-us/` |

### Traditional Chinese in US

代码已完整接入 `zh-Hant-US`（繁体中文、香港惯用书面语），不迁移 EN/ES URL。
中央注册表区分站点标签、路径、Shopify `ZH_TW` 和 Intl `zh-HK`；沿用 US/USD/Bag，
加入香港用语 UI、中文排版、全部共享页面、三语言导航及安全 Checkout URL 支持。
Shopify 繁体语言已发布；缺译时仍允许英文回退。按 D-049 不隐藏缺译页面，About 子页
入口保留；政策/About/Editorial 的已知回退保留真实内容语言标记。未实现商品逐字段
翻译检测，不把英文正文标称为已审校繁中。最新仓库矩阵已批准开启繁中 Core/Commerce/
Policies，Editorial 关闭；部署总开关和单页 readiness 仍生效。公开响应取样见本文件
“当前实施状态”，不据此推断具体分支或部署版本；完整译文与托管 Checkout/通知验收见 Q-202。

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

## 4. 客户与品牌定位

购买任务、工作定位、语气与 claims 边界统一维护在 [BRAND_INPUTS.md](BRAND_INPUTS.md)。
Working 输入用于产品设计，不自动成为获批外部事实；不在多个规格复制品牌文案。

## 5. MVP 范围

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
- 同一 US Catalog 的 en-US 根路径、`/es-us/` 与 `/zh-hant-us/` 语言版本；语言切换不改变
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

## 6. 成功结果

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

## 7. 核心约束

- Shopify 是 Commerce 事实来源；不复制价格、库存、订单和支付逻辑。
- Shopify Pages/Blog/Metafields/Metaobjects 是 MVP 内容来源；不进行无所有权
  规则的双写，独立 CMS 后置。
- 所有健康、疗效、采购、产地、稀缺性和可持续性声明必须可验证。
- 交易 Email 与营销订阅同意分离。
- 不因未来扩展预建未运营页面、Store 或前端项目。
- 第三方工具必须证明业务价值、隐私边界和性能成本。
- 法律政策内容需由合格专业人士或业务方最终批准；项目文档不是法律意见。

## 8. 依赖

具体输入、负责人、完成证据及影响范围集中于 [OPEN_QUESTIONS](OPEN_QUESTIONS.md)。
Shopify 后台填写方法见 [SHOPIFY_CATALOG_SETUP](SHOPIFY_CATALOG_SETUP.md)，执行优先级见
[ROADMAP](ROADMAP.md)，发布步骤见 [LAUNCH_RUNBOOK](LAUNCH_RUNBOOK.md)。
既有 Checkout test mode、客服和政策验收不因本次改版失效；新的代码、内容或部署仍各自验证。

## 9. 主要风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| 业务侧品牌/商业记录被复制成网站事实 | 文案、合规与维护风险 | 仓库只保留获批公开字段；内部记录留在业务系统 |
| 独件与标准 SKU 模型不清 | PDP、库存、Schema 错误 | 填充结构化 product_model，并验收图片与库存语义 |
| 水晶功效被写成医疗事实 | 信任与合规风险 | Claims policy、引用和发布审核 |
| 内容系统过早复杂化 | 双写、成本、维护负担 | Shopify-first；达到触发条件再引 CMS |
| 未来市场页面提前上线 | 重复/薄内容与运营错误 | Current-market-only URLs |
| 第三方脚本累积 | 性能、隐私、CRO 受损 | Vendor gate 与脚本预算 |
| Checkout 追踪不完整 | 漏斗误判 | Shopify 与 analytics 对账 |
