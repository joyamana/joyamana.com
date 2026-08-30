# Technical Specification

Status: Draft — 核心架构已接受，工具细节待初始化时确认  
Owner: Engineering  
Last updated: 2026-08-30
Supersedes: 旧版 `TECH_SPEC.md` 与归档文档中的 Hydrogen/Oxygen 方案

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
          Next.js App Router on Vercel
          ├─ Server Components / SSG / ISR
          ├─ Client Components for interaction
          ├─ Server Actions / thin Route Handlers
          ├─ Metadata / JSON-LD / sitemap / robots
          ├─ Analytics + consent boundary
          └─ Verified webhook cache invalidation
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
| Cache/revalidation | Next.js/Vercel | Shopify webhook + 兜底 revalidate |
| Analytics | 获批工具 | 事件最小化，不成为商业事实来源 |

禁止在 CMS、前端常量或 Analytics 中复制可变化的价格、库存和政策事实。

## 4. 技术基线

### Accepted

- Next.js App Router
- TypeScript strict mode
- React Server Components 优先
- Shopify Storefront API
- Vercel

### Proposed at scaffold

- pnpm
- 当前 Node LTS，通过 `.nvmrc` 或等效文件固定
- 当前稳定 Next.js，精确 lockfile
- Tailwind CSS + CSS variables/tokens
- Vitest + Testing Library
- Playwright
- GraphQL typed document/code generation

不在规划文档中提前写死尚未安装的包版本。初始化当天核对官方文档，固定实际
版本并记录在 lockfile；Shopify Storefront API 版本用环境/代码常量显式固定，
至少每季度检查 deprecated 字段和升级窗口。

## 5. 推荐目录

```text
app/
  (storefront)/
    page.tsx
    shop/page.tsx
    category/[handle]/page.tsx
    products/[handle]/page.tsx
    collections/[handle]/page.tsx
    crystals/[handle]/page.tsx
    blog/[handle]/page.tsx
    about/page.tsx
    about/[handle]/page.tsx
    cart/page.tsx
  api/
    webhooks/shopify/route.ts
  robots.ts
  sitemap.ts
  manifest.ts
components/
  ui/
  layout/
  commerce/
  content/
  seo/
lib/
  shopify/
  commerce/
  content/
  markets/
  seo/
  security/
  analytics/
graphql/
  fragments/
  queries/
  mutations/
types/
styles/
tests/
  unit/
  integration/
  e2e/
```

目录按职责建立，不为未来功能创建空模块。若实际 Next.js 版本的约定变化，
初始化时以当前官方文档为准并更新本规格。

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

### Webhooks 与缓存失效

- Product、Collection 和相关内容更新通过已验证 Shopify webhook 触发
  tag/path revalidation。
- Webhook 必须使用原始请求体按 Shopify 当前要求验证 HMAC，并在解析为业务
  对象或执行任何副作用前拒绝无效请求。
- Handler 设计为幂等，重复事件不产生副作用。
- 记录事件类型、资源 ID、结果和时间；不记录 secret 或完整客户数据。
- Webhook 之外保留合理的时间兜底 revalidation，避免事件丢失导致永久陈旧。
- 失败告警先使用 Vercel 能力；只有实际需要时增加第三方平台。

## 7. 规范化实体

Shopify 原始响应先映射到页面所需的薄实体，再供 UI、metadata、JSON-LD 和
Analytics 使用：

```ts
type MarketContext = {
  marketId: 'us' | 'ca'
  regions: ['US'] | ['CA']
  catalog: 'us' | 'ca'
  locale: 'en-US' | 'es-US' | 'en-CA' | 'fr-CA'
  defaultCurrency: 'USD' | 'CAD'
  currencies: ['USD'] | ['CAD']
  shippingZone: 'us-pending' | 'ca-pending'
  taxProfile: 'us-pending' | 'ca-pending'
  legalProfile: 'us-pending' | 'ca-pending'
}
```

`Market` 是商业运营单元，不等同于 Country、Language 或 Currency。Language
决定内容版本，region 参与 Market 解析，Currency 只参与价格展示和交易上下文。
未来多币种选择不得生成新的 SEO URL。

实体至少包括：

- `NormalizedProduct`
- `NormalizedVariant`
- `NormalizedProductCategory`
- `NormalizedCollection`
- `NormalizedCrystal`
- `NormalizedArticle`
- `NormalizedContentPage`
- `AboutNavigation`（固定 root + 有序 direct-child 引用）
- `NormalizedOrganization`
- `NormalizedPolicy`

Mapper 只统一字段和语义，不建立通用实体平台。字段契约见 Commerce 和
Content/SEO 规格。

## 8. Rendering 与缓存

| 页面/数据 | 默认策略 | 原因 |
|---|---|---|
| Home / About subtree / Policy | Static/ISR；当前 Shopify 内容页使用 5 分钟 revalidate | 品牌内容变化低；About metadata、正文与 tabs 使用同一 root tree |
| Crystal Guide / Article | Static/ISR | 内容型、需完整 HTML |
| Shop / Category / Collection | 当前 Dynamic / no-store；后续 ISR + cache tag | 尚未批准陈旧窗口，也未完成 webhook |
| Product | 当前 Dynamic / no-store；后续 ISR + cache tag + webhook | 先保证价格与可售性实时一致 |
| Cart | Dynamic / no-store | 会话和库存相关 |
| Account（未来） | Dynamic / no-store | 私有客户数据 |
| Search | Dynamic 或短缓存 | Query-specific，noindex |
| Preview/draft | Dynamic + noindex | 不可缓存为生产公开内容 |

规则：

- Metadata、JSON-LD 与可见 UI 应使用同一次数据读取或同一规范化实体。
- 缓存键包含真实启用的 market 和 language。
- 价格/库存允许的陈旧窗口在实现前由 Commerce owner 批准。
- 2026-08-25 临时实现：在陈旧窗口、cache tags 和 Shopify webhook 获批并验收前，
  Product、Collection 及包含实时商品的 Home 使用 request-time Server Rendering
  与 `no-store`。这仍在初始响应输出完整 HTML，也避免把瞬时 Shopify 请求变成
  production build 的发布依赖；sitemap 同样在请求时从 Catalog 生成。完成缓存失效
  链路后再切回表中规划的 ISR。
- 数据不可确认时展示可恢复错误，不显示缓存外的猜测值。
- 不因“所有页面 SSR”把静态品牌和内容页强制改成每请求动态。

## 9. 路由与国际化

### MVP

- US Market 的 en-US 使用根路径，es-US 使用 `/es-us/`。
- CA 规划 Market 保留 en-CA `/en-ca/`、fr-CA `/fr-ca/` 的未来路径规则，但
  第一阶段不生成、导航、索引或响应这些 URL。
- 不生成 `/en-us/`；两个语言路径解析到同一 US Catalog 和运营上下文。
- `config/markets.ts` 提供启用的 US 与 planned CA Market，`lib/i18n` 提供统一
  path helper 和 enabled-locale gate。
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

应用初始化后提交 `.env.example`，只包含变量名和说明。预期变量类别：

- Canonical site URL
- 开启 index gate 时，Canonical site URL 必须是非本地 HTTPS origin；配置缺失或
  仍指向 localhost 时构建 fail closed，避免发布错误 canonical 与 sitemap。
- Shopify store domain
- Storefront API version
- Storefront private/public token（按实际实现最小化）
- Shopify webhook secret
- Analytics/consent public configuration
- Preview/monitoring configuration

要求：

- Local、Preview、Production 凭证分离。
- 启动或构建时验证必需变量并给出安全错误。
- 任何日志、错误消息或测试 snapshot 不得泄露 secret。
- 不在文档、issue、query string 或客户端 bundle 中保存凭证。

## 11. Security 与 Privacy

- CSP、HSTS、Referrer-Policy、Permissions-Policy 等响应头在 Beta 前配置。
- 富文本使用受控组件渲染；不直接注入未消毒 HTML。
- JSON-LD 使用安全序列化，防止 `</script>` 等注入。
- Server Action/Route Handler 验证输入、Origin、方法和权限；对可滥用端点限流。
- Webhook 验证签名、防重复处理，并限制 payload。
- Cookie 使用最小范围、`Secure`、`HttpOnly` 和合理 `SameSite`。
- 不在日志记录 Email、地址、完整订单、token、Cart ID 或支付信息。
- 第三方脚本经过隐私、性能、数据接收方和 consent 审查。
- 仅申请 Shopify 所需 scopes，并建立 token rotation 流程。
- 生产错误对用户使用安全消息，详细堆栈仅进入受限服务端日志。

法律文本和 consent 适用范围需要合格专业人士确认；工程实现不得假设某个州
或国家法律不适用。

## 12. Quality gates

### 每次变更

- Format
- Lint
- TypeScript typecheck
- 相关 unit/integration tests
- Production build（影响 build/runtime 时）

### Integration tests

- Shopify response → normalized entity mapping
- Money、variant、availability 与 market context
- GraphQL errors、timeout 和 unavailable 状态
- Metadata、canonical、robots 和 JSON-LD mapper
- Webhook HMAC、幂等和 cache tag

### E2E

- 浏览 Collection/PDP。
- 选择 Variant 并 Add to cart。
- 更新数量、移除、恢复 Cart。
- Guest flow 跳转 Shopify Checkout。
- 售罄、价格变化、API 失败。
- 关键内容、404、政策和移动导航。

支付完成的端到端自动化应使用 Shopify 支持的测试方式，不绕过或模拟真实支付
安全机制。

### Accessibility

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

- Git 主分支发布 Production；PR 生成 Vercel Preview。
- Preview 使用隔离配置并全站 `noindex`，避免真实客户数据。
- 合并前运行 lint、typecheck、tests 和 build。
- 发布前执行 Shopify API 合约 smoke test 与关键 E2E。
- Production 回滚使用上一个已验证 Vercel deployment；不对 Shopify 业务数据
  做自动回滚。
- 发布步骤、监控和回滚见 `LAUNCH_RUNBOOK.md`。

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
