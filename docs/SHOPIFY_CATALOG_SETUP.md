# Shopify Catalog Classification Setup

Status: Active implementation guide
Owner: Commerce / Content operations
Last updated: 2026-10-03
Related: D-002、D-009、D-020、D-036、D-050；`COMMERCE_SPEC.md`

本文件说明 D-036 所需的 Shopify Admin 配置。它不包含 credential，也不授权代码或
自动化工具修改 Shopify；运营人员完成配置后，Storefront API 只读消费这些事实。

## US 繁体中文（D-049）

- 使用现有店铺、US Market、Headless channel 与 token；不新建香港/台湾市场。
- 站点 `zh-Hant-US` / `/zh-hant-us`；Storefront `ZH_TW`；后台翻译语言 `zh-TW`。
  后台已发布 Chinese (Traditional)，无需再改网站路径或货币。
- 商品 title/description/SEO/options/alt、Collection 和 content_page Metaobjects 的译文
  在 Shopify 维护，使用香港书面语；Policies 也需提供经过审核的正式译文。
  `handle`、SKU、ID、metafield 枚举、USD 与 US 政策事实不随翻译改变。
- 缺译时前台按业务要求直接显示 Shopify 默认语言，不隐藏页面；后台补译后由现有
  adapter 读取。内容与导航可能经历五分钟再验证窗口，商业查询保持 no-store。
- 商品逐字段翻译检测尚未实现。繁中 Core/Commerce/Policies 的索引矩阵已获批开启，
  Editorial 关闭；部署前仍须人工核对翻译并建立持续 readiness，不把配置批准、语言
  已发布或页面返回 200 当成翻译验收。已检测到回退的内容页继续 noindex。
- 托管 Checkout、订单状态和交易通知的可编辑内容另外审校；平台默认繁体不保证
  香港措辞。已验证新繁中 Cart 与英文 Cart 的繁中读取返回 `/zh-tw/cart/c/…`，
  但该合约检查不替代浏览器/支付验收。

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

发布商品前在 Admin 复核准确 taxonomy。Palm Stone、Sphere、Guardian Figure 等
形态只有在实际分类匹配时才使用 Gemstones；Product Type 不作为公开 Category 来源。

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

## 3. Product metafields

在 `Settings > Custom data > Products` 建立：

### 3.1 Product model

```text
Name: Product model
Namespace and key: custom.product_model
Type: Single line text
Preset choices:
  standard
  natural_variation
  one_of_one
Storefront access: enabled
```

每件正式商品必须明确选择一个值。不要根据标题、Tag、库存数量或图片推断商品模型。
Storefront 映射该分类，但不根据缺失/未知值猜测商品模型，也不因此阻止正常购买。
当前未接入可靠的禁止超卖事实，已暂停 `Only X left`。重新显示前必须先确认所选
Variant 的库存政策和准确库存；不使用 `currentlyNotInStock=false` 推断禁止超卖。
exact item / representative image 的具体披露仍需真实商品资料支持。

### 3.2 Design series

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

当前系列状态与缺口统一见 [PROJECT_SPEC.md](PROJECT_SPEC.md)。

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

## 6. Variant 颜色与图片（D-050）

后台已有定义，按业务方截图沿用，不迁移为 Metaobject：

```text
Owner: Variants
Name: Colors
Namespace and key: custom.colors
Type: List of single line text (list.single_line_text_field)
Storefront access: PUBLIC_READ / enabled
```

- 在每个真实 Variant 填一个或多个颜色标签；多色款可填多个值，不填写逗号拼接字符串。
  使用稳定的默认语言词表、统一拼写；UI 规范化空白和大小写，不自行合并颜色别名。
- 标签只描述该款的真实颜色，不把品牌调色板当成商品属性。前台为文字复选项，不猜 HEX。
- 网页已完成字段读取、动态选项、即时筛选、固定选款、图价和 PDP 初选。后台新增颜色
  在下一次请求自动出现，无需再绑定网页代码或部署；媒体关系仍在 Shopify 维护。
- 颜色归属、库存和价格在 Shopify 维护。译文在后台/集中界面词典审校，不为语言复制商品。
- 确认已填样本能由 Storefront API 读取 `type/value`；null 可能是未填或访问权限问题。
  2026-10-02 检查全部 93 个 Variant 为 null，业务方确认尚未填、后续补齐。
- 在商品媒体中逐款绑定真实图片，至少核对两个颜色不同的 Variant。API 的 `image`
  自带产品图回退，字段非空不能代替后台关联检查；一物一图的独件保持既有要求。
- 后台 Variant 顺序决定同条件下的展示优先级（可购买优先后按 POSITION）；调整顺序
  会改变展示款，价格升降序不会改变已选展示款。

## 7. 发布验收

- Product 已发布到 Headless channel，Category 准确，价格/库存来自当前 US Catalog。
- 每件正式 Product 已填充 `custom.product_model`；分别验证 `standard`、
  `natural_variation`、`one_of_one`、缺失值和 oversell Variant 的 PDP 行为。
- Design Series Metaobject 与必要字段有已审核 EN/ES 内容。
- Storefront 已实现并验证 `custom.design_series` reference 与必需故事/媒体字段读取；
  在此前只能验证 Collection 类型门禁和商品网格。
- Series Collection 非空、handle 稳定、`collection_kind=design_series`，并发布到
  Headless channel。
- `/shop` 显示商品；对应 `/category/*` 显示相同商品；系列页只显示系列成员。
- 为已填颜色样本核对多色 OR、颜色加可购买同 Variant AND、展示款价格升降序、
  卡片图/标题深链接和 PDP 初选。售罄款不得因另一款可售而误显示可买。
- 切款、刷新、前进后退和三语言切换后图价款式一致；Add to bag 与独立 Buy now
  使用相同 merchandise，既有 Bag 不被 Buy now 改写。正式设备/Checkout smoke 单独记录。
- Header 的 Shop 下拉只显示非空 Category；设计系列为 0 个时隐藏 Header 系列入口、
  1–2 个时直接显示、3 个及以上时合并为 Collections 下拉。不要用空 Collection 测试
  或触发该阈值。导航结构使用 5 分钟短缓存，Admin 发布变化可能不会即时出现在
  Header；验收时等待再验证并确认实际响应，当前没有手动缓存失效端点。
- `/collections/bracelets` 永久跳转 `/category/bracelets`；未知或普通后台 Collection
  不成为公开页面。
- Category、Collection 与 Product 的 canonical、breadcrumbs、sitemap 和可见链接一致。
- en-US/es-US Commerce scope 已获批准；es-US 商品与 Collection 仍需人工逐页确认非
  fallback。索引总门禁与 Checkout gate 仍只在各自生产验收完成后开启。
