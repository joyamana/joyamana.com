# Decision Log

Status: Active  
Owner: Project owner  
Last updated: 2026-08-31

本文件是项目决策的唯一权威记录。`Accepted` 才是已批准约束；`Proposed` 是
可撤销默认值；`Pending` 不得被实现为已确认事实。

## 状态定义

- `Accepted`：已从现有主干文档确认或由业务方批准。
- `Working`：获准用于测试站/MVP 原型的可替换假设，不是最终外部事实。
- `Proposed`：为了继续规划给出的推荐默认值，等待业务方确认。
- `Pending`：没有安全默认值，实施前必须回答。
- `Superseded`：已被更新决策替代，保留追溯。
- `Rejected`：已明确不采用。

## 决策索引

| ID | 主题 | 状态 | 结论 |
|---|---|---|---|
| D-001 | 商业模式 | Accepted | Brand + Content + Commerce |
| D-002 | Commerce | Accepted | Shopify，不自建商城 |
| D-003 | Frontend | Accepted | Next.js App Router，废止 Hydrogen |
| D-004 | Deployment | Accepted | Vercel，废止 Oxygen |
| D-005 | Backend boundary | Accepted | 不建独立业务后端 |
| D-006 | Launch market | Accepted | US / USD；同一 US Catalog 支持 en-US 与 es-US |
| D-007 | URL | Accepted | en-US 使用根路径，es-US 使用 `/es-us/` |
| D-008 | Customer entry | Accepted | 游客结账，不强制账户 |
| D-009 | Content source | Accepted | MVP 使用 Shopify 原生内容能力 |
| D-010 | Customer account | Accepted | 自定义账户门户不进入 MVP |
| D-011 | Custom Crystal | Accepted | 不进入 MVP，后续单独验证 |
| D-012 | Advertising | Accepted | 不使用 AdSense |
| D-013 | Rendering | Accepted | 索引页输出服务端/预渲染完整 HTML |
| D-014 | Future markets | Accepted | Global-ready internals, enabled-market-only URLs |
| D-015 | Blog naming | Accepted | URL 与 UI 统一使用 Blog，不使用 Journal |
| D-016 | AI crawler policy | Pending | 搜索/用户触发与训练 crawler 分开决定 |
| D-017 | Prototype UI | Working | CSS Modules/global CSS + CSS variables，无 UI kit |
| D-018 | Toolchain | Working | pnpm + Node LTS target + 固定版本 |
| D-019 | Brand name | Accepted | 品牌名称为 Joya Mana；定位与视觉输入继续集中配置 |
| D-020 | Catalog model | Accepted | 标准商品 + 天然独件 |
| D-021 | Policy gate | Accepted | 未确认政策不发布、不进 Schema |
| D-022 | Content governance | Accepted | 人工审批、AI 非事实来源 |
| D-023 | Prototype | Accepted | 可继续初始化全站 noindex 测试站 |
| D-024 | Market model | Accepted | Market、Language、URL、Currency 分离 |
| D-025 | Prototype product | Superseded | 仅本地运行时样本由 D-042 取代；正式 assortment 转 Q-002C |
| D-026 | Canada prototype | Superseded | 曾启用 CA 测试路由；由 D-035 取代 |
| D-027 | Global selector | Accepted | 当前不建 Global Site，保留低成本选择页扩展 |
| D-028 | Header navigation v1 | Superseded | 地区与语言合并入口 |
| D-029 | Header navigation | Accepted | Header 只切当前 Market 语言；目录导航已由 D-036 修订 |
| D-030 | PDP layout and actions | Accepted | 桌面 50/50；Add to bag 主 CTA + Buy now 次 CTA |
| D-031 | Variant selector | Accepted | 左侧款式名，右侧当前 Market 的价格 |
| D-032 | Header utility actions | Accepted | Search/Bag 使用图标；英文 Cart 改为 Bag |
| D-033 | Header and content hubs | Accepted | 移除 New；Guide 资料目录；Blog 编辑层级 |
| D-034 | Mobile nav and About | Accepted | 全屏移动 Menu；统一工具样式；About 品牌立场页 |
| D-035 | Phase-one market visibility | Accepted | 第一阶段只显示 US；Canada 保留规划配置但不公开 |
| D-036 | Catalog and series URLs | Accepted | Category 与设计系列分路由；Header 按真实目录自适应 |
| D-037 | Public contact identity | Accepted | 客服、隐私与公开联系统一使用 `info@joyamana.com` |
| D-038 | Contact form delivery | Working | Server Action + 可关闭的 Resend 薄适配层；不建客户数据库 |
| D-039 | Phase-one service pages | Accepted | 当前不设 FAQ、Disclaimer、独立 Product Care 页面 |
| D-040 | About subtree | Accepted | Content Page Metaobject 驱动独立 URL 与页内文字 tabs |
| D-041 | Editorial source model | Accepted | `/blog` 与 `/crystals` 分别读取 Shopify 原生 `blog`、`crystals` Blog |
| D-042 | Shopify-only runtime | Accepted | 删除 mock provider 与本地正文 fallback；上游异常 fail closed |

## Accepted decisions

### D-001 — Brand + Content + Commerce

Date: 2026-08-02  
Context: 现有项目规格明确网站同时承担品牌、内容和销售职责。  
Decision: 以自有品牌商品销售为收入核心，内容服务信任、发现和转化。  
Consequence: 不以广告浏览量为目标；内容 KPI 必须与品牌或商业结果关联。

### D-002 — Shopify 是 Commerce 事实来源

Date: 2026-08-02  
Alternatives: 自建商品/订单/支付系统。  
Decision: Shopify 管理商品、变体、价格、库存、折扣、购物车、订单、支付与
Checkout。  
Consequence: 前端不得复制最终价格或订单逻辑；只通过公开许可 API 访问。

### D-003 — Next.js 取代 Hydrogen

Date: 2026-08-02  
Alternatives: Hydrogen + React Router。  
Decision: 使用 Next.js App Router + TypeScript。  
Reason: 顶层 `AGENTS.md`、原 `TECH_SPEC.md` 和原 `DECISIONS.md` 均已明确
Next.js；它满足内容控制、SEO 和品牌体验需要。保留两套框架会使路由、缓存、
部署和 API 集成分叉，却不带来当前业务价值。  
Consequence: 历史 Hydrogen 方案移至 `docs/archive/`，不得生成 Hydrogen 目录。

### D-004 — Vercel 取代 Oxygen

Date: 2026-08-02  
Decision: Next.js 部署到 Vercel，Commerce 继续由 Shopify 承担。  
Consequence: Preview/Production、日志、缓存与回滚方案围绕 Vercel 设计。

### D-005 — 无独立业务后端

Date: 2026-08-02  
Decision: MVP 不建设独立服务或数据库。允许 Next.js Server Actions、Route
Handlers、Shopify webhook、OAuth callback 和安全的薄适配层。  
Consequence: 新数据库、队列、长期服务或自建认证必须另做 ADR。

### D-006 / D-007 — 首发市场与 URL

Date: 2026-08-03  
Decision: 当前只有一个 US Market，使用同一 US Catalog、库存、USD 价格、
税务、配送和法律上下文；支持 en-US 与 es-US 两种语言。en-US 使用根路径，
es-US 使用 `/es-us/`，不创建 `/en-us/`。  
Consequence: 两种语言不得复制成两套商品；西语内容和翻译必须经过人工审核
后才能从 noindex 测试状态进入生产索引。

### D-008 / D-010 — 游客购买与账户后置

Date: 2026-08-02  
Decision: 不要求注册。MVP 使用游客购买、交易 Email 和 Shopify Order Status；
不建设自定义 Customer Account UI。  
Consequence: 账户、订单历史、地址和 passwordless 登录在有服务需求后评估
Shopify Customer Account API。

### D-012 — 不使用 AdSense

Date: 2026-08-02  
Decision: 不引入广告组件、广告脚本或广告布局预留。  
Consequence: 避免品牌干扰、第三方脚本、CLS 和转化损失。

### D-013 — 可抓取 HTML，不强制 request-time SSR

Date: 2026-08-02  
Decision: 所有索引页面在初始响应中包含主要内容、链接和结构化信息；根据
数据时效使用 SSG、ISR 或动态服务端渲染。  
Consequence: Client-only SPA 不合格；品牌页和内容页无需为“SSR”牺牲缓存。

### D-014 — Global-ready, current-market-only

Date: 2026-08-02  
Decision: 内部使用 typed market context，但只为真实运营市场生成 URL、
sitemap、catalog 和 hreflang。  
Consequence: 当前仅生成 US 的 en-US 与 es-US 页面；不预建 Canada、UK、
France、Germany、Switzerland 等未来 Market。扩展时优先使用同一前端和
Shopify Store，除非未来业务约束证明需要改变。

## Confirmed and working decisions from 2026-08-03

### D-009 — MVP 内容使用 Shopify 原生能力

Decision: Shopify Pages/Blog 管理基础页面和文章，Metafields/Metaobjects
管理复用的结构化内容；价格、库存永远只在 Shopify Commerce 模型中。  
Reason: 当前没有多人审批、高频多语言或跨渠道发布需求；Sanity 会新增事实
来源、同步、预览和运维边界。  
Upgrade triggers:

- 多名非技术编辑需要角色、审批和排期。
- 内容块需要大规模跨页面/渠道复用。
- 多语言翻译工作流显著超出 Shopify 能力。
- 发布频率和内容量已经造成可测量的运营瓶颈。

### D-011 — Custom Crystal 后置

Decision: MVP 不做配置器。先通过普通变体、联系表单或人工 concierge 验证
需求，再决定是否需要组合规则、动态价格和 Shopify Functions/App。  
Impact if rejected: 需要重新评估商品模型、报价验证、库存、Cart properties、
Checkout 和测试范围。

### D-015 — 使用 `/blog`

Decision: URL、导航、页面标题、Footer、内部文档和内容模型统一使用 `Blog`；
不再使用 `Journal`、`Diario` 或 `/journal` 作为同一栏目别名。  
Reason: 单一命名减少编辑、导航、Analytics 和用户理解歧义。

### D-017 / D-018 — 测试站 UI 与工程基线

Working decision: 测试站使用 Next.js 内置 CSS 能力 + CSS variables/tokens、
pnpm 11.22.0；当前固定 Node 24 LTS（`.nvmrc` 与 `package.json#engines`），并锁定
Next.js 与 Shopify Storefront API 版本，按季度审查升级。Node 26 在进入
Active LTS 前只用于兼容性观察，不作为生产基线；进入 LTS 后再通过 CI、构建、
路由、Shopify 集成和部署回归决定是否升级。  
Reason: 不增加 UI runtime dependency，保持环境一致和版本可追溯。  
Note: 不引入重型组件库；若未来改用 Tailwind，需说明迁移价值。

2026-08-14 maintenance note: 将 pnpm 从 11.18.0 对齐到 Homebrew 稳定版
11.21.0。两者属于同一 major，依赖集合和 lockfile 格式不变；此调整修复新版
pnpm 在读取旧 `packageManager` 固定值时尝试切换原生 executable、但 lockfile
没有对应 pnpm executable identity 而导致命令无法启动的问题。

2026-08-22 maintenance note: 将 pnpm 从 11.21.0 升级并固定到 11.22.0，与当前
稳定版和部署环境保持一致。继续使用精确版本而不是 `latest` 或未固定的全局
版本，避免本地、CI 与 Vercel 因包管理器自动升级产生不可复现的安装结果。

pnpm 脚本前依赖校验使用 `verifyDepsBeforeRun: warn`。开发者在 manifest 或
lockfile 变化后必须显式运行 `pnpm install --frozen-lockfile`；`pnpm dev`、检查和
构建命令不在后台自动修改依赖目录。这样保留状态警告，同时避免非交互环境因
自动 install 或网络访问而阻断正常脚本。

### D-019 — 品牌名称与集中配置

Date: 2026-08-14  
Decision: 品牌名称确认为 `Joya Mana`。工作定位、文案、域名和视觉 token 继续
集中配置；名称确认不代表 `.com`、美国商标或社交账号已经完成核验。  
Consequence: 所有面向用户的品牌名称、metadata 和 wordmark 使用 Joya Mana；
页面继续明确处于 prototype 状态，不得把工作定位中的候选差异升级为已验证
商品声明。

2026-08-31 maintenance note: 当前 US UI 没有可见的 prototype badge；测试状态由
`noindex`、Checkout/Contact release gates 和受控环境表达。若 D-019 的“明确”意指
客户可见标签，该项尚未实现，需先确认不会与品牌测试或可用性目标冲突。

### D-020 — 标准商品与天然独件并存

Decision: 数据模型同时支持 repeatable、natural-variation 和 one-of-a-kind。
天然独件一物一图、一物一库存；标准商品披露天然差异。  
Consequence: Shopify mapper 必须保留 `kind`、exact-image 和库存语义，不能用复杂
Variant 混淆不同设计。

### D-021 — 政策发布门禁

Decision: Shipping、Returns、Duties、Taxes、Warranty、Privacy/Terms 中依赖
业务事实的内容，在负责人确认前只保留开发入口，不发布承诺，不输出政策 Schema。

### D-022 — 内容治理

Decision: 项目负责人最终审批；AI 可辅助草拟但不是作者或事实来源。矿物、
历史、文化和科学内容人工核对，不虚构 expert/reviewer/source。

### D-023 — 不可索引测试站

Decision: 在 Shopify、域名、商品、政策均未准备时，可以建立可运行测试站。
全站默认 `noindex`；只有完成生产门禁后才显式开启索引、Checkout 和适用 Schema。

### D-024 — Market、Language、URL、Currency 分离

Decision:

- Market 是商业运营单元，不等同于国家或货币。
- 一个 Market 定义 Catalog、可用语言、默认与可选货币、Pricing、Tax、
  Shipping 和 Legal requirements。
- URL 表达语言与地区，例如 `/es-us/`、未来可能的 `/fr-fr/` 或 `/de-ch/`。
- Currency 只影响价格展示和 Checkout transaction context，不进入 SEO URL。
- 当前 en-US 与 es-US 都解析到 US Market 和同一 US Catalog；语言切换不得
  改变商品 ID、库存、价格事实来源或配送政策。
- 未来 Spain Market 与当前 US Spanish 不是同一实体；即使语言都是 Spanish，
  Spain 仍可拥有独立 Catalog、EUR 价格、库存、税务、配送和法律配置。

Reason: 国家、语言、Market 和货币并非一一对应。将 Currency 编入 URL 会制造
重复页面；把语言等同于 Market 会错误复制商品和运营事实。  
Consequence: Market 配置使用 regions、locales、currencies、catalog 及各运营
profile 的显式引用；currency selection 使用会话/Shopify context，不生成
`/de-ch-eur/` 一类 URL。

### D-025 — 测试站首件商品

Status: Superseded（仅 runtime sample）；正式 assortment 未决（Q-002C）。

Decision: 测试站暂时只上架「七脉轮普通款」，按标准商品建模。工作规格为
8mm、22 颗，七彩石列表来自 `docs/PRODUCT_INPUTS.md`。业务方已提供的白纹石、
黑曜石、蓝纹石、蜜蜡玉、粉晶 5 张概念图建模为同一 Product 下的 5 个主石
选项；每款 15 颗主石 + 7 颗七彩石。  
Consequence: 其他构思系列不进入 Catalog；“11”的含义、准确组合、价格、腕围、
线材、供应链和质量信息未确认前不补充其他 Variant 或生产声明。

Superseded note: 这些资料现只是历史概念输入和测试 fixture 来源，不再是
storefront 运行时 Catalog。D-042 后可见商品完全由 Shopify Headless channel 的
实际发布结果决定；当前 Aquamarine 商品是测试商店事实，不因此自动成为
已批准的正式首发 assortment。

### D-026 — 加拿大测试 Market（Superseded by D-035）

Decision: 增加独立 Canada 测试 Market：

- URL：`/en-ca/` 与 `/fr-ca/`。
- Catalog：`ca`，与 `us` 分离。
- Currency：CAD；当前 `$92 CAD` 仅为测试值。
- English/French 共享 CA Catalog、商品发布范围、价格、库存和 CA 运营 profile。
- 原型可使用与 US 相同的七脉轮商品 ID 和素材，但 US/CA price、availability
  和 Cart context 必须按 Market 隔离。

Consequence: Canada Shipping、Tax、Returns、Privacy、Legal 和正式法语内容
未获批准前保持 noindex，Checkout 不可用。

### D-035 — 第一阶段隐藏 Canada Market

Date: 2026-08-16  
Decision: 第一阶段仅启用 US Market。Canada 的 typed Market、CAD Catalog 和
en-CA/fr-CA 路径规则保留为未来规划，但不显示地区入口、不生成静态页面、
hreflang 或 sitemap URL；直接访问 `/en-ca/`、`/fr-ca/` 及其子路径返回 404。
Shopify 当前也只开放 US/USD/English 和 US 配送范围。

Reason: Canada 的商品、法语内容、配送、税务、退货、隐私和法律事实均未完成，
公开测试路由会造成市场已可运营的错误暗示。

Consequence: 启用 Canada 前必须重新批准并同时完成 Shopify Market/Catalog、
CAD、en-CA/fr-CA 内容、Checkout、Shipping、Tax 和 Legal 验收；不得只恢复 URL。

### D-027 — 当前不建立 Global Site

Decision: `/` 继续作为 en-US 首页；Header 只切换 US 语言，Footer 只展示当前
启用的 US Market，不建立独立 Global 商品站，也不把 `/` 改成地区门户。  
Reason: 第一阶段只有一个启用的 US Market，全球门户会增加进入摩擦。  
Future trigger: 至少 3–4 个真实运营 Market、错误 Market 访问显著、或确需
`x-default` 选择入口时，可新增 `/choose-region` 轻量页。该新增不会改变
Commerce 模型；页面默认 noindex，不按 IP 强制重定向。  
Important: 若未来把 `/` 改成 Global 门户并将 US 移到 `/en-us/`，属于高影响
SEO URL 迁移，必须另做 ADR、301、canonical 与 hreflang 迁移计划。

### D-028 — Header 地区与语言入口及系列导航

Status: Superseded by D-029.

Decision:

- Header 右侧使用“中性地球图标 + Market · Language”合并入口，例如
  `US · EN`、`US · ES`、`CA · EN`、`CA · FR`。
- 入口展开后同时选择国家/地区与语言；Footer 保留完整文字版地区/语言入口。
- 不使用国旗作为语言图标，因为一种语言可能服务多个 Market，国旗也不能准确
  表达语言。
- 当前主导航直接展示 `Seven Chakras`，不增加只有一层内容的 `Collections`
  抽象入口；Footer 继续保留 Collections 聚合页。
- 当至少有 3 个具备独立叙事和商品规模的正式系列时，再将 Header 升级为
  Collections 父级菜单。

Reason: Market 会影响 Catalog、价格、库存、配送和政策，只展示语言会隐藏重要的
商业上下文；当前只有一个主推系列，直达链接比通用分类多一层点击更清晰。

Consequence: Header 选择 Market 时保留当前页面路径；若目标 Market 不发布该页面，
未来 Shopify 接入后应落到目标 Market 的等价 Collection 或本地化 404，而不是
偷偷回退到其他 Market。

### D-029 — Header 只展示当前 Market 的语言

Amended by: D-035 与 D-036。D-029 的语言/Market 分离原则继续有效；
直达 Seven Chakras 和 Footer Market 切换不再描述当前单一 US 导航。

Decision:

- Header 右侧使用中性语言线性图标和当前语言代码，例如 `EN`、`ES`、`FR`。
- Header 下拉只切换当前 Market 内的语言：US 为 EN/ES，CA 为 EN/FR；语言切换
  永不改变 Market、Catalog、Currency 或 Cart context。
- 国家/地区选择保留在 Footer；未来可将 Footer 与非阻断地区提示连接至
  `/choose-region`。
- 页面以 `USD` / `CAD`、Shipping、Returns 和 Footer 当前地区等信息明确 Market。
- Catalog 导航按 D-036 使用 Shop/Category 与数据驱动的 Design Collection；
  不再固定直达未发布的 Seven Chakras。

Reason: 降低 Header 视觉噪声，同时避免把语言选择误作 Market 选择。语言图标只
辅助识别，不能替代可读语言代码和 accessible name。

Supersedes: D-028 中的 Header 地区/语言合并入口；不改变 D-024 Market 模型或
D-027 Global selector 决策。

### D-030 — PDP 桌面布局与购买操作

Decision:

- PDP 在宽度大于 760px 时使用商品媒体与购买信息各 50% 的左右布局；移动端为
  单列，媒体在前、购买信息在后。
- 桌面滚动右侧购买信息时，整个 50% 左侧媒体面板（背景、留白、缩略图和主图）
  以一个视口高度 sticky；内层图库只负责排版，不再单独 sticky。左栏在 PDP
  结束、进入相关商品区前释放，不创建独立滚动区。内层保持上方主图、下方横向
  缩略图结构；移动端关闭整个面板 sticky。
- Add to bag 是主 CTA；Buy now 是下方 outline 次 CTA，不做两个同权重主按钮。
- 生产 Buy now 使用当前所选 Variant、数量、Market buyer identity 创建独立
  单商品 Shopify Cart，并跳转其最新 `checkoutUrl`；不得把现有 Bag 中其他商品
  意外带入，也不得清空或改写现有 Bag。
- Shopify 商品/Cart 已接入，但真实价格、库存、政策或 Checkout 运营验收
  任一未通过时，未获批公开部署必须保持 `SHOPIFY_CHECKOUT_ENABLED=false`；
  受保护 local/Preview 可为受控 E2E 临时启用，但不等于 production 批准。Buy now
  在门禁关闭时展示禁用状态及明确原因，不模拟付款或订单成功。

Reason: 50/50 保持 Apple 式清晰的媒体/决策平衡；双层级操作同时服务继续浏览与
高意向快速结账，而不制造 CTA 竞争。

### D-031 — Variant 选择项显示价格

Decision: PDP Variant 选择项左侧显示本地化消费者款式名，右侧显示当前 Market
下该 Variant 的格式化价格。供应商名称、中文素材名、文件名和其他内部来源字段
不得进入消费者 UI 或客户端商品 payload。全站价格必须使用所选
ProductVariant 的 Shopify contextual price，并显式包含 currency code；选择后
同步更新 PDP 主价格。历史本地 `$68 USD` / `$92 CAD` 排版值已被 D-035
和 D-042 取代，不得用于运行时。

Reason: 价格是购买选择所需信息；内部素材名称既无消费者价值，也可能造成语言和
商品身份误解。

### D-032 — Header Search 与 Bag

Decision:

- Header Search 使用放大镜图标，Bag 使用购物袋轮廓图标；桌面保留图标和文字，
  移动端 Search 与 Bag 仅视觉隐藏文字但保留 44px 入口和 accessible name。
- 英文消费者文案由 `Cart` 改为 `Bag`，与 PDP `Add to bag` 保持一致；西班牙语
  使用 `Bolsa`，法语保留当地电商更清晰的 `Panier`。
- 购物袋有商品时显示紧凑数量徽标。
- 路由继续使用 `/cart`，组件和 Shopify Cart 模型也继续使用 `cart` 术语。

Reason: 图标提高工具入口的扫读速度；Bag 更符合当前珠宝品牌语气，但不应为了
消费者文案修改稳定 URL 或 Commerce 领域模型。

### D-033 — Header 精简与内容枢纽差异化

Amended by: D-036 已取代固定 Seven Chakras/New 目录入口；内容枢纽的差异化
原则继续有效。

Decision:

- Header 主导航当前由 Shop/Category 和可见 Design Collection 数据驱动，
  并保留 Crystal Guide、Blog、About；不固定展示 Seven Chakras 或 New。
- New 只在有稳定上新节奏且至少有 4–6 个近期商品时重新评估。当前
  `/collections/*` 只允许 `design_series`，因此不保留可公开的
  `/collections/new-arrivals` 默认路由；未来恢复需同时决定唯一 URL 与索引意图。
- Header 工具顺序固定为 Search、Language、Bag，Bag 保持最右侧。
- Crystal Guide 使用居中标题、简短定位和带分隔线的极简资料目录，强调检索。
- Blog 使用居中标题、一个 Featured article 和其余编辑列表，强调内容层级。
- 两个枢纽都必须在服务端 HTML 输出真实文章链接和摘要，不能只留下视觉标题。

Reason: 当前商品与内容规模不足以支撑 New 独立入口；Guide 与 Blog 使用同一卡片
网格会弱化各自的信息任务。差异化布局在保持克制品牌体验的同时提高发现效率和
SEO/GEO 内部链接质量。

### D-034 — 移动导航、Header 工具样式与 About

Amended by: D-036 的数据驱动 Catalog 导航与 D-040 的 Shopify About subtree。

Decision:

- 导航折叠后 Header 使用对称三栏：左侧 Menu、居中 Wordmark、右侧 Search/Bag。
  Menu 打开全屏导航，包含 D-036 产生的 Shop/Category/Design Collection、
  Crystal Guide、Blog、About；Language 移至 Menu 底部，国家/地区仍留在 Footer。
- 移动 Menu 锁定背景滚动，支持 Escape、焦点锁定、关闭后焦点返回和 44px
  触控目标。
- 桌面 Search、Language、Bag 统一为无边框线性图标 + 文字，使用相同高度、字号、
  描边、间距、hover 和 focus；顺序为 Search、Language、Bag。
- About 布局与内容以 D-040 的 `content_page` root/direct-child tree 为准；不再
  固定 Form/Meaning/Clarity 或 Seven Chakras CTA。
- 未有获批资料前不展示或暗示创始人、悠久历史、工作室、手工工艺、产地、团队、
  采购承诺或责任认证。D-040/D-042 后页面只输出完整的 Shopify 内容；缺失时
  fail closed，不要求或注入本地 `working story` 标记。

Reason: 隐藏桌面导航却不提供移动入口会形成导航断点；统一工具样式降低视觉噪声。
About 应回答品牌为何存在及其商品标准，而不是用未经证实的传承叙事填充页面。

### D-036 — 商品类别与设计系列使用独立 URL

Status: Accepted
Date: 2026-08-30
Owner: Project owner
Context: 业务方确认 Joya Mana 同时需要稳定商品类别（Bracelets、Rings 等）与具备
独立故事和视觉的原创设计系列（例如 Seven Chakra）。两者的浏览意图、页面模板和
维护方式不同，继续把所有商品分组都暴露为 `/collections/*` 会混淆消费者语义。

Decision:

- `/shop` 是全部在售商品入口。
- `/category/{handle}` 只表达 Shopify Standard Product Category 对应的商品类别，
  例如 `/category/bracelets`。
- `/collections` 与 `/collections/{handle}` 只表达原创设计系列，
  例如 `/collections/seven-chakra`。
- 商品类别以 Shopify Product Category 为事实来源；设计系列成员以结构化
  `custom.design_series` 商品引用驱动的 Shopify automated Collection 为事实来源。
- Shopify Collection 使用 `custom.collection_kind` 区分 `design_series`、
  `category` 与 `merchandising`；只有 `design_series` 可进入公开
  `/collections/*` 系列路由。
- Crystal 继续使用 `/crystals/*`，筛选参数不自动生成可索引 landing page。
- en-US 使用根路径；es-US 继续在相同稳定英文 handle 前加 `/es-us/`，消费者标题、
  描述和导航本地化，但当前不建立翻译 slug 映射。

Reason: Category 回答“商品是什么”，Collection 回答“属于哪个设计世界”。拆分公开
路径可以同时保留高效购物和品牌叙事，并避免把后台所有 Collection 自动暴露为品牌
系列。稳定英文 handle 也与当前 Shopify shared catalog 和 locale 路由保持一致。

Consequences:

- Category 与 Design Collection 使用不同页面模板、breadcrumbs、metadata 和 sitemap
  页面类型。
- `/collections/bracelets` 等类别别名不得与 `/category/bracelets` 同时返回可索引
  200；已公开的旧类别地址必须 301 到新的 Category URL。
- Header 始终提供 Shop 下拉：`Shop All` 链接 `/shop`，其余只列当前 Catalog 中非空的
  已支持 Product Category。设计系列按已发布、Storefront 可见、非空且
  `collection_kind=design_series` 的 Collection 数量处理：0 个时不显示 Header 入口，
  1–2 个时直接显示各系列名，3 个及以上时合并为 Collections 下拉，并提供
  `View All` 到 `/collections`。桌面与移动端必须遵循同一规则。
- Collections hub 即使暂时没有 Header 入口也保留真实空状态；Footer 可继续作为次级
  入口，不虚构系列。
- Product、Category、Design Collection、Crystal 和筛选组合仍指向同一 Shopify
  Product/Variant，不复制 SKU、价格或库存。
- 当前 `CONTENT_SEO_GEO_SPEC.md` 的信息架构和既有 Collection 路由需要同步迁移。

Migration / rollback: 新增 `/shop` 与 `/category/*` 后再收紧 `/collections/*` 的
类型门禁；sitemap、canonical、hreflang、breadcrumbs 和内部链接同批更新。若上线后
回滚，必须保留反向 301 与 canonical 迁移记录，不能重新开放重复列表 URL。

Supersedes: D-029 和 D-033 中 Header 固定直达 Seven Chakras 的部分、D-034 中 About
硬编码未发布 Seven Chakras 详情 CTA 的部分，以及旧信息架构中把商品类别与设计系列
统一暴露为 `/collections/{handle}` 的部分；D-033 的内容枢纽、New Arrivals 门禁和
其他 UI 决策继续有效。

### D-037 — 公开联系邮箱

Date: 2026-08-30
Decision: 客服、隐私请求和当前公开联系入口统一使用 `info@joyamana.com`。交易身份、
客服沟通与营销同意继续分离；收到 Contact 请求不得自动加入营销列表。
Consequence: 页面、配置和后续政策使用同一地址。生产开放前仍须完成真实邮箱开通、
负责人/备援、域名认证和回复流程验收。

### D-038 — Contact 表单投递边界

Date: 2026-08-30
Status: Working
Decision: Contact 使用 Next.js Server Action 做服务端校验，通过可关闭的 Resend HTTP
薄适配层投递到 `info@joyamana.com`；Next.js 不保存留言、不创建 Shopify Customer，
表单提交不构成营销同意。未配置或未批准供应商时只显示可用的 Email 入口。
Reason: Shopify Theme contact form 不属于当前 Headless storefront；完整 Helpdesk 对
首发流量过重。直接 HTTP 适配无需客户端 SDK，并可在一个文件内替换供应商。
Data boundary: Resend 会接收顾客姓名、邮箱、主题、可选订单号和留言；API key 仅服务端
保存，表单正文和 PII 不进入应用日志或 Analytics。上线前须批准其隐私、保留期、成本，
验证发送域，并在边缘/WAF 配置滥用限制。
Migration / rollback: `CONTACT_FORM_ENABLED=false` 立即回退为 Email-only；更换供应商
只替换投递适配层和 Secret，不改变表单、URL 或客户数据模型。

### D-039 — 当前阶段精简服务页面

Date: 2026-08-30
Status: Accepted
Decision: 当前阶段删除 FAQ、Disclaimer 和独立 Product Care 页面及所有导航入口，
对应 URL 返回 404 且不进入 sitemap。水晶/灵性内容边界继续由 Terms 和内容场景内的
简短提示承担；商品护理继续保留在 PDP 的商品事实中；真实客服问题通过 Contact、
Shipping 和 Returns 处理。
Reason: 三个独立页面当前没有足够的必要内容或独立用户任务，保留草稿入口会增加
导航噪音并形成薄页面。
Migration / rollback: 未来只有在出现真实重复问题、稳定的品牌级护理内容或 Terms
无法覆盖的独立披露需求时，才重新评估页面、内容来源、导航与索引策略。

### D-040 — About 子页面与页内导航

Date: 2026-08-31
Status: Accepted
Owner: Project owner
Context: About 除品牌总览外可能增加 Our Approach、Product Standards 等长期品牌
主题。把这些内容都塞进一个超长页面会降低可维护性；把每个子页都加入 Header 又会
增加主导航噪声。
Decision:

- `/about` 是 About hub、Header 的唯一 About 入口，也是页内导航第一项；直接子页使用
  `/about/{handle}`，不建立更深的公开嵌套。
- 0 个有效子页时不渲染空导航；至少 1 个有效子页时，所有 About 页面共享同一行克制
  的文字 tabs。视觉表现为 tab，语义必须是 `<nav>` 与真实链接，当前页使用
  `aria-current="page"`，不得用客户端隐藏 panel 代替独立 URL。
- Shopify `content_page` Metaobject 是 About hub 与子页的内容事实来源。固定 root
  `about` 的有序 `child_pages` 引用列表决定公开子页成员和顺序；未被 root 直接引用的
  Content Page 不形成公开 About 路由。
- 所有公开条目必须在 Storefront 可见且具备完整 title、body、last_updated、
  seo_title；`navigation_title` 可覆盖 tab 文案，缺失时回退 title。`summary` 和
  `seo_description` 建议人工填写；summary 只有明确填写时才作为 H1 下方导语展示，
  seo_description 缺失时使用正文的安全纯文本摘要，不能因此暴露 HTML、脚本或未显示
  内容。
- en-US 与 es-US 共享稳定英文 handle。语言 fallback 可以提供阅读后备，但必须
  noindex、不得进入 sitemap/hreflang，也不得出现在该语言的 root tabs 中。
- 每页拥有独立 H1、metadata、canonical；About hub 使用 `AboutPage` Schema，子页使用
  `WebPage` 与 `BreadcrumbList`。Header 不因 About 子页数量改成下拉菜单。

Reason: 页内导航保持品牌关系和 Header 简洁，同时真实 URL 保留分享、返回、服务端
HTML 与搜索语义。root 引用作为 allowlist，避免后台任意 Content Page 被意外公开。
Consequences: 新增或下线子页需同时维护 root 引用、翻译、metadata、sitemap 和必要
redirect。D-042 已删除当时的硬编码 About 迁移后备；Metaobject 未配置、
不完整或请求失败时必须 fail closed。
Migration / rollback: 删除 child 引用即可从 tabs 与 sitemap 下线；如果 URL 已正式
发布，改 handle 或永久移除前必须提供明确 301/410 决策。回滚页内导航时仍保留已发布
子页 URL，不能把所有地址批量跳转首页。
Supersedes: D-034 中 About 固定页面布局与硬编码工作文案作为长期实现的部分；D-034
关于未获批品牌事实和 claims 的限制继续有效。

### D-041 — Blog 与 Crystal Guide 使用 Shopify 原生 Blog

Date: 2026-08-30
Status: Accepted
Owner: Project owner
Context: Shopify 已实际创建 handle 为 `blog` 与 `crystals` 的两个原生 Blog。当前
编辑规模优先使用同一套 Article 草稿、发布、作者、日期、SEO 与翻译工作流，不再为
Crystal Guide 同时维护第二套 Crystal Metaobject 正文。
Decision:

- Shopify Blog `blog` 是 `/blog` 与 `/blog/{article.handle}` 的内容事实来源。
- Shopify Blog `crystals` 是 `/crystals` 与 `/crystals/{article.handle}` 的内容事实
  来源；不暴露 Shopify `/blogs/*` URL。
- 两类 Article 均通过 Storefront API 服务端读取。正文、摘要、图片、作者、发布日期、
  tags 与 SEO 使用 Shopify 原生字段；未来需要 composition、hardness、care、sources、
  related products 等结构化信息时，优先增加 Article Metafields。
- 当前不建立一份同名 Crystal Metaobject 与 Article 双写。若商品需要引用 Guide，使用
  Shopify 支持的 Article resource reference；只有出现独立于文章的跨渠道 Crystal
  实体需求时，才另做迁移决策。
- en-US 与 es-US 共享稳定英文 Article handle。未完成真实翻译的语言 fallback 可阅读，
  但必须 noindex，且不得进入该语言的 sitemap/hreflang。

Reason: 两个线上 Blog 已提供当前所需的编辑与发布能力，模型更少、运营路径更直接；
Article Metafields 足以承载 MVP 的结构化扩展，而双写 Article 和 Metaobject 会制造事实
来源冲突。
Consequences: Next.js 的 Blog、Crystal Guide、首页推荐、metadata 与 sitemap 统一从
Shopify Article 派生。修改 Blog handle 或已发布 Article handle 前必须安排明确的 URL
迁移和 301。
Migration / rollback: 本地 prototype entries 已移除。若未来升级为 Crystal
Metaobject，应先定义字段、Article 到实体的迁移和旧 URL 保留方案，再切换唯一事实来源。
Supersedes: D-009 与 `CONTENT_SEO_GEO_SPEC.md` 中“Crystal 必须由 merchant-owned
Metaobject 作为当前唯一正文来源”的部分；D-009 的 Shopify-first 边界与其他
Metaobject 用途继续有效。

### D-042 — Storefront 运行时只支持 Shopify

Date: 2026-08-30
Status: Accepted
Owner: Project owner
Context: 商品、Cart、Policy、About、Accessibility、Blog 与 Crystal Guide 已有正式
Shopify 读取路径。继续保留 `COMMERCE_PROVIDER=mock`、本地样本 Catalog 和本地正文
fallback 会形成第二事实来源，并可能在配置错误或上游缺失时把工作文案误当生产内容。
Decision:

- Storefront 运行时只支持 Shopify；删除 `COMMERCE_PROVIDER`、mock catalog、provider
  分支和 mock 商品视觉标识。
- Shopify 请求失败、条目缺失或字段不完整时 fail closed：详情页 404，hub/信任页显示
  明确的暂不可用状态；不得回退到本地商品、价格、政策或品牌正文。
- About、Policy 与 Accessibility 不再拥有本地正文 prototype。Shopify 默认语言
  fallback 仍可作为语言阅读后备，但继续 noindex，且不进入对应 locale 的
  sitemap/hreflang。
- 商品缺图只显示中性的 “Image unavailable” 状态，不生成可能被误认为商品实拍的
  本地概念图。
- 按钮、错误消息、导航规则、layout 和其他 code-owned UI copy 继续保留在 Next.js；
  它们不属于业务事实 fallback。

Reason: 单一事实来源降低配置漂移、误价、错误政策和工作文案意外发布风险；Shopify
不可用应被监控和修复，而不是由浏览器静默展示另一套数据。
Consequences: 本地无离线 Commerce 演示模式；开发、测试和 Preview 需要 mock fetch
或可用的 Shopify 测试商店。Checkout 仍使用独立 `SHOPIFY_CHECKOUT_ENABLED` 发布门禁。
Migration / rollback: 回滚 Shopify adapter 通过代码版本完成，不恢复运行时 provider
切换或本地业务数据副本。
Supersedes: D-025 的本地七脉轮运行时样本、D-040 的临时 About 正文后备、
D-023 中 mock Checkout 条件，以及旧执行计划中的 `COMMERCE_PROVIDER` rollback。

## Pending decision

### D-016 — AI crawler policy

需要业务方分别决定：

- 允许 Search / user-triggered crawler 发现和引用公开内容。
- 是否允许 training crawler 将公开内容用于未来模型训练。

实施时必须复核各供应商的当前 User-Agent 和官方说明，集中生成 robots 规则，
不得把时效性名称散落在代码中。

## 新决策模板

```md
### D-XXX — Title

Status: Working | Proposed | Accepted | Pending | Superseded | Rejected
Date: YYYY-MM-DD
Owner:
Context:
Alternatives:
Decision:
Reason:
Consequences:
Migration / rollback:
Supersedes:
```
