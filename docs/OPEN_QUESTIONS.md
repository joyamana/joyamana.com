# Open Questions

Status: Active — 只记录当前未解决输入；按 `Blocks` 限定影响范围
Owner: Project owner  
Last updated: 2026-09-02
Resolved input: `BRAND_INPUTS.md`、D-047、D-048

本文件不保存已解决问题和历史审计快照。历史记录见
[`archive/open-questions-history-2026-08-to-09.md`](archive/open-questions-history-2026-08-to-09.md)。
任何问题都不得自动扩大成全站 blocker；只阻塞表格明确列出的能力。

## Fulfillment, tax and policy

| ID | Pending decision | Blocks |
|---|---|---|
| Q-003B | Alaska/Hawaii/Puerto Rico/PO Box/APO/FPO 范围 | Delivery coverage |
| Q-003C | carrier、实际 Checkout 运费、免邮门槛；handling 已确认为通常 1–3 个工作日 | Checkout/shipping settings |
| Q-003E | 销售税、关税、进口费用责任 | Checkout/policy |

这些问题不阻塞已经发布的 Catalog、已审核页面或现有下单支付能力。网站不得自行补写
特殊地区承诺、免邮、税费或进口责任；客户可见事实必须来自 Shopify 配置和已批准 Policy。

## External setup and release dependencies

- [ ] 上线/变更商品前复核 Shopify Standard Product Category。
- [ ] 为正式商品完整填充并审核 Product knowledge metafields：materials、dimensions/
  fit、care、origin/treatment disclosure、package contents 和 related content。
- [ ] 为所有正式商品填充 `custom.product_model`；未知或无效值继续 fail closed。
- [ ] 定义并映射 exact item / representative image disclosure。
- [ ] 完成 Design Series Metaobject、`custom.design_series` reference、story/lookbook；
  `Patron Saint` 的非空 Collection 与 `collection_kind=design_series` 基础门禁已完成。
- [ ] 配置并验收 GA4、Google Search Console 和 Merchant Center。
- [ ] 决定并实现 Analytics/marketing consent 与 Headless `Your Privacy Choices`；不得向
  浏览器暴露 server-only Storefront token。
- [ ] Email/CRM 供应商与 consent/event 方案；Contact 当前保持已确认的 Email-only。

以上清单中的代码工作在对应输入或外部配置准备后进入 Roadmap，不等于全部阻塞当前
Production。价格、库存、Cart、Checkout 和已接入内容继续以 Shopify 为事实来源。

## Current production release state

- `https://www.joyamana.com` 是唯一 canonical origin；apex 308 至 `www`。
- Production 首页与 `/es-us` 已复核为 `index, follow`。en-US/es-US Core、Commerce、
  Policies 已打开；Editorial 关闭，Cart、Search、Preview 和参数页继续 noindex。
- `sitemap.xml` 已非空，只包含通过 scope 与页面 readiness 的 URL。
- 下单支付已由业务方确认完整支持，Shopify Payment test mode 流程测试未发现问题。
- Blog/Crystal Guide 测试 Article 暂不处理并保持 Editorial noindex。
- `info@joyamana.com` 的 inbox、负责人/备援、外发认证和投递表现已确认；Contact 表单
  继续后置。
- Logo、字体授权、颜色和真实商品摄影/视频已确认完成。

## Deferred / conditional decisions

| ID | Decision | Current handling |
|---|---|---|
| Q-101 | Training crawler policy（对应 D-016） | Pending；Search/User 与 Training 分开 |
| Q-103 | Reviews provider | 无真实评论时不渲染模块 |
| Q-104 | Email/CRM | 先定义 consent/events |
| Q-105 | Error monitoring | Vercel baseline 已有；告警、owner 与保留策略待复核 |
| Q-106 | Customer Account | Post-launch |
| Q-107 | Future markets | 第一阶段仅 US；CA 保留 planned 配置且不创建公开 URL |
| Q-108 | Gift Card/Wishlist/Loyalty | 依据购买和复购数据 |

## Closed scope reference

- Q-001A/B、Q-002A/B/C 已由 D-047 移出网站范围。
- Q-003A/F 已解决；Organization/Site Settings 仍是公开字段映射的工程缺口，不是业务
  决策缺口。
- Q-003D、品牌资产、商品摄影和客服邮箱运营验收均已解决。
- Checkout/payment 已由 D-048 接受，不再是开放问题。
