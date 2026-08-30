# Analytics and KPIs

Status: Draft — 工具与 consent 方案待确认  
Owner: Growth / Analytics  
Last updated: 2026-08-02

## 1. 原则

- Shopify Order 是收入和订单的商业事实来源。
- Analytics 用于理解行为，不反向覆盖 Shopify 事实。
- 先定义问题和事件，再选择工具；不因“行业标配”堆脚本。
- 不发送 PII、Cart ID、access token、完整地址或支付信息。
- 对 consent、retention、data sharing 和删除有明确策略。
- SEO/GEO 指标必须与页面质量或商业结果关联。

## 2. 拟议最小工具集

### MVP

- Shopify Analytics / Orders：订单和收入对账。
- Google Analytics 4：storefront 漏斗与 acquisition。
- Google Search Console：Google crawl、index 和 organic performance。
- Google Merchant Center：商品 feed、free listings 和诊断。
- Bing Webmaster Tools：Bing 索引与搜索诊断。
- Vercel Web Analytics/Speed Insights 仅在隐私、成本和脚本预算获批后使用。

### 需要业务价值后再加

- CRM/Email automation
- Meta/TikTok/Pinterest pixels
- Session replay / heatmap
- Sentry 或其他 error monitoring
- Dedicated SEO rank tracker
- Review/loyalty attribution

同类工具不重复安装。每个新增工具记录 owner、目的、事件、cookie、数据接收方、
性能成本和移除方式。

## 3. Measurement model

### Commerce funnel

| Business action | Recommended event | Required context |
|---|---|---|
| 查看商品列表 | `view_item_list` | list id/name, visible items |
| 选择商品卡 | `select_item` | list + selected item |
| 查看 PDP | `view_item` | product/variant, currency, value |
| 选择 Variant | custom only if actionable | product, selected option |
| 加入购物车 | `add_to_cart` | actual added line/value |
| 查看购物车 | `view_cart` | current lines/value |
| 移除商品 | `remove_from_cart` | actual removed line/value |
| 开始结账 | `begin_checkout` | cart snapshot, no PII |
| 完成购买 | `purchase` | Shopify order id, revenue, items |
| Newsletter 同意 | `sign_up` 或明确自定义事件 | form placement, consent type |

事件只在动作成功后发送；按钮点击失败不能记为 `add_to_cart` 或
`begin_checkout`。

### Content

- `page_view` 按 page type 区分 Product/Collection/Crystal/Article/Policy。
- 内容到商品点击记录 source entity 与 destination product。
- 外部 source click 只记录匿名目标域/类型，避免泄露用户数据。
- 阅读深度等微事件只有用于明确决策时才采集。

### Error and quality

- Commerce API failure category
- Add-to-cart user error category
- Checkout redirect failure
- 404 source path（过滤敏感 query）
- Webhook/revalidation failure（服务端监控，不进 GA4）

## 4. Item identity

- `item_id` 使用稳定、非 PII 的 Shopify Variant/Product identifier 或 SKU，
  全站保持一致。
- `item_name`、brand、category、variant 与当前 Shopify 数据一致。
- Currency 由 Market 决定（US=USD，CA=CAD）；value 使用事件发生时该 Market
  的真实金额，事件同时携带 market、locale 与 currency。
- 不在 analytics 中重建折扣、税或最终订单逻辑。
- Product 和 content page type 使用集中枚举。

## 5. Purchase 与 Checkout

Shopify hosted checkout 可能使用不同域名/执行环境，实施前需要：

- 确认 Shopify 当前支持的 Customer Events/pixel 或 analytics 集成。
- 配置允许的跨域/attribution，避免 session 断裂。
- 保证 `purchase` 每个订单只发送一次。
- 处理 consent 在 storefront 到 Checkout 的传递。
- 用测试订单对账：Shopify order、revenue、currency、items、transaction ID。
- Refund/cancellation 以 Shopify 报告为准，并决定是否回传 analytics。

不得在 storefront 用“点击 Checkout”推断购买成功。

## 6. Consent 与 Privacy

- 区分 strictly necessary、preferences、analytics、marketing。
- 非必要脚本按适用政策和业务决定在 consent 后加载。
- Consent UI 易理解、拒绝与接受同样可操作，不阻断公开内容。
- 记录 consent version 和时间时避免额外身份数据。
- Shopify Storefront `visitorConsent` 等能力实施时以当前 API 文档为准。
- Cookie/SDK 清单、purpose、duration、provider 和 policy link 保持可审计。
- Do Not Sell/Share、state privacy 与国际访问处理由合格专业人士确认。

## 7. KPI hierarchy

### North-star context

目标不是最大化任一孤立数字，而是获得可持续、可信的商品收入。核心结果：

- Net sales / contribution context
- Purchase conversion rate
- Average order value
- Repeat purchase
- Refund/cancellation

### Funnel

- Product view → add-to-cart rate
- Cart → begin checkout rate
- Begin checkout → purchase rate
- Content-assisted product view / purchase
- Mobile vs desktop funnel

### Acquisition

- New users / sessions by channel
- Non-brand organic impressions, clicks, CTR
- Organic landing conversion and revenue
- Email opt-in、unsubscribe、complaint
- AI referral sessions and assisted outcomes

### Technical quality

- CWV p75: LCP, INP, CLS
- JS/runtime error rate
- Shopify API/cache failure
- 404/redirect/canonical/index error
- Structured data critical error
- Accessibility critical/serious defect

## 8. SEO reporting

按 page type 分组：

- submitted vs indexed
- clicks / impressions / CTR / position context
- brand vs non-brand query
- Product/Collection/Crystal/Article landing performance
- wrong canonical、crawled not indexed、soft 404、merchant listing error
- organic PDP view → add-to-cart → purchase

不以“发布页数”作为成功指标，不因未索引就批量复制内容。

## 9. GEO / AI Search reporting

由于 AI 引用和归因不完整，使用方向性基准：

- 建立 20–30 个与品牌、主要晶体和购买任务相关的固定问题集。
- 每月在明确记录的产品/地区/无登录条件下检查品牌提及、引用 URL 和事实准确。
- 记录 AI referral（如可识别）到 landing、engagement 和 Commerce funnel。
- 分析获准 AI crawler 的访问和失败状态，避免只看总请求数。
- 发现错误引用时优先修正文、实体、来源和内链。

不把某次回答、crawler hit 或 `llms.txt` 请求当排名保证。

## 10. Baseline 与目标

### Pre-launch

只设质量门槛，不设虚构增长目标：

- 测试事件 100% 与预期触发一致。
- 0 PII 泄露到 Analytics。
- 0 duplicate purchase。
- 测试订单金额/币种/items 可与 Shopify 对账。
- 关键页面有明确 page type 和 acquisition attribution。

### Post-launch

- 前 30 个有效运营日建立基线。
- 排除员工、测试、机器人和故障期。
- 业务方基于商品 margin、流量和样本量设季度目标。
- 每个实验预先定义 hypothesis、primary metric、guardrail 和停止条件。

## 11. Dashboard 与节奏

- Daily launch window：订单、Checkout、错误、CWV 异常。
- Weekly：funnel、channel、landing page、库存/售罄影响、Email。
- Monthly：SEO index/query、content contribution、AI baseline、repeat/refund。
- Quarterly：工具价值、数据保留、third-party scripts、KPI 目标与 Roadmap。

## 12. 验收

- Event dictionary 与代码事件一一对应。
- Consent 前后的网络请求经过检查。
- Shopify 测试订单与 purchase 对账。
- 内部和 Preview traffic 可过滤。
- Dashboard 不把微事件当商业结果。
- 每个第三方工具有 owner、用途、隐私和移除记录。
