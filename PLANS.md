# Execution Plans

复杂任务使用可持续更新的 Execution Plan，让后续 Codex 会话无需依赖聊天
历史也能安全继续。计划是执行记录，不是静态提案。

## 何时使用

满足任一条件时使用：

- 跨越两个或更多领域规格。
- 包含架构、数据所有权、公开 URL 或第三方平台决策。
- 需要多个里程碑、较长验证或分阶段发布。
- 中断后需要其他人或 Codex 会话继续。

单文件修复、文案微调和明确的小任务不需要创建计划。

## 规则

- 计划必须自包含，写清目标、上下文、非目标、依赖和完成标准。
- 每次完成里程碑后更新进度和发现，不让计划与代码脱节。
- 未决业务问题引用 `docs/OPEN_QUESTIONS.md` 的 ID。
- 架构决定引用 `docs/DECISIONS.md` 的 ID；新架构决定先进入决策日志。
- 不把猜测写成事实。采用临时默认值时，写清可撤销路径。
- 验证必须是可执行或可观察的结果，不能只写“测试一下”。
- 完成后保留 Outcome，总结实际结果、偏差、遗留项和验证证据。

## 模板

```md
# <计划名称>

状态：Draft | Active | Blocked | Complete
负责人：<name>
最后更新：YYYY-MM-DD
关联：<issue / decision / question / spec>

## Objective

完成后用户或系统能够做到什么。

## Context

相关目录、现状、事实来源和必须先读的文档。

## Scope

- 包含：
- 不包含：

## Decisions and assumptions

- Accepted decision:
- Temporary assumption:
- Blocking question:

## Milestones

1. [ ] <可独立验收的结果>
2. [ ] <可独立验收的结果>

## Detailed approach

按文件、模块、数据流或用户流程说明实现方法，以及选择此方法的原因。

## Validation

- Command:
- Manual observation:
- SEO/Commerce/Data checks:
- Rollback or recovery:

## Progress log

- YYYY-MM-DD: <完成内容、发现、阻塞>

## Risks

- Risk:
  - Mitigation:

## Outcome

实际交付、验证结果、与原计划的差异、剩余工作。
```

---

# Trust、Policy 与 Product Care 本地页面骨架

状态：Complete  
负责人：Codex  
最后更新：2026-08-14  
关联：D-009、D-021、D-023、D-024；Q-003A–Q-003F；`MVP_PRD.md` P-003/P-007

## Objective

在不接入 Shopify、不虚构运营或法律事实的前提下，完成 Trust/Policy 页面、
Product Care、FAQ、Contact、Accessibility 的本地路由、统一数据契约、页面呈现、
Footer 与 PDP 入口。未来接入 Shopify 时只替换内容 adapter，不重做公开 URL 和 UI。

## Context

现有测试站已有 Shipping、Returns、Privacy、Terms 和 Contact 占位页；Shopify
store、Headless channel、真实政策、客服渠道和商品护理事实尚未准备。测试站全站
默认 `noindex`，当前政策页不在 sitemap。

## Scope

- 包含：统一 draft/published 状态和 source 类型；补充 Disclaimer、Product Care、
  FAQ、Accessibility；更新已有 Policy 页面；四个 locale 路由；Footer 与 PDP 链接；
  文档和验证。
- 不包含：Shopify API 接入、正式政策文案、法律建议、可提交 Contact 表单、
  Policy/FAQ Schema、启用索引或 Checkout。

## Decisions and assumptions

- Accepted：标准 Policy 与普通内容最终由 Shopify Policies/Pages 提供，商品专属
  护理由 Product metafields 提供；Next.js 负责品牌化 URL 和呈现。
- Temporary：所有新增本地内容均为 `draft`，只描述发布前所需输入，不包含期限、
  费用、权利、保证或材料护理承诺。
- Blocking：Q-003A–Q-003F 和 `PRODUCT_INPUTS.md` 的护理相关字段。

## Milestones

1. [x] 建立统一 TrustPage 数据契约与可复用页面。
2. [x] 完成 en-US、es-US、en-CA、fr-CA 路由与导航入口。
3. [x] 完成 PDP 的 Care、Shipping、Returns 摘要链接。
4. [x] 完成 lint、typecheck、tests、build 和初始 HTML 检查。

## Detailed approach

使用本地 typed definitions 表达页面 handle、状态、目标 Shopify source 与待确认
输入；组件只渲染该模型。现有 Policy 页面迁移到同一组件。新增页面保持静态服务端
渲染。Draft 页面不加入 sitemap，未来 adapter 提供已批准内容后再加入发布门禁。

## Validation

- Command：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
- Manual observation：检查四个 locale 的页面路由、Footer 链接和 PDP 内链。
- SEO/Data：全站仍为 noindex；draft trust pages 不进入 sitemap；无虚构政策事实。

## Progress log

- 2026-08-14：建立执行计划并开始盘点现有实现。
- 2026-08-14：新增 typed TrustPage definitions、统一 draft 页面组件、12 个新
  locale 路由，并将既有 Shipping/Returns/Privacy/Terms 迁移到同一模型。
- 2026-08-14：Footer 与 PDP 内链完成；draft trust pages 通过发布状态继续排除
  sitemap；同步 MVP、SEO/GEO 与设计系统文档。
- 2026-08-14：ESLint、TypeScript、14 项测试和 104 页 production build 通过；
  生产服务器 HTML 抽查确认 H1、draft 标记、localized route、PDP 内链和空 sitemap。

## Risks

- Risk：占位文案被误认为正式政策。
  - Mitigation：页面显式显示 Draft / not published，且不包含具体承诺。
- Risk：未来 Shopify 数据结构导致页面返工。
  - Mitigation：页面只依赖统一 TrustPage 模型，Shopify 映射位于内容适配层。

## Outcome

本地 Trust/Policy 页面骨架已完成。新增 `/disclaimer`、`/product-care`、`/faq`、
`/accessibility` 及四个 locale 版本；`/returns` 页面标题统一为 Returns & Refunds。
所有页面仍是 draft，不含运营、护理或法律承诺，不进入 sitemap。未来需接入
Shopify Policies/Pages/Product metafields，并在 Q-003A–Q-003F 与商品护理事实
获批后补正式内容、页面级 metadata、发布状态和 sitemap。

---

# Shopify Commerce vertical slice

状态：Complete
负责人：Codex
最后更新：2026-08-25
关联：D-002、D-005、D-006、D-008、D-020、D-021、D-023、D-024、D-030、
D-031；Q-002A、Q-003A–Q-003F；`MVP_PRD.md` P-002/P-003/P-004

## Objective

让 US en-US 与 es-US storefront 从 Shopify Storefront API 读取真实 Product、
Variant、Price、Availability 和 Collection，并使用 Shopify Cart 完成 Bag 的创建、
恢复、增改删；Buy now 使用独立单商品 Cart；Checkout 始终刷新并使用 Shopify
托管的 `checkoutUrl`。浏览器不得接触 Storefront private token 或完整 Cart ID。

## Context

任务开始时 `src/lib/commerce/catalog.ts`、PDP 和 Cart 仍使用本地 mock；已有
`src/lib/commerce/shopify.ts` 只验证只读连接。2026-08-25 只读复核显示 Headless
channel 已有 1 个可售商品 `aquamarine-bracelet-9-mm`，但只有空的默认
`frontpage` Collection；token 没有读取具体库存数量的 scope。测试站仍全站
`noindex`，Q-003A–Q-003F 的政策和运营事实未批准。

## Scope

- 包含：Storefront Product/Variant/Collection query 和 mapper；明确 provider
  facade；当前 US market/language context；HttpOnly Cart cookie；Cart create/read/
  add/update/remove/recovery；独立 Buy-now Cart；最新 Checkout URL；真实 Cart UI、
  error/loading/empty 状态；metadata/sitemap 数据源迁移；测试和文档。
- 不包含：Admin API 写入、创建或发布 Shopify Collection、具体库存数量展示、
  Shopify webhook/cache invalidation、支付完成自动化、正式政策发布、启用索引、
  Canada Commerce、Customer Account 或自定义 Checkout。

## Decisions and assumptions

- Accepted：Shopify 是 Product、Variant、Price、Availability、Cart、Checkout 和
  Order 的唯一事实来源；US English/Spanish 共享同一 US Catalog 与 USD 交易上下文。
- Accepted：Bag Cart ID 仅保存在 `HttpOnly + SameSite=Lax` cookie 中；Buy now
  必须创建独立单商品 Cart，不读取、清空或改写 Bag。
- Temporary：缺少 `quantityAvailable` scope 时只使用 Shopify
  `availableForSale`，不显示“仅剩 X 件”或猜测库存。
- Temporary：`SHOPIFY_CHECKOUT_ENABLED` 是独立发布门禁。代码和合约可完成，
  但在 Q-003A–Q-003F 及 Shopify Checkout 运营验收前保持 `false`。
- Blocking：业务方需在 Shopify 创建、填充并发布至少一个真实 Collection；否则
  Collection adapter 和空状态可验收，但没有可展示的真实策展集合页。

## Milestones

1. [x] Shopify catalog query、mapper 和 provider facade 完成。
2. [x] Shopify Bag Cart 与 HttpOnly cookie 会话完成。
3. [x] Buy now 独立 Cart 与 Checkout 发布门禁完成。
4. [x] Product、Collection、Cart UI 和 SEO 数据源完成迁移。
5. [x] lint、typecheck、tests、build 与安全的 Shopify contract smoke 完成。

## Detailed approach

Catalog query 使用 `@inContext(country: US, language: ...)` 请求页面所需字段，先映射
为薄的 TypeScript 实体，再由 UI、metadata 和 sitemap 共用。`COMMERCE_PROVIDER`
明确选择 `shopify` 或 `mock`，Shopify 失败时展示错误而不静默回退到样本价格。
Catalog、Collection 与 Search 使用完整 cursor pagination；PDP 继续取回全部 Variant，且
PDP/Cart 的数量控件遵循 Shopify contextual `quantityRule`，并与已约定的 storefront
安全上限 99 取交集。

Cart mutation 全部 `no-store`。Server Action 读取并写入服务端 cookie，只把去除
Cart ID 和 Checkout URL 的安全 Cart view model 返回客户端；用户明确开始 Checkout
时，服务端再次查询 Cart 并返回经过 HTTPS/Shopify host 校验的最新 URL。过期 Cart
在下一次 Add 时创建新 Cart；非 Add 操作不静默丢失已知失败。Buyer traffic 在
Vercel 只转发平台保护且验证为 IP 的 `x-vercel-forwarded-for`；请求设 10 秒 timeout，
并区分 429/GraphQL/network failure。

## Validation

- Command：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
- Contract：以 mock fetch 覆盖 Product/Collection mapper、GraphQL/user error/
  warning、Cart 生命周期、过期恢复、Buy-now 独立性与 URL 验证；使用已配置的
  Storefront token 做不输出 token/Cart ID 的只读 catalog smoke。
- Manual observation：en-US/es-US Product、Collections、Bag 的初始/加载/空/错误
  状态；Variant 切换；数量增减与移除；Header count；Checkout 禁用说明。
- Commerce/Data：UI 与 Cart 金额/币种/availability 均来自 Shopify；Cart ID、token
  不进入客户端 payload、URL、日志或 analytics；Buy now 不影响 Bag。
- Rollback：将 `COMMERCE_PROVIDER` 恢复为 `mock` 可回到明确标注的开发样本；不对
  Shopify 商品、Cart 或订单做数据回滚。

## Progress log

- 2026-08-25：对齐上次会话状态；完成规范、代码、测试与实时 Storefront 只读审计。
  确认真实 Product 已发布、Collection 仍为空、inventory quantity scope 不可用，
  建立本执行计划并开始实施。
- 2026-08-25：完成 Shopify Product/Variant/Money/Image/SEO、非空 Collection 与
  Search mapper；`COMMERCE_PROVIDER=shopify` 成为项目默认，Shopify 失败不回退 mock。
- 2026-08-25：完成 US EN/ES context 的 Cart create/read/add/update/remove/clear、
  HttpOnly cookie、warning/error、过期 add recovery、最新 Checkout URL 与独立 Buy now
  Cart；release gate 默认关闭。
- 2026-08-25：Home、Catalog、PDP、Search、Bag、metadata 与 sitemap 移除运行时
  mock 依赖；实时 Commerce 页面在缓存陈旧窗口和 webhook 获批前使用 request-time
  Server Rendering + `no-store`，初始 HTML 保留完整商品和购买控件。
- 2026-08-25：完成全量 Catalog/Collection/Search/Variant cursor pagination、contextual
  quantity rule、同标签页 Cart 操作队列、Buy-now/Checkout 库存复查、严格 Checkout
  host allowlist、Buyer IP、timeout/rate-limit 分类和 EN/ES 安全错误。
- 2026-08-25：Product/Collection JSON-LD 与 canonical/metadata 共用 normalized entity，
  只随 index gate 输出；Cart/Search 永久 noindex，动态 sitemap 不依赖 build-time
  Shopify 可用性；noindex 页面仍允许 crawler 读取 robots meta。indexable/noindex
  两种 production build 和初始 HTML 均已检查。
- 2026-08-25：`pnpm install --frozen-lockfile`、lint、typecheck、107 项 tests 与
  production build 通过；live Storefront/Cart smoke 通过。库存冲突 smoke 返回
  `MERCHANDISE_NOT_ENOUGH_STOCK` 并保持可履约数量，随后测试 Cart 已清空；客户端
  bundle 与 build 输出未发现 private token。

## Risks

- Risk：空 Shopify Collection 使既有 Seven Chakras 导航失效。
  - Mitigation：运行时不引用 mock Collection；提供真实 Catalog/Collection 空状态，
    并把 Admin 发布 Collection 作为明确业务待办。
- Risk：Cart secret 泄露到 React state、日志或浏览器存储。
  - Mitigation：完整 Cart ID 只存在 HttpOnly cookie 和 server-only adapter，测试
    public Cart view model 不包含 `id` 或 `checkoutUrl`。
- Risk：政策未批准却开放真实付款入口。
  - Mitigation：独立 Checkout env gate 默认关闭；不因 provider 切换自动开放。
- Risk：单一 index gate 会同时开放所有已启用语言和可索引页面。
  - Mitigation：gate 默认关闭；只有 en-US、经人工审核的 es-US、真实商品内容与
    非空页面全部通过发布验收后才能开启，且正式 canonical origin 必须为非本地 HTTPS。
- Risk：Shopify 商品正文可独立于代码更新，未经复核的外部内容可能与价格或披露
  事实冲突。
  - Mitigation：最终实时复核确认早期 `$14` description 冲突已由 Shopify 更新解决；
    gate 仍保持关闭，业务方须审核当前正文与西语翻译后再发布。
- Risk：两个浏览器标签页在没有 Cart cookie 时同时首次 Add，仍可能各自 cartCreate，
  后完成的响应会成为当前 Bag。
  - Mitigation：同标签页请求已串行并防 stale response；跨标签并发需在 Playwright
    覆盖并决定是否接受，或在未来引入不扩大 PII 的协调机制。
- Risk：当前机器使用 Node 26.7.0，超出仓库固定的 Node 24 范围。
  - Mitigation：所有检查虽通过但持续显示 engine warning；CI/Vercel 必须按
    `.nvmrc` / `package.json#engines` 使用 Node 24 重新验收。
- Risk：Playwright/CI 尚未建立，无法在本次自动化真实浏览器的移动端和跨页 cookie
  交互。
  - Mitigation：完成 production 初始 HTML、真实 Storefront/Cart contract、服务端
    Action 与 mapper 测试；在打开 Checkout gate 前补核心 E2E。

## Outcome

US storefront 已切换为 Shopify Catalog 和 Cart 数据。当前可见的 Aquamarine 商品、
USD 35 contextual price、真实媒体和 availability 已进入 Home、Catalog、PDP、Search
与 Bag；旧七脉轮 mock 商品和 `$68` 不再作为 Shopify 运行时回退。Cart secret 仅在
HttpOnly cookie/server adapter，公开 Cart view model 不含 Cart ID 或常驻
`checkoutUrl`。Buy now 始终建立独立单商品 Cart，Bag Checkout 始终重取最新 URL。
PDP/Collection schema 受 index gate 保护，Cart/Search 无论发布开关如何都保持 noindex。

实现已完成但发布仍受业务门禁保护：Shopify 需创建并发布至少一个非空 Collection；
Q-003A–Q-003F、payment/guest checkout/branding/notification 等 Admin 验收完成后，
才可将 `SHOPIFY_CHECKOUT_ENABLED` 设为 `true`。当前全站继续 `noindex`，Spanish 商品
内容因 Shopify 未发布翻译而回退 English，Canada 继续 404。

---

# 商品类别与设计系列 URL 分离

状态：Complete
负责人：Codex
最后更新：2026-08-30
关联：D-002、D-007、D-009、D-013、D-023、D-024、D-036；
`COMMERCE_SPEC.md`、`CONTENT_SEO_GEO_SPEC.md`

## Objective

让顾客通过 `/shop` 浏览全部商品、通过 `/category/{handle}` 按商品形态购物，并通过
`/collections/{handle}` 进入具备独立叙事的原创设计系列；三者共用同一 Shopify
Product/Variant、价格和库存，同时保持唯一 canonical、清晰导航和可验证类型边界。

## Context

当前 storefront 只有 `/collections` 与 `/collections/{handle}`，Collections hub 同时
承担全部商品、后台 Collection 筛选和系列入口。Shopify Product mapper 尚未读取标准
Category，Collection mapper 也未读取 `custom.collection_kind`。2026-08-25 实时审计
显示 Headless channel 有一个商品但没有非空真实 Collection；全站仍由 noindex gate
保护。

## Scope

- 包含：Product Category 数据映射；Collection kind 数据映射；`/shop`、
  `/category/{handle}` 与收紧后的 `/collections/{handle}`；EN/ES 路由和文案；Header、
  Footer、Home、PDP 内链；metadata、canonical、hreflang、Schema、sitemap；测试和文档。
- 不包含：Admin API 写入、替业务方创建 Shopify Category/Metafield/Metaobject/
  Collection、筛选 UI、翻译 slug、Canada 路由、开放 index 或 Checkout gate、完整系列
  Campaign 内容模块。

## Decisions and assumptions

- Accepted：D-036 定义公开 URL 和事实来源边界。
- Accepted：只有 `custom.collection_kind=design_series` 的非空 Shopify Collection
  可出现在 `/collections` 和 `/collections/{handle}`。
- Temporary：首批可导航商品类别使用 Shopify 稳定 taxonomy ID 映射 Bracelets、
  Rings、Necklaces、Earrings；只显示至少有一个 Storefront-visible Product 的类别。
- Blocking：业务方仍需在 Shopify 给商品设置 Product Category，并创建 Design Series
  Metaobject、引用字段、Collection kind 与非空 automated Collection，真实系列页才会
  出现。

## Milestones

1. [x] Product Category 与 Collection kind 进入 normalized commerce entity。
2. [x] `/shop`、Category 和 Design Collection 页面及导航完成。
3. [x] SEO 路径、Schema、sitemap 与重复 URL 防护完成。
4. [x] 规格、后台配置说明和自动化验证完成。

## Detailed approach

在 commerce mapper 中读取 Shopify `Product.category` 和 Collection
`custom.collection_kind`；category config 只保存稳定 taxonomy ID、公开 handle 和本地化
展示文案，不复制商品归属。Category facade 从同一 normalized Product 集合按 taxonomy ID
筛选；当前 Catalog 较小，沿用已有完整 cursor pagination，达到可测量规模瓶颈后再评估
Shopify collection/search filter 查询。Design Collection facade 对 kind 做 fail-closed
过滤，未知或缺失类型不进入公开系列路由。

Shop hub 展示全部商品和真实非空类别；Collections hub 只列 Design Series。PDP breadcrumb
优先链接已支持的 Product Category，否则回到 Shop。所有 locale 通过现有 `localePath`
共享稳定 handle；filter/sort 参数不进入 sitemap。

## Validation

- Command：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
- Manual observation：EN/ES 的 `/shop`、非空 Category、Design Collection、PDP breadcrumb、
  Header/Mobile/Footer 链接和未知 handle 404。
- SEO/Commerce/Data：Category 与 Collection self-canonical；sitemap 不含空类别、普通
  Shopify Collection 或重复类别 URL；JSON-LD 路径与可见页面一致；价格、库存仍只来自
  normalized Shopify Product/Variant。
- Rollback：回退 route/UI commit，并按 D-036 保留已公开 URL 的 redirect/canonical
  迁移；不修改 Shopify 商品、库存或订单数据。

## Progress log

- 2026-08-30：业务方确认 `/category/bracelets` 与 `/collections/seven-chakra` 的双轴
  URL；完成规范、现有路由、Shopify API 能力和工作区审查，接受 D-036 并开始实施。
- 2026-08-30：Storefront Product mapper 增加标准 taxonomy Category，Collection
  mapper 增加 `custom.collection_kind`；新增 Shop/Category 页面，并将系列 facade
  收紧为仅接受 `design_series`。Header、Footer、Home、About、PDP breadcrumb 和 Cart
  空状态已迁移至新信息架构。
- 2026-08-30：Category/Collection metadata、EN/ES hreflang、CollectionPage/ItemList/
  BreadcrumbList、动态 sitemap 和类别旧地址 308 已完成。真实 Shopify 抽查确认
  `/shop`、`/category/bracelets` 为 200，`/collections/bracelets` 为 308，未标记的
  `/collections/frontpage` 为 404；mock 抽查确认 EN/ES Seven Chakra 系列 200，
  merchandising New Arrivals 404。
- 2026-08-30：默认 noindex/Shopify build 与临时 indexable/mock build 均通过；后者
  确认 canonical、双向 EN/ES alternate、JSON-LD 和 sitemap 只使用 `/shop`、
  `/category/bracelets` 与 `/collections/seven-chakra`，不含类别别名或 merchandising。
  最后已恢复默认 noindex/Shopify build。lint、typecheck、109 项 tests 与 production
  build 通过；本机 Node 26 仍触发项目要求 Node 24 的 engine warning。
- 2026-08-30：业务方确认数据驱动 Header：Shop 固定下拉；Design Collection 为 0 个
  时隐藏、1–2 个直接显示、3 个及以上合并为 Collections 下拉。桌面 disclosure 与移动
  accordion 已共用 Storefront 可见、非空的 Category/Design Collection 数据，并增加
  阈值单元测试；D-036、MVP 和 Design System 已同步。Header 的分类结构使用 5 分钟
  server-only 缓存，修复 production build 对每个页面重复请求 Shopify 的问题，不改变
  价格、库存、Cart 或 Checkout 的实时数据边界。
- 2026-08-30：Shop 桌面下拉改为 Header 下方全宽 disclosure，Shop 顶级文字只展开，
  Shop All 在面板内跳转；增加激活下划线、轻遮罩、hover/click/keyboard/Escape 和遮罩
  关闭。真实 Shopify 浏览器验收确认 1440px 面板贴合 Header、Bracelets 数据正确、遮罩
  点击不误触底层页面；390px 移动端继续使用全屏 Menu + accordion。
- 2026-08-30：根据视觉复核移除 Shop All 独立 overview 分区，改为 Shop All 与非空
  Category 在同一横向信息组平铺；恢复离开顶级入口和面板整体区域后的自动收起，并用
  120ms 缓冲避免穿越边界闪烁。Chrome 鼠标轨迹验收确认 hover 展开、进入面板保持、
  离开区域后关闭均符合预期。

## Risks

- Risk：Shopify 未配置 Category 或 collection kind 时导航为空或系列 404。
  - Mitigation：Shop 始终展示真实全部商品；Category/Collection 只按结构化数据开放，
    并记录明确 Admin 待办，不按标题或 tag 猜测。
- Risk：同一类别通过旧 Collection URL 和新 Category URL 重复。
  - Mitigation：Collection route fail-closed 到 `design_series`；已知旧类别 handle 统一
    redirect 到 `/category/*`。
- Risk：完整 Catalog 客户端外的服务端筛选随 SKU 数增长变慢。
  - Mitigation：沿用 server-only 全量 pagination；以真实性能和 Catalog 规模作为迁移到
    category-specific Shopify query 的触发条件。

## Outcome

商品类别与原创设计系列的公开 URL 已完成分离。`/shop` 展示同一 Shopify Catalog 的
全部商品；受支持且非空的标准 Product Category 生成 `/category/*`；只有显式
`custom.collection_kind=design_series` 的非空 Collection 才进入 `/collections/*`。
EN/ES 导航、PDP breadcrumb、metadata、Schema、sitemap 和类别旧地址重定向已一致。
Header 的 Shop 固定提供 Shop All 与非空 Category；Design Collection 按 0 个隐藏、
1–2 个直接展示、3 个及以上合并下拉的规则自适应。

代码不会代替业务方写入 Shopify。真实 Design Collection 仍需按
`docs/SHOPIFY_CATALOG_SETUP.md` 创建 Metaobject/reference、设置 collection kind、填充
商品并发布到 Headless channel；完成前 Collections hub 正确显示空状态。全站 index
gate 与 Checkout gate 均未改变。
