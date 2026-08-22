# Decision Log

Status: Active  
Owner: Project owner  
Last updated: 2026-08-16

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
| D-025 | Prototype product | Accepted | 首件仅上架七脉轮普通款 |
| D-026 | Canada prototype | Superseded | 曾启用 CA 测试路由；由 D-035 取代 |
| D-027 | Global selector | Accepted | 当前不建 Global Site，保留低成本选择页扩展 |
| D-028 | Header navigation v1 | Superseded | 地区与语言合并入口 |
| D-029 | Header navigation | Accepted | Header 只切语言；Footer 切 Market；直达 Seven Chakras |
| D-030 | PDP layout and actions | Accepted | 桌面 50/50；Add to bag 主 CTA + Buy now 次 CTA |
| D-031 | Variant selector | Accepted | 左侧款式名，右侧当前 Market 的价格 |
| D-032 | Header utility actions | Accepted | Search/Bag 使用图标；英文 Cart 改为 Bag |
| D-033 | Header and content hubs | Accepted | 移除 New；Guide 资料目录；Blog 编辑层级 |
| D-034 | Mobile nav and About | Accepted | 全屏移动 Menu；统一工具样式；About 品牌立场页 |
| D-035 | Phase-one market visibility | Accepted | 第一阶段只显示 US；Canada 保留规划配置但不公开 |

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
pnpm 11.21.0；当前固定 Node 24 LTS（`.nvmrc` 与 `package.json#engines`），并锁定
Next.js 与 Shopify Storefront API 版本，按季度审查升级。Node 26 在进入
Active LTS 前只用于兼容性观察，不作为生产基线；进入 LTS 后再通过 CI、构建、
路由、Shopify 集成和部署回归决定是否升级。  
Reason: 不增加 UI runtime dependency，保持环境一致和版本可追溯。  
Note: 不引入重型组件库；若未来改用 Tailwind，需说明迁移价值。

2026-08-14 maintenance note: 将 pnpm 从 11.18.0 对齐到 Homebrew 稳定版
11.21.0。两者属于同一 major，依赖集合和 lockfile 格式不变；此调整修复新版
pnpm 在读取旧 `packageManager` 固定值时尝试切换原生 executable、但 lockfile
没有对应 pnpm executable identity 而导致命令无法启动的问题。

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

### D-020 — 标准商品与天然独件并存

Decision: 数据模型同时支持 repeatable、natural-variation 和 one-of-a-kind。
天然独件一物一图、一物一库存；标准商品披露天然差异。  
Consequence: Mock 和 Shopify mapper 都必须保留 `kind`、exact-image 和库存
语义，不能用复杂 Variant 混淆不同设计。

### D-021 — 政策发布门禁

Decision: Shipping、Returns、Duties、Taxes、Warranty、Privacy/Terms 中依赖
业务事实的内容，在负责人确认前只保留开发入口，不发布承诺，不输出政策 Schema。

### D-022 — 内容治理

Decision: 项目负责人最终审批；AI 可辅助草拟但不是作者或事实来源。矿物、
历史、文化和科学内容人工核对，不虚构 expert/reviewer/source。

### D-023 — 不可索引测试站

Decision: 在 Shopify、域名、商品、政策均未准备时，可以建立可运行测试站。
全站默认 `noindex`，使用明确标注的开发样本；Checkout 在 mock 模式不可用。
只有完成生产门禁后才显式开启索引和 Product/Policy Schema。

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

Decision: 测试站暂时只上架「七脉轮普通款」，按标准商品建模。工作规格为
8mm、22 颗，七彩石列表来自 `docs/PRODUCT_INPUTS.md`。业务方已提供的白纹石、
黑曜石、蓝纹石、蜜蜡玉、粉晶 5 张概念图建模为同一 Product 下的 5 个主石
选项；每款 15 颗主石 + 7 颗七彩石。  
Consequence: 其他构思系列不进入 Catalog；“11”的含义、准确组合、价格、腕围、
线材、供应链和质量信息未确认前不补充其他 Variant 或生产声明。

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

Decision:

- Header 右侧使用中性语言线性图标和当前语言代码，例如 `EN`、`ES`、`FR`。
- Header 下拉只切换当前 Market 内的语言：US 为 EN/ES，CA 为 EN/FR；语言切换
  永不改变 Market、Catalog、Currency 或 Cart context。
- 国家/地区选择保留在 Footer；未来可将 Footer 与非阻断地区提示连接至
  `/choose-region`。
- 页面以 `USD` / `CAD`、Shipping、Returns 和 Footer 当前地区等信息明确 Market。
- 当前主导航继续直达 Seven Chakras；正式系列达到 3 个后再评估 Collections
  父级菜单。

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
- 测试站未连接 Shopify、真实价格与获批政策时，Buy now 只展示禁用状态及明确
  原因，不模拟付款或订单成功。

Reason: 50/50 保持 Apple 式清晰的媒体/决策平衡；双层级操作同时服务继续浏览与
高意向快速结账，而不制造 CTA 竞争。

### D-031 — Variant 选择项显示价格

Decision: PDP Variant 选择项左侧显示本地化消费者款式名，右侧显示当前 Market
下该 Variant 的格式化价格。供应商名称、中文素材名、文件名和其他内部来源字段
不得进入消费者 UI 或客户端商品 payload。当前五个测试款式同价，因此 US 均显示
`$68 USD`、CA 均显示 `$92 CAD`；全站价格必须显式包含 currency code，避免
USD/CAD 共用 `$` 符号造成歧义。Shopify 接入后以所选 ProductVariant 的
contextual price 为准并同步更新 PDP 主价格。

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

Decision:

- Header 主导航当前为 Seven Chakras、Crystal Guide、Blog、About；移除 New，
  但保留 `/collections/new-arrivals` 路由供 Footer、活动或未来恢复使用。
- New 仅在有稳定上新节奏且至少有 4–6 个近期商品时恢复，避免与唯一主系列重复。
- Header 工具顺序固定为 Search、Language、Bag，Bag 保持最右侧。
- Crystal Guide 使用居中标题、简短定位和带分隔线的极简资料目录，强调检索。
- Blog 使用居中标题、一个 Featured article 和其余编辑列表，强调内容层级。
- 两个枢纽都必须在服务端 HTML 输出真实文章链接和摘要，不能只留下视觉标题。

Reason: 当前商品与内容规模不足以支撑 New 独立入口；Guide 与 Blog 使用同一卡片
网格会弱化各自的信息任务。差异化布局在保持克制品牌体验的同时提高发现效率和
SEO/GEO 内部链接质量。

### D-034 — 移动导航、Header 工具样式与 About

Decision:

- 导航折叠后 Header 使用对称三栏：左侧 Menu、居中 Wordmark、右侧 Search/Bag。
  Menu 打开全屏导航，包含 Seven Chakras、Crystal Guide、Blog、About；Language
  移至 Menu 底部，国家/地区仍留在 Footer。
- 移动 Menu 锁定背景滚动，支持 Escape、焦点锁定、关闭后焦点返回和 44px
  触控目标。
- 桌面 Search、Language、Bag 统一为无边框线性图标 + 文字，使用相同高度、字号、
  描边、间距、hover 和 focus；顺序为 Search、Language、Bag。
- About 使用居中品牌 Hero、品牌立场、Form/Meaning/Clarity 三原则、商品透明
  标准和 Seven Chakras/Crystal Guide CTA。
- 未有获批资料前不展示或暗示创始人、悠久历史、工作室、手工工艺、产地、团队、
  采购承诺或责任认证；页面持续标注为 working story。

Reason: 隐藏桌面导航却不提供移动入口会形成导航断点；统一工具样式降低视觉噪声。
About 应回答品牌为何存在及其商品标准，而不是用未经证实的传承叙事填充页面。

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
