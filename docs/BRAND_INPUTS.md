# Joya Mana Brand Inputs

Status: Active input record  
Owner: Project owner  
Last updated: 2026-08-31
Source: `Bling Omen 品牌开放问题与执行约束.pdf`（11 pages, 2026-08-03）

本文件把业务方回复分为 `Confirmed`、`Working` 和 `Pending`：

- `Confirmed`：可写入规格和决策。
- `Working`：可指导测试站和 MVP 原型，但必须集中配置、易于替换，不能作为
  最终外部事实。
- `Pending`：不得对外发布，不得进入政策页或结构化数据。

## Brand

### Confirmed

- 品牌名称：Joya Mana。

### Working

- 工作定位：

  > A design-led crystal brand offering modern jewelry and one-of-a-kind
  > pieces selected for their natural character, symbolism, and giftability.

- 核心购买任务：自用与日常佩戴、礼赠、收藏、个人 spiritual practice、
  家居氛围。
- 品牌语气：Modern、Mysterious、Refined、Warm、Trustworthy。
- 视觉方向：现代、克制、有神秘感，突出水晶纹理和光泽，移动端与商品图片优先。
- 参考品牌：Hermès、Apple；仅参考克制、工艺感和信息层级，不复制视觉、
  文案或页面结构。

### Confirmed constraints

- 不使用未经验证的 luxury、premium、rare、ethical、healing、sustainable、
  certified。
- 不使用恐惧、命运、焦虑或保证人生结果推动购买。
- 不把 spiritual practice 写成医疗功效。
- 避免廉价、杂乱、模板化 New Age 视觉，避免过量星座、塔罗、魔法与闪粉。
- 工作名称、品牌文案和视觉 token 必须集中配置，域名与商标确认前可统一替换。

### Pending

- 美国商标与社交账号可用性；`.com` 域名和 DNS 已完成。
- 目标价格带和 AOV。
- Logo、字体授权、最终颜色与商品摄影。

## Catalog

### Confirmed

- 同时支持标准可补货商品、存在轻微天然差异的标准商品，以及天然独件。
- 天然独件必须一物一图、一物一库存，quantity = 1。
- 标准商品可使用代表性图片，但必须披露合理天然差异；差异明显时展示多件样本。
- 不用复杂 Variant 掩盖本应独立的 Product。
- 天然独件通常不创建无意义 Variant。
- Custom Crystal 不是 MVP 核心；实时 3D/复杂组合器后置。
- Subscription 不进入 MVP，不安装 subscription app。
- Gift Card、预售后置；礼品包装可在成本和运营确认后启用。
- 每件商品随附一份 Joya Mana 专属 guidebook；这是已确认的 package contents，商品、
  About 与履约必须保持一致。

### Working

- 候选 Variant：Size、Length、Metal、Crystal，以及确属真实选择的 Color。
- 如需初期定制服务，使用咨询表单、商品备注、客服或少量预设选项。

### Pending

- 首发产品清单、SKU 数、晶体类型和主 Collection。
- 礼盒形式、包装成本与礼品留言流程。

## Market and operations

### Confirmed

- 当前只运营 United States Market / USD。
- 同一个 US Catalog 支持 en-US 与 es-US；两种语言共享商品、库存、价格、
  配送、税务和法律上下文。
- URL 使用根路径表示 en-US，使用 `/es-us/` 表示美国西语；货币不进入 URL。
- 不开放 Canada、UK、EU、Australia 或其他国际市场。
- 不提前编码未来市场价格、语言、税费或配送业务逻辑。
- Shopify hosted checkout，优先评估 Shopify Payments 及账户可用的钱包/支付。
- 未确认政策不得发布，不得进入 policy Schema。
- 客服、隐私请求和公开联系统一使用 `info@joyamana.com`；业务方已确认 inbox 可以
  正常收信。当前正式客服模式为 Email-only，Contact 表单后置。
- 当前 Shopify Shipping/Returns 正文中的运营承诺已确认：订单通常在 1–3 个工作日内
  处理，合格退货可在收货后 15 天内申请，并按已发布正文执行退货运费、原始运费和
  退款处理规则。

### Working

- 不要求首发实时聊天。
- 目标响应时间可在能力确认后采用 1–2 个工作日。
- 品牌包装、基础护理卡、礼品留言作为候选。

### Pending

- 中国直发、美国本地、3PL 或混合履约。
- Alaska、Hawaii、Puerto Rico、PO Box、军事地址范围。
- carrier、实际 Checkout 运费与免邮门槛；handling time 已确认为通常 1–3 个工作日。
- 销售税、关税、进口费用责任。
- 法律实体、合规地址和政策审批人。

## Content and claims

### Confirmed

- 项目负责人确定主题、审核商品/品牌内容并最终发布。
- AI 可协助草拟和整理，但不是作者资历或事实来源。
- 矿物、历史、文化和科学内容必须人工检查。
- MVP 使用 Shopify Pages、Blog、Metafields/Metaobjects 作为 headless 内容来源；
  独立 Headless CMS 后置。
- URL 与前端栏目名统一使用 `Blog`；不使用 Journal/Diario/Guides 作为同一
  栏目的替代名称。
- 测试站同时创建 en-US 与 es-US；西语是同一 US Market 的内容翻译，不是
  独立商品或西班牙 Market。
- 西语翻译在人工审校前必须保持 prototype/noindex 状态。
- 接受现有 claims policy：传统/文化/个人实践需限定；不诊断、治疗、治愈、
  预防疾病，不保证财富、爱情、好运、保护或人生结果。
- 不虚构作者、专家、资历、来源或 Reviewed by。
- 当前公开 About root、Philosophy、Approach 与 Founder 的 EN/ES 正文已由业务方确认；
  Founder 的个人经历、健康信息、学习/实践背景和社区工作陈述可按现有正文使用。

### Working

- 首发目标：约 5–10 篇 Guide/Article。
- 上线后目标：每月 2–4 篇，以质量、可信度和内链优先。
- 优先主题：crystal care、materials/sizing、gift selection、natural
  variations、individual crystal guides、jewelry care、brand philosophy。

## Accounts, analytics and services

### Current project state

下列是截至 2026-08-31 的实施/账号事实，不会把测试店配置自动升级为生产批准：

- Shopify store、Headless channel、服务端 private Storefront token 与至少一件
  Headless-visible 测试商品已可用。运行时已是 Shopify-only，不再使用
  本地商品/正文 fallback。
- Shopify Policies、`content_page` Metaobject 与原生 Blog/Article 读取路径已实现。
  Shipping/Returns 与 About EN/ES 正文已由业务方确认；Privacy/Terms 的法律主体、
  Headless privacy/consent 和最终法律验收仍按适用门禁处理。Terms 后台占位地址/电话
  已修正并由 Storefront API 直接复核。
- Shopify 已发布非空 `Patron Saint` Design Collection，且
  `collection_kind=design_series`；系列 description/SEO 与 story/lookbook 数据链路仍待完成。
- `blog` 与 `crystals` 当前仍各自只有测试 Article；因尚无正式内容，业务方决定暂不
  处理，继续保持全站 noindex，不能把测试正文升级为已批准内容。
- 公开联系地址已决定为 `info@joyamana.com` 且 inbox 可收信；Contact 表单投递代码
  保留但当前明确后置，仓库示例值及未配置时默认关闭。Resend、表单数据处理和滥用
  控制只有未来重新启用表单时才进入范围；负责人/备援与外发认证仍需运营验收。
- `www.joyamana.com` 已由 Vercel Production 公开响应，`checkout.joyamana.com`
  已由 Shopify Online Store 公开响应；Preview branch/deployment、设计资产、GA4、
  GSC、Merchant Center、CRM/Email、Reviews 和 Consent 仍未完成生产准备或选型。
- D-044 已确认 `https://www.joyamana.com` 为唯一 Production canonical origin，
  `https://joyamana.com` 308 至 `www`。Vercel 环境值已配置；当前公开 deployment 的
  `og:url` 仍为 `https://joyamana.vercel.app`，需在新 deployment 后复核。

### Confirmed boundaries

- 无真实评论时不展示 Reviews。
- 最小分析栈：Shopify + GA4 + GSC。
- 先定义 consent 和事件，再选择 Email/CRM。
- 首发使用 Vercel 基础日志，Beta 前再评估 Sentry。
- Customer Account、Gift Card、Wishlist、Loyalty 均后置。
- Training crawler policy 上线前单独决定。
- 任何 token、密码、API secret 或客户信息不得写入 Markdown 或提交仓库。

## Prototype authorization

业务方已授权 Codex：

- 尽快建立能运行的美国单市场测试网站。
- 为同一 US Market 和 Catalog 创建英文根路径与 `/es-us/` 西语路径。
- 使用集中、可替换的工作品牌配置。
- 在自动化测试或明确标注的 fixture 中使用开发样本，不把样本升级为
  品牌或商品事实。D-042 后 storefront 运行时禁止使用本地样本作为
  Shopify 缺失时的 fallback。
- 建立兼容标准商品与天然独件的数据模型。
- 实施 Shopify-first 内容架构和基础 Search/Collection/navigation。
- 预留未确认政策入口，但保持不可索引且不发布承诺。
- 对待确认字段使用明确的开发占位或 TODO。

仓库示例值及未配置时的代码默认值保持 `noindex`；只有真实域名、商品、政策、
Shopify 和发布验收全部完成后才能启用索引。合格 Product 的 JSON-LD 已实现但受
全站索引门禁抑制；Policy Schema 尚未实现，不能因开启索引门禁而视为自动具备。
