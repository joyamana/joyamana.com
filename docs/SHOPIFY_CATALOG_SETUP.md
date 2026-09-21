# Shopify Catalog Classification Setup

Status: Active implementation guide
Owner: Commerce / Content operations
Last updated: 2026-09-21
Related: D-002、D-009、D-020、D-036；`COMMERCE_SPEC.md`

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
Storefront 对缺失和未知值 fail closed：不会显示低库存文案。PDP 仅对
`standard` / `natural_variation` 中可售、非 oversell、购买增量为 1 且准确可用数量为
1–3 的所选 Variant 显示 `Only X left`；`one_of_one` 永远排除。该字段目前只用于
可信的库存披露；图片代表性必须另填下方 `custom.image_representation`，不能由模型推断。

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

### 3.3 Product knowledge

以下字段已由 storefront 读取。先检查店铺已有 definition，再填充准确、可公开且经人工审校的值；
不得把本文示例当作任何商品的真实数据。Product 为共享事实，需要随规格变化的字段可在
Variant 使用同名 definition；有效 Variant 值覆盖 Product，空值不清除 Product 的已知事实。

| Namespace/key | Shopify type | 内容与边界 |
|---|---|---|
| `custom.summary` | Single line 或 Multi-line text | 一句真实外观/材质摘要 |
| `custom.materials` | Single line 或 Multi-line text | 可见材质，映射到 `facts.material` |
| `custom.dimensions` | Single line 或 Multi-line text | 珠径、长度或实际尺寸及单位 |
| `custom.fit` | Single line 或 Multi-line text | 适合手围/佩戴尺寸，必要限定语 |
| `custom.treatment` | Single line 或 Multi-line text | 真实处理、染色、涂层或合成披露；未知不得填“未经处理” |
| `custom.care` | Single line 或 Multi-line text | 适合该具体材质的护理 |
| `custom.package_contents` | Single line 或 Multi-line text | 实际随附内容；guidebook 已确认，不自动包含礼盒服务 |
| `custom.image_representation` | Single line text，preset choices | `exact_item` 或 `representative`；不得翻译枚举值 |
| `custom.related_content` | List of Article references，Product only | 最多读取 6 项，只接受现有 `blog`/`crystals` 的有效 Article |

为需要读取的 definition 开启 Storefront access。正文文本与字段译文同在 Shopify 维护；
同一 US 商品的 EN/ES/香港繁中事实保持一致。`origin`、weight、craftsmanship 尚无独立映射，
新增字段须先定义用途，不能期望写入任意 metafield 就自动显示。

PDP 已知事实在购买前展示；已映射 bracelets 分类的完整正文下移门槛为 material + treatment
+ dimensions + fit，避免只提供珠径而遗漏适合手围；其他/未映射分类使用 material + treatment
+ dimensions/fit。必须补齐真实 taxonomy，前端不从标题猜测品类。
尚未达到门槛时全文保持在购买前，不能为缩短页面删除现有处理披露。首轮验收至少覆盖一个
有材质处理的商品、一个多 Variant 商品和一个独件；具体待填数据见
[OPEN_QUESTIONS](OPEN_QUESTIONS.md)，不要在本文件维护第二份 SKU 审批表。

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

## 6. 发布验收

- Product 已发布到 Headless channel，Category 准确，价格/库存来自当前 US Catalog。
- 每件正式 Product 已填充 `custom.product_model`；分别验证 `standard`、
  `natural_variation`、`one_of_one`、缺失值和 oversell Variant 的 PDP 行为。
- Product knowledge 与图片代表性按实际商品填充；分别验证空字段、有效字段与 Variant 覆盖。
- Design Series Metaobject 与必要字段按已发布语言完成内容审校。
- Storefront 已实现并验证 `custom.design_series` reference 与必需故事/媒体字段读取；
  在此前只能验证 Collection 类型门禁和商品网格。
- Series Collection 非空、handle 稳定、`collection_kind=design_series`，并发布到
  Headless channel。
- `/shop` 显示商品；对应 `/category/*` 显示相同商品；系列页只显示系列成员。
- Header 的 Shop 下拉只显示非空 Category；设计系列为 0 个时隐藏 Header 系列入口、
  1–2 个时直接显示、3 个及以上时合并为 Collections 下拉。不要用空 Collection 测试
  或触发该阈值。导航结构使用 5 分钟短缓存，Admin 发布变化可能不会即时出现在
  Header；验收时等待再验证并确认实际响应，当前没有手动缓存失效端点。
- `/collections/bracelets` 永久跳转 `/category/bracelets`；未知或普通后台 Collection
  不成为公开页面。
- Category、Collection 与 Product 的 canonical、breadcrumbs、sitemap 和可见链接一致。
- 三语言 Commerce scope 已获批准；ES/繁中商品与 Collection 仍需人工逐页确认正文、
  字段、metadata 与等价关系。索引总门禁、单页 readiness 与 Checkout gate 分别验收。
