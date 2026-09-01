# Joya Mana Brand Inputs

Status: Active input record  
Owner: Project owner  
Last updated: 2026-09-02
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

- 无当前网站发布待定项。美国商标/社交账号与价格带/AOV 在业务侧管理，不在
  网站仓库跟踪；Logo、字体授权、最终颜色和真实商品摄影/视频已确认完成。

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

- 无当前网站架构待定项。具体商品、SKU、晶体和 assortment 由 Shopify/业务运营
  管理；礼盒、包装成本和礼品留言已移出当前网站范围，未来若启用礼赠功能另立范围。

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
- 履约模式以及法律实体、合规地址和政策审批责任已由业务方确认解决；仓库不重复保存
  非公开运营记录，客户可见事实以 Shopify 配置和已批准 Policy 为准。
- `info@joyamana.com` 的负责人/备援、外发认证与回复/垃圾箱表现已确认。

### Working

- 不要求首发实时聊天。
- 目标响应时间可在能力确认后采用 1–2 个工作日。
- 品牌包装、基础护理卡、礼品留言作为候选。

### Pending

- Alaska、Hawaii、Puerto Rico、PO Box、军事地址范围。
- carrier、实际 Checkout 运费与免邮门槛；handling time 已确认为通常 1–3 个工作日。
- 销售税、关税、进口费用责任。

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

## Project status routing

本文件只维护品牌、Catalog、Market、运营和 claims 的业务输入，不再复制部署、账号和
实施快照。当前项目状态见 `PROJECT_SPEC.md`，当前外部依赖见 `OPEN_QUESTIONS.md`，
Analytics/Customer lifecycle 见对应领域规格。2026-08-31 的旧账号/原型记录已归档到
[`archive/brand-project-state-2026-08.md`](archive/brand-project-state-2026-08.md)。
