# Shopify 维护

本文件说明运营人员在 Shopify 维护的字段和检查方法，不授权代码修改后台。
商品和政策行为见交易规格，内容发布/索引规则见内容与索引规格，待完成资料见 Roadmap。

## 发布与翻译

使用现有 Shopify 店铺、US Market 与 Headless channel，不新建香港/台湾市场。
商品、Collection、Content Page、Article 与需要的 Metaobject/字段须发布并允许 Storefront
读取。Shopify Policies 保持真实已批准正文；业务事实、价格和库存不随翻译改变。

维护 EN/ES/香港繁中 title、description、SEO、options、alt 和正文。繁中后台语言为
`zh-TW`，Storefront 为 `ZH_TW`，站点为 `zh-Hant-US`；不得因此改变 USD 或交易国家。
缺译页面可回退默认英文，语言已发布或页面 200 不能证明翻译已审核。
Checkout、Order Status 和通知另外审校，平台默认繁体不能代替香港措辞验收。

内容/导航更新可能经历五分钟再验证，商业读取不缓存。等待并核对实际响应，不把后台
保存成功当作前台已更新；缓存失效细节见技术规格。

## 商品类别

Product 使用最具体的 Shopify Standard Product Category；公开映射由
[catalog.ts](../src/config/catalog.ts) 的 taxonomy allowlist 管理。

| 商品类别 | 公开路径 |
|---|---|
| Jewelry / Bracelets | `/category/bracelets` |
| Jewelry / Rings | `/category/rings` |
| Jewelry / Necklaces | `/category/necklaces` |
| Jewelry / Earrings | `/category/earrings` |
| Rocks & Fossils / Gemstones | `/category/gemstones` |

Palm Stone/Sphere/Guardian Figure 只在真实 taxonomy 匹配时归入 Gemstones。
Product Type/tag 不作为类别来源。至少一件当前 Catalog 可见商品匹配时才出现类别入口。

## 商品与 Variant 字段

在商品自定义数据中维护：

| Owner | Key | 类型与允许值 |
|---|---|---|
| Product | `custom.product_model` | single line text：`standard`、`natural_variation`、`one_of_one` |
| Product | `custom.design_series` | 一个 Design Series Metaobject reference |
| Variant | `custom.colors` | `list.single_line_text_field`，一个或多个真实颜色 |

需要 storefront 读取的 definition/field 开启访问权限。不要根据标题、图片、tag 或库存
填猜测商品模型；准确库存提示当前暂停，不把 `currentlyNotInStock` 当作禁止超卖证明。
商品知识字段在明确含义与结构后维护真实材料、尺寸/fit、care、处理/来源、包装和内容
关系；当前尚未完整映射，不用填写未经确认的 namespace 来假装接入。

颜色定义已经确定为文本列表，不迁移为 Metaobject。多色款填写多个值，不填逗号拼接
字符串；统一默认语言拼写，不把品牌色当商品属性，不以译文改变稳定身份。
网页已接入读取、选项、筛选、图价与 PDP 初选，新增有效值自动读取，无需再绑定代码。
字段 null 可能是未填或访问权限问题，需要分别检查，不保存长期的“全部未填”快照。

逐款关联真实媒体，至少比较两个不同颜色/价格的 Variant。Storefront image 可能回退
产品图，因此非空不是专图绑定证据。独件一物一图。Variant 顺序决定同条件下的优先款，
价格排序不改变款式；不要为图片问题改写前台商品事实。

## 设计系列

只有 Collection 的 `custom.collection_kind=design_series`、Headless 可见且非空时，
才进入公开系列列表和详情。允许枚举为 `design_series`、`category`、`merchandising`，
缺失/其他值不作为设计系列公开。

Collection 可维护 `custom.design_series` 的单个 Metaobject reference。
Product 设置同一 reference，由 automated Collection 归集系列成员；每件商品当前一个
主要系列，改为多值须有真实需求和批准。Category 的后台 Collection 不能标为 design_series。

Design Series 可按后续故事需求设计名称、tagline、简介、rich-text story、hero/mobile
hero、lookbook、真实发布日期和发布状态，字段建议不等于前端已接入。
Collection 维护唯一 handle、description、image 和 SEO，公开 URL 仍 `/collections/{handle}`，
不为 Metaobject 再发布第二个索引页。

当前前端只读取 Collection 类型与网格，没有 reference/story/lookbook。完整系列发布前
须同时完成字段、翻译、适配和展示；只创建 Metaobject 不算故事功能完成。

## About 与 Accessibility

`content_page` definition 开启 Storefront 读取，基础字段按下表维护：

| Key | 类型 | 要求 |
|---|---|---|
| `title` | single_line_text_field | 必填 |
| `body` | rich_text_field | 必填，必须有可见正文 |
| `last_updated` | date | 必填，真实有效日期 |
| `seo_title` | single_line_text_field | 必填 |
| `seo_description` | multi_line_text_field | 可选，缺失用正文摘要 |
| `navigation_title` | single_line_text_field | 可选，缺失用 title |
| `summary` | multi_line_text_field | 可选，明确且不重复才展示 |
| `child_pages` | list.metaobject_reference → content_page | About root 的有序直接子页 |

About root handle 固定 `about`，Accessibility handle 固定 `accessibility`。
About 只公开 root 直接引用的完整子页，不遍历所有 Metaobject 或生成深层路径。
各语言共享 handle、引用关系与事实；正文/SEO 在 Shopify 翻译。
已公开 handle 修改或移除须先确定 redirect/404/410，不批量跳首页。

## Blog 与 Guide

原生 Blog handle `blog` 用于 `/blog`，`crystals` 用于 `/crystals`。
Article 维护真实正文、摘要、作者、日期、媒体、SEO 与翻译，必要扩展放 Article metafields，
不重复保存同主题 Crystal Metaobject 正文。测试文章不作为正式内容，Editorial 暂不索引。

## 操作后检查

- 商品发布到 Headless，Category、Variant 价格/库存/数量规则、模型与真实媒体正确。
- 已填颜色可由 API 读取，验证多色 OR、颜色+可购买同款 AND、展示价排序、卡片与 PDP 同款。
- 深链接、切款、刷新、返回/前进和语言切换一致；Bag/Buy now 使用所选 merchandise。
- 系列真实非空、类型正确、正文/SEO 完整；检查导航 0/1–2/3+ 阈值。
- About 引用、顺序、正文、日期和三语言内容正确；已识别回退页不进入对应 sitemap。
- 核对 UI、metadata、canonical、Schema 与真实数据，按发布手册完成设备和 Checkout 验收。
