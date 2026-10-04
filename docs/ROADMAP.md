# Roadmap

只维护未完成工作和待确认输入。完成后更新所属规格并移除条目，不保存解决记录或日期流水。
当前能力见 [项目说明](PROJECT_SPEC.md)，发布检查见 [发布手册](LAUNCH_RUNBOOK.md)。

## 优先完成：商品、内容与运营

| 工作 | 需要完成的内容 | 影响范围 |
|---|---|---|
| 颜色与图片 | Shopify 填真实 Variant `custom.colors`，检查权限、默认语言标签、款式图片、排序和公开语言控件 | 真实颜色筛选与图片验收 |
| 商品知识 | 建字段、填值、翻译并接入材料、尺寸/fit、care、可验证来源/处理、package contents、内容关联 | 商品透明度、PDP 与适用 Schema；不制造本地资料 |
| 商品模型与披露 | 补全 `custom.product_model`，实现 exact item/representative image 披露 | 标准商品与独件的图片、履约说明；未知模型不阻止正常购买 |
| 低库存提示 | 若要恢复准确提示，先提供可靠的 Shopify 禁止超卖事实并验证 | 仅准确库存文案；现有库存和购买判断继续使用 |
| 设计系列 | 复核 Patron Saint 等正式 Collection 描述/SEO，建立 Design Series/reference 并接入 story/lookbook | 完整系列叙事和索引 |
| 译文 | 补齐并人工审校香港繁中商品、内容、政策、Checkout 与通知；西语恢复另行批准 | 翻译质量及对应索引；允许英文回退的页面仍可访问 |
| 正式 Editorial | 审核真实文章、作者、引用、声明与图片，替换或撤下测试内容 | Blog/Guide 索引；准备前保持关闭 |

具体后台维护方法见 [Shopify 维护](SHOPIFY_CATALOG_SETUP.md)。

## 未决运营输入

| 需要业务方决定 | 影响范围 |
|---|---|
| Alaska、Hawaii、Puerto Rico、PO Box、APO/FPO 是否支持 | 特殊配送地址 |
| carrier、实际 Checkout 运费、免邮门槛 | 结账和配送费用 |
| 销售税、关税与进口费用责任 | 结账、政策和相关说明 |
| 搜索/用户触发抓取与模型训练抓取的分别处理 | robots/crawler 配置；代码默认不是批准 |

已确认政策见[交易规格](COMMERCE_SPEC.md)，不重新列为待决。
不得自行补写特殊地址、免邮或税费承诺；上表只影响对应能力。

## 品牌实体、隐私与测量

- 从获批公开字段建立 Organization/Site Settings，接入 Home、Contact 与适用政策 Schema。
- 先批准 consent 分类、Headless `Your Privacy Choices`、GPC、地区范围和 Checkout
  跨域同意流程，再接入 Analytics/marketing。不能向浏览器暴露私密 Storefront token。
- 按需配置并验收 GA4、Search Console、Merchant Center、Bing Webmaster；确认数据接收方、
  事件、保留期、成本和退出方式。前端事件、Shopify 订单与测试购买须能对账。
- 首页 Email opt-in 尚未实现；先定义订阅内容、同意和可退出路径，不遮挡首屏或阻断购买。
  若启用 Email/CRM 或 Contact 表单，先定义事件、投递、发件域和滥用保护。
  当前只用电邮联系，没有表单投递或供应商配置。

## 工程与验收

- 按 [Shopify 品牌资产操作](SHOPIFY_CATALOG_SETUP.md#品牌资产与-checkout)上传已准备的 PNG，
  配置并验收 Hosted Checkout、Order Status 与通知的正式字标；前台 SVG 不会自动同步后台。
- 手机菜单、数量输入、横向缩略图和矮屏 sticky 须完成真实手机、读屏与 200% zoom 验收；Bag 和 Checkout
  在获批环境完成真实流程检查。自动浏览器与单元测试不能代替这些检查。
- 修复 Next 动态缺失商品/内容页的初始 404 正文缺失；当前状态码/noindex 正确但正文需 JS，
  保留客户端恢复，避免框架内部补丁
  或未经批准的实验性 API。未知路径、暂停西语和停用市场已支持无 JavaScript 恢复。
- 建立可靠的商品/系列翻译回退检测；实现前保留发布时人工逐页检查。
- 复核 CSP/HSTS、安全头、第三方脚本、PII/secret 边界和 token 轮换。
- 配置错误告警、负责人、保留策略、发布值守与回滚目标，不重复接入同类监控平台。
- 仅当用户任务和内容规模证明必要时扩展内容搜索；当前商品搜索继续 noindex。

- 检查 Shopify 正文残留的西语链接、托管结账自身语言设置；本站暂停不会自动修改后台。

## 后续候选

候选不等于已批准功能，只在真实数据支持后评估：

| 能力 | 进入条件 |
|---|---|
| Reviews | 真实订单、采集/审核、激励披露、删除导出与 Schema 规则明确 |
| Customer Account | 客服或复购数据显示自助订单/地址需求；仍支持游客，优先 Shopify 账户能力 |
| Wishlist/Recently Viewed/Reorder | 用户行为、目录和可重复 SKU 证明价值 |
| Loyalty/Referral/Gift Card/礼品包装 | 利润、退款、奖励负债、滥用、成本和客服规则确认 |
| Custom Crystal | 先由少量变体或人工咨询验证需求，再评估复杂配置器 |
| CMS/独立搜索/webhook | 编辑、目录规模、高频变更或紧急失效需求出现可测瓶颈 |
| 多市场 | Catalog、币种、库存、支付、税费、配送、法律、客服和翻译全部获批就绪 |

当前不建设 Subscription、社区等级、签到、任务、勋章或批量关键词页面。
新增系统或市场须先说明价值、边界、替代方案和迁移影响，更新所属规格；
不因候选清单预建公开 URL、数据库、认证或生产依赖。
