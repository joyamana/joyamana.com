# 发布与回滚

按实际改动验收，不把后台保存、代码推送或本地 build 当成部署成功。dev 对应受保护
Vercel Preview，main 对应 Production。历史查 Git、GitHub CI 和 Vercel，不另存流水文档。
当前能力见 [项目说明](PROJECT_SPEC.md)，未决依赖见 [Roadmap](ROADMAP.md)。

## 发布前

确认负责人、变更范围、批准、部署和回滚目标。工程、商品、内容、客服和隐私负责人
验收各自负责的范围；未决配送、税费和支付配置不能在发布中自行补写。

索引与 Checkout 分别核对批准范围，Preview 始终 noindex。Contact 只提供 Email。
生产保留已批准配置，不因例行更新把所有开关一律关闭。

## 代码和环境

- 使用 Node 24，按 [README](../README.md#本地开发)运行 frozen install、预检、格式、lint、
  类型、测试和 build，核对 GitHub CI。纯文档改动只查规则迁移、旧引用、链接和代码一致性。
- Local/Preview/Production 凭证分离，日志和检查输出不含 secret/PII。
- Production origin 精确为 `https://www.joyamana.com`，apex 对应路径 308 至 www。
- 分别核对部署索引开关、语言矩阵、单页内容和 Checkout 配置。环境修改须部署后
  查看真实响应，不能用 Dashboard 保存结果代替。

## 商品和交易

使用受影响的真实商品和获批测试环境，按 [交易规格](COMMERCE_SPEC.md)检查：

- 商品资料和媒体真实，Category、Variant、数量规则、图价和披露正确。
- 筛选/排序、深链接、切款、刷新、返回/前进和切语言始终指向同一款。
- 数量框可清空后重新输入；非法数量有提示且不能购买，切款后按新规则重置。
- 游客加购、重复操作、刷新恢复、修改、移除、清空可用；规则/库存变化可恢复。
- 网络故障保留 Bag，确认过期或上游空袋时清除旧显示，部分失败显示实际剩余行。
- Buy now 不改变已有 Bag；Checkout 校验最新行并使用 Shopify 最新 URL。
- 图价、币种、小计、折扣和 Shopify 结账一致；政策、订单确认、Order Status、通知
  和客服 Email 与实际运营一致。

付款用 Shopify 支持的测试方式和已批准环境。真实扣款、退款和到账核对单独验收；
未经范围授权不创建生产订单，已有业务支付确认不能代替当次 Checkout 检查。

## 内容和索引

按 [内容与索引规格](CONTENT_SEO_GEO_SPEC.md)检查实际 HTML 和响应：

- 正文、H1、lang、title、description、OG、canonical、面包屑和链接与可见内容一致。
- 干净可索引页进入 sitemap；Cart/Search、参数、Preview 和停用市场排除。
- 空 Shop/Collections hub noindex、无商品 Schema；参数页无 hreflang/Schema，并按规则
  指向同语言干净 canonical。筛选零结果不等于整个目录为空。
- 逐页检查 ES/繁中商品和系列译文；部分翻译的标题、正文、摘要各用实际 lang。
  已识别回退和未满足翻译条件的内容，不进入自身索引或其他语言 alternate。
- 三语言 Core/Commerce/Policies 已批准，Editorial 仍关闭；不能把测试文章当成正式内容。
- JSON-LD 可解析且图价/状态与页面一致；Home/Contact/政策 Schema 尚未接入。
- 未知路径和停用市场有无 JavaScript 的 404；动态缺失详情检查浏览器恢复，并说明
  初始正文的框架限制。重定向、下架、robots 和静态资源访问符合规则。
- 按上线范围检查 Search Console、Bing、Merchant Center 的所有权、索引和 feed。

## 设备、无障碍和性能

检查真实手机/平板/桌面、键盘、200% zoom 和必要辅助技术：

- 页面无横向溢出，sticky Header 不遮挡内容；文字、控件对比和 reduced motion 可用。
- 手机菜单打开后背景不可操作，Tab 留在菜单内，Escape/关闭返回焦点；改变宽度后
  菜单关闭，焦点仍可见。桌面语言下拉在焦点离开时关闭。
- 输入 label/错误、Cart 状态和图片 alt 可理解。
- 核对首屏图片、字体、布局跳动、bundle 和外部脚本。真实移动 p75 目标为
  LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1。

目标为 WCAG 2.2 AA，局部检查不是全站认证。Playwright 当前封存；单元测试、build、
HTTP 和自动浏览器检查不能替代真实设备、辅助技术或支付验收。

## 隐私和测量

核对必要 Cart cookie 清单以及网络、URL、日志、错误中是否含 secret/PII。
当前没有 Analytics/consent 运行时。若本次获批启用相关功能，按
[技术规格](TECH_SPEC.md#安全和客户数据)另外验证供应商和隐私说明、接受/拒绝/修改、
GPC、跨 Checkout 行为、token 权限、事件去重和 Shopify 订单对账；拒绝营销仍能购买。

## 发布和回滚步骤

1. 确认范围、负责人、检查结果、具体例外和回滚目标。
2. 推送 dev，验收受保护 Preview 的环境和受影响页面、交易及设备。
3. 将同一已验收提交合并或快进 main，使用独立生产配置部署。
4. 从外部核对 Production、apex/www、关键页面、索引和 Checkout；内容更新后等待
   再验证并检查真实正文。
5. 在当次 PR 或部署记录写 commit、deployment、检查结果、负责人和回滚目标。

发布后观察错误、Shopify/API/Checkout、价格库存、政策和域名。已有测量工具才检查
事件、consent、索引和真实用户性能，不虚构未采集数据。

代码故障回到上一个已验证 Vercel deployment，环境/索引回退也须部署后核对。
不回滚 Shopify Order、Customer 或 Inventory。交易故障暂停受影响购买路径，内容风险
撤下或 noindex，不能用 robots 禁抓代替删除。客户补救写入当次记录，长期修正进入
规格或 Roadmap。
