# Superseded Decisions — 2026-08

Status: Historical evidence only  
Archived: 2026-09-02

本文件保存已被后续决策或当前 Production 状态取代的决策正文。ID 和替代关系仍可从
`../DECISIONS.md` 的决策索引查询；本文件不得作为当前实现依据。

## D-023 — 不可索引测试站

Original decision: 在 Shopify、域名、商品、政策均未准备时，可以建立可运行测试站。
全站默认 `noindex`；只有完成生产门禁后才显式开启索引、Checkout 和适用 Schema。

Superseded by: D-044、D-045、D-048 及当前 Production release state。Preview 与仓库
默认 fail-closed 规则继续有效，但 Production 已开放获批索引和 Checkout 范围。

## D-025 — 测试站首件商品

Original status: Superseded（仅 runtime sample）。

Original decision: 测试站暂时只上架「七脉轮普通款」，按标准商品建模。工作规格为
8mm、22 颗，七彩石列表来自历史 [`product-inputs-2026-08.md`](product-inputs-2026-08.md)。
业务方提供的白纹石、黑曜石、蓝纹石、蜜蜡玉、粉晶 5 张概念图曾建模为同一 Product
下的 5 个主石选项；每款 15 颗主石 + 7 颗七彩石。

Original consequence: 其他构思系列不进入 Catalog；“11”的含义、准确组合、价格、腕围、
线材、供应链和质量信息未确认前不补充其他 Variant 或生产声明。

Superseded by: D-042。上述资料只保留为历史概念/fixture；运行时商品完全由 Shopify
Headless channel 决定，网站不维护第二份 assortment 批准清单。

## D-026 — 加拿大测试 Market

Original decision:

- URL：`/en-ca/` 与 `/fr-ca/`。
- Catalog：`ca`，与 `us` 分离。
- Currency：CAD；`$92 CAD` 仅为当时测试值。
- English/French 共享 CA Catalog、商品发布范围、价格、库存和 CA 运营 profile。
- 原型可使用与 US 相同的商品身份和素材，但 US/CA price、availability 和 Cart context
  必须按 Market 隔离。

Original consequence: Canada Shipping、Tax、Returns、Privacy、Legal 和正式法语内容
未批准前 noindex，Checkout 不可用。

Superseded by: D-035。Canada 现在只保留 typed planned 配置，不生成公开 URL。

## D-028 — Header 地区与语言入口及系列导航

Original decision:

- Header 使用“中性地球图标 + Market · Language”合并入口，例如 `US · EN`、`US · ES`、
  `CA · EN`、`CA · FR`。
- 入口同时选择国家/地区与语言；Footer 保留完整文字版入口。
- 不使用国旗作为语言图标。
- 主导航曾计划直接展示 `Seven Chakras`，不增加单层 `Collections` 抽象入口。
- 至少有 3 个正式系列时再升级为 Collections 父级菜单。

Original consequence: 切换 Market 时保留当前路径；目标 Market 无页面时进入等价页或
本地化 404，不静默回退其他 Market。

Superseded by: D-029、D-035、D-036。当前 Header 只切换 US Market 内 EN/ES，Catalog
导航按真实 Product Category 与 Design Collection 数据生成。
