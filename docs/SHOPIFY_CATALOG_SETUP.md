# Shopify Catalog Classification Setup

Status: Active implementation guide
Owner: Commerce / Content operations
Last updated: 2026-08-31
Related: D-002、D-009、D-020、D-036；`COMMERCE_SPEC.md`

本文件说明 D-036 所需的 Shopify Admin 配置。它不包含 credential，也不授权代码或
自动化工具修改 Shopify；运营人员完成配置后，Storefront API 只读消费这些事实。

## 1. 商品类别

在 Shopify Admin 的每个 Product 中设置最具体的 Shopify Standard Product Category。
首批公开路由映射如下：

| Shopify category | Storefront URL |
|---|---|
| Apparel & Accessories > Jewelry > Bracelets | `/category/bracelets` |
| Apparel & Accessories > Jewelry > Rings | `/category/rings` |
| Apparel & Accessories > Jewelry > Necklaces | `/category/necklaces` |
| Apparel & Accessories > Jewelry > Earrings | `/category/earrings` |
| Arts & Entertainment > Hobbies & Creative Arts > Collectibles > Rocks & Fossils > Gemstones | `/category/gemstones` |

Aquamarine bracelet 在 2026-08-30 Storefront 抽查时可通过 Bracelets Category
发现，但生产发布前仍应在 Admin 复核。若未来上架 Palm Stone、Sphere、
Guardian Figure 等实物，仅在 Shopify 准确 taxonomy 确认后才使用 Gemstones；
这些名称不表示当前 Headless Catalog 已有对应商品。Product Type 不是公开
Category 的事实来源。

Category route 只在当前 Headless channel 至少有一个商品使用对应 taxonomy ID 时出现。
代码不按标题、Tag 或 Product Type 推断归属。

## 2. Design Series Metaobject

在 `Content > Metaobjects`（或 `Settings > Custom data`）建立 `Design Series` definition。
建议第一阶段字段：

| Field | Suggested type | Purpose |
|---|---|---|
| Name | Single line text | 系列规范名称 |
| Tagline | Single line text | 系列短句 |
| Short introduction | Multi-line text | 卡片和 PDP 摘要 |
| Story | Rich text | 系列正文 |
| Hero image | File reference | 桌面主视觉 |
| Mobile hero image | File reference | 可选移动主视觉 |
| Campaign images | List of file references | Lookbook / Editorial |
| Launch date | Date | 真实发布日期 |
| Published | True or false | 内容运营门禁 |

需要前台读取的 definition/field 开启 Storefront access，并为 en-US 与 es-US 建立人工
审核翻译。不要为同一 Metaobject 再开放第二个可索引 web page；公开系列 URL 保持
`/collections/{handle}`。

## 3. Product metafield

在 `Settings > Custom data > Products` 建立：

```text
Name: Design series
Namespace and key: custom.design_series
Type: Metaobject reference → Design Series
Values: One value
Storefront access: enabled
```

第一阶段每件商品只有一个主要设计系列。若未来确有跨系列商品，再另行批准改为 list；
不要先为假设需求增加多值关系。

## 4. Collection metafields

在 `Settings > Custom data > Collections` 建立：

```text
Name: Collection kind
Namespace and key: custom.collection_kind
Type: Single line text
Preset choices:
  design_series
  category
  merchandising
Storefront access: enabled
```

可再建立关联字段：

```text
Name: Design series
Namespace and key: custom.design_series
Type: Metaobject reference → Design Series
Values: One value
Storefront access: enabled
```

当前 storefront 已读取 `custom.collection_kind` 并 fail closed：缺失、拼写不同或不是
`design_series` 的 Collection 不会出现在 `/collections`，详情路由也返回 404。
当前前端尚未读取 Collection/Product 上的 `custom.design_series` reference，也未
渲染 Metaobject 中的 story/lookbook 字段。按 D-036 发布完整设计系列前，还需实现并
验证该读取链路；不能只创建 Metaobject 就声称系列故事已接入。

2026-08-31 current state: `Patron Saint` 已是非空、Headless 可见且
`custom.collection_kind=design_series` 的 Collection，基础路由和商品成员显示正常。
其 description/SEO 仍为空；是否已建 Design Series Metaobject/reference 无法由当前
Storefront query 验证，且即使已建，前端也尚未读取 story/lookbook。

## 5. 建立系列 Collection

每个设计系列建立一个非空 Shopify automated Collection：

```text
Title: Seven Chakra
Handle: seven-chakra
Condition: Product metafield Design series is equal to Seven Chakra
custom.collection_kind: design_series
custom.design_series: Seven Chakra
```

补充唯一 description、image、SEO title/description，并发布到 Headless sales channel。
商品只需设置 `custom.design_series`，满足条件后自动进入系列 Collection。

Category 可以在 Admin 建 automated Collection 辅助运营，但公开前端仍使用
`/category/*`。不要把 Bracelets Collection 标记为 `design_series`。

## 6. 发布验收

- Product 已发布到 Headless channel，Category 准确，价格/库存来自当前 US Catalog。
- Design Series Metaobject 与必要字段有已审核 EN/ES 内容。
- Storefront 已实现并验证 `custom.design_series` reference 与必需故事/媒体字段读取；
  在此前只能验证 Collection 类型门禁和商品网格。
- Series Collection 非空、handle 稳定、`collection_kind=design_series`，并发布到
  Headless channel。
- `/shop` 显示商品；对应 `/category/*` 显示相同商品；系列页只显示系列成员。
- Header 的 Shop 下拉只显示非空 Category；设计系列为 0 个时隐藏 Header 系列入口、
  1–2 个时直接显示、3 个及以上时合并为 Collections 下拉。不要用空 Collection 测试
  或触发该阈值。导航结构使用 5 分钟短缓存，Admin 发布变化可能不会即时出现在
  Header；验收时等待缓存刷新或通过已批准的缓存失效流程处理。
- `/collections/bracelets` 永久跳转 `/category/bracelets`；未知或普通后台 Collection
  不成为公开页面。
- Category、Collection 与 Product 的 canonical、breadcrumbs、sitemap 和可见链接一致。
- 全站 index gate 与 Checkout gate 只在各自生产门禁完成后开启。
