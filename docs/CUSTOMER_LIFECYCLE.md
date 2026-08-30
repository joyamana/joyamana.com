# Customer Lifecycle

Status: Draft — MVP 边界已确定，供应商待选  
Owner: Customer experience / Marketing  
Last updated: 2026-08-02  
Supersedes: `docs/archive/crystal-customer-system-design.md` 的阶段命名

## 1. 原则

> 账户服务购买，不控制购买。

- 首次购买不要求注册。
- Email 是订单沟通标识，但营销同意独立获得。
- Shopify 管理 Customer、Order 和 Checkout。
- Customer Portal 只有在减少客服或提升复购的价值明确时建设。
- 不建立传统商城式等级、成长值、签到、任务和勋章。

## 2. MVP lifecycle

```text
Discover
  → Browse / Learn
  → Add to cart
  → Guest Shopify Checkout
  → Transactional confirmation
  → Shopify Order Status / support
  → Optional marketing relationship
```

### Discover

来源包括 direct、organic search、AI referral、social、Email 和 paid channel。
Landing page 必须与来源承诺一致，不用强制弹窗截断。

### Consider

通过 Product、Collection、Guide、Article、Shipping、Returns 和真实信任信息
完成判断。Email opt-in 是可选增强，不是查看价格或库存的条件。

### Purchase

- Guest checkout 默认可用。
- Checkout 收集履约所需信息。
- 不用 account creation、survey 或 marketing consent 阻断支付。

### Post-purchase

- Shopify transaction Email。
- Shopify Order Status。
- 真实客服渠道和响应预期。
- 只有在 consent/适用规则允许时发送营销、cross-sell 或 review request。

## 3. Email identity 与 consent

必须区分：

| 数据/动作 | 目的 | 是否等同营销同意 |
|---|---|---|
| Checkout Email | 订单和履约 | No |
| Newsletter opt-in | 品牌/内容/促销 | Yes，需清楚选择 |
| SMS opt-in | 短信营销 | 单独同意 |
| Account Email | 登录与服务 | No |
| Review request | 订单后沟通 | 按适用政策和工具配置 |

- 保存 consent source、time、language 和表单版本。
- 提供 unsubscribe/preference 路径。
- 不使用预勾选或暗示拒绝会影响购买。
- 不把未订阅的 Checkout Email 导入营销列表后直接发送。

## 4. Customer service

MVP 自助与人工服务：

- Order Status。
- Shipping/Returns。
- Contact 渠道。
- 损坏、丢件、退货和订单变更流程。

公开客服与隐私联系统一使用 `info@joyamana.com`。Contact 表单只为本次服务请求
投递必要字段，不创建营销订阅、不复制 Shopify Customer/Order，也不把 PII 写入
Analytics。表单供应商未批准或不可用时，页面回退为直接 Email。

上线前必须确定服务时段、响应承诺、责任人和升级路径。

## 5. Customer Account（Post-MVP）

建议使用 Shopify 当前 Customer Account API 与其 passwordless/OAuth 能力，
不创建用户名密码数据库。

候选功能顺序：

1. Orders / order detail
2. Order tracking
3. Addresses
4. Basic profile
5. Reorder
6. Wishlist

进入条件：

- 客服数据显示订单查询/地址管理是高频问题。
- 复购用户有明确自助需求。
- Shopify plan/API 与隐私要求可满足。
- OAuth、cookie、PII、安全和 Checkout session 有完整设计。

即使账户上线，Guest checkout 仍保留。

## 6. Growth capabilities

### Reviews

在真实订单量、采集流程、moderation 和披露规则确认后上线。不能用占位评论。

### Wishlist / Recently viewed

只有用户行为和目录规模证明价值时上线。优先本地/Shopify 可恢复方案，不急于
建设跨设备数据库；跨设备同步可能需要账户和额外数据处理。

### Reorder

对可重复 SKU 且复购数据充分时优先于复杂 Loyalty。

### Loyalty / Referral / VIP

需要明确 margin、奖励负债、fraud、退款和 customer support 规则。不能只因
竞品有就上线。

### Subscription

Monthly box 涉及选品、库存、付款失败、取消、客服和合规；不属于 MVP。

## 7. 数据最小化

- Shopify 保存履约和订单所需客户数据。
- Next.js 不持久化客户资料或订单副本。
- Analytics 使用最小必要标识，不发送 Email、地址、Cart ID、Order detail。
- 第三方 CRM/App 必须经过数据接收方、保留期、删除和导出审查。
- Support 工具只接收解决问题需要的数据。

## 8. Lifecycle metrics

- Guest checkout completion
- Checkout abandonment
- Support contacts per order / reason
- Delivery/return satisfaction proxy
- Marketing opt-in rate
- Email unsubscribe/complaint
- Repeat purchase rate
- Account adoption（账户上线后）
- Self-service deflection（账户上线后）

不得为了提高 opt-in 或 account adoption 牺牲购买转化和明确 consent。

## 9. MVP 验收

- 未登录用户可以完成整个 storefront → Checkout 路径。
- 所有 Email 表单清楚区分交易与营销。
- Order Status、Shipping、Returns、Contact 可发现。
- 客户数据不进入无必要的前端状态、URL、日志或 analytics。
- 没有 Password、Rewards、Wishlist 或 Account 的伪入口。
