# 水晶出海独立站 - 用户体系设计总结

> 归档状态：研究材料，非当前项目规范。
>
> 归档日期：2026-08-02
>
> 当前用户体系以 `docs/CUSTOMER_LIFECYCLE.md`、`docs/MVP_PRD.md` 与
> `docs/DECISIONS.md` 为准。本文件保留用于追溯早期讨论，其中的阶段命名和
> 第三方工具示例均不代表已批准范围。

## 1. 用户体系总体原则

水晶类 DTC（Direct To
Consumer）品牌独立站通常不会一开始建设复杂会员系统。

核心原则：

> 不要让注册阻碍首次购买。

绝大多数成熟 Shopify 品牌采用：

-   游客购买优先
-   Email 作为主要用户身份
-   账号体系作为订单管理和复购工具

用户系统不是销售入口，而是 Customer Portal（客户服务中心）。

------------------------------------------------------------------------

## 2. 行业常见用户体系阶段

### Phase 1：无强制账号体系

用户流程：

访问网站 → 浏览商品 → 加入购物车 → Checkout → 填写 Email → 付款

系统记录：

-   Email
-   Shipping Address
-   Order Data

特点：

-   不要求注册
-   不要求密码
-   最大化 Checkout 转化率

------------------------------------------------------------------------

## 3. Phase 2：自动生成 Customer Account

流程：

首次购买 → Checkout 输入 Email → 创建订单 → Account Activation → Email
Magic Link 登录

推荐登录方式：

-   Email
-   One-Time Code / Magic Link

不推荐：

-   Username
-   Password

原因：

-   降低登录摩擦
-   用户无需记忆密码
-   更符合现代 DTC 体验

------------------------------------------------------------------------

## 4. Phase 3：Customer Portal

账户中心：

-   Orders
-   Order Tracking
-   Addresses
-   Wishlist
-   Reviews
-   Rewards
-   Referrals
-   Returns
-   Subscriptions
-   Profile

账号从登录入口变成客户服务中心。

------------------------------------------------------------------------

## 5. 水晶品牌账号功能优先级

### 高优先级

#### Orders

功能：

-   查看历史订单
-   再次购买
-   查看订单详情

#### Order Tracking

减少客服压力，用户自行查看物流。

#### Addresses

支持家庭、公司、礼物地址。

#### Wishlist

适合：

-   高客单价水晶
-   限量款
-   礼物商品

------------------------------------------------------------------------

## 6. 后续增强功能

### Rewards / Loyalty

例如：

\$1 = 1 Point

作用：

-   提升复购
-   提高 Customer Lifetime Value

### Referral

推荐奖励：

好友获得优惠，推荐者获得积分或余额。

### Subscription

例如：

Monthly Crystal Box

优势：

-   稳定收入
-   消化库存

缺点：

-   运营复杂
-   容易取消

初期不建议作为核心业务。

------------------------------------------------------------------------

## 7. 不建议做的功能

不建议初期做：

-   头像
-   昵称
-   等级
-   成长值
-   签到
-   任务中心
-   勋章

欧美 DTC 用户通常不会为了购买水晶维护复杂资料。

------------------------------------------------------------------------

## 8. Shopify 实际生态

基础：

Customer Account：

-   Orders
-   Addresses
-   Login

复杂能力通过 App：

-   Wishlist
-   Loyalty
-   Reviews
-   Returns
-   Tracking
-   CRM / Email

常见工具：

-   Smile.io
-   Yotpo
-   Judge.me
-   Loop Returns
-   AfterShip
-   Klaviyo

------------------------------------------------------------------------

## 9. 针对本项目的建议

项目条件：

-   美国市场优先
-   Shopify 后台
-   水晶品牌 DTC
-   后续扩展全球市场

### V1 用户系统

只需要：

-   Orders
-   Order Tracking
-   Addresses
-   Basic Profile

登录：

Email + One-Time Code

不要：

-   强制注册
-   密码体系
-   复杂会员等级

------------------------------------------------------------------------

### V2

增加：

-   Wishlist
-   Recently Viewed
-   Reorder

目标：

提高转化和复购。

------------------------------------------------------------------------

### V3

增加：

-   Rewards
-   Referral
-   Gift Card
-   Subscription
-   VIP

目标：

建立长期客户关系。

------------------------------------------------------------------------

## 10. 开发优先级

P0：

-   Shopify Checkout
-   Guest Checkout
-   Order System
-   Email Collection

P1：

-   Customer Account
-   Order History
-   Tracking
-   Address Management

P2：

-   Wishlist
-   Reviews
-   Reorder

P3：

-   Loyalty
-   Referral
-   Subscription
-   VIP System

------------------------------------------------------------------------

# 最终结论

水晶出海独立站不应该设计成传统商城会员中心。

正确方向：

游客购买\
↓\
Email Identity\
↓\
Optional Account\
↓\
Customer Portal\
↓\
Rewards / Loyalty / Community

第一阶段重点：

-   产品体验
-   Checkout 转化
-   订单查询
-   Email 营销

用户体系应该服务品牌增长，而不是增加购买阻力。
