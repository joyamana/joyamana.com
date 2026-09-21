# Open Questions

Status: Active — 只记录当前未解决输入；按 `Blocks` 限定影响范围
Owner: Project owner  
Last updated: 2026-09-21
Resolved input: `BRAND_INPUTS.md`、D-047、D-048

本文件不保存已解决问题和历史审计快照。历史记录见
[`archive/open-questions-history-2026-08-to-09.md`](archive/open-questions-history-2026-08-to-09.md)。
任何问题都不得自动扩大成全站 blocker；只阻塞表格明确列出的能力。

## Fulfillment, tax and policy

| ID | Pending decision | Blocks |
|---|---|---|
| Q-003B | Alaska/Hawaii/Puerto Rico/PO Box/APO/FPO 范围 | Delivery coverage |
| Q-003C | carrier、实际 Checkout 运费、免邮门槛；handling 已确认为通常 1–3 个工作日 | Checkout/shipping settings |
| Q-003E | 销售税、关税、进口费用责任 | Checkout/policy |

这些问题不阻塞已经发布的 Catalog、已审核页面或现有下单支付能力。网站不得自行补写
特殊地区承诺、免邮、税费或进口责任；客户可见事实必须来自 Shopify 配置和已批准 Policy。

## External setup and release dependencies

以下为统一输入清单；其他规格描述验收契约并链接这里，不重复维护 SKU 或素材审批表。
本轮未登录 Shopify Admin，代码接入不能替代后台实际填充与内容验收。

| ID | 负责人/所需动作 | 完成证据 | 限定影响范围 |
|---|---|---|---|
| Q-201 | 商品运营：按 [Shopify setup](SHOPIFY_CATALOG_SETUP.md#33-product-knowledge) 填写真实知识字段及 `image_representation`；复核 Category、`product_model` | 至少覆盖处理材质、多 Variant、独件；字段值、图片语义及 Shopify/UI 对照记录 | 短规格、护理、关联内容和正文下移；不隐藏现有缺字段商品 |
| Q-202 | 内容/翻译：审校 ES 与香港繁中商品、选项、字段、SEO、系列及内容页；另查托管 Checkout/通知 | 逐页译文/等价关系记录与三语言购物 smoke | 正式本地化与发布验收；保留 D-049 允许的英文回退访问 |
| Q-203 | 品牌运营：补 `Patron Saint` 真实简介/SEO/主图，准备 Design Series reference 与 story/lookbook | 获批正文/媒体、关联定义与 Storefront 读取验证 | 系列故事及单页索引 readiness；现有商品网格可运行 |
| Q-204 | 品牌设计：提供实际佩戴/尺度照片、guidebook 封面及允许公开内页的位置和网页裁切 | 可用原图、焦点/alt 与使用范围 | 对应新素材模块；现有 Logo/颜色/字体批准无需重做 |
| Q-205 | 内容负责人：准备正式 Guide/Blog 稿、作者/来源和现有测试 URL 的替换/下线记录 | Shopify 发布内容及缓存后目录/详情实际响应 | 按 D-041 完成内容治理；Editorial 索引继续独立关闭 |
| Q-206 | 运营/技术：确定 consent、Headless Privacy Choices/GPC 方案；配置 GA4、Search Console、Merchant Center | 接收方/成本/退出路径、权限及事件/feed 验收 | 新追踪/营销与发现工具；Contact 仍 Email-only |
| Q-207 | 发布负责人：核对当前部署 SHA/时间并验收本次代码的 Preview、设备和三项门禁 | 部署记录、人工步骤/结果、回滚目标 | 新版本发布；2026-09-21 繁中公开 HTML 取样不代表完整译文验收 |

商品知识与图片代表性 mapper 已接入；Product/Collection 翻译回退仍无可靠自动识别。
已知 Policy/About 等内容回退保留 noindex 保护。以上事项只影响各自能力，不扩大为全站 blocker。

## Deferred / conditional decisions

| ID | Decision | Current handling |
|---|---|---|
| Q-101 | Training crawler policy（对应 D-016） | Pending；Search/User 与 Training 分开 |
| Q-103 | Reviews provider | 无真实评论时不渲染模块 |
| Q-104 | Email/CRM | 先定义 consent/events |
| Q-105 | Error monitoring | Vercel baseline 已有；告警、owner 与保留策略待复核 |
| Q-106 | Customer Account | Post-launch |
| Q-107 | Future markets | 第一阶段仅 US；CA 保留 planned 配置且不创建公开 URL |
| Q-108 | Gift Card/Wishlist/Loyalty | 依据购买和复购数据 |

已解决输入见 [BRAND_INPUTS.md](BRAND_INPUTS.md) 与 D-047/048；
当前发布状态见 [PROJECT_SPEC.md](PROJECT_SPEC.md)。
