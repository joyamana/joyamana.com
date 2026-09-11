# Maintenance History through September 2026

Status: Archived — 仅用于追溯，不作为当前实现依据
Archived: 2026-09-11

本次整理将日期化记录从当前规格移出。有效决策已合并到
[`DECISIONS.md`](../DECISIONS.md)，当前状态见 [`PROJECT_SPEC.md`](../PROJECT_SPEC.md)，
发布操作见 [`LAUNCH_RUNBOOK.md`](../LAUNCH_RUNBOOK.md)。以下版本、状态和门禁只反映当时。

## Decision maintenance notes

2026-08-14 maintenance note: 将 pnpm 从 11.18.0 对齐到 Homebrew 稳定版
11.21.0。两者属于同一 major，依赖集合和 lockfile 格式不变；此调整修复新版
pnpm 在读取旧 `packageManager` 固定值时尝试切换原生 executable、但 lockfile
没有对应 pnpm executable identity 而导致命令无法启动的问题。

2026-08-22 maintenance note: 将 pnpm 从 11.21.0 升级并固定到 11.22.0，与当前
稳定版和部署环境保持一致。继续使用精确版本而不是 `latest` 或未固定的全局
版本，避免本地、CI 与 Vercel 因包管理器自动升级产生不可复现的安装结果。

2026-09-02 maintenance note: 将 pnpm 从 11.22.0 升级并固定到 11.24.0，继续与
当前本地稳定版保持一致。Node 26.8.1 仅作为本地兼容性观察环境；由于 Node 26
尚未进入 LTS，且 Vercel Production Functions 尚未正式支持 26.x，仓库、正式
构建和部署基线继续固定 Node 24。

2026-08-31 maintenance note: 当前 US UI 没有可见的 prototype badge；测试状态由
`noindex`、Checkout/Contact release gates 和受控环境表达。若 D-019 的“明确”意指
客户可见标签，该项尚未实现，需先确认不会与品牌测试或可用性目标冲突。

2026-08-31 deployment note: `www.joyamana.com` 已指向 Vercel Production，
`checkout.joyamana.com` 已指向 Shopify Online Store。域名配置完成不代表美国商标、
社交账号、支付、政策、索引或完整发布验收已完成。

2026-09-02 scope note: 美国商标/社交账号与价格带/margin 已由业务方从网站开放问题中
关闭并在项目外管理，不再是代码、索引或 Checkout 门禁。Logo、字体授权、颜色与真实
商品摄影/视频也已确认完成；仓库仍不得虚构或公开内部商业资料。

2026-08-31 content note: 业务方确认当前每件商品均随附一份 Joya Mana 专属 guidebook；
这是实际 package contents/履约承诺，不再作为待定包装假设。礼盒、包装成本和礼品留言
已移出当前网站范围；未来若增加礼赠功能，作为新范围重新定义，不沿用旧 Q-002B 门禁。

2026-09-01 inventory note: 业务方批准 PDP 显示准确的 `Only X left`，阈值为 3。
只有结构化模型明确为 standard/natural-variation，且当前 Variant 可售、库存已知、
不允许超卖、步进为 1 时显示；one-of-a-kind 和未知模型必须排除，商品卡不显示。

2026-08-31 approval note: 业务方确认当前 Shopify Shipping/Returns 正文中的运营承诺，
包括通常 1–3 个工作日处理、收货后 15 天退货申请窗口、适用退货运费责任、原始运费
和退款处理时限。该确认解除 Q-003D，并使 PDP 可以显示相同摘要；税务、法律主体、
支付和 Checkout 配置仍按各自门禁处理。Terms 后台占位地址/电话已由业务方修正，
Storefront API 直接复核不再返回占位符；2026-09-01 公开 Production HTML 复核也已
不含占位符。后续 Shopify 内容修改仍受当前 5 分钟缓存窗口影响。

2026-08-31 runtime note: Shopify 已有非空、Headless 可见且
`custom.collection_kind=design_series` 的 `Patron Saint` Collection，并已进入 Header、
Collections hub 和详情页。当前 Collection description/SEO 仍为空，Design Series
Metaobject/reference 与 story/lookbook 前端读取链路仍未实现；旧“无非空 Design
Collection / 未设置 collection_kind”状态已失效。

2026-09-02 operations note: 业务方确认 `info@joyamana.com` inbox、负责人/备援、
外发认证以及回复/垃圾箱表现均已完成验收。未来新增公开服务时段或响应 SLA 时，仍须
以实际客服能力单独批准。

2026-08-31 scope amendment: 当前正式客服模式为 Email-only，Contact 表单明确后置；
保持 `CONTACT_FORM_ENABLED=false`，Resend、表单滥用控制和表单投递验收不再阻塞当前
发布范围。未来重新批准表单时再恢复上述供应商和数据处理门禁。

2026-08-31 content approval note: 业务方确认当前 About root、Philosophy、Approach、
Founder 的 EN/ES 正文，以及 Founder 页中的个人经历、抑郁诊断、学习/实践背景、
社区/慈善工作和帮助数百人的事实陈述。上述内容不再是开放审核项。

2026-08-31 scope note: 当前 `hello-world` 与 `hello-for-crystal-guide` 仍是测试文章，
且无正式内容可替换；业务方决定本阶段暂不处理。它们不得被误记为正式内容或随索引
门禁进入 sitemap，未来准备正式内容时再替换/下线并完成 EN/ES 审核。
Migration / rollback: 本地 prototype entries 已移除。若未来升级为 Crystal
Metaobject，应先定义字段、Article 到实体的迁移和旧 URL 保留方案，再切换唯一事实来源。
Supersedes: D-009 与 `CONTENT_SEO_GEO_SPEC.md` 中“Crystal 必须由 merchant-owned
Metaobject 作为当前唯一正文来源”的部分；D-009 的 Shopify-first 边界与其他
Metaobject 用途继续有效。

## Historical Phase 0 exit criteria

## 11. Phase 0 业务退出条件

工程边界、测试店与样例数据流已足够支持后续实施，但 Phase 0 仍未达成下列
业务退出条件，不得因代码进展把它们标记为已批准：

- 工作品牌、Catalog 类型、内容和测试站边界已确认。
- 生产阻塞问题集中记录在 `docs/OPEN_QUESTIONS.md`。
- 正式首发商品和内容足以验证生产数据与发布流程。
- 真实 Shipping、Returns、Privacy 等政策有负责人。
- Shopify、Vercel、域名和内容维护责任明确。
- MVP PRD 与技术规格不再包含阻塞性占位信息。

## Initial launch procedure (superseded by ongoing release runbook)

## 8. 发布步骤

1. 冻结非必要内容和配置变更。
2. 记录当前 Production deployment 和 Shopify 配置快照/导出方式。
3. 运行全部自动检查和有记录的人工 production 浏览器/Checkout smoke；D-043 有效时
   不等待 Playwright，也不把人工结果写成自动化 E2E。
4. 在三个发布门禁均关闭的状态下，将已批准 commit 部署到受保护 Preview；如必须
   使用 Production，先建立受控发布窗口并确认访问、支付和回退范围。
5. 验证域名、SSL、首页、PDP、Bag、Policy、Contact Email 入口和全站 noindex。
   内容/导航使用 5 分钟缓存且当前无 webhook；变更后等待/清除约定窗口再做 smoke，
   并把这段陈旧窗口写入发布记录。
6. 先完成 Shopify Admin 中 Payment test mode、guest checkout、shipping、tax、
   branding、policy link 和 notification 配置验收；随后在受保护目标环境单独设置
   `SHOPIFY_CHECKOUT_ENABLED`，创建新 deployment/redeploy，再运行测试订单并验证
   payment、confirmation、Order Status 与 notification。失败时恢复门禁并再次部署。
7. 当前保持 `CONTACT_FORM_ENABLED=false`，以已确认可收信的 Email-only 渠道提供支持，
   不等待 Resend 或表单上线。未来若另行批准表单，再完成数据、发件域和滥用验收，
   在目标环境单独启用并创建新 deployment/redeploy 验证投递与降级。
8. 清理测试 Product/Article/订单标记和其他会被索引的测试数据，等待或清除已约定的
   5 分钟缓存窗口，再重验 Catalog、内容、Policy、Search 和内部链接。
9. 将同一已验收 commit promote/deploy 到受控 Production，先保持三个门禁关闭；
   单独核对 Production 的 domain、secret、Shopify context、访问保护和 rollback target。
   再按已批准记录逐个设置 Checkout/Contact gate，每次创建新 deployment/redeploy 并
   重做 Production smoke，不直接继承 Preview 环境值。
10. 退出 Shopify Payment test mode，复核 live provider、payout、Checkout、shipping、
    tax 与 notification 配置。若业务/支付规则允许，完成获批的低额真实订单、退款与
    对账；否则记录可接受的替代验收证据。测试模式未退出时不得 go-live。
11. 完成拟开放范围的内容/翻译/SEO/privacy 检查并确认 Production 非本地 HTTPS
    canonical 后，先 review、提交并部署 `src/config/indexing.ts` 中对应的矩阵 scope
    策略，同时保持 `NEXT_PUBLIC_SITE_INDEXABLE=false`；随后打开总开关并 redeploy。
    此时保留临时访问保护，逐组检查 metadata、sitemap、hreflang 和 Schema；细分回退
    通过恢复仓库策略并部署完成，紧急全站回退则关闭总开关并 redeploy。
12. Launch lead go/no-go 后解除 Production 临时访问保护，立即从外部网络验证首页、
    Checkout、Contact、robots、sitemap、Schema、hreflang 和永久 noindex 页面，再提交
    Search Console 与 Merchant Center。若外部 smoke 失败，恢复保护/门禁并 redeploy。
13. 每个门禁 deployment 均记录版本、环境值、smoke 和 rollback target；不要在同一
    未验证 deployment 中连续打开多个门禁。记录 go-live 时间与已知例外，开始
    launch monitoring window。

## 2026-09-02 external response snapshot

2026-09-02 外部检查确认 apex 308 至 `https://www.joyamana.com`、`www` 返回 Vercel
HTTP 200、`checkout` 返回 Shopify HTTP 200。D-044 确认 `www` 是唯一 canonical
origin；Vercel Production 环境值已由业务方配置，当前公开 deployment 的
canonical/OG 已复核为 `https://www.joyamana.com`。Production 首页和 `/es-us` 当前为
`index, follow`，sitemap 已包含双语言 Core、Commerce、Policies；Editorial、Cart、
Search 和参数页继续 noindex。D-045 使用部署总开关与仓库 locale/page-group 矩阵控制范围。
