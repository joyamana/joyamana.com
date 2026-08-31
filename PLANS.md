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

# Trust、Policy 与 Product Care 本地页面骨架（历史）

状态：Complete
当前适用性：Historical — 后续实现已被 D-035、D-039 与 D-042 取代
负责人：Codex  
最后更新：2026-09-01
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

Post-completion note（2026-08-31）：上述 Outcome 保留为 2026-08-14 的实施证据，
不再表示当前运行时。D-035 后 Canada 路由不生成并返回 404；D-039 已删除
FAQ、Disclaimer 和独立 Product Care 页面；D-042 已删除本地 Trust/
Policy 正文和 fallback。当前 Shipping/Returns/Privacy/Terms 只读 Shopify
Policies，About/Accessibility 只读 `content_page` Metaobject；缺失或异常时 fail
closed。

---

# Shopify Commerce vertical slice

状态：Complete
负责人：Codex
最后更新：2026-08-31
关联：D-002、D-005、D-006、D-008、D-020、D-021、D-023、D-024、D-030、
D-031；Q-002A、Q-002C、Q-003A–Q-003F；`MVP_PRD.md` P-002/P-003/P-004

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
- 不包含：Admin API 写入、创建或发布 Shopify Collection、使用库存数量制造稀缺文案、
  Shopify webhook/cache invalidation、支付完成自动化、正式政策发布、启用索引、
  Canada Commerce、Customer Account 或自定义 Checkout。

## Decisions and assumptions

- Accepted：Shopify 是 Product、Variant、Price、Availability、Cart、Checkout 和
  Order 的唯一事实来源；US English/Spanish 共享同一 US Catalog 与 USD 交易上下文。
- Accepted：Bag Cart ID 仅保存在 `HttpOnly + SameSite=Lax` cookie 中；Buy now
  必须创建独立单商品 Cart，不读取、清空或改写 Bag。
- Resolved：2026-08-31 已可读 `quantityAvailable` 与 `currentlyNotInStock`。PDP/
  Bag 用它们和 contextual `quantityRule` 限制可选数量。2026-09-01 业务方进一步批准
  PDP 的准确低库存披露：只对明确 `standard` / `natural_variation` 模型、非 oversell、
  步进为 1 且准确数量为 1–3 的所选 Variant 显示；One-Of-A-Kind 和未知模型排除。
  当 `currentlyNotInStock=true` 或 Shopify 不返回精确数量时，不把 `null`
  误判为 0；Cart warning/user error 和 Checkout 仍是并发变化的最终裁决。
- Temporary：`SHOPIFY_CHECKOUT_ENABLED` 是独立发布门禁。代码和合约可完成，
  但在 Q-003A–Q-003F 及 Shopify Checkout 运营验收前，未获批公开部署保持
  `false`；受保护 local/Preview 可按 Runbook 临时启用完成 E2E。
- Blocking：若首发包含设计系列，业务方需创建、填充并发布至少一个非空
  `collection_kind=design_series` Collection，并完成 `custom.design_series` reference/
  story 链路；否则 Collection adapter 和空状态可验收，但不能发布设计系列页。

## Milestones

1. [x] Shopify catalog query、mapper 和 provider facade 完成。
2. [x] Shopify Bag Cart 与 HttpOnly cookie 会话完成。
3. [x] Buy now 独立 Cart 与 Checkout 发布门禁完成。
4. [x] Product、Collection、Cart UI 和 SEO 数据源完成迁移。
5. [x] lint、typecheck、tests、build 与安全的 Shopify contract smoke 完成。

## Detailed approach

Catalog query 使用 `@inContext(country: US, language: ...)` 请求页面所需字段，先映射
为薄的 TypeScript 实体，再由 UI、metadata 和 sitemap 共用。运行时只支持 Shopify，
Shopify 失败时展示错误而不静默回退到本地样本。
Catalog、Collection 与 Search 使用完整 cursor pagination；PDP 继续取回全部 Variant，且
PDP/Cart 的数量控件遵循 Shopify contextual `quantityRule`，并与已约定的 storefront
安全上限 99 取交集；对不允许继续销售且数量已知的 Variant，还与
`quantityAvailable` 取交集。

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
- Rollback：通过代码版本回滚 adapter；不恢复本地 Commerce provider，也不对
  Shopify 商品、Cart 或订单做数据回滚。

## Progress log

- 2026-08-25：对齐上次会话状态；完成规范、代码、测试与实时 Storefront 只读审计。
  确认 Headless-visible 测试 Product 已发布、Collection 仍为空、inventory quantity scope 不可用，
  建立本执行计划并开始实施。
- 2026-08-25：完成 Shopify Product/Variant/Money/Image/SEO、非空 Collection 与
  Search mapper；`COMMERCE_PROVIDER=shopify` 成为项目默认，Shopify 失败不回退 mock。
- 2026-08-30：移除 `COMMERCE_PROVIDER`、本地 mock catalog 与本地内容正文 fallback；
  Catalog、Cart、About、Policy、Accessibility 和 Editorial 运行时统一 Shopify-only，
  上游缺失或异常时 fail closed。
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
- 2026-08-31：Storefront scope 已返回 `quantityAvailable` 与
  `currentlyNotInStock`；normalized Product/Cart line、PDP、Bag 和数量工具统一使用
  Shopify 库存上限，并保留 continue-selling/null 语义。本轮文档同步前，
  lint、typecheck 与 147 项 Vitest 在 Node 26.7.0 上通过；因超出项目固定的
  Node 24 范围，仍需在 Node 24/CI 重验。
- 2026-09-01：映射 Product `custom.product_model`，增加严格 fail-closed 的 PDP
  `Only X left`（阈值 3），并以 180 项 Vitest、lint、typecheck 和 production build
  完成验证。正式商品仍需由运营在 Shopify 填充模型字段。
- 2026-09-01：PDP 改读并安全渲染 Shopify `descriptionHtml`，保留标题、段落、列表、
  链接、强调和表格等语义格式；纯文本 `description` 继续服务 metadata/Schema 和后备。
- 2026-09-01：按 D-045 增加部署级索引总开关，以及 `src/config/indexing.ts` 中
  en-US/es-US + 四页面组的版本控制门禁，未知路径 fail closed；按 D-046 后置 webhook
  并接受内容/导航 5 分钟窗口。六个细分索引环境变量已移除，preflight、metadata、
  sitemap、hreflang、Schema 和文档已同步；当前为 29 个测试文件、181 项 Vitest。

## Risks

- Risk：没有合格 `design_series` 时系列入口会隐藏且 Collections 显示空状态；若
  首发 scope 承诺设计系列，这会阻塞发布。
  - Mitigation：运行时不引用 mock Collection；只有业务方创建非空 Design Collection
    并完成 kind/reference/story 链路后才公开系列入口。
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
    公开 index gate 必须保持关闭，业务方须审核当前正文与西语翻译后再发布。
- Risk：两个浏览器标签页在没有 Cart cookie 时同时首次 Add，仍可能各自 cartCreate，
  后完成的响应会成为当前 Bag。
  - Mitigation：同标签页请求已串行并防 stale response；当前用人工双标签复现并记录
    是否接受。若此路径频繁回归或客户端状态复杂度增加，按 D-043 重新评估 Playwright，
    或在未来引入不扩大 PII 的协调机制。
- Risk：当前机器使用 Node 26.7.0，超出仓库固定的 Node 24 范围。
  - Mitigation：所有检查虽通过但持续显示 engine warning；CI/Vercel 必须按
    `.nvmrc` / `package.json#engines` 使用 Node 24 重新验收。
- Risk：Playwright 按 D-043 暂缓且 CI 尚未建立，无法自动化验证真实浏览器的移动端、
  跨页 cookie 和支付交互。
  - Mitigation：完成 production 初始 HTML、真实 Storefront/Cart contract、服务端
    Action 与 mapper 测试；在打开 Checkout gate 前执行并记录人工浏览器/Checkout
    smoke，不把该证据写成自动化 E2E。

## Outcome

US storefront 已切换为 Shopify Catalog 和 Cart 数据。2026-08-25 验证时可见的
Aquamarine 测试商品、当时的 Shopify contextual price、媒体和 availability 已进入 Home、Catalog、PDP、Search
与 Bag；旧七脉轮 mock 商品和 `$68` 不再作为 Shopify 运行时回退。Cart secret 仅在
HttpOnly cookie/server adapter，公开 Cart view model 不含 Cart ID 或常驻
`checkoutUrl`。Buy now 始终建立独立单商品 Cart，Bag Checkout 始终重取最新 URL。
PDP/Collection schema 受 index gate 保护，Cart/Search 无论发布开关如何都保持 noindex。

实现已完成但发布仍受业务门禁保护：若首发包含设计系列，Shopify 需创建并发布非空、
标记为 `design_series` 且完成 reference/story 链路的 Collection；
Q-003A–Q-003F、payment/guest checkout/branding/notification 等 Admin 验收完成后，
才可在公开部署将 `SHOPIFY_CHECKOUT_ENABLED` 设为 `true`。仓库默认继续全站
`noindex`，Spanish 商品内容因 Shopify 未发布翻译而回退 English，Canada 继续 404；
各 local/Preview/Production 环境值仍须分别验收。
已知且不允许继续销售的库存数量会约束 PDP 与 Bag 数量。后续于 2026-09-01 获批的
准确低库存披露只在 PDP、明确 repeatable 模型和严格可靠性条件下显示 1–3 件；商品卡、
One-Of-A-Kind、未知模型及 continue-selling Variant 均不显示。

---

# 商品类别与设计系列 URL 分离

状态：Complete
负责人：Codex
最后更新：2026-08-31
关联：D-002、D-007、D-009、D-013、D-023、D-024、D-036；
`COMMERCE_SPEC.md`、`CONTENT_SEO_GEO_SPEC.md`

## Objective

让顾客通过 `/shop` 浏览全部商品、通过 `/category/{handle}` 按商品形态购物，并通过
`/collections/{handle}` 进入具备独立叙事的原创设计系列；三者共用同一 Shopify
Product/Variant、价格和库存，同时保持唯一 canonical、清晰导航和可验证类型边界。

## Context

本任务开始时 storefront 只有 `/collections` 与 `/collections/{handle}`，Collections hub 同时
承担全部商品、后台 Collection 筛选和系列入口。Shopify Product mapper 尚未读取标准
Category，Collection mapper 也未读取 `custom.collection_kind`。2026-08-25 实时审计
显示 Headless channel 有一个测试商品但没有非空 Collection；全站仍由 noindex gate
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
  Rings、Necklaces、Earrings、Gemstones；只显示至少有一个 Storefront-visible Product
  的类别。
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
- 2026-08-31：Category allowlist 增加 Shopify Gemstones taxonomy；本地 mock
  Catalog 移除后，所有 Category/Collection 验证继续以 Shopify response 或测试中的
  mock fetch 为输入。现有旧类别重定向覆盖 Bracelets、Rings、Necklaces 和
  Earrings；Gemstones 尚无已发布的旧 Collection URL 迁移记录。

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

代码不会代替业务方写入 Shopify。Post-completion update（2026-08-31）：业务方已在
Shopify 发布非空 `Patron Saint` Collection，并设置
`custom.collection_kind=design_series`；它已进入 Header、Collections hub 和详情页。
仍需按 `docs/SHOPIFY_CATALOG_SETUP.md` 补全 description/SEO、Design Series
Metaobject/reference 与 story/lookbook。Post-completion update（2026-09-01）：索引已按
D-045 拆分为部署级总开关与仓库内语言/页面组门禁；Checkout gate 未改变。

---

# Shopify 内容接入与运行时单一事实来源

状态：Complete
负责人：Codex
最后更新：2026-08-31
关联：D-009、D-021、D-022、D-023、D-037–D-042；Q-003A–Q-003F；
`MVP_PRD.md` P-005/P-006/P-007

## Objective

让品牌、编辑和 Policy 页面从 Shopify 的唯一内容事实来源生成初始 HTML、
metadata、可适用 Schema 与 sitemap 候选路径，并删除会在上游缺失时伪装成
正式内容的本地正文 fallback。

## Context

2026-08-30 前，Policy、About、Accessibility、Blog 与 Crystal Guide 仍混有本地
prototype 正文或样本 entity。Shopify 已提供 Policies、`content_page`
Metaobject 与两个原生 Blog，但正式内容、西语翻译和政策批准尚不完整。
仓库示例值及未配置时的代码默认值继续关闭全站 index 与 Checkout gate；各部署
环境仍需单独核验。

## Scope

- 包含：Shopify Policy mapper 与 HTML allowlist；About root/direct-child tree；
  Accessibility `content_page`；Blog/Crystal Guide Article；内容 metadata、Schema、
  sitemap 和翻译 fallback 门禁；Contact Server Action/Resend 可关闭薄适配；
  删除运行时 mock Catalog 与本地业务正文。
- 不包含：代替业务方在 Shopify Admin 发布内容或翻译、政策/
  claims 批准、Resend 生产开通、Customer Privacy API、Analytics/consent、
  webhook、开放索引或 Checkout。

## Decisions and assumptions

- Accepted：Shopify 是商品与 MVP 业务内容的唯一运行时事实来源；缺失或
  异常时 fail closed（D-009、D-041、D-042）。
- Accepted：FAQ、Disclaimer 和独立 Product Care 页面当前不存在（D-039）。
- Current：`info@joyamana.com` 已确认可以收信，当前正式范围为 Email-only；表单、
  Resend 与滥用防护后置并保持关闭。负责人/备援、外发认证和服务流程仍待验收（D-038）。
- Blocking：Shopify 当前内容只是部分可用，且不等于业务、翻译或法律批准。

## Milestones

1. [x] Refund/Privacy/Shipping/Terms 从 Shopify Policies 安全读取。
2. [x] About hub 与 direct-child 页面及 Accessibility 改用 `content_page`。
3. [x] `/blog` 与 `/crystals` 改用 Shopify Blog/Article。
4. [x] Contact 投递边界、Email-only 降级与 PII 校验完成。
5. [x] 本地 mock provider/业务正文 fallback 删除，失败状态收紧。
6. [x] 文档、测试与发布门禁同步。

## Detailed approach

内容 adapter 在服务端向 Shopify 发起带 US language context 的查询，把原始响应
映射为薄的 typed entity。Rich text/Policy HTML 经 allowlist 清理后才渲染。西语
请求如命中 Shopify 默认英语 fallback，页面仍可阅读，但不输出可索引
metadata/Schema，也不进入该 locale 的 sitemap/hreflang。不完整或未被 root
引用的 About child 返回 404。

Contact Server Action 只接收回复当次请求所需字段，不创建 Customer、订单或
营销订阅，不记录正文/PII。`CONTACT_FORM_ENABLED=false` 或缺少密钥时只展示
`info@joyamana.com`。

## Validation

- Command：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
- Contract：Vitest 已覆盖 Policy/About/Content Page/Editorial 的 GraphQL 映射、HTML
  清理、adapter 缺失/无效、西语 fallback、published paths、About render、通用 SEO/
  structured-data builder 与 Contact 投递；通用 Shopify client tests 另覆盖 GraphQL/
  protocol error，不等于每个内容 adapter 的 network/timeout 分支都有直接测试。
- Remaining test gaps：`about-metadata.ts`、`editorial-metadata.ts`、各 Policy/
  Accessibility `generateMetadata` 与 Editorial detail fallback Schema gate 尚无直接
  测试；不能把通用 helper 覆盖写成所有 route metadata/Schema 已验收。
- SEO/Data：全站 noindex 时 sitemap 为空且不输出 JSON-LD；正文和索引资格来自同一
  Shopify entity。Policy 的本地化 metadata copy 是代码常量，只用 entity 状态控制
  index eligibility；默认语言 fallback 不进入 published paths。
- Current evidence：2026-08-31 在 Node 26.7.0 上 lint、typecheck、21 files / 147 项
  Vitest 与 production build 通过；本机超出项目固定的 Node 24 范围，仍需在
  Node 24/CI 重验。首次受限网络 build 因 Google Fonts 无法下载而失败，允许网络后
  同一 build 通过。

## Progress log

- 2026-08-30：Refund 与 Privacy 读取、清理、翻译识别和索引门禁完成；
  Shipping/Terms 在上游缺失时显示暂不可用。
- 2026-08-30：公开邮箱统一为 `info@joyamana.com`；Contact Server Action、可关闭
  Resend adapter、表单校验和 Email-only 降级完成。
- 2026-08-30：About root/child tree、共享页内导航、独立 metadata/Schema 和
  Accessibility 读取完成。
- 2026-08-30：Blog/Crystal Guide 与首页推荐改读 Shopify Article，本地
  prototype entries 删除。
- 2026-08-31：删除最后的 mock Catalog、Trust Page 和正文 fallback；运行时
  统一 Shopify-only，商品缺图只显示中性不可用状态。

## Risks

- Risk：已发布测试文章或政策正文被误当成已审批生产内容。
  - Mitigation：仓库默认关闭 index gate；各部署环境核验，内容与 Policy 仍需
    业务/claims/法律验收。
- Risk：5 分钟内容/导航缓存在没有 webhook 时延迟发布或下线。
  - Mitigation：公开发布前完成 HMAC webhook/cache invalidation，或书面接受明确的
    陈旧窗口，并在保持 noindex 的受控环境验收。
- Risk：未来启用 Contact 表单会将客户 PII 交给外部供应商。
  - Mitigation：当前 Email-only 且默认关闭表单；未来重新批准后才完成数据边界、
    保留期、域验证与滥用防护。

## Outcome

当前 storefront 已无本地业务数据后备路径。Shopify 可用时输出规范化内容；
缺失或异常时返回 404、空状态或暂不可用，不显示旧工作文案。这个计划的
代码边界已完成。Post-completion update（2026-08-31）：Shipping/Returns、About EN/ES、
Terms 占位符、guidebook 与 Contact inbox 已获业务确认；Contact 表单明确后置。正式
Article/Crystal Guide 内容、Commerce 西语翻译、剩余法律/税务复核、隐私选择入口、
发布门禁仍是上线工作，不由 `Complete` 状态自动批准。Post-completion update
（2026-09-01）：webhook 按 D-046 后置，不再作为当前上线工作。

---

# 2026-08-31 文档与实施状态同步

状态：Complete
负责人：Codex
最后更新：2026-08-31
关联：D-035–D-042；`ROADMAP.md` Phase 1–4；`OPEN_QUESTIONS.md`

## Objective

让所有现行项目文档以 2026-08-31 的仓库实现为共同基线，明确区分已实现技术切片、
历史证据、deployment-specific 配置、未批准业务输入和发布 blocker，使后续会话不再
依据 Phase 1、本地 mock、四 locale 或已完成全部 Commerce 等过期陈述工作。

## Context

代码已从早期本地原型演进为 Shopify-only Commerce 与 Shopify-backed 内容 adapter，
但文档仍分散保留旧商品、旧路由、旧测试数和拟议工具链。索引、Checkout 与 Contact
是独立发布门禁；仓库默认值不能代表任一 local/Preview/Production 的实际环境值。

## Scope

- 包含：`README.md`、`AGENTS.md`、全部现行项目规格/输入/决策/Runbook、既有
  Execution Plans、`.env.example` 注释，以及它们之间的状态、引用和术语一致性。
- 不包含：修改 runtime 代码、替业务方批准商品/政策/品牌资产、改变 Accepted 架构、
  启用任何发布门禁或写入 Shopify/Vercel。
- 历史保留：`docs/archive/` 不作为当前事实来源，不改写；`docs/REFERENCES.md` 已检查
  其用途说明，但没有重新联网核验官方资料，因此不伪造新的 `Last verified` 日期。

## Decisions and assumptions

- 当前事实以代码、tracked 配置、测试输出和有日期的 Shopify 审计为证据。
- 个人/部署环境值不写入文档；只记录仓库示例与未配置时的默认行为，并要求逐环境验收。
- Accepted 决策保留历史原文；后续决定通过 amended/superseded/maintenance note 收口。
- 测试店商品与内容只证明数据链路，不自动成为获批 production assortment 或正文。

## Milestones

1. [x] 盘点当前路由、Shopify adapter、缓存、Schema、门禁、工具链和验证能力。
2. [x] 更新全部需要变化的现行 Markdown，并同步 `AGENTS.md`、`PLANS.md` 与环境说明。
3. [x] 交叉审校 Commerce、Content/SEO、国际化、发布顺序和历史计划边界。
4. [x] 验证 Markdown、lint、typecheck、Vitest 与 production build。

## Detailed approach

现行文档统一采用“核心技术切片完成、生产退出条件未完成”的阶段口径；动态价格、
库存、政策和测试商品不复制为长期批准事实。实现缺口集中回写 Roadmap、Open Questions
和 Launch Runbook，包括 Product knowledge/model、Search metadata、参数级 noindex、
Policy/Accessibility hreflang、document-level Spanish lang、Schema、Header cache、
Analytics/consent、webhook、CI、按 D-043 暂缓的 Playwright，以及受控
Checkout/Contact 验收。

## Validation

- `git diff --check`：通过。
- 19 份现行 Markdown 的显式相对链接检查：全部解析到存在文件。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm test`：21 files / 147 tests 通过。
- `pnpm build`：通过。首次受限网络执行只因 Google Fonts 无法下载而失败；允许网络后
  同一 production build 成功。
- 环境边界：上述 pnpm 命令运行于 Node 26.7.0，触发项目要求 `>=24 <25` 的 engine
  warning；仍需在 Node 24 与未来 CI 重验，不能写成 CI/Preview/browser/payment E2E。

## Progress log

- 2026-08-31：完成实现/文档/Git/验证证据盘点并建立跨领域同步清单。
- 2026-08-31：更新 18 份现行 Markdown 与 `.env.example`；保留 References 的旧核验
  日期和 archive 历史原文。
- 2026-08-31：三轮实现对照和交叉审校后，修正门禁时态、Product model、内容错误行为、
  缓存边界、发布顺序、参数索引与跨语言 hreflang 等过度声明。
- 2026-08-31：完成链接、diff、lint、typecheck、147 项 Vitest 和 production build 验证。
- 2026-08-31：业务方确认品牌为 Joya Mana，`www.joyamana.com` 已指向 Vercel、
  `checkout.joyamana.com` 已指向 Shopify Online Store，Production 已公开但下单支付等
  功能未完整支持；建立并切换本地 `dev` 分支用于后续 Vercel Preview。
- 2026-08-31：外部检查确认两个域名均返回 HTTP 200；Production 仍 noindex、sitemap
  为空且首页 `og:url` 仍为 Vercel 默认域名。按 D-043 封存 Playwright，当前使用有记录
  的人工浏览器/Checkout smoke，复杂度触发后再评估。

## Risks

- Risk：文档状态被误读为 production ready。
  - Mitigation：所有状态页同时列明业务审批、翻译、外部账号、E2E 和发布门禁缺口。
- Risk：历史计划的“Complete”被误作当前架构。
  - Mitigation：保留历史 Outcome 作为日期化证据，并增加 superseded/post-completion note。
- Risk：动态 Shopify 或 deployment 配置在文档提交后变化。
  - Mitigation：不复制 secret/环境值；发布前按 Runbook 重新审计 Shopify 与每个 deployment。

## Outcome

当前项目文档已与 2026-08-31 仓库进展对齐：Shopify-only 数据边界、US EN/ES 与
planned CA、Catalog/Cart 核心切片、Shopify 内容接入、独立门禁和生产 blocker 使用
一致口径。未改 runtime 代码、外部系统或发布状态；下一阶段可直接从 Roadmap 与
Open Questions 中的真实缺口继续，而无需依赖旧 Phase 1 或 mock 假设。

Post-completion note（2026-08-31）：随后 Production 与正式域名已由业务方配置并公开，
因此本计划原 Outcome 中“未改外部系统或发布状态”只描述该轮文档同步当时的范围，
不再代表当前部署状态。D-044 随后确认 `www` canonical 与 apex 308；索引、
Checkout/payment、政策、翻译、Analytics/consent 和发布验收仍待完成。

---

# Execution Plan — SEO/i18n、Header resilience 与 env preflight（2026-08-31）

Status: Complete
Owner: Engineering

## Goal

在不启用索引、Checkout、Contact 或 Playwright 的前提下，修复参数页索引保护、
document-level locale、Policy/Accessibility hreflang、Search metadata、Header
上游故障/缓存字段和部署环境 preflight，并使文档与运行时证据同步。

## Scope

- 包含：当前 en-US/es-US 可索引路由 metadata、root document layout、服务页
  translation readiness、Header navigation Shopify query/projection、Locale shell
  降级、构建前环境校验、测试和现行文档。
- 不包含：Commerce Product/Collection Spanish fallback 检测、开启 index gate、
  Shopify payment/政策配置、Vercel deploy/push、Analytics/consent 或 Playwright。

## Decisions and assumptions

- D-044：Production canonical origin 为 `https://www.joyamana.com`；apex 308 至 `www`。
- 参数 URL 保留 clean canonical，但强制 noindex/noarchive 并移除 hreflang。
- Policy/Accessibility 只有真实本地化正文才参与该语言的 alternate。
- Header 故障只降级动态 taxonomy/series 链接，不恢复本地 Catalog。
- Vercel Production/Preview 在 build 前 fail closed；错误只包含变量名，不输出 secret。

## Milestones

1. [x] 修复参数 metadata、en-US/es-US root document lang、服务页 hreflang 和 Search 文案。
2. [x] 建立 Header 专用最小 Shopify queries，并在上游失败时保留基础导航和页面主体。
3. [x] 新增 `pnpm preflight` 并接入 `prebuild`，校验 canonical、Preview、Shopify 与门禁 secret。
4. [x] 增加 metadata、Header projection/failure 和 preflight tests。
5. [x] 完成默认 noindex build、diff/文档一致性与最终工作树核对。

## Validation

- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm test`：24 files / 157 tests 通过。
- `pnpm build`：默认 noindex build 通过；首次受限网络执行只因现有 Google Fonts 下载
  失败，允许网络后通过。
- 临时 indexable production build：通过；初始 HTML 验证 clean `/shop` 为 index/follow、
  `?sort=price&utm_source=test` 为 noindex/noarchive、canonical 均为 `www` clean URL且参数页
  无 hreflang；`/es-us` 输出 `<html lang="es-US">`。
- 外部域名：apex 返回 308 至 `https://www.joyamana.com/`，`www` 返回 Vercel 200；
  post-completion 复核已确认部署版本的 canonical 与 OG 使用 `www` origin。
- 环境边界：验证运行于 Node 26.7.0，仍有项目要求 Node 24 的 engine warning；不能写成
  CI、Preview、Production redeploy 或支付 E2E 已通过。

## Risks

- Risk：多 root layout 使跨语言导航执行完整文档加载。
  - Mitigation：语言切换频率低，换取初始 HTML document locale 正确；build 和本地
    production HTML 已验证。
- Risk：Header 降级会暂时隐藏动态类别/系列。
  - Mitigation：保留 Shop all/Search/Bag/语言入口和页面主体；不以陈旧商业数据兜底。
- Risk：未来 deployment 的环境值漂移会再次输出错误 origin。
  - Mitigation：preflight 对 Production build 强制 `www`，每次 deploy 后按 Runbook
    外部复核 canonical/OG；当前 deployment 已复核正确。

## Outcome

7 项指定问题均已完成：可索引 clean URL 与参数 noindex 分离，en-US/es-US 输出正确
document lang，Policy/Accessibility hreflang 按真实翻译过滤，Search metadata 与
Product-only 运行时一致，Header 使用最小字段并可安全降级，Vercel build 前执行
不泄露 secret 的环境 preflight。默认生成物已恢复为 noindex；没有启用任何发布门禁、
修改 Shopify 数据、推送 `dev` 或部署 Vercel。

---

# Execution Plan — 业务确认同步与 PDP Policy 文案（2026-09-01）

Status: Complete
Owner: Engineering

## Goal

把 Design Collection、Policy/About、客服邮箱、guidebook 与测试文章的最新业务确认
同步到现行文档，并移除 PDP 仍把已确认 Shipping/Returns 写成 pending 的旧文案。

## Scope

- 包含：`AGENTS.md`、根级说明、现行 `docs/`、本计划、环境变量注释、PDP 与禁用
  Checkout 提示、对应 unit tests。
- 不包含：修改 Shopify/Vercel 配置、处理暂缓的 Blog/Crystal Guide 测试内容、实现
  Policy Schema、Customer Privacy consent、Collection metadata fallback、细粒度 index
  gate 或 webhook/cache invalidation。

## Decisions and assumptions

- `Patron Saint` 已非空、Headless 可见并设置 `collection_kind=design_series`；系列
  description/SEO、Metaobject/reference 与 story/lookbook 仍未完成。
- Shipping/Returns 运营承诺、About EN/ES、Founder 事实、每件商品随附 guidebook 已确认。
- Terms 后台占位符已修复；直接 Storefront API 与 2026-09-01 公开 Production HTML
  均已复核不再返回占位符。
- `info@joyamana.com` 可以收信；当前正式客服范围为 Email-only，表单后置。
- 两篇测试 Article 因没有正式替代内容而暂缓，不得在开启索引时进入 sitemap。

## Milestones

1. [x] 核对 Shopify/Production 当前状态和代码行为。
2. [x] 更新 PDP Shipping/Returns 摘要与 Checkout disabled 提示，增加 EN/ES 测试。
3. [x] 同步现行决策、输入、规格、Roadmap、Runbook、Open Questions 与仓库指令。
4. [x] 完成 lint、typecheck、unit tests、production build 与 diff 一致性检查。

## Validation

- `git diff --check`：通过。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm test`：26 files / 161 tests 通过，其中新增 PDP Policy copy tests 2 项。
- `pnpm build`：preflight 与 production build 通过；首次受限网络执行仅因现有 Google
  Fonts 下载失败，允许网络后通过。
- Production Terms：2026-09-01 公开 HTML 不含地址/电话占位符，`og:url` 使用
  `https://www.joyamana.com/terms`。
- 环境说明：检查运行于 Node 26.7.0，pnpm 持续提示项目要求 Node `>=24 <25`；仍需
  在 CI/Node 24 环境重验，且本轮没有修改 Shopify/Vercel、启用索引/Checkout 或部署。

## Risks

- Risk：Shopify 内容缓存使已修复 Terms 在公开页面短时显示旧版本。
  - Mitigation：直接 Storefront API 已验证；按 D-046 公开验收固定等待 5 分钟窗口。
- Risk：把测试 Article 的“暂缓”误写成可以被索引。
  - Mitigation：索引总门禁与 Editorial 子门禁保持关闭；D-045 持续排除未正式发布内容。
- Risk：把 Collection 基础门禁完成误写成完整系列体验完成。
  - Mitigation：文档分别列明 description/SEO、Metaobject/reference 和 story/lookbook 缺口。
