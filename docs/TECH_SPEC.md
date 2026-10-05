# 技术规格

## 架构

Next.js App Router / TypeScript 承担页面、交互、数据转换和必要的 Server Actions / Route
Handlers；Vercel 为部署平台，Shopify Storefront API 为商品、内容和交易来源。
不建立独立数据库、认证、订单或支付系统。Server Components 优先，真实交互才使用
Client Components。页面、metadata 和 JSON-LD 共用校验后的数据。

| 目录 | 职责 |
|---|---|
| `src/app/(english)/`、`zh-hant-us/` | 两种公开语言的薄路由、layout、错误边界 |
| `src/app/actions/` | Cart 服务端操作 |
| `src/components/` | 共享页面与交互 |
| `src/config/` | 品牌、市场、语言、索引、类别和环境校验 |
| `src/lib/commerce/` | Shopify 请求、商品摘要/详情、目录和 Cart |
| `src/lib/content/` | 内容读取、清洗、翻译判断和 metadata |
| `src/lib/http/`、`i18n/`、`navigation/` | 404、语言路径、文案和导航 |

商品摘要只含卡片所需身份、图、价格范围、类别和可售性；完整目录另补齐 Variant，
PDP 再读取正文、SEO 和图库。类型在 `types.ts` / `cart-types.ts`，不能把摘要当完整选款数据。

## 工具与字体

Node 保持 24，精确 pnpm 和依赖版本以 [package.json](../package.json) / lockfile 为准。
安装使用 frozen lockfile，依赖变更后显式安装。ESLint / TypeScript 的兼容性须在升级前
核对，不覆盖 peer 声明或禁用检查；保留 `verifyDepsBeforeRun: warn`。

样式用 global CSS 和变量，不引入 UI kit、GraphQL codegen 或独立 CMS。
字体用 next/font：构建下载、站点自托管，繁中按字符分片、按需加载，英语不请求中文字体。
字体选择见 [设计规范](DESIGN_SYSTEM.md)，授权见 [OFL](../public/fonts/OFL-Noto-HK.txt)。

## Shopify 请求

- Headless channel 最小权限 private Storefront token 只在服务端使用；运行时不接 Admin API。
- 查询按领域集中，只取需要的字段。同一市场保持 country/language 一致；金额保留十进制
  字符串，统一比较/格式化，不用浮点数决定商业金额。
- 请求最多 10 秒；区分配置、超时、限流、网络、HTTP、GraphQL 与 mutation user errors。
  不自动重放可能重复执行的 Cart mutation。
- Bag 跨页核对更新时间、小计、身份和数量。检测到变化后从第一页最多重读一次；仍变化
  则报错。mutation 后只重读返回的 Cart，保留 warnings，不重放 mutation。
- 需要全量的数据须完整分页，校验 cursor、重复 ID、归属和数量。每次目录读取共用
  最多 100 次请求、20 秒预算，包含基础页和款式补读；超限报错，不返回部分目录。
- PDP 首批 100 个 Variant；摘要不读 Variant，浏览筛选按批次完整补齐。繁中颜色补读
  默认语言时只取 Variant ID/colors 与必要分页字段。推荐读取失败可省略推荐，商品失败进入错误边界。
- buyer IP 只信任 Vercel 保护的 `x-vercel-forwarded-for`，校验后转发，不保存。
  其他部署先确定可信代理，不信任客户端可伪造 header。

API 版本由环境固定，维护时核对支持窗口及字段。官方说明：
[Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api)、
[inContext](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/in-context)。

## 渲染、缓存与错误

| 数据 | fetch 策略 |
|---|---|
| 商品、目录、价格、库存、搜索、Cart、Checkout | `no-store` |
| About、Accessibility、Policies、Blog/Guide | `revalidate: 300` |
| Header 导航 | 独立轻量查询，`revalidate: 300` |
| sitemap | 动态汇总，沿用来源策略 |

商品与公开内容读取使用模块级 React `cache`，以字符串参数在一次服务器渲染内复用；
跨请求缓存只由 fetch 管理，Cart 和 mutation 不接入 React cache。sitemap 属 Route Handler，
不依赖渲染缓存。metadata 先判断索引/参数条件，再读取其他语言的内容，复用当前语言结果。
[React cache](https://react.dev/reference/react/cache)仅适用于 Server Components 请求内复用。

索引页首次响应提供正文与链接。Bag noindex，挂载后用 Server Action 读取私有状态。
Header 失败仍保留 Shop All、Search、Bag、语言入口与正文。真实空内容显示空态；上游
故障进入现有错误边界，使用当前 Next 的 `retry()` 重读。正文不回退本地商业资料。

五分钟是再验证周期，失败时可能继续提供旧内容。当前没有 webhook/手动失效端点；
确需增加时校验 HMAC、鉴权、幂等、范围和告警。构建不要求 Shopify 上游成功。

## 路由与环境

语言映射见 [locales.ts](../src/config/locales.ts)，市场定义见 [markets.ts](../src/config/markets.ts)。
公开界面用 `EnabledLocale`；停用和未来配置保留在 `SupportedLocale`，共享译文独立于
启用状态。繁中站点代码 `zh-Hant-US`、Storefront `ZH_TW`、后台 `zh-TW`、Intl `zh-HK`，
交易国家仍为 US。跨 root layout 切语言会完整导航。

未知路径、暂停西语和未启用市场由 catch-all 返回完整 404/noindex/no-store 文档。
动态缺失商品、文章和 About 子页继续用 `notFound()`；当前返回 404/noindex，但初始 HTML
缺少可见错误正文，需要 JavaScript 恢复。保留现有恢复方式，每次部署仍须复验。[#97000](https://github.com/vercel/next.js/issues/97000)因复现链接无效关闭，
不能据此认定问题已修复，不使用框架内部补丁或实验性 API。

环境说明集中在 [.env.example](../.env.example)，预检与运行时共用校验。
布尔值不接受空格，开索引须有合法非本机 HTTPS origin。Vercel 要求站点和 Shopify 配置，
Production origin 精确为 `https://www.joyamana.com`，预检拒绝 Preview 开启索引。
默认索引/Checkout 关闭，各部署使用获批范围；变量错误只报告名称和问题。

## 安全和客户数据

- Local/Preview/Production 凭证分开。token、客户 PII、完整 Cart ID 不进浏览器、日志、URL、
  Analytics、错误或快照；Next.js 不保存客户资料、订单或支付副本。
- Cart cookie 为 `joya-mana-shopify-cart-us`：HttpOnly、SameSite=Lax、Path=/、最多 10 天，
  Production Secure，属于必要 cookie。正常 Cart view 不含 secret ID/Checkout URL；顾客
  点击购买/结账后才返回校验过的 URL。客户端操作串行，网络失败保留袋，确认过期才清空。
- Shopify HTML 用本地 `sanitize-html` 清洗，Rich text 校验后受控渲染，JSON-LD 安全序列化。
  清洗不传客户数据、不收费；更换时保留接口和安全行为。
- 端点校验输入、Origin、方法与权限。安全响应头见 [next.config.ts](../next.config.ts)。
- 新工具先说明目的、负责人、数据接收方、保留/删除/导出、成本、性能和移除办法。

当前没有 Analytics、Customer Events 或 consent UI。启用前按 [交易规格](COMMERCE_SPEC.md#交易身份与营销)
批准同意分类和地区范围；非必要脚本按同意加载，API 失败则关闭。隐私偏好须可拒绝、修改
和重开，核对 GPC 与 Checkout 跨域行为。Customer Privacy API 使用独立最小权限 public token，
不能复用 private token。事件只在成功后发送，purchase 每单一次并与 Shopify 对账，不含 PII/Cart secret。

检查命令见 [README](../README.md)，发布验收见 [发布手册](LAUNCH_RUNBOOK.md)。CI 使用固定
Node/pnpm，对 PR、dev/main 做无生产凭证的安装与检查，不写 Shopify、不部署。
