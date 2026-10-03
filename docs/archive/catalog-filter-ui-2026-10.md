# 即时商品筛选与界面优化

状态：Complete — 本地实现和验证完成，未部署
负责人：Engineering / Project owner
最后更新：2026-10-03
关联：D-050；DESIGN_SYSTEM / COMMERCE_SPEC / MVP_PRD

## Objective

取消 Apply，选择可购买、颜色、排序或移除条件后立即更新。颜色的读取、匹配、固定
选款、卡片图片及 PDP 初选在网页代码中完整绑定，后台补值后无需追加代码或部署。

## Context

沿用 D-050 同 Variant 条件与 Shopify 唯一事实来源。已有颜色字段 JSON 读取和完整
Variant 数据路径；此次优化 UI 与交互，不迁移字段、URL、商业数据或索引策略。

## Scope

- 三语言 Shop / Category / Design Collection；紧凑标题、工具条、颜色/排序浮层和标签。
- 即时乐观选择、加载提示、连续操作、历史恢复、键盘/触控和无 JS GET 链接。
- 颜色 fixture 仅用于隔离本地 smoke，不能进入正常应用或回写 Shopify。

## Decisions and assumptions

- 用户于 2026-10-03 明确批准取消 Apply 并重做 UI；局部实现无需新 ADR，补充 D-050。
- 无颜色值只影响真实选项，不成为网页实现 blocker；不从图片、标题或品牌配色猜商品颜色。
- 复用原生 details 与链接，无新依赖、生产服务或环境变量。

## Milestones

1. [x] 实现即时选择、浮层、标签与紧凑三语言列表布局。
2. [x] 完成工程检查、真实目录与隔离颜色 fixture 浏览器 smoke。
3. [x] 同步当前规格与 Outcome，归档计划。

## Validation

- Node 24：preflight / lint / typecheck / test / production build。
- Chrome：颜色多选、快速连续选择、排序、清除、刷新、Back/Forward、Space/Escape、
  桌面和 320/390px，关闭 JS 后原生链接可用；无 Apply。
- 真实 Shopify 请求 no-store；颜色 fixture 在独立测试进程注入 API 响应，仅核验颜色
  → 固定选款 → 卡片图片/价格 → PDP 初选；正常进程不含 fixture。
- 参数 metadata/Schema/sitemap 延续原门禁；购物 ID/价格选择逻辑不改变。

## Progress log

- 2026-10-03：改为即时链接与乐观选中状态；增加颜色/排序浮层、开关、轻量标签、
  加载提示及原生 GET fallback，收紧列表标题和商品网格间距。
- 2026-10-03：移除列表标题继承的 460px 最小高度，清理旧筛选样式。完成 320/390px
  布局、原生浮层、连续选择、历史恢复、键盘焦点和 HTML/索引门禁检查。

## Risks

- 快速操作不得丢失已选条件或被旧响应覆盖；用实际浏览器并发导航验收。
- 浮层需保持小屏可读、键盘操作与焦点；无颜色数据不显示实施等待说明。

## Outcome

- 即时筛选已覆盖三语言 Shop、Category 和设计系列详情；没有 Apply，选择条件和
  排序、移除标签及清除均直接更新，清除保留排序。颜色匹配、固定选款、图价、Variant
  深链接和 PDP 初选已经完整连接；后台新增真实值自动读取，无需后续网页绑定工作。
- Node 24.21.0：preflight、lint、typecheck、36 files / 235 tests 和 production build
  通过；最终 CSS 调整后再次 production build / preflight 通过，git diff --check 通过。
- 隔离 Chrome（未使用 Playwright）：真实目录 Shop 46、Category Bracelets 28、
  Patron Saint 8；可购买筛选得到 41，价格降序按完整列表校验。三语言无 Apply，
  空颜色/未知颜色可清除。320px 西语、390px 香港繁中无横向溢出，标题高度分别约
  227/215px，颜色/排序浮层完整可见，Space 即时选择、Escape/外部点击关闭、焦点和
  刷新通过，无捕获的运行时或 console 异常。
- 颜色业务值仍未填：在另一个本地进程对真实 Shopify 响应注入六款测试颜色标签，
  不回写数据且正常进程不导入 fixture。Pink 选中 Amethyst 12mm，卡片与 PDP 的
  Variant ID、图片 URL 和价格相同；Purple/多选按固定规则选 14mm。快速连续颜色
  多选与可购买条件不丢失，Back/Forward、清除保留排序、三语言和关闭 JS 原生 GET
  均通过。此证据验证代码链路，不能视为 Shopify 已填颜色或真实媒体绑定验收。
- HTTP 初始 HTML：真实 46/41/0 张卡片、fixture Pink 2 张卡片均直接输出，ES Category
  与香港繁中系列参数页同样服务端渲染；metadata、无 Apply、参数 noindex、无参数页
  Schema/alternate metadata，以及 sitemap 无参数/停用 Canada URL 通过。
- 现有 Cart/Checkout 商业逻辑保持原验证记录；本轮未创建订单或操作付款。未添加
  依赖、环境变量或外部服务，未部署。正式真机/译文验收、后台真实颜色与媒体核验及
  发布验收仍由 ROADMAP / SHOPIFY_CATALOG_SETUP 跟进。
