# Open Questions

Status: Active — 各项按 Blocks 阻塞对应能力；不要把条件项一律当成全站 blocker
Owner: Project owner  
Last updated: 2026-08-31
Resolved input: `docs/BRAND_INPUTS.md`

业务方已授权先建立可运行测试站。下列问题分别会阻塞真实商品接入、政策发布或
生产上线；以表格 `Blocks` 和发布清单的适用范围判断，不设置一个笼统 P0 标签。
Codex 不得以开发样本代替答案。

## Brand and commercial

| ID | Pending decision | Blocks |
|---|---|---|
| Q-001A | Joya Mana 的美国商标与社交账号核验；`.com` 与 DNS 已完成 | Production identity |
| Q-001B | 价格带、AOV 和 margin context | Real prices、free shipping |
| Q-002A | 七脉轮普通款完整 11 选项、SKU、正式材料与定价 | Seven Chakra 生产 Catalog |
| Q-002B | 礼盒、包装成本、礼品留言 | Gift experience |
| Q-002C | 正式首发 assortment；Aquamarine 是否仅测试商品 | Public Catalog、index、Checkout |

## Fulfillment and policy

| ID | Pending decision | Blocks |
|---|---|---|
| Q-003A | 中国直发、美国本地、3PL 或混合履约 | Shipping promise |
| Q-003B | Alaska/Hawaii/Puerto Rico/PO Box/APO/FPO 范围 | Delivery coverage |
| Q-003C | handling、carrier、运费、免邮门槛 | Checkout/shipping page |
| Q-003D | 退换窗口、例外、运费、restocking、损坏/丢件 | Returns page |
| Q-003E | 销售税、关税、进口费用责任 | Checkout/policy |
| Q-003F | 法律实体、地址、政策审批人 | Privacy/Terms/Organization |

未解决前，缺失的 Shopify Policy 必须 fail closed 或明确显示暂不可用，全站保持
`noindex`，不得输出 Shipping/Return policy Schema；不得用本地开发正文伪装政策。

## Assets and accounts

- [x] Shopify store / development store
- [x] Headless channel 与 private Storefront API access（2026-08-15 只读验证通过）
- [x] 历史代表性 mock Product/Collection 已完成迁移并从运行时代码删除
- [x] Shopify Headless channel 中发布测试 Product/Variant（2026-08-25 可见 1 件）
- [ ] Shopify Headless channel 中创建、填充并发布非空 Design Collection
- [ ] 上线前复核所有 Shopify Standard Product Category；2026-08-30 Storefront
  抽查时 Aquamarine 可通过 Bracelets Category 发现
- [ ] 定义、填充并映射正式 Product knowledge metafields：materials、dimensions/
  fit、care、origin/treatment disclosure、package contents 与 related content，并完成 EN/ES 审核
- [ ] 定义并映射 repeatable/natural-variation/one-of-a-kind 商品模型，以及
  exact item/representative image disclosure；当前 mapper/UI 尚未实现这组语义
- [ ] 创建 Design Series Metaobject、Product `custom.design_series` reference、
  Collection `custom.collection_kind`，并将真实系列 Collection 标记为 `design_series`
- [ ] 在现有 `content_page` definition 增加可选 `navigation_title`（single line）、
  `summary`（multi-line）和 `child_pages`（Content Page Metaobject reference list），并
  确认 Storefront access
- [ ] 创建、审核并发布 root `about`；如需子页，将完整 child 加入
  `about.child_pages`，按期望 tabs 顺序排列，并完成 en-US / es-US 正文与 SEO 审核
- [x] 最终域名和 DNS：`www.joyamana.com` 指向 Vercel，
  `checkout.joyamana.com` 指向 Shopify Online Store
- [x] Vercel account/team 与 Production deployment；`www` 已公开响应
- [ ] 将本地 `dev` 分支推送并由 Vercel 成功构建为 Preview；推送前不视为 Preview 已建立
- [x] D-044 确认 `https://www.joyamana.com` 为 canonical origin，apex 308 至 `www`；
  Vercel Production 环境值已设置
- [ ] 部署当前代码后复核公开 canonical/OG；2026-08-31 当前 deployment 的
  `og:url` 仍指向 `https://joyamana.vercel.app`
- [ ] Logo、字体授权、颜色
- [ ] 真实商品摄影/视频
- [x] Home 已移除并删除测试期 `bling-omen-editorial-hero.png`，首屏改用纯色背景与
  排版；未来新增 production hero/editorial 资产仍须先获批
- [x] 公开客服/隐私邮箱确定为 `info@joyamana.com`
- [ ] `info@joyamana.com` inbox、负责人/备援和交易发件域名认证
- [ ] 决定是否批准 Resend 作为 Contact 数据处理方，并确认成本、保留期、
  删除/导出、发件域验证和退出路径
- [ ] 在启用 `CONTACT_FORM_ENABLED` 前配置生产滥用限制/WAF 并验收投递、
  回复、失败和 Email-only 降级流程
- [ ] GA4 / GSC / Merchant Center
- [ ] Email/CRM 与 Consent 方案

不要在本文件粘贴 credential。

## Shopify storefront audit — 2026-08-16（历史快照）

本节只保留当日证据；后续 follow-up 与当前 Shopify response 优先。Storefront API
当日只读确认：

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

## Shopify storefront follow-up — 2026-08-25（历史快照）

Storefront API 与安全的 Cart smoke 已确认：

- Headless 可见 `aquamarine-bracelet-9-mm` 及 1 个可售 Variant，contextual price
  为 USD；页面不得再使用 `$68` mock 价格或七脉轮 mock 商品作为运行时回退。
- 本轮早期该商品 Shopify description 只有 `$14`；最终实时复核时已替换为完整
  商品正文，当前页面未再出现该价格冲突。正文仍须在公开发布前由业务方审核。
- Collection 仍只有空的默认 `frontpage`；Storefront 在有真实非空 Collection 前
  只能展示 Shopify 全商品目录，具体 Collection URL 不得引用本地 mock。
- US Spanish `@inContext(language: ES)` 当前回退为 English，说明西语翻译尚未在
  Shopify 发布；`/es-us/` 继续 noindex，不能把 fallback 视为已审核翻译。
- 当日 token 尚不能读取具体库存数量，页面只使用 `availableForSale` 与
  Shopify Cart warning/user error 做可售校验。该状态已被 2026-08-31 follow-up 取代。
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

## Shopify editorial follow-up — 2026-08-30

- Storefront API 当前可读取原生 Blog `blog` 与 `crystals`；两者各有 1 篇已发布测试
  Article，分别为 `hello-world` 与 `hello-for-crystal-guide`。
- `/blog`、`/crystals` 与各详情页已切换为 Shopify Article，不再读取本地 prototype
  entries；品牌 URL 不暴露 Shopify `/blogs/*`。首页已按后续业务决定移除 Blog 推荐。
- 两篇测试 Article 当前均无 excerpt、SEO、featured image 或 tags，正文只有一行测试
  文字。前端会从正文生成安全摘要，但这些内容仍须替换为原创、审核完成的正式内容。
- `@inContext(language: ES)` 当前对两个 Blog 均回退 English；西语页面提供阅读后备并
  保持 noindex，不进入西语 sitemap/hreflang。
- 当前全站 noindex 门禁不变。正式开放索引前还需完成 Article 内容审核、claim/source
  检查、独立 SEO、图片 alt、翻译与相关商品关系。

## Shopify runtime follow-up — 2026-08-31

- Headless private Storefront token 现可读 `quantityAvailable` 与
  `currentlyNotInStock`。Product/Cart mapper、PDP 与 Bag 已与 contextual
  `quantityRule` 一起使用这些字段约束可选数量；并发变化仍以 Cart warning/
  user error 和 Checkout 为准，页面不显示“仅剩 X 件”类紧迫文案。
- `COMMERCE_PROVIDER`、本地 mock Catalog、本地 Trust/Policy/About/Editorial 正文
  fallback 已删除。Storefront 现为 Shopify-only；缺失/无效/异常时 fail closed。
- 当前 Search 仅检索 Shopify Product；CI、自动化浏览器/支付 E2E、webhook/cache
  invalidation、Analytics/consent 和 Customer Privacy API 仍未实现。Playwright 按
  D-043 暂缓，当前使用有记录的人工浏览器/Checkout smoke。
- Search metadata 已与 Product-only 运行时一致，不再声称检索 editorial content。
- 参数请求已输出 `noindex, nofollow, noarchive`，保留 clean canonical 并移除 hreflang；
  clean URL 在 index gate 开启时维持正常 index/follow。
- Policy/Accessibility 的双向 hreflang 已按各语言真实 readiness 过滤；fallback 页继续
  noindex，并退出 sitemap/Schema。
- Product/Collection 尚无法自动识别 Spanish 真实翻译与 English fallback；在增加
  Commerce translation readiness 验证前不得开启全站 index gate。
- en-US/es-US 已在初始 HTML 输出正确的 document-level `<html lang>`。
- Header 目录已使用不含价格/库存/正文的导航专用 query/projection；上游失败时降级为
  基础导航并保留页面主体，不恢复本地 Catalog。监控/告警仍属于 Q-105。

## Deferred / conditional decisions

| ID | Decision | Current handling |
|---|---|---|
| Q-101 | Training crawler policy（对应 D-016） | Pending；Search/User 与 Training 分开 |
| Q-103 | Reviews provider | 无真实评论时不渲染模块 |
| Q-104 | Email/CRM | 先定义 consent/events |
| Q-105 | Error monitoring | Vercel Production baseline 已有；告警、owner 与保留策略待复核 |
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

- 品牌名称确认为 `Joya Mana`；美国商标和社交账号可用性仍在 Q-001A。

## Production deployment follow-up — 2026-08-31

- `https://www.joyamana.com` 外部返回 HTTP 200，并由 Vercel 提供服务。
- `https://checkout.joyamana.com` 外部返回 HTTP 200，并由 Shopify 提供服务。
- Production 首页仍输出 `noindex, nofollow, noarchive`；`robots.txt` 允许抓取，
  但 `sitemap.xml` 是空 `urlset`。这是公开可访问但尚未开放搜索索引的状态。
- D-044 已确认 `www` canonical，外部检查确认 apex 308 至 `www`。Vercel Production
  环境值已设置，但当前 deployment 的 `og:url` 仍为 `https://joyamana.vercel.app`；
  当前代码 redeploy 后必须复核。origin 修正不代表可以同时打开 index gate。
- 业务方确认网站已正式公开，但下单支付等能力尚未完整支持。因此域名与部署问题已
  解决，Checkout/payment、政策、翻译、Analytics/consent 与发布验收仍按各自 Blocks
  保持开放。
