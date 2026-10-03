# 技术规格

## 架构与事实来源

浏览器 → Next.js App Router / Vercel → Shopify Storefront API。
Next.js 负责页面、交互、路由、metadata 和数据适配；Shopify 管理商品、商业数据、内容、
购物袋、托管 Checkout、订单与客户。不建立独立数据库、业务后端、认证或支付系统。
Server Components 优先，Server Actions/Route Handlers 只承担必要的服务端工作。

UI、metadata、JSON-LD 与未来 Analytics 共用规范化实体。Mapper 只处理页面需要的字段，
不建通用实体平台，不从标题、图片或 tag 猜测商业事实。实体在 `src/lib/commerce/types.ts`、
`cart-types.ts` 和 `src/lib/content/`；具体契约见 [交易规格](COMMERCE_SPEC.md)与
[内容与索引](CONTENT_SEO_GEO_SPEC.md)。

## 工具与目录

使用 Node 24、TypeScript strict、固定 pnpm 和相互兼容的稳定依赖。精确版本唯一来源是
[package.json](../package.json)与 lockfile，安装使用 `pnpm install --frozen-lockfile`。
保留当前 ESLint 9 / TypeScript 6 兼容组合；升级前核对 Next/React/import/a11y 和
TypeScript ESLint 的支持范围，不覆盖 peer 声明、不禁用检查、不并存两套编译器。
manifest/lockfile 变化后显式安装，保留 `verifyDepsBeforeRun: warn` 提醒。

使用 global CSS、CSS variables 和 next/font，无 UI kit、GraphQL codegen 或独立 CMS。
字体与排版选择见设计规范；字体构建时下载、自托管，访客不直接请求 Google 字体服务。
繁中字形按字符范围分片，按需加载，EN/ES 不应下载中文字体；实际请求需在浏览器核验。
授权文件保留在 [OFL-Noto-HK.txt](../public/fonts/OFL-Noto-HK.txt)。

| 目录 | 职责 |
|---|---|
| `src/app/(english)/`、`es-us/`、`zh-hant-us/` | 三语言薄路由、独立 document layout 与错误边界 |
| `src/app/actions/` | Cart 与关闭的 Contact server actions |
| `src/components/` | 共享页面、布局和交互 |
| `src/config/` | 品牌、市场、语言、索引和类别配置 |
| `src/lib/commerce/` | Shopify client、查询契约、mapper、目录读取与 Cart |
| `src/lib/content/` | 政策、Content Page、About 与文章适配 |
| `src/lib/http/`、`i18n/`、`navigation/` | 404、语言路径与导航 |

测试以 `*.test.ts(x)` 就近放置。不为未来 analytics、webhook、e2e 或其他功能创建空模块。

## Shopify 请求

- 使用 Headless channel 的最小权限 private Storefront token，仅在服务端使用。
  运行时不接入 Admin API，不把 private token 放入 `NEXT_PUBLIC_*`。
- GraphQL 查询与类型按领域集中；只取必要字段，不在组件散落查询或以 `any` 掩盖变化。
- 市场敏感请求使用同一 country/language context；金额保留 Shopify 十进制字符串，
  集中格式化和比较，不用浮点数决定商业金额。
- 分别处理超时、限流、网络、HTTP、GraphQL errors 和 mutation user errors。
  请求设中止时限，不自动重放非幂等 Cart mutation。
- 完整读取需要的分页；检测异常 cursor、重复 ID、归属和数量，不静默截断。
- 需要 buyer IP 时只信任 Vercel 保护的 `x-vercel-forwarded-for`，验证格式、不持久化。
  其他部署须先明确可信代理，不能直接转发客户端可伪造 header。

官方接口说明：[Headless Storefront](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api)、
[Market/语言 context](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/in-context)。
API 版本由环境配置固定，维护时核对字段和支持窗口，不把文档链接当成永久版本保证。

## 渲染与缓存

| 数据 | 策略 |
|---|---|
| 商品、目录、价格、库存、搜索、Cart、Checkout | `no-store` |
| About、Accessibility、Policies、Blog/Guide | Shopify fetch `revalidate: 300` |
| Header 动态目录 | 独立轻量查询，fetch `revalidate: 300` |
| Cart 页面 | noindex 的客户端空壳，挂载后通过 Server Action 读取私有 Cart |
| sitemap | 动态汇总，沿用商业/内容各自的读取规则 |

索引页须在初始 HTML 提供正文和链接，可按时效选择静态、ISR 或动态渲染。
React `cache` 只做请求内去重，持久缓存只由 fetch 管理，不叠加两层导航缓存。
Header 查询不包含价格、库存、图片或正文，不复用于商品卡/PDP/Cart；失败时保留
Shop All、Search、Bag、语言入口与主体，不让导航故障拖垮整页。

五分钟是再验证周期，不是硬失效上限；失败时可能继续提供旧内容。更新后等待并检查
实际响应。当前不实现 webhook 或手动失效端点；高频更新、紧急下线或协作成本证明
需要时再评估。若启用，必须校验原始请求 HMAC、鉴权、幂等、最小失效范围和失败监控。

数据读取不是构建发布的前提；上游不可用时提供安全空状态或重试，不恢复本地商业正文。
错误边界使用 Next `retry()` 重新获取服务端内容。

## 市场、语言与路由

市场与公开路径边界见 [项目说明](PROJECT_SPEC.md)。注册与映射的唯一实现是
[locales.ts](../src/config/locales.ts)，市场定义见 [markets.ts](../src/config/markets.ts)。
`EnabledLocale` 用于当前 UI，`SupportedLocale` 可保留未启用的规划配置。

繁中站点标签为 `zh-Hant-US`，Shopify Storefront 为 `ZH_TW`、后台翻译为 `zh-TW`，
Intl 格式使用 `zh-HK`；它仍是 US Market，不是香港市场。三语言各有正确的 `<html lang>`
与字体，跨 root layout 语言切换为完整文档导航。

未知路径/停用市场由 catch-all Route Handler 返回完整 404/noindex/no-store 文档。
动态缺失商品/文章/About child 仍使用 `notFound()`，初始错误正文有
[Next 上游限制](https://github.com/vercel/next.js/issues/97000)，需 JavaScript 恢复。
保留稳定框架方案，不为此引入内部补丁或实验性 API。

## 环境配置

变量说明统一在 [.env.example](../.env.example)：

| 变量 | 用途 |
|---|---|
| `NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_SITE_INDEXABLE` | 站点 origin、部署级索引开关 |
| `SHOPIFY_STORE_DOMAIN`、`SHOPIFY_STOREFRONT_ACCESS_TOKEN`、`SHOPIFY_STOREFRONT_API_VERSION` | 服务端 Storefront 读取 |
| `SHOPIFY_CHECKOUT_ENABLED`、`SHOPIFY_CHECKOUT_DOMAIN` | 结账开关与可选托管域名 |
| `CONTACT_FORM_ENABLED`、`RESEND_API_KEY` | 关闭的表单投递适配 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | 可选所有权验证 metadata |

Local、Preview、Production 凭证分离。预检和运行时共用安全的纯配置校验；运行时仍须
自我保护。布尔值不接受附带空格，开索引必须提供合法 HTTPS origin。Vercel 部署要求
站点和 Shopify 配置；Production origin 精确为 `https://www.joyamana.com`，Preview 不索引。
Checkout/Contact 开启时须具备对应配置。错误只说明变量名和问题，不泄露值。
未来功能的 secret/变量只在实现且获批后加入，不预留无用 GA4 等配置。

## 安全与客户数据

- 私密 token、完整 Cart ID、Email、地址、订单详情和支付信息不进入日志、URL、
  Analytics、公开错误或测试快照。Next.js 不保存客户资料、订单或支付副本。
- Cart 引用保存于 `joya-mana-shopify-cart-us` cookie：HttpOnly、SameSite=Lax、Path=/、
  最长 10 天，Production Secure。它只用于恢复 Bag，不是营销同意；纳入隐私 cookie 清单。
- 正常浏览器 Cart view 不含 secret Cart ID 或 Checkout URL；URL 只在明确点击购买/结账后返回。
- Shopify HTML 在服务端由 `sanitize-html` 清洗，Rich text 校验结构后受控渲染。
  这是本地依赖，无新服务、客户数据接收方或订阅费，退出时替换 `sanitizeShopifyHtml` 接口。
  JSON-LD 使用安全序列化，防止 script 注入；可发布内容判断见内容规格。
- 端点校验输入、Origin、方法和权限；可滥用功能在开放前完成生产限流。
  当前 Contact 已有输入/Origin/honeypot 边界，不能把它称作已完成 WAF 防护。
- 当前安全响应头见 [next.config.ts](../next.config.ts)；CSP/HSTS 与第三方域名仍需验收。
- 新工具先说明 owner、目的、数据接收方、保留/删除/导出、成本、性能与移除方式。
  内部法律/商业记录不复制到仓库，公开实体只用获批字段，缺失不填占位值。

当前无 Analytics、Shopify Customer Events 或 consent UI。未来启用时先确认必要、偏好、
分析、营销分类和地区规则；非必要脚本按获批同意加载，API 不可用时保持关闭。
隐私入口须允许重新打开偏好、拒绝与修改，并核对 GPC 与 Checkout 跨域行为。
浏览器若使用 Shopify Customer Privacy API，须用独立最小权限 public token，不能复用
现有 private token。具体待办见 Roadmap，实施时再核对当前官方 API，不预写 SDK 蓝图。

## 检查、CI 与变更

常用检查见 [README](../README.md)。`typecheck` 先生成 Next 路由类型，`build` 先预检。
GitHub CI 使用固定 Node/pnpm，对 PR 和 dev/main 执行无生产凭证的安装、格式、lint、
类型、测试和 build；不写 Shopify、不部署，运行结果以 GitHub 为准。

测试关注 Shopify 映射、金额、分页/数量、可购买判断、错误、市场、metadata 和 Schema。
当前封存 Playwright；Vitest/build/HTTP 合约检查不等于自动支付 E2E。客户端状态、回归频率、
团队或设备矩阵增长后再评估浏览器测试工具，启用前更新本规格与发布手册。
真实设备、辅助技术、性能和 Checkout 验收按发布手册执行。

更换系统或新增 CMS、搜索、数据库、认证、客户数据处理方时，先证明现有能力不足，
说明替代方案、数据边界、成本、迁移和退出方式，更新所属规格后再实施。
