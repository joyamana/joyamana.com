# Product Inputs

Status: Active input record — 历史概念与当前 Shopify 测试商品分离
Owner: Project owner  
Last updated: 2026-08-31
Source: `构思中的系列.docx`（业务方提供，2026-08-03）

Additional sources: 业务方提供的 5 张七脉轮系列概念图（2026-08-03）。

本文件保留早期系列构思，但不把构思自动升级为可销售事实。运行时商品只以
Shopify Headless channel 当前发布的 Product/Variant、价格、库存和媒体为准；
生产首发 assortment 仍需负责人单独批准。

## 当前 Shopify 测试 Catalog

截至最近一次记录的 Storefront 审计：

- Headless channel 可见 `aquamarine-bracelet-9-mm`，当时有 1 个可售
  Variant。商品、价格、媒体和 availability 均由 Shopify 实时提供，文档不
  复制它们作为长期事实。
- 2026-08-30 实时抽查时该商品可通过 `/category/bracelets` 发现；生产
  发布前仍需在 Shopify Admin 重新核对 Standard Product Category。
- 2026-08-31 已可读 `quantityAvailable`、`currentlyNotInStock` 和 contextual
  `quantityRule`；PDP 和 Bag 只用它们限制可履约数量，不展示虚假紧迫文案。
- Shopify Spanish context 在最近审计时仍回退 English，不得视为已审校西语
  商品内容。
- 该商品用于验证 Shopify-only storefront，不因“已发布到测试店”自动成为
  获批的正式首发商品。

## 历史七脉轮原型输入

下列是 2026-08-03 获批用于本地原型的首件样本，已由 D-042 从 storefront
运行时移除：

> 七脉轮普通款 / Seven-Chakra Classic Bracelet

### Historical working facts

- 标准可补货商品，不是天然独件。
- 普通款使用 8mm 珠。
- 文档写明 8mm 为 22 颗；作为工作规格展示，生产前复核腕围和计算方式。
- 七彩石列表：
  - 紫水晶
  - 青金石
  - 蓝玛瑙
  - 绿萤石
  - 黄玛瑙
  - 橙玛瑙
  - 红碧玉
- 当前已提供 5 个主石选项的概念图：
  - 白纹石
  - 黑曜石
  - 蓝纹石
  - 蜜蜡玉
  - 粉晶
- 概念图明确每个选项为 15 颗主石 + 7 颗七彩天然石，共 22 颗。
- en-US 与 es-US 使用同一个 US 商品 ID、库存与 USD 价格。
- Canada 暂不发布；规划中的 CA Catalog 仍与 US price/availability/Cart 隔离。
  历史 `$92 CAD` 只保留为内部排版测试值，不对应公开 Market。

### Historical prototype-only values

- `$68` 仅是当时的 Cart 和排版测试值，不是批准价格，也不再进入
  运行时。
- 业务方提供的 5 张图按“概念图”使用，不声明为实际商品摄影或一物一图。
- 英文名、西班牙文名和描述是开发文案，发布前需人工审校。

### Pending clarification

- “七脉轮普通款（11）”具体指 11 个 Chakra-focused 款、11 个 SKU、11 个
  Variant，还是其他组合。
- 主石与七彩石的准确排列、每种石头颗数和表格中 300/540/240 的单位与用途。
- 图中两个银色隔片的材质、规格、成本与是否进入最终款。
- 弹力绳/线材、金属配件、隔片、扣具和备用材料。
- 实际腕围、尺码范围、重量和允许天然差异。
- 供应商、产地、处理方式、材料鉴定和质量标准。
- 生产售价、成本、库存、SKU/Barcode、包装和保养说明。
- 除当前 5 个选项外，“普通款（11）”是否还包含 6 个待提供的主石选项。
- 白纹石、蓝纹石、蜜蜡玉等供应商商业名称对应的矿物学名称；验证前英文/西语
  采用保守工作译名并同时保留中文 source name。

## 暂不上架的构思

- 七脉轮加强款
- 万圣节款
- 许愿款
- 圣诞节款
- 五行款
- 12 星座
- 摆放/装饰水晶摆件

其中“金钱、事业、爱情、守护、健康、心脏”等主题涉及 claims 风险。未来
若进入商品或内容规划，必须遵守 `CONTENT_SEO_GEO_SPEC.md` 的 claims policy，
不得承诺财富、健康、保护或人生结果。

上述历史资料可用作测试 fixture 或未来产品讨论输入，但只有 Q-002C 批准将其纳入
正式 assortment，且 Q-002A 的 SKU、材料、定价、图片和库存全部批准并发布到
Shopify 后，才能成为客户可见 Catalog；任何情况下都不得恢复为运行时 fallback。
