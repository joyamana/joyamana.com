# 发布与回滚

按实际改动验收。代码推送、后台保存和本地 build 都不等于部署完成。
dev 对应受保护 Vercel Preview，main 对应 Production。

## 发布前

确认变更范围、负责人、批准、检查结果和回滚目标；工程、商品、内容、客服、隐私各自
验收负责范围。业务待决项见 [Roadmap](ROADMAP.md)，不得在发布中自行补写政策。

- 使用 Node 24，按 [README](../README.md#本地开发)运行安装与工程检查，核对 CI。
  纯文档改动只检查规则、链接和代码一致性。
- 核对分开的 Local/Preview/Production 凭证，输出不能含 secret/PII。
- Production origin 为 `https://www.joyamana.com`，apex 对应路径 308 至 www。
- 索引、公开语言、单页内容、Checkout 各核对批准范围；Preview 始终 noindex。
  环境修改后检查部署真实响应，不因例行更新一律关闭生产已批准开关。

## 商品与交易

在获批环境用受影响的真实商品按 [交易规格](COMMERCE_SPEC.md)检查：

- 资料/媒体、Category、所选 Variant、价格/币种、数量规则和披露。
- 筛选/排序、深链接、切款、刷新、返回/前进与切语言指向同款。
- 数量能清空再输入，非法草稿禁购，切款后按新规则重置；最小数量超过库存时不可购买。
- 游客加购、重复操作、刷新恢复、修改/移除/清空；库存变化和负库存不令整袋不可读。
- 初读失败显示重试；操作响应丢失只读重取，不重复执行。重读失败保留 Bag，
  确认过期/上游空袋清除旧显示，部分失败返回实际剩余行。
- Buy now 不改已有 Bag；Checkout 重读并校验最新行，使用 Shopify 最新 URL。
- 小计/折扣与结账一致，政策、订单邮件、Order Status、通知与客服符合实际运营。
- 核对 Shopify 托管结账自身的语言入口与 URL，不能从本站配置推断后台西语已关闭。

支付用 Shopify 支持的测试方式和批准环境；真实扣款、退款、到账另外验收，未授权不建
生产订单。业务支付确认、单元测试、HTTP 和浏览器检查都不能替代当次交易验收。

## 内容与索引

按 [内容与索引规格](CONTENT_SEO_GEO_SPEC.md)检查部署响应：

- 初始 HTML 的正文、H1/lang、title/description/OG、canonical、面包屑与链接一致。
- sitemap 只列合格干净页；空目录、Search/Cart、参数、Preview、未来市场和回退页排除。
- 参数页无 hreflang/Schema，canonical 按规则回到同语言干净页。
- 人工检查繁中商品/系列正文与 metadata、各部分实际 lang、内容回退和双向 hreflang。
- `/es-us` 及子路径、未来市场和没有等价迁移的旧地址：带/不带参数的 GET/HEAD 均 404；
  HTML/响应头 noindex、no-store，恢复链接可用，无对应导航、sitemap、hreflang 或 Schema。
- 英语/繁中的 `/collections/bracelets|rings|necklaces|earrings`：GET/HEAD 均 308 到
  同语言 `/category/*`，保留查询参数；目标按正常类别页规则验收。
- 缺正文的固定政策/Accessibility 显示不可用并 noindex；缺失动态详情检查 404。
- 检查索引矩阵与本次批准内容；Editorial 仍关闭，测试文章不参与正式索引。
- JSON-LD 可解析且图价/状态与可见内容一致。未知路径有无 JS 的完整 404；动态缺失详情
  另查正文和客户端恢复，框架限制见技术规格。
- 重定向、下架、robots/静态资源正确；已有搜索账号才验所有权、索引和 feed。

## 设备、隐私与性能

用真实手机/平板/桌面、键盘、200% zoom 和必要辅助技术检查：

- 无横向溢出、Header 遮挡，文字/控件对比与 reduced motion 可用。
- 手机菜单背景不可操作，Tab 留在菜单，关闭/Escape/改宽度后焦点可见；桌面语言下拉随焦点关闭。
- 数量输入/错误和 Cart 状态可理解，图库 1/5/6/20 张图及矮桌面窗口可用，缩略图横向
  滚动可键盘访问，sticky 在推荐前释放，主要按钮至少 44px。
- 图片 alt、首屏加载、字体、布局跳动、bundle 与脚本。真实移动 p75 目标：
  LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1；没采集不宣称达到。

WCAG 目标见设计规范，局部检查不是全站认证。Playwright 当前封存，自动检查不替代人工。
检查必要 Cart cookie 和网络/日志/URL/error 的 secret/PII。当前无 Analytics/consent 运行时；
若本次批准启用，按 [技术规格](TECH_SPEC.md#安全和客户数据)另验供应商、同意偏好、GPC、
Checkout 跨域、权限、去重和订单对账，拒绝营销仍可购买。

## 发布与回滚步骤

1. 确认范围、负责人、检查结果、具体例外与回滚目标。
2. 推送 dev，验受保护 Preview 的环境、页面、交易和设备。
3. 将同一已验收提交合并/快进 main，使用独立生产配置部署。
4. 从外部查 Production、apex/www、索引与 Checkout；内容更新后等再验证并核对正文。
5. 在当次 PR/部署记录写 commit、deployment、实际检查结果、负责人和回滚目标。

发布后观察错误、API/Checkout、图价库存、政策和域名；已有测量工具才核对事件和用户性能。
代码故障回到上一个已验证 Vercel deployment，环境/索引回退部署后核对。不回滚 Shopify
Order/Customer/Inventory；交易故障暂停受影响路径，内容风险撤下或 noindex，不用 robots
禁抓代替删除。客户补救留在当次记录，长期修正进入规格/Roadmap。
