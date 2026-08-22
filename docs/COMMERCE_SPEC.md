# Commerce Specification

Status: Draft — Catalog 与运营政策待确认  
Owner: Commerce / Operations  
Last updated: 2026-08-02  
Related: `MVP_PRD.md`, `TECH_SPEC.md`, `CUSTOMER_LIFECYCLE.md`

## 1. 原则

- Shopify 是商品、价格、库存、折扣、Cart、Checkout、Order 的唯一事实来源。
- 前端帮助理解和选择，不自行决定最终价格、税费、配送或可售性。
- 游客购买优先；账户和 Loyalty 不得阻碍首次交易。
- 天然水晶的个体差异必须诚实表达，图片代表性与实际交付物不能含糊。
- 商品信息完整度优先于 SKU 数量。

## 2. Catalog 待决模型

首发 Catalog 必须先归类：

### Repeatable product

同一 Product 下的商品可以重复履约，Variant 代表 size、metal、length、
crystal 等真实选项。共享 PDP 可展示代表性图片，但必须说明天然差异。

### One-of-a-kind product

每件实物有独立媒体、属性和 inventory quantity=1。售出后保持有用归档、
推荐相近商品或按下架规则处理，不能继续接受加购。

### Hybrid

标准设计下使用天然独件。需要明确买家收到的是“图片中的具体实物”还是
“同规格相似实物”；该决定影响图片、Product/Variant、库存和退换政策。

在 Q-002 回答前，不锁定 Product/Variant 层级。

## 3. Product 数据契约

### Shopify 核心字段

- GID、handle、status、published state
- title、description、vendor/brand
- product category/type、tags（仅后台组织，不自动建索引页）
- media
- options、variants
- SKU
- price、compare-at price、currency
- availability、inventory policy
- selling plan（MVP 不使用，除非另行批准）
- SEO title/description（如采用）

### 必需的商品知识字段

- 主要 crystal/mineral 引用
- product form/type
- materials 和 metal
- dimensions、weight、size/fit
- color 与天然差异说明
- origin（只在可验证时）
- treatments、dye、coating、synthetic/lab-grown 披露
- craftsmanship/process（只在可验证时）
- exact item vs representative image
- package contents
- care 与使用安全
- shipping/returns policy reference
- related Guide/Article

### 标识符

- 每个可售 Variant 有唯一 SKU。
- GTIN/MPN 只在真实存在时提供，不为 Schema 或 feed 编造。
- Product group/Variant ID 在 Shopify、Analytics 和 Schema mapper 中稳定。

## 4. Collection

- 只创建有真实购买意图、库存和独特说明的人工策划 Collection。
- Collection 可以基于商品类型、晶体类型或礼赠场景，但不能无节制组合。
- tags、vendor、自动筛选结果不自动变成可索引 landing page。
- 每个主 Collection 需要唯一 title、intro、策展逻辑和至少一个有效商品。
- 空或薄 Collection 不进入 sitemap；运营方决定隐藏、noindex 或补充。
- 同一意图不能同时由多个不同 URL 竞争。

## 5. Media

- 独件商品必须使用该件实物的真实图片。
- Repeatable product 说明颜色、纹理和形态可能存在天然差异。
- 首图、细节、尺度、佩戴/场景、包装和必要披露各有明确用途。
- 不用生成式图片伪装真实商品、来源、认证或客户使用结果。
- 后台保存高质量源图；前端由 Shopify CDN/Next Image 输出响应式格式。

## 6. Price 与 Promotion

- 所有展示金额来自当前 US market Shopify response。
- compare-at price 只有真实、合法且 Shopify 配置有效时展示。
- 优惠码、自动折扣、Gift Card 与 member price 最终由 Shopify 验证。
- 不实现虚假倒计时、虚假“仅剩 X 件”或默认勾选加购。
- 税费和配送未计算前使用准确限定语，不承诺未经确认的总价。

## 7. Inventory 与商品生命周期

| 状态 | PDP | Index | Cart |
|---|---|---|---|
| In stock | 正常购买 | Yes | Allowed |
| Temporarily out of stock | 保留信息、明确售罄 | 通常 Yes | Blocked |
| Preorder | 仅在政策/日期确认后 | Yes | Shopify validates |
| Permanently discontinued | 有价值归档或迁移 | 按 SEO 规则 | Blocked |
| Unpublished/invalid | 不公开 | No | Blocked |

- 永久下架只有存在真正等价替代时才 301。
- 不把所有失效商品跳转首页。
- Cart 更新时重新处理库存和价格警告。
- PDP Variant 选择器显示 Shopify 返回的 contextual variant price；内部供应商
  名称、素材名和文件名不得作为消费者文案或客户端商品字段。

## 8. Cart

### 功能

- Create/read cart。
- Add、update quantity、remove lines。
- 展示当前 line price 和 cart subtotal。
- 显示 Shopify warnings/user errors。
- 恢复已有 Cart；无效/过期 Cart 安全重建。
- Checkout 前请求最新 `checkoutUrl`。

### 错误处理

- 变体售罄或不可售。
- Requested quantity 超过库存。
- Price/discount 发生变化。
- API timeout、rate limit 或 partial error。
- Cart 已过期。

错误必须说明客户可采取的下一步；不得静默丢失 Cart 或用旧价格继续。

## 9. Checkout、Payment 与 Order

- Checkout 使用 Shopify hosted checkout。
- PDP Buy now 使用独立单商品 Cart，带当前 Variant、数量与 Market buyer
  identity，并请求最新 `checkoutUrl`；不得复用、清空或改写用户已有 Bag。
- Shopify、真实价格、库存和获批政策未连接时，Buy now 保持不可用，不模拟订单。
- 支付方式、地址验证、税、配送、折扣和订单创建由 Shopify 管理。
- Next.js 不收集、代理或存储支付卡数据。
- Checkout 域名、品牌样式、政策链接和交易 Email 在 Shopify 中配置并验收。
- 成功订单以 Shopify Order 为准；Analytics purchase 不能反向创建业务事实。
- Order confirmation 与 Shopify Order Status 可被游客使用。

## 10. Shipping、Returns 与 Taxes

下列内容全部是 P0 业务输入，当前不得假设：

- fulfillment origin 与 handling time
- service levels、cost、free-shipping threshold
- domestic scope、PO box、Alaska/Hawaii/territory
- damaged/lost package 流程
- return/exchange window 与 exclusions
- return shipping 和 refund time
- sales tax 责任
- international duties（MVP 原则上不承诺）

确认后，Shopify 配置、Checkout、Policy page、PDP 摘要、FAQ 与 Schema 必须
一致。任何变更需同步所有消费者触点。

## 11. Email 与营销同意

- 订单所需 Email 是交易身份，不等于营销订阅。
- Newsletter、SMS 和其他营销分别获得明确同意并记录来源。
- 不使用预勾选、模糊文案或因拒绝营销而阻断购买。
- Abandoned checkout、post-purchase 和 review request 需按获批 consent 与
  工具规则配置。
- 取消订阅和偏好更新必须可用。

## 12. Reviews 与 UGC

- MVP 不展示占位 rating、虚构 review 或无法验证来源的 testimonial。
- 供应商选型前定义采集、verified purchase、moderation、syndication、
  deletion、export 和 Schema 规则。
- Incentivized review 必须按适用要求清楚披露。
- 负面真实评论不能因为评分低而被不当抑制。
- 只有页面可见且符合平台规则的真实评分才进入 Product Schema。

## 13. Apps 与第三方工具准入

每个 Commerce App 必须回答：

- 解决了哪个已量化问题？
- Shopify/Next.js 原生能力为何不足？
- 收集哪些客户和订单数据？
- 对 Checkout、速度、SEO 和 Accessibility 有何影响？
- 月度成本、迁移和数据导出路径是什么？
- 失败或取消订阅时 storefront 如何降级？

初期不同时引入 Reviews、Loyalty、Referral、Subscription、Tracking 和
Personalization 全套工具。

## 14. MVP 验收

- 代表性 repeatable/one-of-a-kind 商品模型已通过业务审核。
- 每个首发 Product/Variant 具备必需字段和真实媒体。
- Price、currency、availability、SKU 在 Shopify/UI/Cart/Schema 一致。
- Guest Cart → Shopify Checkout 完成跨设备核心测试。
- Shipping/Returns/Taxes 文案与 Checkout 配置一致。
- 售罄、下架、价格变化、API 错误均有明确行为。
- 没有虚构 rating、scarcity、origin、treatment 或 health claim。
