# Launch Runbook

Status: Draft — 应用已生成，负责人和生产外部配置待补充  
Owner: Engineering / Operations  
Last updated: 2026-08-02

本 Runbook 只描述可重复的发布控制。当前已有本地应用代码和检查命令；生产
URL、联系人、Shopify Admin 配置和 dashboard 仍是待填项，不能声称已验证。

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

- `OPEN_QUESTIONS.md` 的 P0 项目已解决。
- MVP PRD 的发布验收没有未接受的 blocker。
- Production Shopify Catalog、Markets、payment、shipping、tax 配置获批。
- 域名、SSL、Checkout domain、Email sender 和 support inbox 可用。
- Production secrets 与 Preview/local 分离。
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
- Collection membership 和排序。
- Shipping、Returns、Privacy、Terms、Accessibility 内容。
- Shopify Checkout 品牌、policy links、payment、shipping、tax。
- 测试 Guest Cart → Checkout → test order → confirmation → Order Status。
- 售罄、超库存、折扣、损坏 Cart 和 API 失败。
- Transaction Email 与 support reply。

## 5. SEO/GEO 检查

- Canonical production domain，无 Preview/staging URL。
- Preview 和内部页面 `noindex`。
- `robots.txt` 符合 D-016，不误封静态资源和获准 crawler。
- Sitemap 只包含 200、canonical、indexable、published URL。
- Title、description、OG image、H1、breadcrumbs。
- Product/Offer、Organization、Article 等 JSON-LD 与 UI 一致。
- 404/410/301、旧 slug、售罄和下架行为正确。
- Search Console、Bing Webmaster、Merchant Center 验证。
- 关键页面在禁用 JavaScript时仍有主要内容和链接。

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

## 8. 发布步骤

1. 冻结非必要内容和配置变更。
2. 记录当前 Production deployment 和 Shopify 配置快照/导出方式。
3. 运行全部自动检查和 production smoke test。
4. 将已批准 commit 部署到 Production。
5. 验证域名、SSL、首页、PDP、Cart、Checkout、Policy。
6. 提交/确认 sitemap 与 Merchant Center feed。
7. 运行测试订单并清理测试数据标记。
8. 开始 launch monitoring window。
9. 由 Launch lead 记录 go-live 时间、版本和已知例外。

## 9. 监控窗口

### 第一小时

- 5xx、runtime error、Shopify API error。
- Add-to-cart、Cart、Checkout redirect。
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
