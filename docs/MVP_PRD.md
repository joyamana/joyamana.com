# MVP Product Requirements

Status: Draft — 依赖 Phase 0 决策  
Owner: Product owner  
Last updated: 2026-08-02  
Related: `PROJECT_SPEC.md`, `COMMERCE_SPEC.md`, `CONTENT_SEO_GEO_SPEC.md`

## 1. 产品目标

在一个可信、快速、移动端友好的美国英文品牌站中，让访客能够：

1. 理解品牌和商品是否适合自己。
2. 按商品类型或晶体类型发现商品。
3. 查看准确的材料、尺寸、来源、护理、价格和库存。
4. 无需注册即可加购并进入 Shopify Checkout。
5. 通过可信内容继续研究，并自然回到相关商品。

## 2. 核心旅程

### J1：直接购物

Landing/Home → Collection → Product → Add to cart → Cart → Shopify Checkout

### J2：内容辅助购买

Search/AI citation → Crystal Guide/Article → Related Product/Collection →
Product → Cart → Shopify Checkout

### J3：礼赠

Home/Collection → Product → 查看包装、配送与退换政策 → Cart → Checkout

### J4：订单后服务

Checkout confirmation → Shopify Order Status / support → 可选 Email 关系

MVP 不在购买前插入登录、注册、问卷或营销弹窗强制步骤。

## 3. 信息架构

URL 名称在品牌命名确认前使用功能性路径：

| Route | 目的 | Index |
|---|---|---|
| `/` | 品牌价值、主分类、主商品、教育入口、信任 | Yes |
| `/collections` | 可选的人工策划分类总览 | Yes，内容充足时 |
| `/collections/{handle}` | 单一购买意图的商品集合 | Yes |
| `/products/{handle}` | 单一商品或同组变体购买页 | Yes |
| `/crystals` | 晶体知识枢纽 | Yes |
| `/crystals/{slug}` | 单一晶体实体权威页 | Yes |
| `/blog` | Blog 文章枢纽；唯一栏目名称 | Yes，首发时有真实文章才开放 |
| `/blog/{slug}` | 问题、比较、护理、礼赠等文章 | Yes |
| `/about` | 品牌故事与真实承诺 | Yes |
| `/contact` | 联系方式和客服预期 | Yes |
| `/faq` | 跨站真实常见问题 | Yes，避免与政策重复 |
| `/shipping` | 配送政策 | Yes |
| `/returns` | 退换政策 | Yes |
| `/privacy` | 隐私政策 | Yes |
| `/terms` | 使用/销售条款 | Yes |
| `/disclaimer` | 材料事实、文化传统、象征意义与个人实践的边界 | Yes，内容获批后 |
| `/product-care` | 稳定的品牌级护理指南；商品专属说明仍在 PDP | Yes，内容充足且获批后 |
| `/accessibility` | Accessibility statement | Yes，内容获批后 |
| `/search` | 站内搜索；仅在目录规模需要时启用 | No |
| `/cart` | 购物车 | No |
| `/account/*` | 后续账户服务 | No |

不要同时创建语义相同的 `/shop/*` 与 `/collections/*`。最终永久路径由
`docs/DECISIONS.md` 记录。

## 4. 跨站需求

### FR-001 Header 与导航

- Logo 链接首页。
- 主导航最多呈现业务确认的核心入口。
- Cart 数量可访问且不会导致布局跳动。
- 移动 Header 提供 Menu、居中 Wordmark、Search 与 Bag；Language 位于 Menu
  底部。Menu 支持背景滚动锁定、Escape、焦点锁定、焦点返回和 44px 触控目标。
- 语言切换器在 en-US 与 es-US 等价页之间切换；不得因此改变 US Catalog、
  商品 ID、USD 价格、库存或政策。
- 当前只有一个 US Market，不显示伪造的国家或 Currency 选择器。

### FR-002 Footer

- 提供 Contact、Shipping、Returns、Privacy、Terms 等真实链接。
- 展示法律实体、联系方式和社交链接时必须有真实数据。
- Email opt-in 清楚说明订阅内容，不能与交易同意混淆。

### FR-003 Search

- 若首发目录和内容规模不需要，MVP 可不提供站内搜索。
- 启用时必须同时检索商品和内容，提供空状态，结果页 `noindex`。
- 不因未来搜索需求先引入独立搜索服务。

### FR-004 状态与错误

- 为 loading、empty、unavailable、API error、404 和 500 提供可恢复体验。
- Commerce API 失败时不展示猜测的价格或库存。
- 永久失效商品按 SEO 规格处理，不一律跳转首页。

## 5. 页面需求

### P-001 Home

必须：

- 一句话说明真实品牌价值，不使用未确认定位词。
- 明确的主购买入口与主内容入口。
- 展示真实商品或 Collection，不放不可购买占位卡。
- 提供来源、工艺、包装或服务信任信息，但仅限已确认事实。
- 适量 Email opt-in；不得遮挡首屏或强制互动。

验收：

- 主要价值和导航在初始 HTML 中可读。
- 无 JavaScript 时核心链接仍可访问。
- 移动端首屏不被弹窗、视频或重型脚本阻断。

### P-002 Collection

必须：

- 唯一 H1、策展说明、商品网格、可理解的空状态。
- 商品卡显示图片、名称、真实价格区间和可用状态。
- 筛选只覆盖对真实目录有价值的属性。
- 参数筛选/排序不进入 sitemap，不生成重复索引页。

验收：

- Collection 只包含当前 US catalog 可见商品。
- 商品卡与 PDP 价格一致。
- 分页或加载更多可被键盘与 crawler 访问。

### P-003 Product Detail

必须：

- 商品名称、图库、价格、变体、库存、数量、Add to bag 与 Buy now。
- 材料、尺寸/重量、颜色、包含物、护理、来源/处理披露。
- 天然差异、独件状态或图片代表性说明，取决于商品模型。
- Shipping/Returns 摘要并链接完整政策。
- 相关 Crystal Guide、文章或商品，只有真实关联才展示。
- 准确 Product/Offer 结构化数据。

验收：

- 不选择有效变体时不能误加购。
- Variant 选择项显示本地化款式名与当前 Market 价格；切换后主价格、结构化数据
  和加入 Cart 的 merchandise 必须一致。
- Buy now 使用独立单商品 Cart 进入 Shopify hosted checkout，不改变已有 Bag；
  Shopify 未连接时必须禁用并解释原因。
- 售罄、不可售和低库存信息来自 Shopify。
- UI、metadata 与 JSON-LD 的价格、币种、库存一致。
- 图片有尺寸、响应式资源和有意义的替代文本。

### P-004 Cart

必须：

- 查看、更新数量、移除商品和查看预计小计。
- 明确税费与配送在 Checkout 确认，除非已有可靠估算。
- 处理价格变化、售罄、超过库存和 API 失败。
- 点击 Checkout 时获取最新 `checkoutUrl` 并跳转 Shopify。
- 不要求登录。

验收：

- 刷新后购物车可恢复。
- Cart ID 不出现在日志或 analytics payload。
- 重复提交不会无意创建多条或错误数量。

### P-005 Crystal Guide

必须：

- 清楚回答该晶体是什么，并区分矿物事实、护理/安全与传统文化含义。
- 有来源、真实作者、发布时间和实质更新时间。
- 关联当前可售商品，但知识内容不能只是商品列表。
- 不包含未经证实的诊断、治疗、治愈或预防承诺。

验收：

- 内容意图不与同主题 Blog 文章重复。
- 索引页采用资料目录结构，服务端输出各 Guide 的名称、摘要和可抓取链接。
- 引用可追溯，作者/审核者信息不虚构。
- 主要答案和出处在初始 HTML 中可读。

### P-006 Article

必须：

- Answer-first summary、正文、相关问题、来源、作者、日期。
- 与 Crystal Guide 形成清晰分工：文章解决具体问题或场景。
- Blog 索引页建立 Featured article 与其余文章的编辑层级，并在服务端输出摘要
  和可抓取链接。
- 关联实体和商品必须经过人工选择。

首发门槛：

- 没有真实、原创、审核完成的内容时，不公开空 Blog 枢纽和薄文章。

### P-007 Trust 与 Policy pages

- About：先呈现获批品牌立场、内容原则和商品透明标准；团队、工艺、采购、历史
  和认证只在有真实资料时加入，不得用工作文案补成生产事实。
- Contact：真实渠道、响应时间和必要地址信息。
- Shipping/Returns：与 Shopify Checkout 和实际运营一致。
- Privacy/Terms：由适格负责人批准，并记录更新时间。
- FAQ：只回答真实高频问题，不复制整段政策或为 Schema 凑内容。
- Disclaimer：不能替代页面本身准确、克制的 claims；正式措辞由负责人批准。
- Product Care：品牌级指南与 Product metafields 的商品专属护理事实保持一致；
  内容过薄时只在 PDP 展示，不公开空页面。
- Accessibility：只陈述实际措施、已知限制和真实支持渠道，不夸大符合程度。

## 6. Commerce 需求

- Product、Variant、Price、Inventory、Discount、Cart、Checkout、Order 归 Shopify。
- Cart 使用 Storefront API；Checkout 使用 Shopify hosted checkout。
- 商品不可售时不能加入购物车。
- 促销必须由 Shopify 验证，前端不得自行决定最终价格。
- 交易邮件使用 Shopify 或已批准的交易系统。
- Reviews 只有真实来源和审核流程确认后才上线。

详细字段和边界见 `docs/COMMERCE_SPEC.md`。

## 7. 非功能需求

- Responsive：mobile-first，覆盖手机、平板和桌面。
- Accessibility：以 WCAG 2.2 AA 为目标，核心旅程支持键盘和辅助技术。
- Performance：真实用户 p75 目标 LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1。
- SEO：索引页有完整 HTML、唯一 metadata、正确 canonical 和适用 Schema。
- Security：秘密仅服务端，客户 PII 不进入客户端日志或不必要工具。
- Resilience：Shopify 限流、超时和失败有可恢复状态。
- Privacy：非必要追踪在适用 consent 之前不运行。

## 8. 发布验收

- 所有 P0 页面使用真实品牌、商品、图片和政策内容。
- Home → PDP → Cart → Shopify Checkout 的游客路径在移动端和桌面通过。
- 0 个关键内部 404；所有预期 sitemap URL 返回 200、canonical、indexable。
- 0 个 Schema 与 UI 价格/库存不一致；eligible PDP 无 critical structured data error。
- Preview、Cart、Search、Account 和参数页不会被索引。
- 键盘、焦点、表单标签、错误信息和主要图片 alt 已检查。
- 性能预算通过或有业务方接受的书面例外。
- Analytics 无双重 purchase，Shopify 订单与测试事件可对账。
- Shipping、Returns、Privacy、Terms 和 claims 内容已由负责人批准。
