# Launch Runbook

Status: Draft — Shopify-only 应用已建立，负责人、内容和生产外部配置待完成
Owner: Engineering / Operations  
Last updated: 2026-08-31

本 Runbook 只描述可重复的发布控制。当前已有本地应用代码和检查命令；生产
URL、联系人、Shopify Admin 配置和 dashboard 仍是待填项，不能声称已验证。
全站 index、Shopify Checkout 和 Contact 表单投递是三个独立门禁；仓库示例值及
未配置时的代码默认值均为关闭，各 Preview/Production deployment 必须分别核验。
仓库尚无 CI、Playwright/E2E、webhook/cache invalidation 或 Analytics/consent 运行时。

## 1. 发布角色

上线前填写：

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

- `OPEN_QUESTIONS.md` 中 `Blocks` 覆盖 Public Catalog、index、Checkout、Policy、
  production identity/domain 或所选首发能力的项目已解决；条件/后置项按实际 scope
  记录决定，不笼统要求全部关闭。
- MVP PRD 的发布验收没有未接受的 blocker。
- Production Shopify Catalog、Markets、payment、shipping、tax 配置获批。
- 域名、SSL、Checkout domain、Email sender 和 support inbox 可用。
- Production secrets 与 Preview/local 分离。
- `SHOPIFY_CHECKOUT_ENABLED`、`NEXT_PUBLIC_SITE_INDEXABLE` 与
  `CONTACT_FORM_ENABLED` 分别有明确 owner、验收记录和回退方式，不用一个
  总开关同时放开。
- 数据备份/导出责任与 Vercel rollback 方式明确。
- Support 知道 Shipping、Returns、damaged/lost、order-change 流程。

## 3. 代码质量检查

当前真实命令：

```text
install: pnpm install --frozen-lockfile
format/check: 待建立
lint: pnpm lint
typecheck: pnpm typecheck
unit/integration: pnpm test
e2e: 待建立
build: pnpm build
```

要求全部通过，或由 Launch lead 书面接受具体例外和风险。

## 4. Production 内容与 Commerce 检查

- 品牌名称、法律实体、联系方式、Logo、social links。
- Product/Variant/SKU、价格、库存、媒体、材料、尺寸、处理/来源披露。
- Shopify Standard Product Category 与 `/category/*` 归属。
- Design Series Metaobject/reference、`collection_kind=design_series`、Collection
  membership、非空状态和排序。
- Shipping、Returns、Privacy、Terms、Accessibility 内容。
- Shopify Checkout 品牌、policy links、payment、shipping、tax。
- 测试 Guest Cart → Checkout → test order → confirmation → Order Status。
- 售罄、超库存、折扣、损坏 Cart 和 API 失败。
- Transaction Email 与 support reply。
- `info@joyamana.com` inbox、负责人/备援和回复流程。若启用 Contact 表单，
  另行批准 Resend 的数据边界/保留期/成本/退出路径，验证发件域与生产滥用控制。

## 5. SEO/GEO 检查

- Canonical production domain，无 Preview/staging URL。
- Preview 和内部页面 `noindex`。
- 按上线前批准的 D-016 crawler policy 验证 `robots.txt`，不误封静态资源和获准
  crawler；当前 D-016 仍是 Pending，不得把代码默认当成业务批准。
- Sitemap 只包含 200、canonical、indexable、published URL。
- Cart、Search、参数页和内部状态页永久 `noindex` 且不进入 sitemap；参数不得制造
  canonical/indexable 变体。当前参数请求只 canonical 回 clean path，并未根据
  `searchParams` 覆盖 robots；总 index gate 打开时会继承基页 indexable metadata，
  必须在发布前实现并测试参数级 `noindex`。
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
  noindex/sitemap/Schema 门禁与 About/Article alternate 过滤已实现；Policy/
  Accessibility 的英文页仍可能输出未就绪 es-US alternate，必须在发布前修复并回归。
- Product/Collection 的 Spanish 翻译已通过可重复的 Commerce translation readiness
  检查，不依赖人眼猜测 Storefront fallback；`<html lang>` 在 en-US/es-US 页面均
  与 document locale 一致。
- 全站 index gate 只在所有拟发布内容和西语页面一次性验收通过后开启；当前 sitemap
  会在总门禁打开后加入 `/`、`/contact`，且 Product/Collection 没有逐页 fallback
  检测，不能把总门禁误当成逐页翻译保护。

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

## 8. 发布步骤

1. 冻结非必要内容和配置变更。
2. 记录当前 Production deployment 和 Shopify 配置快照/导出方式。
3. 运行全部自动检查和 production smoke test。
4. 在三个发布门禁均关闭的状态下，将已批准 commit 部署到受保护 Preview；如必须
   使用 Production，先建立受控发布窗口并确认访问、支付和回退范围。
5. 验证域名、SSL、首页、PDP、Bag、Policy、Contact Email 入口和全站 noindex。
   内容/导航使用 5 分钟缓存且当前无 webhook；变更后等待/清除约定窗口再做 smoke，
   并把这段陈旧窗口写入发布记录。
6. 先完成 Shopify Admin 中 Payment test mode、guest checkout、shipping、tax、
   branding、policy link 和 notification 配置验收；随后在受保护目标环境单独设置
   `SHOPIFY_CHECKOUT_ENABLED`，创建新 deployment/redeploy，再运行测试订单并验证
   payment、confirmation、Order Status 与 notification。失败时恢复门禁并再次部署。
7. 若 Resend 已通过数据与滥用验收，在目标环境单独设置
   `CONTACT_FORM_ENABLED`，创建新 deployment/redeploy 并验证投递/降级；否则保持
   表单关闭，只展示已经 go/no-go 验收可收信的 Email 渠道。
8. 清理测试 Product/Article/订单标记和其他会被索引的测试数据，等待或清除已约定的
   5 分钟缓存窗口，再重验 Catalog、内容、Policy、Search 和内部链接。
9. 将同一已验收 commit promote/deploy 到受控 Production，先保持三个门禁关闭；
   单独核对 Production 的 domain、secret、Shopify context、访问保护和 rollback target。
   再按已批准记录逐个设置 Checkout/Contact gate，每次创建新 deployment/redeploy 并
   重做 Production smoke，不直接继承 Preview 环境值。
10. 退出 Shopify Payment test mode，复核 live provider、payout、Checkout、shipping、
    tax 与 notification 配置。若业务/支付规则允许，完成获批的低额真实订单、退款与
    对账；否则记录可接受的替代验收证据。测试模式未退出时不得 go-live。
11. 完成所有内容/翻译/SEO/privacy 检查并确认 Production 非本地 HTTPS canonical 后，
    在 Production 最后设置 `NEXT_PUBLIC_SITE_INDEXABLE` 并创建新 deployment/redeploy；
    此时保留临时访问保护，先做内部响应检查。
12. Launch lead go/no-go 后解除 Production 临时访问保护，立即从外部网络验证首页、
    Checkout、Contact、robots、sitemap、Schema、hreflang 和永久 noindex 页面，再提交
    Search Console 与 Merchant Center。若外部 smoke 失败，恢复保护/门禁并 redeploy。
13. 每个门禁 deployment 均记录版本、环境值、smoke 和 rollback target；不要在同一
    未验证 deployment 中连续打开多个门禁。记录 go-live 时间与已知例外，开始
    launch monitoring window。

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
