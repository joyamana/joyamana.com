# Shopify 维护

本文说明后台填写与核对；写入须有对应授权。业务规则归 [交易规格](COMMERCE_SPEC.md)，
内容就绪与索引归 [内容与索引](CONTENT_SEO_GEO_SPEC.md)，未接入能力归 [Roadmap](ROADMAP.md)。

## 发布与翻译

使用现有店铺、US Market、Headless channel，不新建香港/台湾市场。
商品、Collection、Article、Metaobject/字段须发布并允许 Storefront 读取。
Policies 保持真实获批正文；翻译不改变业务事实、价格、库存或引用关系。

本次公开范围只核对英语和香港繁中 title、description、SEO、options、alt 与正文。
西语暂停本站上线，保留已有译文；本站配置不会自动修改 Shopify/Checkout 的语言设置。
繁中后台语言 `zh-TW`，Storefront `ZH_TW`，本站 `zh-Hant-US`，交易仍为 US/USD。
语言发布或页面 200 不能证明译文正确；Checkout、Order Status、通知另外审校香港措辞。

更新后核对实际前台响应；内容/导航有五分钟再验证，商业读取不缓存，详见技术规格。

## 品牌资产与 Checkout

前台 Logo 资源与使用规则见 [设计规范](DESIGN_SYSTEM.md#品牌与视觉)。Next.js 资源不会
自动同步 Shopify 的品牌、Hosted Checkout 或通知；后台需分别上传并检查实际显示。

1. Settings → General → Brand assets → Manage：默认 Logo 使用
   [lockup-rust.png](../public/brand/lockup-rust.png)，方形 Logo 使用
   [symbol-square-rust.png](../public/brand/symbol-square-rust.png)。默认资产为透明 PNG、
   2048px 宽；方形图为透明 PNG、1024×1024，符合后台最低尺寸要求。
2. Settings → Checkout → Configurations → Edit → Settings → Logo：选择
   [wordmark-rust.png](../public/brand/wordmark-rust.png)，调整 Width 与 Alignment，
   保持字标原比例，分别预览桌面和手机。表单用浅底，按钮和强调色沿用设计规范的正式颜色，
   不将纹样铺到表单或价格区域。
3. 通知模板的 Logo 另行配置，核对订单确认、Order Status 和 Checkout；两种公开语言
   共用品牌资产，译文仍按发布范围审校。保存后执行 [发布验收](LAUNCH_RUNBOOK.md#商品与交易)。

官方入口与要求：[管理品牌资产](https://help.shopify.com/en/manual/promoting-marketing/managing-brand-assets)、
[Checkout 样式](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style)。
上传资源和前台代码完成不代表后台已保存或部署验收通过。

## 商品类别与字段

Product 使用最具体的 Shopify Standard Product Category；公开 taxonomy allowlist 见
[catalog.ts](../src/config/catalog.ts)：

| 类别 | 路径 |
|---|---|
| Jewelry / Bracelets | `/category/bracelets` |
| Jewelry / Rings | `/category/rings` |
| Jewelry / Necklaces | `/category/necklaces` |
| Jewelry / Earrings | `/category/earrings` |
| Rocks & Fossils / Gemstones | `/category/gemstones` |

Palm Stone/Sphere/Guardian Figure 仅在真实 taxonomy 匹配时归入 Gemstones，不用 Type/tag
代替。至少一件当前 Catalog 可见商品匹配才显示入口。

| Owner | Key | 类型与值 | 前台状态 |
|---|---|---|---|
| Product | `custom.product_model` | single line text：`standard`、`natural_variation`、`one_of_one` | 已读取；图片披露待接入 |
| Product | `custom.design_series` | 一个 Design Series Metaobject reference | 后续归集/故事待接入 |
| Variant | `custom.colors` | `list.single_line_text_field`，一个或多个真实颜色 | 已用于筛选 |

需读取的 definition/field 开启 Storefront 访问。模型不能猜测；商品知识字段在结构确定后
填真实资料，不用未确认 namespace 假装接入。准确库存提示所需事实见交易规格。

颜色保持文本列表，不迁移 Metaobject。多色填多个值，不填逗号拼接字符串；默认语言
统一拼写，译文不改稳定身份。新增值自动读取，null 时检查填写与访问权限。
逐款绑定媒体，至少比较两个颜色/价格不同的 Variant；API image 非空可能是产品图回退，
须到后台检查专图绑定。顺序影响优先款，不能为图片问题改写商业事实。

## 设计系列

Collection 维护 `custom.collection_kind` single line text，值可为 `design_series`、`category`、
`merchandising`。只有 design_series、Headless 可见且非空才公开；缺失/其他值不作为系列。
维护唯一 handle、description、image、SEO，URL 为 `/collections/{handle}`。
缺描述详情不索引，不把运营归组标成设计系列。reference、故事/lookbook 接入工作见 Roadmap。

## About 与 Accessibility

`content_page` definition 开启 Storefront 读取，字段如下：

| Key | 类型 | 要求 |
|---|---|---|
| `title` | single_line_text_field | 必填 |
| `body` | rich_text_field | 必填，有可见正文 |
| `last_updated` | date | 必填，真实有效日期 |
| `seo_title` | single_line_text_field | 必填 |
| `seo_description` | multi_line_text_field | 可选，缺失用正文摘要 |
| `navigation_title` | single_line_text_field | 可选，缺失用 title |
| `summary` | multi_line_text_field | 可选，明确且不重复 |
| `child_pages` | list.metaobject_reference → content_page | About root 的有序直接子页 |

root handle 为 `about`，Accessibility 为 `accessibility`，各语言共用身份和引用关系。
只公开 root 引用的完整一级子页，规则见内容规格。已公开 handle 修改/移除先确定迁移。

## Blog 与 Guide

Blog handle `blog` 对应 `/blog`，`crystals` 对应 `/crystals`。Article 填真实正文、摘要、
作者、日期、媒体、SEO 与翻译，扩展放 Article metafields，不另存同主题正文。
测试文章不能正式发布，Editorial 索引继续关闭。

## 操作后核对

- Headless 发布、Category、模型、价格/库存/数量规则和媒体正确。
- API 可读颜色，核对多色 OR、颜色+可购买同款 AND、展示价排序、卡片/PDP/Bag 同款。
- 深链接、切款、刷新、返回/前进与公开语言切换一致。
- 系列类型/成员/正文/SEO、导航数量阈值，About 引用/顺序/日期和实际译文正确。
- 检查 Shopify 正文是否残留 `/es-us` 链接，在来源内容修正，不由 HTML 清洗器猜测替换。
- 按 [发布手册](LAUNCH_RUNBOOK.md)核对 HTML、索引、设备和获批 Checkout 流程。
