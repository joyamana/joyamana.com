# 商品与交易规格

Shopify 管理商品、价格、库存、折扣、Cart、订单、支付与 Checkout。前端负责帮助理解、
选款和恢复错误，不复制最终定价、订单或支付系统。后台维护步骤见
[Shopify 维护](SHOPIFY_CATALOG_SETUP.md)。

## 商品模型与事实

| `custom.product_model` | 含义 | 图片与履约 |
|---|---|---|
| `standard` | 可重复履约的标准商品 | 使用真实代表图，说明合理天然差异 |
| `natural_variation` | 天然差异较明显的标准商品 | 明确范围，必要时展示多件真实样本 |
| `one_of_one` | 天然独件 | 一物一图、一物一库存，quantity=1 |

每件正式商品必须明确模型，不用库存、标题或图片推断。缺失/无效模型不输出猜测，
也不因此禁止正常购买。天然独件不建立无意义 Variant；差异应独立为 Product 时不能
强行合并。标准设计搭配独件也须说明收到具体实物还是同规格相似件。
每件商品随附 Joya Mana 专属 guidebook，这是已确认的履约内容。

Shopify 核心字段包括身份/handle、发布状态、title/description/SEO、真实媒体、Category、
options/Variants/SKU、价格/compare-at/currency、可售性、库存和数量规则。
SKU 唯一；GTIN/MPN 仅在真实存在时填写。当前实体不保留 vendor、Product Type/tags、
Variant SKU 或 inventory policy；需要 feed/披露时明确用途再接入，不从名称猜测。

正式商品还需真实材料、尺寸/weight/fit、天然差异、可验证来源、处理/染色/涂层/合成披露、
制作事实、exact/representative image、package contents、care/安全与相关内容。
这些知识字段、图片代表性披露和内容关联尚未接入 mapper，不能用本地文案制造资料。

## 商品类别与设计系列

`/shop` 为全商品，`/category/{handle}` 表达 Shopify Standard Product Category，
`/collections/{handle}` 表达原创设计系列。分类按 taxonomy ID allowlist，不按 tag、
标题或 Product Type 推断。公开类别须非空；类别别名的重定向见内容与索引规格。

系列须 Headless 可见、非空且 `custom.collection_kind=design_series`。
Product `custom.design_series` reference 用于系列归集，Collection 管理 URL/SEO/成员，
Design Series Metaobject 用于故事和视觉，不另建第二个可索引系列页。
当前只读取 Collection 类型、描述、媒体和商品；reference/story/lookbook 尚未接入。

运营用 automated/merchandising Collection 可辅助后台归组，不自动成为公开系列或索引页。
类别与系列须有各自唯一意图、标题和真实说明；存在但缺少有效描述的系列仍可浏览商品，
详情 noindex，不输出 Schema 或进入 sitemap。

## Variant 筛选、展示与深链接

- Variant `custom.colors` 为 `list.single_line_text_field`，校验 JSON 字符串数组，
  trim/NFC/大小写规范化去重。空/无效值不匹配，颜色事实不从图、名称、tag 或品牌色推断。
- 默认语言原值作为稳定键，翻译字段按 Variant ID 补取默认键；显示词典只负责界面翻译，
  未知颜色保留原标签。不复制各语言商品或自行合并颜色别名。
- Shop、Category、设计系列完整读取范围内 Variant：颜色组内 OR，与 `available=1`
  跨组 AND，所有条件须在同一款命中。默认保留售罄商品，无结果返回 200。
- 每个 Product 只显示一张卡片，按可购买优先、Shopify POSITION、ID 固定选款。
  `sort=price-asc|price-desc` 按该款十进制 USD 单价全局排序，平价稳定按来源/ID，
  切排序不能换款；不能用商品最低价替代展示款价格。
- 图片、款式、价格、状态、链接和适用 Schema 共用选定 Variant。网页颜色读取、筛选、
  图价和 PDP 初选已接通，后台新值在下一次 no-store 请求自动读取，无需再做网页绑定。
- 列表按 POSITION 完整分页，轻量批次/并发和读取预算由代码集中维护。
  cursor、重复 ID、归属或预算失败时显示错误，不能展示静默截断的结果。
- 卡片使用 Variant image；Storefront 可能提供产品图后备，非空不证明专图已绑定，
  后台需逐款核对。PDP 所选款无图时允许真实产品图库后备，仍不得制造商品图。
- `/products/{handle}?variant={numericID}` 服务端验证归属并初始化同款。
  无参数按相同固定规则选款；售罄款保留选择并禁购；失效/外商品 ID 要求重新选择。
- 切款同步 URL、图价、minimum 和购买动作；返回/前进、刷新与三语言切换保留允许的业务参数。
  更新中与需要选款不显示成售罄。参数索引行为统一见内容与索引规格。

## 价格、数量与可购买状态

所有金额来自当前 Market 的 Shopify 返回；展示 currency code，真实 compare-at 才显示原价。
优惠码、折扣、税费、运费和最终总价由 Shopify 校验；不得承诺尚未计算的总价或虚构优惠。

列表、PDP 和 Offer 共用 Product/Variant 可售性及数量规则。PDP/Bag 的新提交须为正整数，
满足 minimum/maximum/increment、站内每款 99 件上限，以及已知可用库存。
上限须向下对齐步进，例如 increment=2 时最大可选 98。

只有 `currentlyNotInStock=false` 且 `quantityAvailable` 为已知非负整数时，才使用保守库存
上限。`currentlyNotInStock=true` 可能允许继续销售，库存 `null` 不等于 0；两者仍受
Shopify 可售性、数量规则、mutation warning/user error 和最终 Checkout 校验。
此标志不能证明 inventory policy，不用它声称禁止超卖或保证发货时效。

准确 `Only X left` 当前暂停。若恢复，只能用于明确的 standard/natural_variation、
所选款可售、可靠禁止超卖、精确库存 1–3 且步进为 1 的 PDP。独件、未知模型/库存和
超卖排除；商品卡不显示，不用红色警报、倒计时或虚假紧迫性。

暂时售罄通常保留 PDP 信息并禁止购买；永久下架按内容价值和等价替代处理，不批量跳首页。
当前不启用预售、Subscription 或 Gift Card；新增运营模式须另行确认。

## Bag 与 Checkout

Bag 支持创建、读取、加购、修改数量、移除、恢复和清空。行价格与小计来自 Shopify；
税费与运费在 Checkout 确认。商品标题/图片链接保留 Variant 与当前语言。

- 读取最多 500 行，单页和单次 mutation input 最多 250，清空分批执行。
  校验分页 cursor、重复行、Cart 一致性和总数量；不能把前 250 行当作全部。
- 已存行只校验结构有效，不能因数量规则/库存变化令整袋不可读。显示行级问题并允许
  直接调整到当前有效数量；无法满足 minimum 时提示移除或重选。
- 新加购同时检查同款合并后不超过 99；服务端不能只依赖按钮限制。
- mutation 失败或部分成功时刷新实际剩余内容并保留错误，不声称清空成功。
  过期 Cart 的加购可安全建立新袋；不能因任意 API 故障静默丢失现有购物袋。
- Checkout 点击后重读最新 Cart，校验每行库存/规则/可售性并取得最新 URL。
  失败时返回安全的最新 Bag 供修正，不让问题行直接进入结账。
- Buy now 使用所选 Variant/数量/Market 的独立单商品 Cart，检查实际返回行和阻塞警告，
  不清空、改写或携带已有 Bag。
- Checkout URL 是 Shopify 不透明地址，按获准 host/locale 校验，不手工改写。
  cookie、secret 和 IP 边界见技术规格。

支付、地址验证、折扣、税费、配送和订单创建归 Shopify。Next.js 不收集、代理或保存卡数据。
订单确认、交易 Email 与 Order Status 使用 Shopify，游客可访问，不建第二份订单系统。
开关关闭时购买/结账说明不可用，不模拟成功；业务支付批准与实际部署验收见项目说明。

## 配送、退换与客服

Shipping/Returns 的现行正文、履约模式、法律实体和审批责任已确认。订单通常在
1–3 个工作日内处理，合格退货可在收货后 15 天内申请；运费承担、原始运费和退款时间
按已发布 Shopify 正文执行。政策变更须同步 Shopify/Checkout、政策页、PDP 摘要和适用
Schema，不能在不同触点保留旧承诺。特殊地址、费率和税费待决项见 Roadmap。

客服、隐私与公开联系统一 `info@joyamana.com`；收信、负责人/备援、外发认证和回复流程
已确认。当前 Email-only，页面不承诺未批准的时段或 SLA。
损坏、丢件、退货和订单修改按真实流程处理，不把支持请求视为营销订阅。

现有关闭的 Contact Server Action + Resend 适配层仅为未来投递准备，不存留言、不创建
Shopify Customer。启用前批准供应商的数据边界、保留期、成本、退出方式、发件域、
生产限流与隐私说明；表单数据只用于本次服务请求。

## 交易身份、营销与评论

Checkout Email/Account Email 用于订单或服务，不等于 Newsletter/SMS 营销同意。
营销须分别明确选择，记录来源、时间、语言和版本，提供取消订阅与偏好更新；
不预勾选、不用拒绝营销阻断购买、不把未订阅订单邮箱直接导入营销发送。
Abandoned checkout、复购、cross-sell 和 review request 按获批同意与工具规则执行。

当前没有 Reviews。未来启用须有真实来源、采集/审核、激励披露、删除/导出和评分规则；
不虚构评论、空星级或认证，不因评分低不当抑制真实负评。仅页面可见的真实评分进入 Schema。
账户、复购与营销候选统一放 Roadmap，不预建会员系统。

## 测量与验收

Shopify Order 是订单与收入事实来源。未来事件仅在实际动作成功后发送，失败加购不能记
为 `add_to_cart`，点击 Checkout 不能推断 `purchase`。商品/款式/currency/value 使用动作
发生时的同一实体；purchase 每单一次，与 Shopify 测试订单、金额和商品对账。
不向事件发送 PII 或完整 Cart ID；consent 与追踪边界见技术规格。

发布时用真实商品检查模型/媒体/字段、UI/Bag/Schema 的价格库存一致、规则变化恢复、
部分失败、售罄、独立 Buy now、游客 Checkout、订单确认、政策与客服。具体步骤和记录
统一见发布手册，不把 mapper 测试当成跨设备或支付验收。
