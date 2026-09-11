# Launch Runbook

Status: Active — Production 已公开并开放已审核索引/交易范围；剩余内容与运营项继续验收
Owner: Engineering / Operations  
Last updated: 2026-09-11

本文件用于已上线站点的持续发布与回滚。当前能力和批准范围见
[PROJECT_SPEC.md](PROJECT_SPEC.md)，未解决输入按 OPEN_QUESTIONS 的 Blocks 限定影响。
dev 对应受保护 Vercel Preview，main 对应 Production。

三个门禁独立：索引总开关 + indexing.ts 矩阵、Shopify Checkout、Contact form。
Preview 始终 noindex；Production 保持已获批范围。Contact 当前 Email-only。
内容/导航按 D-046 使用五分钟再验证窗口，更新后须检查实际响应。
Playwright 当前封存；发布仍需记录人工浏览器/Checkout 验收。

## 1. 发布角色

每次发布记录实际负责人；表格不代表已完成角色分配：

| Role | Owner | Responsibility |
|---|---|---|
| Launch lead | TBD | Go/no-go 与协调 |
| Engineering | TBD | Build、deploy、rollback |
| Shopify/Operations | TBD | Catalog、inventory、Checkout、orders |
| Content/SEO | TBD | 内容、metadata、robots、sitemap |
| Brand/Design | TBD | 视觉与文案批准 |
| Customer support | TBD | 客户问题与升级 |
| Legal/Privacy | TBD | Policy、claims、consent 审核 |

## 2. Go/no-go 前置条件

- `OPEN_QUESTIONS.md` 中剩余问题按各自 `Blocks` 验收，不扩大为全站 blocker。
- MVP PRD 的发布验收没有未接受的 blocker。
- Production Shopify Catalog、Markets、payment、shipping、tax 配置获批。
- 域名、SSL、Checkout domain、Email sender 和 support inbox 可用。
- Production secrets 与 Preview/local 分离。
- `SHOPIFY_CHECKOUT_ENABLED`、`NEXT_PUBLIC_SITE_INDEXABLE`、仓库内索引矩阵，与
  `CONTACT_FORM_ENABLED` 分别有明确 owner、验收记录和回退方式，不用一个
  总开关同时放开。
- 数据备份/导出责任与 Vercel rollback 方式明确。
- Support 知道 Shipping、Returns、damaged/lost、order-change 流程。

## 3. 代码质量检查

在 Node 24 下运行；依赖版本使用 package.json 与 frozen lockfile：

```text
install: pnpm install --frozen-lockfile
environment: pnpm preflight
format/check: 待建立
lint: pnpm lint
typecheck: pnpm typecheck
unit/integration: pnpm test
browser/checkout: 有记录的人工 smoke（D-043；Playwright 暂缓）
build: pnpm build
```

要求全部通过，或由 Launch lead 书面接受具体例外和风险。

## 4. Production 内容与 Commerce 检查

- 品牌名称、法律实体、联系方式、Logo、social links。
- Product/Variant/SKU、价格、库存、媒体、材料、尺寸、处理/来源披露。
- Shopify Standard Product Category 与 `/category/*` 归属。
- `Patron Saint` 已确认 `collection_kind=design_series`、Headless 可见且非空；发布前补全
  description/SEO，并按需要建立 Design Series Metaobject/reference、story/lookbook 和排序。
- Shipping、Returns、Privacy、Terms、Accessibility 内容。
- Shopify Checkout 品牌、policy links、payment、shipping、tax。
- 测试 Guest Cart → Checkout → test order → confirmation → Order Status。
- 售罄、超库存、折扣、损坏 Cart 和 API 失败。
- Transaction Email 与 support reply。
- `info@joyamana.com` inbox、负责人/备援、回复流程、外发认证和垃圾箱表现已确认；发布
  smoke 仍需验证当次环境与实际收发链路。
  若未来启用 Contact 表单，
  另行批准 Resend 的数据边界/保留期/成本/退出路径，验证发件域与生产滥用控制。

## 5. SEO/GEO 检查

- Canonical production origin 固定为 `https://www.joyamana.com`；apex 对应 URL 308
  至 `www`，canonical/hreflang/sitemap 不使用 apex、Preview 或 staging origin。
- Preview 和内部页面 `noindex`。
- 按上线前批准的 D-016 crawler policy 验证 `robots.txt`，不误封静态资源和获准
  crawler；当前 D-016 仍是 Pending，不得把代码默认当成业务批准。
- Sitemap 只包含 200、canonical、indexable、published URL。
- Cart、Search、参数页和内部状态页永久 `noindex` 且不进入 sitemap；参数不得制造
  canonical/indexable 变体。核对 clean canonical、noindex 与 hreflang 移除。
- `NEXT_PUBLIC_SITE_URL` 必须是获批的非本地 HTTPS origin；缺失或不安全时索引
  fail closed，不输出 Preview/staging canonical。
- Title、description、OG image、H1、breadcrumbs；当前缺少 OG image，发布前补齐。
- Product/Offer、Organization、WebSite/WebPage、ContactPage、Article 及适用 Policy
  JSON-LD 与 UI 一致；当前 Home Organization/WebSite/WebPage、ContactPage 和 Policy
  Schema 尚未实现，不能仅通过开启 index gate 获得。
- 404/410/301、旧 slug、售罄和下架行为正确。
- Search Console、Bing Webmaster、Merchant Center 验证。
- 关键页面在禁用 JavaScript时仍有主要内容和链接。
- 默认语言 fallback 的 Policy、About、Accessibility 和 Article 不进入对应 locale
  的 sitemap/Schema，并且不被其他语言页面的 hreflang 引用。当前 fallback 页自身
  noindex/sitemap/Schema 门禁以及 About/Article/Policy/Accessibility alternate
  readiness 过滤均已实现。
- `<html lang>` 在 en-US/es-US 页面与 document locale 一致；停用市场及未知路径返回 404。
- D-045 的索引总开关与仓库内 locale/page-group scope 只为已验收范围开启。
  en-US/es-US Commerce 均已获业务方批准；Product/Collection 尚无逐页 Spanish fallback
  自动检测，因此每次发布必须人工逐页核对西语正文、metadata 和 hreflang，发现 fallback
  时关闭 es-US Commerce scope 或先修复内容。未知路径默认 noindex。

## 6. Accessibility 与 Performance

- Mobile/desktop/tablet 关键页面。
- Keyboard、focus、screen reader smoke test、200% zoom。
- Form error、Cart status、menu/dialog、reduced motion。
- 真实图片与 Production 数据下的 CWV/Lighthouse。
- 第三方脚本 inventory、consent 和 performance impact。
- 无横向滚动、明显 CLS、阻塞首屏 popup。

## 7. Analytics 与 Privacy

- Consent accept/reject/preferences。
- 未同意时不应运行的脚本确实不运行。
- `view_item`、`add_to_cart`、`begin_checkout`、`purchase` 测试。
- Purchase 不重复并与 Shopify 测试订单对账。
- URL、events、logs 无 Email、地址、Cart ID、token 或支付信息。
- Privacy/Cookie 文案与实际工具一致。
- Headless storefront 接入 Shopify Customer Privacy API 时，浏览器使用独立最小权限
  public token，不暴露 server-only private token；适用时有可验证的
  `Your Privacy Choices` 入口和同根 Checkout consent 行为。

当前上述 Analytics/consent 与 Customer Privacy API 项均未完成，不得在发布记录中
预先勾选。

未来获批实施 Headless Customer Privacy 时，代码范围为：

- 建立独立的浏览器可用 Storefront public token 配置；不得复用或暴露当前 server-only
  private token。
- 在 client-only privacy provider 中加载 Shopify Customer Privacy / bundled banner
  asset，以 `storefrontRootDomain=joyamana.com`、
  `checkoutRootDomain=checkout.joyamana.com`、当前 US locale/country 初始化。
- Footer 提供可重复打开偏好设置的入口；另提供清楚的 `Your Privacy Choices` opt-out
  flow，只在用户明确操作后调用 `setTrackingConsent({ sale_of_data: false, ...headless })`，
  显示成功/失败状态。不得自行读写 Shopify consent cookie。
- Analytics/marketing/preferences 脚本分别调用对应 `*ProcessingAllowed()` 判断，并监听
  `visitorConsentCollected`；API 未就绪或判断失败时，本项目自己的非必要脚本 fail closed。
- CSP 允许 Shopify privacy asset，并允许浏览器向 Checkout domain 的 Storefront API
  发起所需 POST；不扩大到任意第三方域名。
- 覆盖首次访问、接受、拒绝、修改偏好、适用州 data-sale opt-out、GPC、EN/ES、跨
  `www` → `checkout` 及无障碍键盘流程。

对应 Shopify Admin 配置范围为：

- `Settings > Customer privacy` 复核并发布 Privacy policy；确认 Shopify Network
  Intelligence 与实际使用功能一致。
- 配置 Cookie banner 的地区与 EN/ES 文案；是否在 US 全域展示由 Legal/Privacy 决定，
  不由代码猜测。
- 启用并复核 Data sharing opt-out page 的适用州、内容与 GPC 行为；Online Store 自动
  菜单入口不会自动出现在 Headless Footer，因此仍需上述前端入口。
- 在 `Settings > Domains` 复核 storefront/checkout 同属 `joyamana.com` 根域，并建立
  独立 public Storefront token；记录 token rotation、owner 和撤销方式。
- 列出 GA4、广告像素、Shopify pixels 及其他第三方接收方，确保后台地区配置、Privacy
  正文和代码中的 consent 分类一致，再批准启用任何 analytics/marketing runtime。

## 8. 发布步骤

1. 确认变更范围、未决依赖、发布负责人、当前 Production deployment 与 rollback target。
   发布窗口内避免同时修改相关 Shopify 内容/运营配置。
2. 在 Node 24 下完成 frozen install、preflight、lint、typecheck、tests 和 build。
   记录 commit、验证范围与具体例外。
3. 推送 dev 并检查受保护 Preview。总索引门禁必须关闭；需要 Checkout smoke 时，
   仅按该环境已获批的测试配置启用。Contact 继续关闭。
4. 在 Preview 验证受影响页面、初始 HTML/metadata、EN/ES、移动端、404、Cart 与
   Checkout 流程。Shopify 内容变更后等待缓存窗口，并确认实际正文已更新。
   HTTP/合约测试不能替代人工交互和 Payment test mode 验收。
5. 将同一已验收提交快进/合并到 main，使用 Production 独立环境配置部署。
   例行代码发布保持已获批索引/Checkout 范围；只有存在具体风险时才临时关闭相应门禁，
   不把首次上线的全关流程用于每次更新。
6. 若本次扩大索引、启用 Contact 或更改支付/配送/税务配置，先完成各自审批与测试，
   再单独发布并验证该变化。仓库矩阵或环境变量变化都需要新 deployment。
   Payment test mode 验收不代表已经完成真实扣款、退款或 payout 对账。
7. 从外部访问 Production，核对 www canonical、apex 308、受影响页面/Checkout、
   robots/sitemap、hreflang/Schema、参数 noindex。关键失败时按下一节回滚。
8. 记录 deployment、门禁范围、人工 smoke、例外、rollback target 与监控链接。
   只在相关功能已启用时检查 Analytics/purchase 对账；不为无变更的功能伪造验收记录。

首次上线的原始流程见 [历史记录](archive/maintenance-history-through-2026-09.md)。

## 9. 监控窗口

### 第一小时

- 5xx、runtime error、Shopify API error。
- Add to bag、Bag、Checkout redirect。
- Price/inventory mismatch。
- Domain、redirect、robots、sitemap。

### 前 24 小时

- Orders 与 payment/shipping failures。
- Purchase analytics 对账。
- Support contacts、broken links、device-specific issue。
- CWV、third-party script 和 consent issue。

### 第一周

- Index/canonical/merchant diagnostics。
- Funnel by device/channel。
- Sold-out/catalog 和 policy 问题。
- AI/Search crawler access（按获准策略）。

## 10. Rollback

### Code/UI regression

- 回滚到上一个已验证 Vercel deployment。
- 门禁通过环境变量恢复时同样需要新 deployment/redeploy，并验证实际响应，不把修改
  dashboard 值本身当成回滚完成。
- 不对 Shopify Order、Customer 或 Inventory 执行数据回滚。
- 若 Schema/SEO 问题不影响交易，可评估快速 forward fix；仍需记录决定。

### Commerce/config issue

- 在 Shopify 中暂停受影响商品、市场、discount 或 shipping rule。
- 若价格、支付、库存或 Checkout 可靠性受影响，优先停止相关购买路径。
- 保留客户沟通与订单修复记录。

### Content/policy issue

- 撤下或 noindex 有风险内容。
- 不用 robots.txt 代替删除/noindex。
- 修正后记录发布时间与实质更新时间。

每次 rollback/incident 记录：时间、影响、发现方式、决定人、操作、验证、客户
补救和后续预防。

## 11. Go-live 记录模板

```md
Version / commit:
Deployment URL:
Production domain:
Go-live time:
Launch lead:
Checks completed:
Accepted exceptions:
Rollback target:
Monitoring links:
Incident contact:
```
