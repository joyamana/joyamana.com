# Technical Specification

Status: Working — Production 已公开部署，工程 hardening 与发布验收待完成
Owner: Engineering  
Last updated: 2026-09-11

## 1. 架构目标

- 以最少系统完成可靠的品牌、内容和 Commerce 体验。
- 所有索引内容在初始 HTML 中可读取。
- Shopify 保持 Commerce 事实来源和最终交易裁决者。
- 支持缓存和静态优化，同时保证价格、库存和政策不误导。
- 内部可以扩展 market/locale，外部只暴露当前真实运营市场。
- 不把未来 Customer Account、CMS、搜索或定制器复杂度带入 MVP。

## 2. 系统边界

```text
Browser / Search crawler / AI Search crawler
                    |
                    v
          Next.js App Router (Vercel Production + local/dev workflow)
          ├─ Server Components / dynamic rendering
          ├─ Client Components for interaction
          ├─ Server Actions / thin Route Handlers
          ├─ Metadata / JSON-LD / sitemap / robots
          ├─ Analytics + consent boundary (planned)
          └─ Short server cache for low-volatility content/navigation
                    |
                    v
                 Shopify
          ├─ Products / Variants / Collections
          ├─ Price / Inventory / Discounts / Markets
          ├─ Pages / Blog / Metafields / Metaobjects
          ├─ Storefront Cart
          ├─ Hosted Checkout
          └─ Orders / Customers / Order Status
```

MVP 没有独立数据库、业务 API 服务、身份服务、PIM、搜索服务或队列。
Shopify webhook/cache invalidation 按 D-046 当前后置，不属于上图运行链路；低频内容与
导航使用五分钟再验证窗口；更新后须检查实际响应。

## 3. 职责与数据所有权

| 能力 | Owner | 说明 |
|---|---|---|
| Product/Variant/SKU | Shopify | 唯一商品事实来源 |
| Price/Inventory/Discount | Shopify | 前端不可覆盖最终值 |
| Cart | Shopify Storefront API | Next.js 维护会话引用，不存业务副本 |
| Checkout/Payment/Order | Shopify | 跳转 hosted checkout |
| Customer/Order Status | Shopify | MVP 不建自有客户数据库 |
| Pages/Blog/structured content | Shopify（D-009 Accepted） | Pages/Blog + Metafields/Metaobjects |
| Rendering/routing/UI | Next.js | 品牌体验、内容组合、交互 |
| Metadata/Schema | Next.js mapper | 与 UI 共用规范化实体 |
| Cache/revalidation | Next.js | 当前低频内容及 Header Catalog fetch 使用 5 分钟缓存；D-046 接受该窗口并后置 webhook |
| Analytics | 获批工具 | 事件最小化，不成为商业事实来源 |

禁止在 CMS、前端常量或 Analytics 中复制可变化的价格、库存和政策事实。

## 4. 技术基线

Next.js App Router、TypeScript strict、React Server Components、Shopify Storefront API、
Vercel；Node 24 系列。直接依赖精确版本统一在 [package.json](../package.json)，
传递依赖由 pnpm-lock.yaml 固定，不在多份文档重复维护补丁版本。

当前使用 Next 16.3、React 19.3、Vitest 5、pnpm 12；Vitest 使用 Node environment。
ESLint 9.x / TypeScript 6.0.x 是已接受的最新兼容稳定组合：
Next 依赖的 import/React/a11y 插件不支持 ESLint 10，typescript-eslint 不支持 TypeScript 7。
ESLint 9 已被上游标记停止支持；下一次维护优先复核该限制，不能把它视为长期升级策略。
当前不覆盖 peer 声明、不禁用 lint，也不并存两套 TypeScript 编译器。
验证以 Node 24 下的 frozen install、peer check、lint、typecheck、tests、build 为准。

使用 Next global CSS + variables/tokens；无 UI kit、GraphQL codegen 或独立 CMS。
CI、format/coverage gate 尚未建立；Vercel dev Preview 与 main Production 已建立。
Playwright 按 D-043 暂缓，webhook 按 D-046 后置。
Shopify API 版本以 .env.example/部署配置为准，至少每季度复核字段与支持窗口。

## 5. 当前目录边界

```text
src/
├── app/
│   ├── (english)/           # en-US root routes + [...path] 404 boundary
│   ├── es-us/               # explicit US Spanish routes
│   ├── actions/              # Cart and Contact server actions
│   ├── robots.ts
│   └── sitemap.ts
├── components/                  # shared layout, interaction and pages
├── config/                      # brand, site, market and category allowlists
└── lib/
    ├── commerce/                # Shopify client, catalog, cart, normalized types
    ├── content/                 # Policy/About/Content Page/Editorial adapters
    ├── i18n/
    ├── navigation/
    ├── seo.ts
    └── structured-data.ts
```

测试与被测模块就近放置为 `*.test.ts(x)`。当前没有 `api/webhooks`、独立
`graphql/`、`analytics/` 或 `tests/e2e/` 目录；不为未来功能创建空模块。

## 6. Shopify 集成

### Headless channel

- 通过 Shopify Headless channel 创建 storefront 和最小权限 private token。
- 私密 Storefront token 使用 `SHOPIFY_STOREFRONT_ACCESS_TOKEN`，仅用于服务端；
  该变量必须填写 Headless channel 生成的 private token，不得使用
  `NEXT_PUBLIC_*` 暴露。
- Runtime storefront 不使用 Admin API token。
- 创建 Metaobject definition 等管理动作优先在 Shopify Admin 完成；若未来需
  自动化，另行评估一次性脚本或 App 的权限边界。

### GraphQL

- Query 与 fragment 按领域集中，不在 React 组件内拼接重复查询。
- 生成或维护明确的 TypeScript 类型；不以 `any` 掩盖 API 变化。
- 对 GraphQL `errors`、user errors、HTTP error、timeout 和 rate limiting
  分别处理。
- Query 只请求页面需要字段，避免一个“万能商品查询”。
- 金额使用 Shopify `MoneyV2` 和集中 formatter，禁止浮点运算决定最终金额。
- 所有 market-sensitive 查询使用同一 market context。
- Product/Cart 同时映射 `availableForSale`、`quantityAvailable`、
  `currentlyNotInStock` 和 contextual `quantityRule`。只对不允许继续销售且精确
  数量已知的 Variant 在客户端收紧数量上限；Cart warning/error 仍是最终校验。

### Cart

- 通过 Storefront API 创建和更新 Cart。
- 推荐在 `HttpOnly + Secure + SameSite=Lax` cookie 中保存必要的 Cart 引用，
  不建设 session 数据库。
- Cart ID 视为敏感会话信息：不进入 URL、analytics 或应用日志。
- 服务器端请求在 Shopify 要求时传递正确的 buyer IP/header，且不持久化 IP。
- Vercel 部署只信任平台保护的 `x-vercel-forwarded-for` 并验证 IP 格式；其他部署
  平台必须先定义 trusted-proxy 边界，不能直接转发客户端可伪造 header。
- Storefront 请求设有限时中止，并分别归类 timeout、HTTP/GraphQL rate limit、
  network、HTTP 与 GraphQL error；不得自动重放非幂等 Cart mutation。
- Checkout 点击时重新获取最新 `checkoutUrl`，避免使用过期 URL。
- Shopify Checkout 是最终价格、折扣、库存、税费和配送裁决者。

### Webhooks 与缓存失效（D-046：当前后置）

- 当前不实现 webhook 或手动 revalidation endpoint；Policy、About、Accessibility、
  Article 与 Header 导航更新后等待至少 5 分钟再验收。
- 未来达到 D-046 触发条件后，Product、Collection 和相关内容更新可通过已验证 Shopify
  webhook 触发最小范围 tag/path revalidation。
- Webhook 必须使用原始请求体按 Shopify 当前要求验证 HMAC，并在解析为业务
  对象或执行任何副作用前拒绝无效请求。
- Handler 应幂等；只记录事件类型、资源 ID、结果和时间，不记录 secret 或
  完整客户数据。
- Webhook 之外保留合理的时间兜底 revalidation；失败告警先使用 Vercel 能力。

## 7. 规范化实体

Shopify 原始响应先映射到页面所需的薄实体，再供 UI、metadata、JSON-LD 和
Analytics 使用：

Market/Locale/Currency 的真实类型定义见 `src/config/markets.ts` 和
`src/lib/i18n/locales.ts`，字段不得从文档示例复制为第二份实现。
Language 决定内容，地区参与 Market 解析，Currency 只参与价格/交易上下文。

当前已实现的薄实体包括：

- `Product` / `ProductVariant` / `ProductCategory` / `Collection`
- 不含 Cart ID 和常驻 Checkout URL 的公开 Cart view model
- `StorefrontPolicy`
- `StorefrontContentPage`
- `StorefrontAboutTree`（固定 root + 有序 direct-child 引用）
- `StorefrontEditorialIndex` / `StorefrontEditorialArticle`

Organization/Site Settings 规范化实体尚未实现。相关业务输入已确认解决，但实现仍须
从获批公开字段建立集中配置；不得为了 Schema 推断、复制非公开法律实体/地址或填写
占位 Logo、域名和 social profile。

Mapper 只统一字段和语义，不建立通用实体平台。字段契约见 Commerce 和
Content/SEO 规格。

## 8. Rendering 与缓存

| 页面/数据 | 默认策略 | 原因 |
|---|---|---|
| Home | Dynamic；Catalog `no-store` | 首页包含实时商品，首屏与品牌立场文案由代码集中维护 |
| About / Policy / Accessibility | Dynamic route + Shopify fetch 5 分钟 | 低频内容；About 共用 tree，Policy/Accessibility entity 控制正文与索引资格 |
| Crystal Guide / Article | Dynamic route + Shopify fetch 5 分钟 | 低频内容、需完整 HTML |
| Shop / Category / Collection | Dynamic / `no-store`；Header Catalog fetch 独立缓存 5 分钟 | 页面商业数据无批准陈旧窗口；Header 只消费导航字段 |
| Product | Dynamic / `no-store` | 价格、可售性和库存数量优先实时一致 |
| Cart | 静态 `noindex` client shell；挂载后通过 Server Action `no-store` 读取 | Cart cookie、会话和库存相关，不把私有 Cart 烘焙进 HTML |
| Account（未来） | Dynamic / no-store | 私有客户数据 |
| Search | Dynamic / `no-store` | 当前只检索 Shopify Product，query-specific，noindex |
| Sitemap | Dynamic；Catalog `no-store`，内容 fetch 5 分钟 | 只在 index gate 开启后聚合已发布路径 |
| Preview/draft | Dynamic + noindex | 不可缓存为生产公开内容 |

规则：

- Metadata、JSON-LD 与可见 UI 应使用同一次数据读取或同一规范化实体。
- 缓存键包含真实启用的 market 和 language。
- 价格/库存允许的陈旧窗口在实现前由 Commerce owner 批准。
- Header 使用独立的 navigation-specific Product Category/Collection GraphQL query，
  只映射 taxonomy ID、handle、title、collection kind 和非空判断，不读取或缓存价格、
  可售性、库存数量、图片或正文。5 分钟 Header cache 不得复用于 PDP、商品卡或 Cart。
- Header navigation 上游失败时 Locale shell 降级为空的动态目录链接，保留 Shop all、
  Search、Bag、语言切换和页面主体；不恢复本地 Catalog，也不让 Header 数据故障触发
  全页 error boundary。
- 持久缓存只由 fetch 的 `revalidate: 300` 管理；React `cache` 仅做请求内去重。
  Header 不再叠加 `unstable_cache`，避免两层缓存续存旧导航。
- Collection 的 metadata、sitemap 与 Schema 共用有效描述判断；存在但缺少描述的
  系列保留商品浏览与中性 metadata，详情保持 noindex，不进入 sitemap 或输出 Schema。
- 五分钟是再验证周期，不是硬失效上限；再验证失败可能继续提供旧内容。
  内容更新后等待并检查实际响应，紧急失效需求按 D-046 重新评估。
- 运行时数据获取不作为 build 发布依赖；不可确认时展示可恢复错误。
  Error page 使用 Next 16.3 的 `retry()` 重新获取服务端子树。

## 9. 路由与国际化

### MVP

- US Market 的 en-US 使用根路径，es-US 使用 `/es-us/`，zh-Hant-US 使用 `/zh-hant-us/`。
- CA 规划 Market 保留 en-CA `/en-ca/`、fr-CA `/fr-ca/` 的未来路径规则，但
  第一阶段不生成、导航、索引或响应这些 URL。
- 不生成 `/en-us/`；三个语言路径解析到同一 US Catalog 和运营上下文。
- `config/locales.ts` 是无循环依赖的 locale/类型注册表，集中 provider、format 与 OG
  映射；`config/markets.ts` 引用受限类型，`lib/i18n` 提供 path helper、语言列表和启用门禁。
  zh-Hant-US 对应 Storefront `ZH_TW`、Admin `zh-TW`、Intl `zh-HK`、OG `zh_US`。
  字体仅在繁中 root layout 声明 Noto Serif HK 500 与 Noto Sans HK variable；
  使用既有 `next/font/google` 构建时下载、自托管 WOFF2/`unicode-range` 分片，
  `preload: false`、`display: swap`，访客只向本站按需请求字体。EN/ES 不下载中文 WOFF2；
  Turbopack 可能合并部分字体 CSS 声明，验收须以真实字体请求而非 import 位置为准。
  拉丁文本保留 Newsreader/Manrope，中文加载期间回退系统字体；无新增包或运行时第三方平台。
  字体上游来源与 OFL 授权随站点保留在 `public/fonts/OFL-Noto-HK.txt`。
- US/CA 使用独立 Catalog、Currency、Availability 和 Cart context；语言切换
  不改变 Market，Market 切换不得复用另一 Market 的 Cart。
- 路径使用小写、短横线；推荐无尾斜杠并由重定向统一。
- Shopify 标准 `/products/{handle}` 保留，避免无必要偏离。
- `/shop` 展示全部在售 Product；`/category/{handle}` 由 Shopify Standard Product
  Category 驱动；`/collections/{handle}` 只允许
  `custom.collection_kind=design_series` 的非空设计系列。
- 首批 Category route 通过稳定 Shopify taxonomy ID allowlist 映射公开 handle；
  未知或无商品类别返回 404，不按产品标题、Product Type 或 tag 猜测。
- `/collections/bracelets` 等已知类别旧路径永久重定向至 `/category/bracelets`，
  防止重复 canonical。
- `/about/{handle}` 只从固定 `about` Content Page 的直接 `child_pages` 引用解析；
  未引用、错误类型、不完整或未知 handle 返回 404，不按所有 Metaobject 自动建路由。
- About root 与子页在服务端输出同一有序页内导航；语言 fallback 保持 noindex 且不进入
  sitemap/hreflang。
- en-US/es-US/zh-Hant-US 各自拥有 root document layout，初始 HTML 的 lang 与 locale 一致；
  跨 root layout 语言切换是完整文档 navigation。
  停用市场与未知路径由统一 catch-all 返回 noindex/404，不预建业务模板。
  当前 notFound 响应未在初始 HTML 渲染提示正文，需在 Preview 验证客户端恢复；
  不将正确的 404 状态码等同于完整的无 JavaScript 错误页体验。
- Product/Collection 目前无法从 Storefront response 自动识别 Spanish 是真实翻译
  还是 English fallback。en-US 与 es-US Commerce 均已获业务方批准开放；自动验证实现前，
  es-US Product/Collection 必须在每次发布时人工逐页检查，发现 fallback 时关闭对应
  scope 或先修正 Shopify 内容。
- zh-Hant-US 按 D-049 允许相同 fallback 可读；About 有效子页不因缺译隐藏。
  Core/Commerce/Policies 的索引矩阵已按 D-045 开启，Editorial 关闭；保留总开关和单页
  readiness，不实现商品翻译 allowlist。现有 US cookie 不变；新 Cart 和旧 Cart
  以 ZH_TW 请求，Checkout 校验仅增加实测 `/zh-tw/` 前缀，不改写 opaque URL。
- Currency 不进入 URL；若未来一个 Market 支持多个 Currency，选择保存在
  会话/Shopify buyer context 中。

### 扩展条件

第二个 Market 真正获批后再：

- 增加该 Market 获批的 language-region route segment。
- 从 Shopify Localization/`@inContext` 获取对应上下文。
- 配置 Catalog、Pricing、Currency、Tax、Shipping、Legal、translation 与
  analytics。
- 生成真实 alternate/hreflang。
- 为旧路径和冲突 slug 设计迁移。

不使用 IP 强制 301。可以给用户市场建议，并保存主动选择。

## 10. 环境与配置

当前 `.env.example` 只包含部署环境变量名和说明，分为：

- `NEXT_PUBLIC_SITE_URL` 与部署级 `NEXT_PUBLIC_SITE_INDEXABLE` 索引总开关；en-US/es-US
  与 zh-Hant-US 各自的 Core/Commerce/Policies/Editorial scope 统一维护在版本控制的
  `src/config/indexing.ts` locale/page-group 矩阵。页面需同时通过总开关与对应矩阵 scope。
  打开总开关时
  canonical URL 必须是非本地 HTTPS origin，配置缺失或仍指向 localhost 时构建 fail
  closed，避免发布错误 canonical 与 sitemap。
- `SHOPIFY_STORE_DOMAIN`、`SHOPIFY_STOREFRONT_ACCESS_TOKEN` 与
  `SHOPIFY_STOREFRONT_API_VERSION`；当前 token 仅在服务端使用。
- `SHOPIFY_CHECKOUT_ENABLED` 与可选 `SHOPIFY_CHECKOUT_DOMAIN`。
- `CONTACT_FORM_ENABLED` 与 server-only `RESEND_API_KEY`。
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`；`NEXT_PUBLIC_GA4_ID` 只是预留配置，
  当前没有 GA4 运行时集成。

Shopify webhook secret、consent 和监控变量只在对应功能实现并批准后加入，
不提前伪造已存在的配置。

要求：

- Local、Preview、Production 凭证分离。
- 启动或构建时验证必需变量并给出安全错误。
- 任何日志、错误消息或测试 snapshot 不得泄露 secret。
- 不在文档、issue、query string 或客户端 bundle 中保存凭证。

`pnpm preflight` 已提供不输出 secret 的集中部署检查，并由 `prebuild` 自动运行：
Vercel 部署必须提供 canonical origin 与 Shopify credential；Production origin 必须
精确为 `https://www.joyamana.com`；Preview 必须 noindex；Checkout/Contact 门禁开启
时必须具备对应 credential。运行时 adapter 仍保留自身校验，不能只依赖 build。

当前部署状态见 [PROJECT_SPEC.md](PROJECT_SPEC.md)，具体发布步骤见 Runbook。

## 11. Security 与 Privacy

- 当前已设置 `X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options`
  和限制型 `Permissions-Policy`；CSP 与 HSTS 在确定 Production/Checkout/第三方域后
  于 Beta 前配置并验收。
- 富文本使用受控组件渲染；不直接注入未消毒 HTML。
- JSON-LD 使用安全序列化，防止 `</script>` 等注入。
- Server Action/Route Handler 验证输入、Origin、方法和权限；对可滥用端点限流。
- 若未来实施 Webhook，必须验证签名、防重复处理，并限制 payload。
- Cookie 使用最小范围、`Secure`、`HttpOnly` 和合理 `SameSite`。
- 不在日志记录 Email、地址、完整订单、token、Cart ID 或支付信息。
- 第三方脚本经过隐私、性能、数据接收方和 consent 审查。
- 仅申请 Shopify 所需 scopes，并建立 token rotation 流程。

Webhook 按 D-046 后置；未来实施时上述安全边界是启用条件。限流与 token rotation
仍是发布安全要求；Contact 已有输入/Origin/honeypot 边界，但生产 rate limit/WAF
仍在开放清单中。
- 生产错误对用户使用安全消息，详细堆栈仅进入受限服务端日志。

法律文本和 consent 适用范围需要合格专业人士确认；工程实现不得假设某个州
或国家法律不适用。

## 12. Quality gates

### 每次变更

- `pnpm lint`
- `pnpm typecheck`（先 `next typegen`，再 `tsc --noEmit`）
- `pnpm test`（或至少相关 Vitest）
- `pnpm build`（影响 build/runtime 时）

当前无独立 format 脚本、coverage threshold 或 CI gate；在建立前不得声称已通过。

### Integration tests

- Shopify response → normalized entity mapping
- Money、variant、availability 与 market context
- GraphQL errors、timeout 和 unavailable 状态
- Metadata、canonical、robots 和 JSON-LD mapper
- Webhook HMAC、幂等和 cache tag（实现 webhook 时新增）

### Browser/Checkout validation（Playwright 暂缓）

- 当前按 D-043 不安装、不编写或维护 Playwright suite。
- 每次受影响发布必须记录人工浏览 Collection/PDP、选择 Variant、Add to bag、
  更新数量、移除、恢复 Cart 和 Guest Checkout 跳转的结果。
- 人工 smoke 还需覆盖售罄、价格变化、API 失败、关键内容、404、政策和移动导航。
- Vitest、build 和 Storefront contract smoke 不得表述为浏览器或支付 E2E。
- 当客户端状态、关键路径、回归频率、团队协作或设备矩阵明显增加时，重新评估
  Playwright，并在启用前更新 D-043、Roadmap 和 Runbook。

无论是否自动化，支付完成验证都应使用 Shopify 支持的测试方式，不绕过或模拟真实
支付安全机制。

### Accessibility（发布前待自动化与人工验收）

- 自动 axe 检查。
- 键盘、焦点顺序、skip link、dialog/menu focus trap。
- 表单 label、error association、live region。
- 图片 alt、对比度、zoom、reduced motion。
- 核心流程进行人工辅助技术检查。

### SEO/Performance

- 初始 HTML、title、description、canonical、robots、Schema。
- Sitemap 只含 200/canonical/indexable URL。
- Preview 不可索引。
- 真实设备/数据检查 LCP、INP、CLS。
- Bundle 与第三方脚本预算；新增脚本需解释。

## 13. CI/CD 与发布

当前 `dev` 已关联 Vercel Preview，`main` 关联 Production；尚无 CI workflow。
提交前运行相关检查；Preview 必须 noindex，secret 与 Production 分离。
同一已验收 commit 发布到 Production，按批准范围核验环境与功能门禁，不复用 Preview 值。
回滚使用已验证 Vercel deployment，不回滚 Shopify 订单/库存数据。
详细流程、监控和验收记录见 [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md)。

## 14. 架构升级触发条件

以下需求出现时重新评估，而非提前实现：

| 能力 | 触发条件 |
|---|---|
| Sanity/其他 CMS | Shopify 编辑工作流出现可测瓶颈 |
| 独立搜索 | Catalog/内容规模与搜索数据证明需要 |
| Customer Account | 客服、自助订单或复购价值明确 |
| 数据库/服务 | Shopify/Next.js/SaaS 无法可靠承载已确认业务 |
| Customizer | 人工/表单验证需求、规则和营收价值 |
| 多市场路由 | 具体市场的运营、Catalog、政策和内容就绪 |

每项都必须先建立 ADR。
