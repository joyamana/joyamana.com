# 项目说明

## 目标与范围

Joya Mana 是面向美国市场的水晶 DTC 品牌，收入来自自有商品销售。品牌内容帮助顾客
理解商品、建立信任并完成购买；不依赖广告变现。优先级见 [AGENTS.md](../AGENTS.md)。

当前只运营 US / US Catalog / USD，语言为 en-US、es-US、zh-Hant-US，分别使用根路径、
`/es-us/`、`/zh-hant-us/`。繁中采用香港书面语；三种语言共享商品、价格、库存和政策。
Canada 仅有未启用配置，其他市场也不提前公开。

生产站点为 `https://www.joyamana.com`，apex 对应路径永久 308 至 www；托管结账使用
`checkout.joyamana.com`。dev 对应 Vercel Preview，main 对应 Production。
仓库已包含三语言、即时筛选和本地修复；某次推送是否部署、译文是否通过审校，必须从
实际部署与验收确认，不能从分支名或代码存在推断。

## 用户流程

| 任务 | 流程 |
|---|---|
| 直接购物 | 首页 → Shop/类别/设计系列 → 商品 → Bag → Shopify Checkout |
| 内容辅助选择 | Crystal Guide/Blog → 相关商品或类别 → 商品 → Bag → Checkout |
| 礼赠 | 浏览商品 → 核对包装、配送与退换 → Bag → Checkout |
| 订单后服务 | Shopify 确认与 Order Status → 必要时联系客服 |

购买不要求注册、问卷或营销同意，不使用 AdSense 或预留广告布局。
账户、订阅、Wishlist、Loyalty、Referral 和实时定制器不在当前实现范围；
是否启用由真实需求和业务批准决定。

## 当前能力

| 领域 | 已实现 |
|---|---|
| 浏览 | 三语言首页、Shop、商品类别、设计系列、商品详情和商品搜索 |
| 商品选择 | 同款颜色/可购买筛选、展示款价格排序、卡片与 PDP 精确选款、数量规则与图库 |
| 购物 | Shopify Cart 创建/读取/修改/恢复、完整分页、独立 Buy now、结账前最新数量校验 |
| 内容 | Shopify About 一级子页、Accessibility、Policies、Blog 与 Crystal Guide |
| 搜索可见性 | metadata、canonical、hreflang、robots、sitemap、适用页面 JSON-LD 与参数排除 |
| 工程 | Node 24、固定依赖、预检、格式检查、lint、类型检查、Vitest 和 GitHub CI |

技术边界见 [技术规格](TECH_SPEC.md)，商品行为见 [交易规格](COMMERCE_SPEC.md)，
索引与内容来源见 [内容与索引规格](CONTENT_SEO_GEO_SPEC.md)。

## 当前限制

- Product knowledge 字段、图片代表性披露、商品与内容关联、设计系列故事/lookbook 尚未接入。
- 正文翻译允许默认英文回退；已识别的内容回退页不索引。商品/系列尚不能自动检测
  回退，每次发布需人工检查 ES/繁中正文和 metadata。
- 真实禁止超卖事实尚未提供，准确低库存提示暂停；普通库存、数量和可购买判断仍正常。
- 搜索只检索商品。Editorial 保持关闭索引，测试文章不能当成正式上线内容。
- Contact 为 Email-only。已有关闭的表单适配层，尚未启用生产投递。
- Organization/Site Settings、Home/Contact/政策 Schema、Analytics、营销 consent 和
  Headless 隐私偏好流程尚未实现。Google verification 配置不等于账号已经验证。
- 未知路径/停用市场有完整的无 JavaScript 404；动态缺失商品/内容页的初始错误正文
  仍受 Next 限制，浏览器加载 JavaScript 后恢复。
- 人工设备、辅助技术、译文、实际购物袋与 Checkout 验收须按每次发布范围执行。
  单元测试、HTTP 检查和本地浏览器检查不能替代真实支付验收。

业务方已确认下单支付能力和 Payment test mode 流程。生产启用范围仍由各部署配置和
当次验收决定；该确认不代表已执行真实扣款、退款或 payout 对账。

## 内容与业务输入

已确认的品牌名称、字体、配色和真实摄影由设计规范维护；商品随附专属 guidebook、
Shipping/Returns 的现行承诺及客服渠道由交易规格维护。法律实体、履约模式和政策审批
责任已由业务方确认，仓库不复制非公开商标、成本、利润或法律记录。

未决配送范围、费率和税费，以及所有代码/后台待办，统一见 [Roadmap](ROADMAP.md)。
这些问题只影响各自能力，不能自动扩大为全站阻塞。

## 完成标准

- 顾客能从品牌内容或目录发现商品，无需注册完成 Bag → Shopify Checkout。
- UI、购物袋、metadata 和适用 Schema 的商品事实一致，政策与真实运营一致。
- 索引页初始 HTML 可读，移动端、键盘和辅助技术核心流程可用。
- 不虚构商品、作者、评论、来源、紧迫性或医疗功效。
- 新工具的收益、隐私、性能和退出方式明确；不提前建设未来市场或大型功能。

发布的可执行检查统一见 [发布手册](LAUNCH_RUNBOOK.md)。
