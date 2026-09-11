# Decision Log

Status: Active  
Owner: Project owner  
Last updated: 2026-09-11

本文件只保存有效决定与必要的替代关系。状态以索引为准：Accepted 为业务批准，
Working 为可替换实现选择，Proposed 为未批准建议，Pending 必须等待决策。
历史版本、审批过程与部署快照见 [Archive](archive/README.md)。

## 决策索引

| ID | 主题 | 状态 | 结论 |
|---|---|---|---|
| D-001 | 商业模式 | Accepted | Brand + Content + Commerce |
| D-002 | Commerce | Accepted | Shopify，不自建商城 |
| D-003 | Frontend | Accepted | Next.js App Router |
| D-004 | Deployment | Accepted | Vercel |
| D-005 | Backend boundary | Accepted | 不建独立业务后端 |
| D-006 | Launch market | Accepted | US / USD；同一 US Catalog 支持 en-US、es-US、zh-Hant-US |
| D-007 | URL | Accepted | en-US 根路径，es-US `/es-us/`，zh-Hant-US `/zh-hant-us/` |
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
| D-023 | Prototype | Superseded | 测试站阶段已结束；Production 范围由 D-044/045/048 控制 |
| D-024 | Market model | Accepted | Market、Language、URL、Currency 分离 |
| D-025 | Prototype product | Superseded | 仅本地运行时样本由 D-042 取代；assortment 由 Shopify/业务运营管理 |
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
| D-043 | Browser E2E tooling | Accepted | 当前阶段封存 Playwright；复杂度触发后再启用 |
| D-044 | Production canonical origin | Accepted | `https://www.joyamana.com`；apex 308 至 `www` |
| D-045 | Index release matrix | Accepted | 部署总开关 + locale/page-group fail-closed 配置 |
| D-046 | Content cache window | Accepted | 内容与导航五分钟再验证；webhook 后置 |
| D-047 | Website blocker boundary | Accepted | Q-001A/B、Q-002A/B/C 移出网站范围；Q-003A/F 已解决 |
| D-048 | Checkout/payment readiness | Accepted | 下单支付完整支持；Payment test mode 流程测试通过 |
| D-049 | US Traditional Chinese | Accepted | dev 完整接入 zh-Hant-US / 香港用语；允许后台英文回退，索引范围遵循 D-045 |

Superseded 决策正文移至
[`archive/superseded-decisions-2026-08.md`](archive/superseded-decisions-2026-08.md)；
索引保留 ID、状态和替代关系，归档正文不作为当前实现依据。

## 架构与业务边界

### D-001 — Brand + Content + Commerce

自有品牌商品销售是收入核心；内容服务信任、发现和转化，KPI 与商业结果关联。

### D-002 — Shopify 是 Commerce 事实来源

商品、变体、价格、库存、折扣、Cart、Checkout、订单、支付归 Shopify。
前端只通过获授权 API 读取和操作，不复制最终定价、订单或支付系统。

### D-003 / D-004 — Next.js 与 Vercel

使用 Next.js App Router + TypeScript，部署到 Vercel。
只维护这一套 storefront；历史 Hydrogen/Oxygen 方案不属于当前实现。

### D-005 — 无独立业务后端

不建独立服务或数据库。允许必要的 Next.js Server Actions、Route Handlers、
缓存失效端点与服务端适配层。数据库、队列、长期服务或自建认证须另做 ADR。

### D-006 / D-007 — US 市场与 URL

US / US Catalog / USD；en-US 根路径、es-US `/es-us/`、zh-Hant-US `/zh-hant-us/`，不创建 `/en-us/`。
三种语言共享商品身份、库存、价格、税务、配送和政策；翻译需人工审核。
当前索引开放范围见 D-045。

### D-008 / D-010 — 游客购买与账户后置

不要求注册。使用 Shopify hosted Checkout、交易 Email 与 Order Status。
自定义账户门户不进入当前范围；有真实自助服务需求时再评估 Customer Account API。

### D-009 — Shopify 原生内容

Pages/Blog 管理页面与文章，Metafields/Metaobjects 管理结构化内容。
独立 CMS 只在多人审批、排期、跨渠道复用或翻译流程出现可测瓶颈后评估。

### D-011 — Custom Crystal 后置

不建实时配置器。先通过普通变体、咨询或人工服务验证需求；组合规则、动态定价、
3D 和 Shopify Functions/App 需另行批准。

### D-012 — 不使用 AdSense

不引入广告组件、脚本或广告布局预留。

### D-013 — 初始 HTML 可读

索引页面在初始响应中包含主要内容、链接与适用结构化数据。
按数据时效选择静态、ISR 或动态服务端渲染，不强制每次请求 SSR，不做 client-only 索引页。

### D-014 — 只公开真实运营市场

内部保留 typed market context；只为已运营市场生成 URL、Catalog、hreflang 和 sitemap。
未来扩展优先复用同一前端与 Shopify Store，不预建未获批准的公开页面。

### D-024 — Market、Language、URL、Currency 分离

Market 定义 Catalog、可用语言、Pricing、Currency、Tax、Shipping 与 Legal context。
Language 决定内容，地区参与 Market 解析；Currency 不进入 URL/canonical。
同一 Market 内切语言不改变商业事实，跨 Market 必须隔离价格、库存与 Cart。

### D-035 — Canada 保持 planned

只有 US 启用。CA/CAD/en-CA/fr-CA 保留 typed 规划配置；
`/en-ca`、`/fr-ca` 及其子路径返回 404，不导航、不索引、不生成业务页面。
启用前必须重新批准 Catalog、币种、翻译、Checkout、Shipping、Tax 与 Legal。
当前只保留统一 404 路由边界，不维护停用市场的业务模板。

### D-027 — 根路径仍是 en-US

不建立 Global Site，不强制 IP redirect。Header 只切 US 语言，Footer 显示当前市场。
当多个真实市场或错误市场访问证明有需要时，可评估 noindex `/choose-region`。
若将 US 迁至 `/en-us/`，必须另做 URL、redirect、canonical 与 hreflang 迁移决策。

## 工程与品牌

### D-017 / D-018 — UI 与工具链

Next.js CSS + CSS variables/tokens，无 UI kit。Node 固定 24 系列，包管理器与直接依赖
使用精确版本，唯一版本清单是 [package.json](../package.json)；安装使用 frozen lockfile。

采用最新相互兼容的稳定版，不启用 canary/beta，不编写旧版本运行时兼容层。
当前 ESLint 9.x / TypeScript 6.0.x 是业务方接受的例外：Next 的 React/import/a11y
插件尚未支持 ESLint 10，typescript-eslint 仍依赖 TypeScript 6 API。
不通过放宽 peer 声明或禁用检查掩盖不兼容；下一次升级重新验证插件支持。

`verifyDepsBeforeRun: warn` 保留依赖变更提醒；manifest/lockfile 变化后显式 install。
`pnpm typecheck` 先运行 `next typegen`，再检查 TypeScript，支持全新 checkout。
Playwright 范围由 D-043 控制。

### D-019 — 品牌名称与资产

品牌名为 Joya Mana；品牌文案和视觉 tokens 集中配置。
Logo、字体授权、颜色及真实商品摄影/视频已确认。
网站英/西语标题使用 Newsreader、正文与价格数字使用 Manrope。繁中品牌标题与 PDP
标题使用 Noto Serif HK 500；正文、商品卡标题和导航/操作界面使用 Noto Sans HK。
中文 Web Font 只由繁中布局加载，通过现有 next/font 自托管并按字符范围分片，
不向访客引入 Google 字体请求；加载期间保留系统后备字体。
商标、社交账号与内部价格带在业务侧管理，不是网站发布门禁。
客户可见声明仍须真实，Working 定位不自动成为已证实商品承诺。

### D-020 — 商品模型与低库存

Shopify `custom.product_model` 支持 `standard`、`natural_variation`、`one_of_one`。
天然独件一物一图、一物一库存；标准商品诚实披露天然差异。
每件商品附带专属 guidebook 是已确认的履约事实。

PDP 只对明确的 standard/natural_variation，在所选 Variant 可售、精确库存为
1–3、不允许超卖且数量步进为 1 时显示准确低库存。独件、未知模型、未知库存与
oversell 排除；商品卡不显示低库存。具体数量契约见 [Commerce Spec](COMMERCE_SPEC.md)。

### D-021 — 政策发布门禁

客户可见 Shipping、Returns、Taxes、Privacy/Terms 等事实须负责人批准，
与 Shopify 配置一致；未确认内容不发布、不进 Schema。
当前 Shipping/Returns 承诺已确认，Terms 占位内容已修正。
特殊配送、费率和税费仅按 Q-003B/C/E 各自范围跟踪，不扩大成全站门禁。

### D-022 — 内容治理

项目负责人最终审批。AI 可辅助草拟，不能充当作者资历或事实来源。
矿物、文化、历史与科学内容人工核实，不虚构作者、专家、评论或来源。

## 页面与交互

### D-015 — 栏目统一为 Blog

URL、导航、metadata 与内容模型统一使用 `/blog` 和 Blog；
不使用 Journal/Diario 作为同一栏目别名。

### D-029 — Header 语言入口

Header 只切当前 Market 的语言，US 为 EN/ES/繁中；中性图标配可读代码和 accessible name。
切换不改变 Market/Catalog/Currency/Cart；未来地区选择放在 Footer。
目录入口按 D-036 数据驱动，当前 Footer 不展示虚假的市场切换器。

### D-030 — PDP 布局与购买操作

宽度大于 760px 时媒体/购买信息各 50%；左侧整块媒体面板 sticky，相关商品区前释放。
移动端单列、不 sticky；不建独立滚动区。
Add to bag 为主 CTA，Buy now 为 outline 次 CTA。
Buy now 使用所选 Variant/数量/Market 创建独立单商品 Shopify Cart，
获取最新 checkoutUrl，不清空、改写或带入现有 Bag。
Checkout 门禁关闭时禁用并解释原因，不模拟订单成功。

### D-031 — Variant 价格

选择项左侧为消费者款式名，右侧为当前 Market 的 Variant price。
选择后更新 PDP 主价格；所有金额含 currency code。
内部供应商名称、素材名和文件名不得进入消费者文案或客户端商品字段。

### D-032 — Search 与 Bag 工具

Search 放大镜、Bag 购物袋图标；桌面配文字，移动端保留 accessible name 和 44px 目标。
英文使用 Bag / Add to bag，西语 Bolsa；有商品时显示数量徽标。
公开路由仍为 `/cart`，代码与 Shopify 模型仍使用 cart。

### D-033 — 内容枢纽与导航

Header 保留数据驱动 Shop/Category/Design Collection、Crystal Guide、Blog、About。
工具顺序为 Search、Language、Bag。当前没有 New 入口；
只有稳定上新且至少 4–6 个近期商品时才重新评估唯一 URL 与索引意图。
Guide 使用资料目录，Blog 使用 Featured article + 编辑列表；
都在初始 HTML 输出真实链接与摘要。首页不放 Blog 或 Collection 推荐。

### D-034 — 移动导航

移动 Header 为 Menu / 居中 Wordmark / Search+Bag 三栏。
全屏 Menu 包含同一导航数据，Language 位于底部；支持滚动锁定、Escape、焦点锁定、
关闭后返回焦点与 44px 目标。桌面工具统一字号、描边、间距、hover/focus。
About 内容按 D-040 读取，不注入未获批品牌故事。

### D-036 — Category 与 Design Collection

`/shop` 全商品；`/category/{handle}` 表达 Shopify Standard Product Category；
`/collections` 与详情只表达设计系列。稳定英文 handle 在 US 各语言间共享。
分类由 taxonomy ID allowlist 映射，不按 title/tag/Product Type 猜测。

只有 Headless 可见、非空且 `custom.collection_kind=design_series` 的系列进入导航。
0 个隐藏入口，1–2 个直接展示名称，3 个以上合并 dropdown 并链接 View All。
Hub 保留真实空状态。商品成员继续以 Shopify 为来源，不复制 SKU、价格或库存。
完整系列成员模型使用 Product `custom.design_series` reference 驱动 automated Collection；
story/lookbook 的未完成部分见 Roadmap 与 Shopify setup。

已公开 `/collections/bracelets` 等类别别名永久重定向到 `/category/bracelets`，
不开放重复 canonical。未来改 handle 必须保留明确的 URL 迁移与回滚方案。

### D-037 — 客服身份

客服、隐私与公开联系统一使用 `info@joyamana.com`。
Inbox、负责人/备援、外发认证与回复/垃圾箱表现已确认；
收到客服请求不构成营销订阅。新增服务时段或 SLA 需单独批准。

### D-038 — Contact 表单后置

当前正式客服为 Email-only，`CONTACT_FORM_ENABLED=false`。
保留可关闭的 Server Action + Resend HTTP adapter；Next.js 不保存留言、
不创建 Shopify Customer，表单不构成营销同意。
未来启用须批准供应商的数据边界、保留期、成本和退出路径，
验证发件域与 WAF/滥用控制。姓名、邮箱、可选订单号和留言仅用于投递；
secret/PII 不进入客户端、日志或 Analytics。

### D-039 — 精简服务页面

不设 FAQ、Disclaimer 或独立 Product Care 页；对应 URL 返回 404，不进 sitemap。
声明放在 Terms/相关内容场景；商品护理放在 PDP；真实问题由客服与政策页处理。
有独立、持续的用户任务和正式内容后再评估新增页面。

### D-040 — About subtree

`/about` 是 hub 和 Header 唯一入口；直接子页使用 `/about/{handle}`。
Shopify `content_page` root `about` 的有序 `child_pages` 决定成员与顺序。
未引用、错误类型、不完整条目不形成公开子页；不自动遍历所有 Metaobject。

条目须有完整 title/body/last_updated/seo_title。
navigation_title 缺失回退 title；summary 明确填写才展示，seo_description 缺失使用安全正文摘要。
没有有效子页时不显示空导航；有子页时所有页面共享真实链接组成的文字 tabs，
当前页 aria-current，不使用隐藏 panel 替代 URL。

About hub 使用 AboutPage，子页使用 WebPage/BreadcrumbList；各自有 H1、metadata 与 canonical。
翻译 fallback 可阅读，但 noindex、不进 sitemap/hreflang；es-US 不将 fallback 子页放入
root tabs，zh-Hant-US 按 D-049 保留有效子页的入口。
当前 About/Philosophy/Approach/Founder EN/ES 正文与其中事实陈述已获业务方确认。
改公开 handle 或移除子页前须决定 redirect/410，不能批量跳首页。

### D-041 — 原生 Blog 与 Crystal Guide

Shopify Blog `blog` 驱动 `/blog/*`，`crystals` 驱动 `/crystals/*`；
使用原生 Article 正文、摘要、作者、图片、日期、tags、SEO 与翻译。
结构化扩展优先 Article Metafields；不同时维护同主题 Crystal Metaobject 正文。
语言共享 handle；fallback 可读但不索引、不进入对应 sitemap/hreflang。
当前测试文章暂不处理，Editorial 保持关闭；正式内容准备后再审核、替换或下线。

### D-042 — Shopify-only runtime

商品/Cart、Policy、About、Accessibility、Blog/Guide 只从 Shopify 读取。
缺失、不完整或请求失败时按页面契约显示 404/不可用，不恢复本地业务正文、
mock catalog 或 provider 切换。缺图显示中性不可用状态。
按钮、导航、错误提示与页面结构等 code-owned 文案仍由 Next.js 管理。
测试可 mock fetch；生产回滚使用代码版本，不恢复第二份商业事实来源。

## 发布与运营

### D-043 — 暂缓 Playwright

当前不安装、不编写、不维护 Playwright。使用 Vitest、build、HTTP/Shopify 合约检查
及有记录的人工浏览器/Checkout smoke；不能把它们称作自动化支付 E2E。
客户端状态、回归频率、团队或设备矩阵明显增长后再评估。

### D-044 — Canonical origin

唯一 origin 为 `https://www.joyamana.com`，apex 对应 URL 永久 308 至 www。
Production `NEXT_PUBLIC_SITE_URL` 必须精确匹配；canonical/OG/hreflang/sitemap
不使用 apex 或 Preview origin。环境修改后 redeploy，并复核实际 HTML。

### D-045 — 索引矩阵

部署总开关 `NEXT_PUBLIC_SITE_INDEXABLE` + 仓库 `src/config/indexing.ts`
locale/page-group 矩阵 + 页面自身 readiness，共同决定索引、sitemap、hreflang 与 Schema。
业务方已明确批准所有已启用语言 en-US/es-US/zh-Hant-US 的 Core、Commerce、Policies
配置为 true，Editorial 保持 false。配置变更随部署生效，不代表 Production 已更新。
Cart、Search、参数页、未知路径与未上线 locale 始终排除；Preview 总开关必须关闭。

这替代了继续关闭繁中 scope 的发布选择，不改变 URL、语言可见性、部署总开关或单页
readiness。索引范围批准不代表译文已审校：Product/Collection fallback 尚无自动检测，
缺译商品也可能进入 sitemap/hreflang/Schema；每次发布仍须人工核对 ES/繁中正文、
metadata 与等价关系。已检测到回退的 Policy/About/Accessibility 等单页继续 noindex。
策略与环境变化都需部署；紧急关闭总开关可全站 noindex，细分回退通过恢复矩阵部署完成。

### D-046 — 内容/导航五分钟缓存

当前接受 300 秒再验证窗口，不实现 webhook 或手动失效端点。
内容更新后等待至少五分钟并从实际响应确认更新；缓存再验证失败时可能继续提供旧内容，
不能把五分钟理解为硬失效或紧急下线保证。
价格、库存、PDP、Cart 与 Checkout 保持 no-store。
高频发布、紧急下线或协作成本增加后，再批准 HMAC/鉴权、幂等、最小 tag 失效与监控方案。

### D-047 — 网站问题范围

Q-001A/B、Q-002A/B/C 移出网站范围；Q-003A/F、品牌资产/摄影和客服运营已解决。
仓库不保存内部商标、margin、商品审批、包装成本或未公开法律记录。
Q-003B/C/E 仅按各自配送/费率/税费范围跟踪。
Organization/Site Settings 仍需获批公开字段映射，属于工程缺口。

### D-048 — Checkout/payment readiness

业务方确认 US 下单与支付完整支持，Payment test mode 流程未发现问题。
已验收 Production 可启用 Checkout；部署级开关与默认关闭保护仍保留。
test mode 证据不代表已执行 live charge、退款或 payout 对账，后者须单独记录。

## Pending

### D-016 — AI crawler policy

搜索/用户触发抓取与训练用途分别决定。
实施前核对供应商当前 User-Agent 与官方说明，集中生成 robots 规则；
不得把代码默认当成业务批准。

## 语言扩展

### D-049 — US 繁体中文与香港用语

Status: Accepted — dev 完整代码接入；索引批准见 D-045，main 合并与 Production 部署另行授权
Date: 2026-09-11
Owner: Project owner / Engineering

业务方要求在 dev 完整接入同一 US Market 的 `zh-Hant-US`，采用繁体字和香港惯用书面语。
不新增香港/台湾 Market，不改变 US Catalog、USD、库存、购物袋、配送或政策事实。
Shopify 繁体语言已发布。最新要求允许缺译页面正常访问并显示 Shopify 默认语言正文，
不隐藏页面、不复制本地业务正文、不新增待完善占位。英文回退不视为繁中译文完成。

URL 为 `/zh-hant-us`，HTML/hreflang 使用 `zh-Hant-US`；Shopify 接口分别映射
`ZH_TW` / `zh-TW`，不将平台语言编码当作交易国家。香港措辞与格式偏好独立维护，
不用 `zh-HK` 路径误表达市场，也不拼接多个 region subtag。

实施优先使用独立 locale registry/类型、语言级发布状态、共享 adapter 与薄路由，
不迁移 EN/ES，不引入大型翻译平台。替代方案中的仅简转繁无法保证香港用语；
新增 HK Market 或复制 storefront 会错误改变商业边界。
接入覆盖三语言导航、Cart/Checkout、字体和内容 readiness。
不实施缺译隐藏或商品审核 allowlist；最新索引批准统一见 D-045，Editorial 仍关闭。
正式译文和持续 readiness 流程继续验收，不能只切配置即认为已审校。
Checkout 默认繁体不保证香港措辞，单独验收。
回退只收回新语言范围；已索引 URL 的下线需按现有生命周期规则处理，不批量跳首页。

运行映射见 `src/config/locales.ts` 和 [TECH_SPEC.md](TECH_SPEC.md)，后台维护步骤见
[SHOPIFY_CATALOG_SETUP.md](SHOPIFY_CATALOG_SETUP.md)；执行与验证记录见 Archive。
本条修订 D-006/007/029/045 的语言范围，不改变现有 EN/ES 索引批准。

## 新决策模板

```md
### D-XXX — Title

Status: Working | Proposed | Accepted | Pending | Superseded | Rejected
Date: YYYY-MM-DD
Owner:
Context / alternatives:
Decision / reason:
Consequences:
Migration / rollback:
Supersedes:
```
