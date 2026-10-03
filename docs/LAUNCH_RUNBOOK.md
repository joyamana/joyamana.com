# 发布与回滚

每次发布按实际改动验收。当前能力见项目说明，未决项和影响范围见 Roadmap。
dev 对应受保护 Vercel Preview，main 对应 Production；不把代码推送当成部署成功。
历史从 Git、GitHub CI 与 Vercel 查询，不另外维护归档文件或重复测试流水。

## 发布前

确认实际负责人、变更范围、部署/回滚目标和具体未决依赖。工程、商品运营、内容/品牌、
客服和隐私的相关负责人只验收自己负责的范围，不把条件待办一律当成全站阻塞。
相关政策与客户可见承诺须有批准，不借发布改变未经确认的配送、税费或支付配置。

索引、Checkout、Contact form 独立控制，各自有批准范围与回退方式。Preview 始终
noindex，生产保留已获批范围，不因例行代码更新把全站开关全关。
Contact 继续 Email-only；功能开启时才验收其供应商与数据处理流程。

## 代码与环境

按 [README 检查命令](../README.md#本地开发)运行 Node 24 下的 frozen install、预检、
格式、lint、类型、相关测试与生产 build，核对 GitHub CI。纯文档改动检查规则迁移、
旧引用、链接和代码一致性，不必重复应用构建。

- Preview/local/Production secret 分离，不提交或输出 token/PII。
- Production site URL 精确为 `https://www.joyamana.com`，apex 对应路径 308 至 www。
- Preview 索引总开关关闭；生产总开关、语言矩阵、单页内容条件和 Checkout/Contact
  配置分别核对，不复用 Preview 值。
- 环境或索引策略修改须部署并查看真实响应，Dashboard 保存本身不算生效。

## 商品、交易与政策

使用受影响的真实商品和允许的测试环境：

- 核对 Product/Variant、SKU、Category、图片、材料/尺寸/来源/处理、模型与真实披露。
- 筛选、排序、卡片、深链接、PDP 图价/选款、跨语言和返回/前进使用同一款。
- 游客加购、重复操作、刷新恢复、数量修改/移除/清空、库存下降和规则变化可恢复。
- 售罄、未知库存、API 超时/限流/部分失败有准确状态；不使用猜测的价格或库存。
- Buy now 使用独立单商品 Cart，不改变 Bag；Checkout 获取最新 URL 并校验最新行。
- 价格、币种、折扣、库存、小计和 Shopify 托管结账一致；政策链接、订单确认、
  Order Status、交易邮件与实际运营一致。
- Shipping/Returns/Taxes、PDP 摘要与结账配置同步，客服 Email 可用。

当前业务支付确认不替代本次变更的 Checkout 检查。付款测试使用 Shopify 支持的测试
方式与已批准环境；真实扣款、退款和 payout 对账单独验收，不从测试模式推断完成。
未经范围授权不为 smoke 创建生产订单。

## 内容与索引

- 正式页面使用获批品牌、商品、媒体、政策与作者/来源，正文在初始 HTML 可读。
- 检查 H1、lang、title、description、OG、canonical、breadcrumbs 和真实链接。
- sitemap 仅含 200、干净且可索引页面；Cart/Search/参数/预览/未上线市场永久排除。
- 参数页 noindex，符合条件时指向 clean canonical，移除 hreflang 与 Schema。
- 三语言 Core/Commerce/Policies 矩阵开启，Editorial 关闭；实际部署总开关与单页检查
  仍生效，不能因矩阵开启把测试文章或回退内容加入索引。
- ES/繁中商品和系列逐页人工检查翻译与等价关系；已检测回退的 About/政策/
  Accessibility/Article 自身及其他语言 alternate 均排除。
- Product/Offer/ItemList 等 JSON-LD 可解析且与可见图价/状态一致；Home/Contact/政策
  Schema 尚未接入，不能在记录中预先勾选。OG image 等缺口按实际页面核对。
- 未知路径和停用市场 404/noindex 且无 JavaScript 可恢复；动态缺失详情的初始正文
  限制仍需记录，检查浏览器恢复，不声称全部 404 首屏已修复。
- 正确的重定向/下架行为、robots 和静态资源访问；训练 crawler 策略仍待决。
- 根据上线范围完成 Search Console、Bing、Merchant Center 所有权/索引/feed 检查。

## 手机、键盘与性能

检查真实手机/平板/桌面、200% zoom、键盘与必要辅助技术：无横向溢出、控件不遮挡，
菜单锁定背景/焦点、Escape 和焦点返回正常；表单 label/错误、Cart 状态、图片 alt、
对比度和 reduced motion 可用。发布目标为 WCAG 2.2 AA，不能拿局部检查声称全站认证。

真实用户/数据的移动 p75 目标：LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1。
检查首屏图片/字体、布局跳动、bundle 和第三方脚本；不通过增加脚本堆叠替代测量。
当前不启用 Playwright；Vitest、build、HTTP 或自动浏览器检查不替代人工设备/支付验收。

## 隐私与测量

现有必要 Cart cookie 纳入清单；网络、URL、事件、日志、错误和快照不含 secret/PII。
当前没有 Analytics/consent 运行时，不把未来项目勾选为已完成。

若本次获批启用非必要脚本或隐私功能，另外检查：

- 供应商、目的、数据接收方、保留/删除、成本、退出与隐私正文一致。
- 同意前后实际请求，接受/拒绝/修改偏好、GPC、地区范围和跨 Checkout 行为。
- Customer Privacy 浏览器调用使用独立 public token，private token 不泄露。
- 成功动作对应事件；purchase 不重复，与 Shopify 测试订单/金额/币种/商品对账。
- Preview/内部/测试流量可过滤，拒绝营销不阻断购买。

## 发布步骤

1. 确认范围、负责人、代码检查、依赖和回滚目标。
2. 推送 dev，检查受保护 Preview、对应部署环境及受影响页面/交易/设备。
3. 将同一已验收提交合并或快进 main，按独立生产配置部署。
4. 从外部核对 Production、apex/www、关键页面、索引与 Checkout；后台内容更新后
   等待缓存周期并确认真实正文。
5. 在当次 PR 或部署记录写明 commit、deployment、检查范围/结果、具体例外、
   负责人和回滚目标。不用本地 build 代替发布验收，也不另建历史文档。

## 发布后与回滚

发布后重点观察运行错误、Shopify/API/Checkout、价格库存、政策、域名与新设备问题。
工具已启用时再检查事件对账、consent、索引和真实性能，不虚构未采集的数据。

代码故障回到上一个已验证 Vercel deployment；环境/索引回退同样部署并核对响应。
不回滚 Shopify Order、Customer 或 Inventory。交易可靠性受影响时暂停对应购买路径；
内容风险撤下/noindex，不以 robots 禁抓代替删除。记录影响、操作、验证和客户补救，
长期修正写入规格或 Roadmap，完成后不保留重复流水。
