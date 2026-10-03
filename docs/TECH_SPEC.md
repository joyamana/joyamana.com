# 技术规格

## 架构与代码组织

浏览器通过 Next.js App Router / Vercel 读取 Shopify Storefront API。Next.js 负责页面、
交互、路由、搜索信息和数据转换；Shopify 管理商品、内容、购物袋、托管 Checkout、
订单和客户。不建立独立数据库、业务后端、认证或支付系统。优先使用 Server Components，
交互才使用 Client Components，服务端操作使用必要的 Server Actions / Route Handlers。

页面、购物袋、metadata 和 JSON-LD 使用同一份经过校验的数据。转换函数只保留页面需要
的字段，不从标题、图片或 tag 猜测商业事实。商品类型在 `src/lib/commerce/types.ts`，
购物袋在 `cart-types.ts`，内容适配在 `src/lib/content/`。

| 目录 | 职责 |
|---|---|
| `src/app/(english)/`、`es-us/`、`zh-hant-us/` | 三语言薄路由、document layout 和错误边界 |
| `src/app/actions/` | Cart 服务端操作 |
| `src/components/` | 共享页面、布局和交互 |
| `src/config/` | 品牌、市场、语言、索引和类别配置 |
| `src/lib/commerce/` | Shopify 请求、查询类型、数据转换、目录和 Cart |
| `src/lib/content/` | 政策、Content Page、About 和文章读取 |
| `src/lib/http/`、`i18n/`、`navigation/` | 404、语言路径和导航 |

测试以 `*.test.ts(x)` 就近放置，不为未来功能创建空模块。

## 工具和依赖

使用 Node 24、TypeScript strict 和固定 pnpm。精确版本以 [package.json](../package.json)
和 lockfile 为准，安装使用 `pnpm install --frozen-lockfile`。当前 ESLint 9 / TypeScript 6
组合保持兼容；升级前核对 Next、React、lint 插件的支持范围，不覆盖 peer 声明或禁用检查。
依赖文件变化后显式安装，保留 `verifyDepsBeforeRun: warn` 提醒。

样式使用 global CSS 和 CSS variables，字体使用 next/font，不引入 UI kit、GraphQL
codegen 或独立 CMS。字体在构建时下载并自托管，繁中字形按字符范围分片、按需加载；
EN/ES 不应请求中文字体。字体选择见 [设计规范](DESIGN_SYSTEM.md)，授权文件保留在
[OFL-Noto-HK.txt](../public/fonts/OFL-Noto-HK.txt)。

## Shopify 请求和分页

- 使用 Headless channel 的最小权限 private Storefront token，仅在服务端使用；运行时
  不接入 Admin API，不把 private token 放入 `NEXT_PUBLIC_*`。
- GraphQL 查询和类型按领域集中，只取必要字段，不能用 `any` 掩盖字段变化。
- 同一市场使用一致的 country/language；金额保留 Shopify 十进制字符串，集中格式化
  和比较，不用浮点数决定商业金额。
- 分别处理超时、限流、网络、HTTP、GraphQL errors 和 mutation user errors。
  请求有中止时限，不自动重放可能重复执行的 Cart mutation。
- 完整读取所需分页，检查 cursor、重复 ID、归属和数量，不能静默截断。
  每次目录读取共用最多 100 次请求、20 秒预算，涵盖基础分页和款式补读；单次请求
  最多 10 秒且不超过剩余时间。预算失败显示错误，不能发布部分结果。
- 商品详情首批读取 100 个 Variant，摘要读取 1 个；浏览筛选再按批次补齐款式。
  推荐目录读取失败时省略推荐区，商品自身失败仍进入错误边界。
- buyer IP 只信任 Vercel 保护的 `x-vercel-forwarded-for`，校验格式且不持久化。
  其他部署须先明确可信代理，不能转发客户端可伪造 header。

API 版本由环境配置固定，维护时核对字段和支持窗口。官方说明：
[Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api)、
[市场和语言](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/in-context)。

## 渲染和缓存

| 数据 | 策略 |
|---|---|
| 商品、目录、价格、库存、搜索、Cart、Checkout | `no-store` |
| About、Accessibility、Policies、Blog/Guide | fetch `revalidate: 300` |
| Header 动态目录 | 独立轻量查询，fetch `revalidate: 300` |
| Cart 页面 | noindex，挂载后通过 Server Action 读取私有 Cart |
| sitemap | 动态汇总，沿用各数据源的读取规则 |

索引页在初始 HTML 提供正文和链接。React `cache` 只做请求内去重，持久缓存只由 fetch
管理。Header 查询不读取价格、库存、图片或正文；失败仍保留 Shop All、Search、Bag、
语言入口和页面主体。

五分钟是再验证周期，失败时可能继续提供旧内容；更新后须检查实际响应。当前没有
webhook 或手动失效端点。将来确需接入时，校验原始请求 HMAC、鉴权、幂等、失效范围
和失败告警。构建不依赖上游成功；读取失败提供安全空状态或重试，不恢复本地商业正文。
错误边界使用 Next `retry()` 重新读取服务端内容。

## 路由和环境

市场范围见 [项目说明](PROJECT_SPEC.md)，语言映射以 [locales.ts](../src/config/locales.ts)
为准，市场定义见 [markets.ts](../src/config/markets.ts)。当前 UI 使用 `EnabledLocale`，
未启用配置保留在 `SupportedLocale`。繁中站点为 `zh-Hant-US`，Storefront 为 `ZH_TW`，
后台翻译为 `zh-TW`，Intl 使用 `zh-HK`；交易国家仍是 US。跨 root layout 切语言会完整导航。

未知路径和停用市场由 catch-all Route Handler 返回完整 404/noindex/no-store 文档。
动态缺失商品、文章和 About 子页使用 `notFound()`，初始错误正文仍受
[Next 上游问题](https://github.com/vercel/next.js/issues/97000)影响，需要 JavaScript 恢复。
保留稳定框架，不引入内部补丁或实验性 API。

变量说明只维护在 [.env.example](../.env.example)。Local、Preview、Production 凭证分离，
预检和运行时共用纯配置校验，错误只报告变量名和问题。布尔值不接受空格；开索引须有
合法 HTTPS origin。Vercel 要求站点和 Shopify 配置，Production origin 精确为
`https://www.joyamana.com`，Preview 不索引。Checkout 开启时校验对应配置。

## 安全和客户数据

- 私密 token、完整 Cart ID、Email、地址、订单和支付信息不进入日志、URL、Analytics、
  公开错误或测试快照。Next.js 不保存客户资料、订单或支付副本。
- Cart 引用放在 `joya-mana-shopify-cart-us` cookie：HttpOnly、SameSite=Lax、Path=/、
  最长 10 天，Production Secure。它用于恢复 Bag，纳入必要 cookie 清单，不是营销同意。
- 正常 Cart view 不含 secret Cart ID 或 Checkout URL；URL 只在顾客明确点击购买或结账
  后返回。客户端 Cart 操作串行执行；网络故障保留现有袋，确认过期才清空。
- Shopify HTML 在服务端由 `sanitize-html` 清洗，Rich text 校验后受控渲染；JSON-LD
  安全序列化。清洗依赖在本地运行，无客户数据接收方或订阅费，可通过替换清洗接口退出。
- 端点校验输入、Origin、方法和权限。当前 Contact 只提供 Email，没有表单投递或留言存储。
- 响应头以 [next.config.ts](../next.config.ts) 为准；CSP/HSTS 和外部资源按发布范围验收。
- 新工具先说明目的、负责人、数据接收方、保留/删除/导出、成本、性能和移除方式。
  非公开法律/商业记录不复制进仓库，公开实体只使用获批字段。

当前没有 Analytics、Customer Events 或 consent UI。未来启用前须批准同意分类和地区
规则，非必要脚本按同意加载，API 不可用时关闭；偏好可重新打开、拒绝和修改，并核对
GPC 与 Checkout 跨域行为。浏览器 Customer Privacy API 须使用独立最小权限 public token，
不能复用 private token。订单事件仅在动作成功后发送，purchase 每单一次并与 Shopify
对账，不发送 PII 或完整 Cart ID。实施待办见 [Roadmap](ROADMAP.md)。

## 检查与 CI

命令见 [README](../README.md)，发布和回滚见 [发布手册](LAUNCH_RUNBOOK.md)。类型检查
先生成路由类型，build 先预检。GitHub CI 使用固定 Node/pnpm，对 PR 和 dev/main 执行
无生产凭证的安装、格式、lint、类型、测试和 build，不写 Shopify、不部署。

测试覆盖金额、数据转换、分页/数量、购买状态、错误、市场、metadata 和 Schema。
Playwright 当前封存；单元测试和构建不能替代真实设备、辅助技术和 Checkout 验收。
浏览器测试工具只在实际回归需求出现后重新评估。
