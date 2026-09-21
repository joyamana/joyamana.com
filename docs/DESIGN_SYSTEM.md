# Design System

Status: Active — D-050 品牌实现；部署与设备验收单独记录
Owner: Brand / Design / Frontend
Last updated: 2026-09-21

本文件只维护当前视觉与组件规则。品牌事实见 [BRAND_INPUTS](BRAND_INPUTS.md)，
交易与索引边界见 [DECISIONS](DECISIONS.md)，待提供素材见 [OPEN_QUESTIONS](OPEN_QUESTIONS.md)。

## Tokens 与字体

实际变量集中在 [globals.css](../src/app/globals.css)，组件复用现有语义 token。

| 角色 | 值 | 使用范围 |
|---|---|---|
| 品牌浅色 | `#D8D2F0` | Hero 文案区、有限品牌区、深色底 Logo |
| 品牌深色 | `#7B2C06` | Logo、主按钮、Footer |
| 主背景 | `#FCFAF7` | 商品与阅读区 |
| 暖辅助底 | `#F4EADF` | 品牌主张和辅助区域 |
| 正文 | `#302421` | 名称、价格、长文 |
| 次级文字 | `#6B5852` | 说明和标签，不再降低透明度 |
| 辅助色 | `#AE9BC2` / `#E38C82` / `#F7C19D` / `#DA6E51` | 少量装饰，不自动用作状态或小字颜色 |

英/西语标题使用 Newsreader，正文与数字使用 Manrope；繁中品牌/PDP 标题使用
Noto Serif HK 500，正文、卡片与操作使用 Noto Sans HK。字体通过 `next/font` 自托管，
中文字体仅在繁中布局加载。Logo 为路径，不额外加载朱雀仿宋。

纯色对比：赭棕/浅紫 6.53:1，白/赭棕 9.52:1，正文/暖白 14.40:1；
次级文字/浅紫约 4.58:1，避免透明度叠加。白/浅紫、白/灰紫和普通白字/陶土橙不适用。
图片叠字、焦点、hover、disabled 与错误状态按实际合成背景验收。

## 资产与图片

- 正式资产位于 [public/brand](../public/brand/README.md)：wordmark、symbol、lockup、
  reverse lockup 与 pattern；保留原稿路径、字距和比例。Header 用字标，Footer 用反色组合。
- pattern 当前是完整原稿，**没有通过无缝平铺验收**；只作为单张装饰图使用，不重复外缘。
- 商品图来自实际 Shopify 媒体，保持原色与完整形态；独件图与实物对应。
  卡片用稳定容器和 `contain`，以文字表达不可售，不给缺货图加变色滤镜。
- Hero 优先显示真实可售商品图；缺少适用图时使用已有抽象编辑背景
  `joya-mana-home-hero.webp`，该背景不代表在售实物或真实产地。
- 所有图预留尺寸并设置符合布局的 `sizes`。仅关键首图使用 `preload`；其余按需加载。
  商品 alt 描述实际可见特征，装饰 Logo/纹样不重复朗读。

## 当前组件

- Header 保留 Shop、真实系列、Crystal Guide、Blog、About。系列 0 个隐藏、1–2 个直显、
  ≥3 个下拉；类别与系列分开。工具顺序 Search / Language / Bag。
- 移动 Header 为 Menu / 居中字标 / Search+Bag；全屏菜单保留焦点锁定、Escape、
  返回焦点与背景滚动锁定。Header/Footer 切语言保留对应路径与 US Bag。
- 首页顺序为浅紫文案与商品图首屏、Selected pieces、真实类别入口、品牌主张、Footer。
  精选最多四件，0 件提供恢复入口；不加 Blog/设计系列推荐或未接通订阅表单。
- 商品卡按图片、名称、可用短规格、价格、必要不可售状态排列；未知原因用 Unavailable。
  数量、价格与状态规则由 Commerce 层提供，不显示虚假 Best seller、评价或紧迫性。
- 主按钮赭棕底白字，小圆角；次按钮为边框样式。PDP Add to bag 为主、Buy now 在下方。
  真实 cart readiness/库存/数量门禁不可被样式绕过。
- PDP 桌面媒体/购买区各 50%；整个图库面板仅在 PDP 内 sticky，推荐区前释放。
  移动单列且图库不 sticky。短事实就绪才下移完整正文；具体门槛见 [COMMERCE_SPEC](COMMERCE_SPEC.md)。
- About 在真实文字 tabs 后直接进入正文，当前项用下划线及 `aria-current`；不增独立大 Hero。
  移动 tabs 可局部横向滚动，内容页保持克制行宽。
- Guide 用资料目录，Blog 用 Featured article 与编辑列表；空/失败状态保持可恢复。
  Policy/Accessibility 的业务正文来自 Shopify；Contact 使用集中 UI 文案与客服邮箱。
- Bag 明确金额、数量与小计；仅有问题时突出库存状态，错误给出刷新/重试入口。

## 响应式与验收

- 以 320、390、768、1440 px 检查；不允许页面横向溢出。图库/tabs 的局部滚动须可操作。
- 正文通常 16–18 px；阅读区约 60–70ch，繁中按实际字宽复核。长商品名可换行，不截断关键规格。
- 主要触控目标至少 44 × 44 CSS px；购买按钮高度至少 48 px。焦点在深浅底均清晰。
- 键盘可完成导航、语言、Variant、数量与购买；检查 200% 缩放、320 CSS px reflow、
  图片替代文本及有文字的错误状态。动效遵守 `prefers-reduced-motion`。
- 本文件记录目标与实现规则，不替代实际设备、性能或无障碍验收记录。
