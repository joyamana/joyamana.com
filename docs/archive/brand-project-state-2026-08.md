# Archived Brand/Project State — 2026-08-31

Status: Historical evidence only  
Archived: 2026-09-02

本文件保存 `BRAND_INPUTS.md` 曾包含的账号、服务和原型授权快照。多项状态随后已变化，
当前事实只看 `../PROJECT_SPEC.md`、`../OPEN_QUESTIONS.md` 和 `../DECISIONS.md`。

## Accounts, analytics and services snapshot

当时记录：

- Shopify store、Headless channel、服务端 private Storefront token 与至少一件
  Headless-visible 测试商品已可用；运行时已是 Shopify-only。
- Shopify Policies、`content_page` Metaobject 与原生 Blog/Article 读取路径已实现。
- Shopify 已发布非空 `Patron Saint` Design Collection，且
  `collection_kind=design_series`；系列 description/SEO 与 story/lookbook 尚未完成。
- `blog` 与 `crystals` 各有测试 Article，且无正式内容。
- `info@joyamana.com` inbox 可收信，Contact 表单后置。
- `www.joyamana.com` 与 `checkout.joyamana.com` 已公开响应。
- GA4、GSC、Merchant Center、CRM/Email、Reviews 和 Consent 尚未完成。
- D-044 已确认 `www` canonical 与 apex 308；当时仍在等待新部署修正 `og:url`。

后续变化包括：Production canonical/OG 已修正，索引已按 D-045 开放部分 scope，
Checkout/payment 已由 D-048 接受，客服运营和品牌资产也已确认。不得使用本快照覆盖
这些较新事实。

## Confirmed boundaries at the time

- 无真实评论时不展示 Reviews。
- 最小分析栈：Shopify + GA4 + GSC。
- 先定义 consent 和事件，再选择 Email/CRM。
- Customer Account、Gift Card、Wishlist、Loyalty 后置。
- Training crawler policy 单独决定。
- token、密码、API secret 和客户信息不得写入 Markdown 或提交仓库。

## Prototype authorization

业务方当时授权建立 US 单市场测试站、en-US `/` 与 es-US `/es-us`、集中品牌配置、
标准商品/天然独件数据模型、Shopify-first 内容架构和基础 Search/Collection/navigation。
测试 fixture 不得升级为品牌或商品事实；D-042 后 Storefront 运行时禁止本地商品/正文
fallback。该原型阶段现已结束，当前发布边界由较新决策控制。
