# 商品与交易规格

Shopify 管理商品、价格、库存、折扣、Cart、订单、支付与 Checkout。前端帮助理解、选款
和恢复错误；后台填写步骤见 [Shopify 维护](SHOPIFY_CATALOG_SETUP.md)。

## 商品模型与资料

| `custom.product_model` | 含义 | 图片与履约要求 |
|---|---|---|
| `standard` | 可重复履约的标准商品 | 真实代表图，说明合理天然差异 |
| `natural_variation` | 天然差异较明显的标准商品 | 明确差异范围，必要时展示多件真实样本 |
| `one_of_one` | 天然独件 | 一物一图、一物一库存，quantity=1 |

正式商品须明确模型，不从标题、图片或库存推断。无效/缺失值不输出猜测，也不因此
禁止正常购买。独件不建无意义 Variant；该独立为商品的差异不能强行合并。标准设计配
独件须说明收到具体实物还是同规格相似件。每件商品随附 Joya Mana 专属 guidebook。

Shopify 核心事实包括身份/handle、发布状态、title/description/SEO、媒体、Category、
options/Variants、价格/compare-at、币种、可售性、库存和数量规则。后台 SKU 唯一，
GTIN/MPN 仅填真实值。前端暂不保留 vendor、Product Type/tags、Variant SKU 或 inventory policy。

正式商品还需材料、尺寸/weight/fit、天然差异、可验证来源、处理/染色/涂层/合成披露、
制作事实、实物/代表图、包装、care/安全和相关内容。这些知识字段及图片披露尚未完整接入，
不能由本地文案补造。缺失项统一见 [Roadmap](ROADMAP.md)。

## 类别与设计系列

`/shop` 为全商品，`/category/{handle}` 按 Shopify Standard Product Category 的 taxonomy ID
allowlist 分类，`/collections/{handle}` 为原创设计系列；不按 tag、标题或 Product Type 猜测。
公开类别须非空，旧类别地址迁移见内容与索引规格。

系列须 Headless 可见、非空且 `custom.collection_kind=design_series`。
Collection 管理 URL/SEO/成员；Product reference 和 Design Series Metaobject 用于后续归集、
故事和视觉，不另建同主题索引页。当前只读 Collection 类型、描述、媒体和商品。
运营归组 Collection 不自动公开；系列缺有效描述仍可浏览商品，但详情 noindex，
不输出 Schema，不进 sitemap。

## 选款、筛选与卡片

- Variant `custom.colors` 是文本列表，校验 JSON 数组，trim/NFC/大小写规范化去重。
  默认语言原值是稳定键，按 Variant ID 补取；词典只翻译显示，未知颜色保留原标签。
  颜色不从图、名称、tag 或品牌配色推断，不合并别名或复制各语言商品。
- Shop/Category/系列完整读取范围内 Variant：选多个颜色时，符合其中一种即可；
  同时开启可购买筛选时，两个条件须命中同一个款式。默认保留售罄，无结果返回 200。
  超过 32 个颜色、单值超过 100 字符或空值视为无效筛选，返回零结果；清除后恢复。
- 每件商品一张卡，先选可购买款，再按 Shopify 的款式顺序和 ID 选定。
  按展示款十进制 USD 单价排序，平价按来源/ID；排序不换款，不拿商品最低价替代。
- 选款卡的图、价、状态、链接和适用 Schema 共用该 Variant，下一次 no-store 请求更新事实。
  首页、搜索、推荐只用摘要：显示价格范围，图片与名称链接到商品详情；可售摘要卡不显示
  额外操作提示，不以缺少款式的数据宣称可购买。
  商品明确不可售时仍显示不可购买。
- 卡片只用该款 image；Shopify 可能返回产品图，不代表后台已绑定专图。
  PDP 所选款无图时可用真实产品图库，不能制造图片。
- `/products/{handle}?variant={numericID}` 服务端验证归属并初始化同款。
  无参数按相同规则选款；售罄款保留选择并禁购，失效/外商品 ID 要求重选。
- 切款同步 URL、图价、minimum 与购买动作；刷新、返回/前进、公开语言切换保留允许参数。
  更新中和需选款不能显示成售罄。参数索引规则见 [内容与索引](CONTENT_SEO_GEO_SPEC.md)。

分页和读取预算由技术规格负责，失败不能展示部分目录。

## 价格、数量与可购买状态

金额来自当前 Market，展示 currency code；compare-at 必须真实且高于现价才显示原价。
折扣、税、运费与最终总价归 Shopify 校验，不虚构优惠或承诺未计算总价。

选款列表、PDP 和 Offer 共用 Product/Variant 可售性与数量规则。新提交须为正整数，
满足 minimum/maximum/increment、站内每款 99 件上限和已知库存；上限向下对齐步进，
例如 increment=2 最多 98。数量框允许清空和中间输入，非法草稿显示错误并禁购，不按旧值提交。

接受 Shopify 的整数库存，包括负数，不能因负库存令商品或整个 Bag 读取失败。
`currentlyNotInStock=false` 且库存非负时按库存设上限，负数时没有可购买数量。
`currentlyNotInStock=true` 表示可能继续销售，不按库存截断；`null` 不等于 0。
所有情况仍受可售性、数量规则、mutation warning/user error 和最终 Checkout 校验。
该标志不证明禁止超卖，也不构成预售或发货时效承诺。

准确 `Only X left` 文案暂停。恢复须有可靠禁止超卖事实，且为明确标准模型、所选款可售、
精确库存 1–3、步进 1 的 PDP；独件、未知模型/库存和超卖排除，商品卡不显示。
不使用警报、倒计时或虚假紧迫性。暂时售罄 PDP 保留信息，永久下架按 URL 规则处理。
当前不启用预售、Subscription 或 Gift Card。

## Bag 与 Checkout

Bag 支持创建、读取、加购、改数量、移除、恢复、清空；行总价和小计来自 Shopify，
税与运费在 Checkout 确认。商品链接保留 Variant 和当前语言。

- 最多 500 行，每页/每次操作最多 250 行，清空分批。完整读取与变化检查见技术规格。
- 已存行保持可读，库存/规则变化显示行级问题，允许调整到有效数量；无法满足 minimum 时
  提示移除或重选。新加购校验同款合并后不超过 99，不能只依赖按钮。
- mutation 业务失败或响应丢失后只读刷新实际内容并保留错误，不重放操作。重读失败保留袋，
  确认过期才清空；过期 Cart 可在加购时重建。首次读取失败显示重试，不宣称空袋。
- Checkout 点击后重读最新 Cart，校验所有行并取最新 URL；失败返回安全 Bag 供修正，
  上游空袋清除旧显示，问题行不能进入结账。
- 加购、Buy now 和结账各自保留本次操作错误，不借用其他操作的提示。
- Buy now 使用独立单商品 Cart，核对所选 Variant/数量、实际返回行与阻塞警告，
  不读写已有 Bag cookie。Checkout URL 按获准 host/locale 校验，不手工改写。
- 英语和繁中共享 US cookie。停用语言 Action 拒绝输入，不调用 Shopify 或改动 cookie。

cookie、secret 与 IP 边界见 [技术规格](TECH_SPEC.md#安全和客户数据)。支付、地址验证、
折扣、配送、订单和交易邮件归 Shopify，游客可用 Order Status，不建第二份系统。
关闭购买/结账时说明暂不可用，不模拟成功。

## 配送、退换与客服

现行政策、履约方式、法律实体与审批责任已确认。订单通常在 1–3 个工作日内处理，
合格退货可在收货后 15 天内申请；运费承担、原始运费和退款时间按 Shopify 已发布正文。
政策变化须同步 Shopify/Checkout、政策页、PDP 摘要和适用 Schema。
特殊地址、费率和税费待决项只维护在 Roadmap。

客服、隐私与公开联系统一由 `brand.supportEmail` 管理，当前为 `info@joyamana.com`。
收信、负责人/备援、外发认证和回复流程已确认。目前只用电邮，页面不承诺未批准的时段/SLA。
订单查询提示提供订单号和结账邮箱；损坏、丢件、退货和修改按实际流程，不视为营销订阅。

## 交易身份与营销

Checkout/Account Email 用于交易或服务，不等于 Newsletter/SMS 同意。营销须明确选择，
记录来源、时间、语言和版本，并能取消订阅/改偏好；不预勾选，不因拒绝营销阻断购买，
不把未订阅订单邮箱直接导入营销。弃单、复购、cross-sell、review request 按获批规则执行。
技术与跨域隐私要求见技术规格，接入待办见 Roadmap。

实际商品、Bag、游客结账与订单后流程按 [发布手册](LAUNCH_RUNBOOK.md)验收，
单元测试不能证明支付已验收。
