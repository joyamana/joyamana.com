# Open Questions

Status: Active — 不阻塞测试站工程骨架  
Owner: Project owner  
Last updated: 2026-08-30
Resolved input: `docs/BRAND_INPUTS.md`

业务方已授权先建立可运行测试站。下列问题仍会阻塞真实商品接入、政策发布或
生产上线；Codex 不得以开发样本代替答案。

## Brand and commercial

| ID | Pending decision | Blocks |
|---|---|---|
| Q-001A | Joya Mana 的 `.com`、美国商标与社交账号核验 | Production identity/domain |
| Q-001B | 价格带、AOV 和 margin context | Real prices、free shipping |
| Q-002A | 七脉轮普通款完整 11 选项、SKU、正式材料与定价 | Shopify catalog |
| Q-002B | 礼盒、包装成本、礼品留言 | Gift experience |

## Fulfillment and policy

| ID | Pending decision | Blocks |
|---|---|---|
| Q-003A | 中国直发、美国本地、3PL 或混合履约 | Shipping promise |
| Q-003B | Alaska/Hawaii/Puerto Rico/PO Box/APO/FPO 范围 | Delivery coverage |
| Q-003C | handling、carrier、运费、免邮门槛 | Checkout/shipping page |
| Q-003D | 退换窗口、例外、运费、restocking、损坏/丢件 | Returns page |
| Q-003E | 销售税、关税、进口费用责任 | Checkout/policy |
| Q-003F | 法律实体、地址、政策审批人 | Privacy/Terms/Organization |

未解决前，测试站 Policy 页面必须显示为内部开发占位、全站保持 `noindex`，
不得输出 Shipping/Return policy Schema。

## Assets and accounts

- [x] Shopify store / development store
- [x] Headless channel 与 private Storefront API access（2026-08-15 只读验证通过）
- [x] 代表性 mock Product/Collection（七脉轮普通款，5 个概念选项）
- [x] Shopify Headless channel 中发布真实 Product/Variant（2026-08-25 可见 1 件）
- [ ] Shopify Headless channel 中创建、填充并发布真实 Collection
- [ ] 为商品设置准确 Shopify Standard Product Category（首件应核对 Bracelets）
- [ ] 创建 Design Series Metaobject、Product `custom.design_series` reference、
  Collection `custom.collection_kind`，并将真实系列 Collection 标记为 `design_series`
- [ ] 最终域名和 DNS
- [ ] Vercel account/team
- [ ] Logo、字体授权、颜色
- [ ] 真实商品摄影/视频
- [x] 公开客服/隐私邮箱确定为 `info@joyamana.com`
- [ ] `info@joyamana.com` inbox、负责人/备援和交易发件域名认证
- [ ] GA4 / GSC / Merchant Center
- [ ] Email/CRM 与 Consent 方案

不要在本文件粘贴 credential。

## Shopify storefront audit — 2026-08-16

Storefront API 已只读确认：

- Store name 为 Joya Mana；主域名仍是 `gee0hu-1n.myshopify.com`，商店描述为空。
- 仅 US / USD / English 可用，`shipsToCountries` 仅 US；Canada 未开放。
- 支付展示配置返回 USD 与常见卡组织，但这不证明 payment provider 已激活、
  payout 已验证或测试模式配置正确。
- Privacy Policy 有 Shopify 正文，但尚未完成业务/法律批准；Refund、Shipping、
  Terms 均为空。
- Headless 可见 Product 为 0；只有空的默认 `frontpage` Collection。
- Headless 可见 Page 为 0；默认中文 Blog「新闻」无文章；`main-menu` 仍是中文
  默认菜单。Next.js 不使用 Shopify theme menu，但这些默认内容应在上线前整理。

Storefront token 无法验证、仍需 Shopify Admin 人工确认：

- 法律主体、地址、账单套餐、Shopify Payments、银行与 payout 状态、测试模式。
- Inventory location、fulfillment origin、package、shipping profile/zone/rate。
- US sales-tax registration 与 Shopify Tax 设置；不得仅凭默认计算视为合规。
- Guest checkout、Customer accounts、营销同意、订单处理和 Checkout branding。
- Customer Privacy、cookie banner、data-sharing opt-out 与实际第三方脚本清单。
- Notification sender、发件域名认证、订单邮件、support/privacy 邮箱。
- 正式域名、DNS、Checkout domain、像素/Analytics 和生产 Secret 分离。

## Shopify storefront follow-up — 2026-08-25

Storefront API 与安全的 Cart smoke 已确认：

- Headless 可见 `aquamarine-bracelet-9-mm` 及 1 个可售 Variant，contextual price
  为 USD；页面不得再使用 `$68` mock 价格或七脉轮 mock 商品作为运行时回退。
- 本轮早期该商品 Shopify description 只有 `$14`；最终实时复核时已替换为完整
  商品正文，当前页面未再出现该价格冲突。正文仍须在公开发布前由业务方审核。
- Collection 仍只有空的默认 `frontpage`；Storefront 在有真实非空 Collection 前
  只能展示 Shopify 全商品目录，具体 Collection URL 不得引用本地 mock。
- US Spanish `@inContext(language: ES)` 当前回退为 English，说明西语翻译尚未在
  Shopify 发布；`/es-us/` 继续 noindex，不能把 fallback 视为已审核翻译。
- token 未获得 `quantityAvailable` scope；前端只使用 `availableForSale`，不展示或
  猜测具体库存数。真实 Cart 请求增加数量时，Shopify 能返回库存不足 warning 并
  保持可履约数量。
- Cart create/update/remove 与 HTTPS `checkoutUrl` 合约可用；smoke 未创建订单，
  测试商品行已移除。Buy now 与 Bag Checkout 的代码仍受
  `SHOPIFY_CHECKOUT_ENABLED=false` 门禁保护。

## Shopify policy follow-up — 2026-08-30

- Storefront API 当前可读取已发布的 Refund Policy 与 Privacy Policy；Shipping
  Policy 和 Terms 仍未完成。
- `/returns` 与 `/privacy` 已改为服务端读取 Shopify Policy，并对商家正文执行
  HTML allowlist 清理；正文缺失或 API 不可用时不输出旧政策承诺，也不进入索引。
- Shopify 当前返回真实西语 Refund Policy；Privacy Policy 的 `ES` context 仍回退
  English。西语路由始终可访问，只有正文存在真实翻译时才允许进入 sitemap/index。
- Shopify Customer privacy 当前显示：Cookie banner 使用 automated 判断且 US
  销售地区不要求展示；Data sharing opt-out 已在 California、Colorado 等 15 个州
  启用；Shopify Network Intelligence 为 Enabled。
- Shopify Online Store 的 data-sharing opt-out 设置不会自动为 Next.js Headless
  storefront 生成入口。正式公开前仍需使用独立 public Storefront token 接入
  Customer Privacy API、提供 `Your Privacy Choices`，并核对同根 Checkout domain；
  绝不能向浏览器暴露当前 server-only private token。

## Before public launch

| ID | Decision | Current handling |
|---|---|---|
| Q-101 | Training crawler policy | Pending；Search/User 与 Training 分开 |
| Q-103 | Reviews provider | 无真实评论时不渲染模块 |
| Q-104 | Email/CRM | 先定义 consent/events |
| Q-105 | Error monitoring | Vercel baseline；Beta 前复核 |
| Q-106 | Customer Account | Post-launch |
| Q-107 | Future markets | 第一阶段仅 US；CA 保留 planned 配置且不创建公开 URL |
| Q-108 | Gift Card/Wishlist/Loyalty | 依据购买和复购数据 |

## Resolved on 2026-08-03

- Working name/positioning/voice and prohibited brand claims。
- Standard + natural one-of-a-kind catalog model。
- One-of-a-kind quantity=1 and exact-image rule。
- Custom Crystal、Subscription、Customer Account 后置。
- Shopify Pages/Blog/Metaobjects，独立 CMS 后置。
- `/blog` URL。
- 同一 US Market/Catalog 支持 en-US 根路径与 `/es-us/`。
- CA typed Market/Catalog 模型保留，但第一阶段不公开 `/en-ca/`、`/fr-ca/`，
  不发布 CAD 价格或 Canada Checkout。
- 当前不建 Global Site；未来可按触发条件增加 `/choose-region`。
- Market、Language、URL、Currency 分离；Currency 不进入 URL。
- Claims/editorial constraints。
- Minimal analytics: Shopify + GA4 + GSC。
- Codex 可继续初始化不可索引测试站。

## Resolved on 2026-08-14

- 品牌名称确认为 `Joya Mana`；域名、美国商标和社交账号可用性仍在 Q-001A。
