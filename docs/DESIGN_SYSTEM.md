# Design System Direction

Status: Working — 测试站视觉方向已获批，生产资产待确认  
Owner: Brand / Design  
Last updated: 2026-08-31

本文件定义体验和实现边界。测试站可使用下列可替换视觉方向；Logo、商品摄影和
生产色值仍需按 `OPEN_QUESTIONS.md` 的 Assets and accounts 清单定稿。
测试站字体使用开放授权字体，正式
品牌上线前仍需确认字体组合是否作为长期品牌资产。

## 1. 体验原则

- Product truth before decoration：商品真实信息比神秘感包装更重要。
- Calm confidence：减少视觉噪声、虚假紧迫和过度动效。
- Editorial commerce：内容与商品自然关联，但不把 PDP 写成内容堆积页。
- Mobile purchase first：先保证手机浏览、变体、Cart 和 Checkout。
- Inclusive by default：Accessibility 不是上线后补丁。
- Fast by design：图片、字体、动效和第三方脚本都受性能预算约束。

这些原则不等于最终视觉风格；“高端”“疗愈”“极简”等词仍需品牌批准。

## 2. Working visual direction

- Home：参考 Dior 当前官网的 full-bleed editorial entry、少量文案与系列化
  叙事节奏，不复制其图片、Logo、字体、导航或具体版式。
- Product：参考 Apple 当前购买页的左右决策布局。桌面端左侧大幅/连续媒体，
  右侧清晰、可 sticky 的商品名、价格、选择、CTA 与事实；桌面两侧各占 50%，
  右侧内容滚动时左侧图库保持可见；移动端恢复单列且关闭 sticky。
- Color：保留温暖象牙白主背景，将品牌识别转向矿物深梅紫、灰粉与少量古金；
  不再以干邑棕或橙色作为主要品牌识别，降低与 Hermès 的视觉联想。
- Typography：Display 使用 Newsreader，正文与界面使用 Manrope；通过
  `next/font` 在构建时自托管，使用 Latin subset 和 variable font。系统字体
  仅作为加载失败时的 fallback。
- Editorial image：AI 生成图只用于明确标注的原型 editorial 区域，不用作
  真实商品图。

这些参考是构图、信息层级与色温原则，不构成对第三方 trade dress 的复制。

## 3. 待确认的品牌输入

- Logo 与 wordmark 版本、最小尺寸和留白。
- Primary/secondary/neutral/semantic colors。
- 字体授权、fallback 和使用层级。
- Photography：背景、光线、比例、佩戴/尺度、独件拍摄规则。
- Illustration/icon 风格。
- Brand voice、capitalization、button 和 error tone。
- Packaging 与实体触点。
- 禁用视觉元素和竞品相似风险。

无输入前只建立语义 token，不在生产文案或视觉中固化占位品牌。

## 4. Token 结构

拟议使用 CSS variables，组件只引用语义 token：

```text
color:
  bg / surface / elevated
  text / text-muted / inverse
  border / border-strong
  action / action-hover / focus
  success / warning / error

type:
  display / heading / body / label / caption

space:
  1–N consistent scale

shape:
  radius-sm / md / lg / full

motion:
  duration-fast / normal
  easing-standard

layout:
  content-width / reading-width / gutter
```

不在组件中散落任意 hex、font size、z-index 和 box shadow。Token 数量以实际
组件需求增长，不预建完整企业级系统。

测试站当前工作 token：

```text
background / paper: #F7F2E9 warm ivory
surface: #FFFCF8 soft white
subtle surface: #EEE7E1 shell
brand soft: #E9DEE4 mineral rose
text: #211C20 charcoal plum
text muted: #6F676C
brand / primary action: #3B2937 deep aubergine
accent: #916B7D dusty mauve
metal accent: #A78659 antique gold（仅装饰，不用于小号正文）
focus: #73445F
display font: Newsreader
body / UI font: Manrope
```

主背景上文字对比度：text 15.05:1、text muted 4.91:1、brand 12.09:1、
focus 6.92:1。Accent 4.09:1 与 metal accent 3.04:1 不用于普通尺寸正文。

## 5. Responsive

- Mobile-first，关键断点由内容和组件行为决定，不按设备型号堆断点。
- 主要触控目标至少满足 WCAG 2.2 相关要求，并为相邻目标留足空间。
- 不允许横向滚动、遮挡 sticky header 或被浏览器 UI 覆盖。
- Product media、price、variant 和 Add to bag 在小屏保持清晰顺序。
- PDP 图库内层使用上方主图、下方横向缩略图。桌面整个 50% 媒体面板（含背景
  和留白）以一个视口高度仅在 PDP 范围内 sticky；内层图库不单独 sticky，进入
  相关商品区前释放。移动端关闭整个面板 sticky。
- 桌面增强不能让移动端下载无用重型媒体。

## 6. Accessibility baseline

目标：WCAG 2.2 AA。

- 语义 HTML 优先于 ARIA。
- 全站有 skip link、landmark、唯一 H1 和逻辑 heading。
- 所有交互支持键盘、可见 focus 和正确 focus return。
- Dialog、drawer、menu 管理 focus，不让背景误操作。
- 表单有 label、instructions、关联 error 和必要 live region。
- 文本和非文本对比度满足标准。
- 200% zoom/reflow 下不丢内容和操作。
- 动效尊重 `prefers-reduced-motion`。
- 图片 alt 描述购买所需信息；装饰图使用空 alt。
- 颜色不是状态的唯一表达。

自动检测不能替代键盘和辅助技术人工验证。

## 7. 核心组件

### 当前导航规则

- 桌面 Header 右侧按 Search、Language、Bag 排列，三者统一为无边框线性图标 +
  文字，使用相同高度、字号、描边、间距、hover 和 focus；Bag 商品数使用紧凑
  数字徽标。图标不能替代文字或 accessible name。
- Header 下拉只切换当前 Market 的语言，不允许借语言切换改变 Market。
- 导航折叠后使用 Menu / 居中 Wordmark / Search + Bag 的对称三栏；Language
  移入全屏 Menu 底部。Menu 必须锁定背景滚动并管理 Escape、焦点锁定和焦点返回。
- Footer 提供完整国家/地区入口；未来可连接 `/choose-region`。
- 不用国旗代表语言，也不用地球图标暗示 Header 可以切换 Market。
- 当前 Header 的 Shop 固定使用下拉，包含 Shop All 与真实非空 Category。原创设计系列
  为 0 个时不显示 Header 入口，1–2 个时直接显示系列名，3 个及以上时合并为
  Collections 下拉并包含 View All；桌面与移动端使用相同数据和阈值。桌面顶级文字只
  负责 disclosure，面板从 Header 底部全宽展开，使用激活下划线、轻遮罩和克制过渡；
  Shop All / View All 与其余条目在同一横向信息组中展示，不划分独立 overview 区。
  不得复制第三方品牌素材，也不为当前少量目录强行加入 Editorial 图。下拉支持键盘
  原生 disclosure、Escape、焦点离开关闭、桌面 hover、鼠标离开完整菜单区域后短延迟
  自动关闭，以及点击遮罩关闭；移动端使用 accordion。暂不显示 New；近期商品达到
  4–6 个且有稳定上新节奏后，再恢复 New。Category 与系列不得混入同一菜单。
- Header 工具入口按 Search、Language、Bag 排列，Bag 始终最靠右。

### Foundation

- Container、Stack、Grid
- Heading、Text、Link
- Button、IconButton
- Form fields、Select/Combobox、Checkbox
- Dialog/Drawer、Disclosure
- Status message、Skeleton（不造成 CLS）

### Layout

- Announcement（只有真实信息）
- Header / Mobile navigation
- Breadcrumbs
- Footer
- Cookie/consent UI（按获批方案）

### Commerce

- ProductCard
- Money
- ProductGallery
- VariantSelector
- QuantityControl
- AddToCart
- CartDrawer/Page
- Availability
- PolicySummary

### Content

- RichText
- AnswerSummary
- KeyTakeaways
- SourceList
- AuthorCard
- FAQ/Disclosure
- RelatedEntities

内容枢纽视觉规则：

- Crystal Guide：居中标题和定位说明，下方为极简资料目录、细分隔线和清晰入口。
- Blog：居中标题和定位说明，下方为一个 Featured article 与其余编辑列表。
- Home 首屏使用纯色背景和排版层级，不展示测试期或未获批的 Hero 图片。首页不展示
  Blog 推荐或 Design Collection 条带；这些内容保留在各自导航与独立页面中。
- 没有获批编辑摄影时优先使用排版层级，不制造占位图片；获得真实资产后 Blog
  可升级为图片主导的 Featured story。
- 极简不等于空页；索引链接、摘要和分类必须输出在服务端 HTML。

About 视觉与内容规则：

- 正式 Content Page 在共享页内文字 tabs 后直接进入克制宽度的左对齐正文；H1 是正文
  第一层级，不另建纯文字 Hero 或 Page Header 区块。Summary 只有后台明确填写且不重复
  正文时才显示为 H1 下方导语。D-042 后已无本地 About 正文后备；上游缺失时
  显示暂不可用，不用 Form/Meaning/Clarity 等旧工作文案补齐。
- About 没有子页时不显示单独一项的 tab 栏；出现子页后 root 永远是第一项。使用文字
  与细下划线表达当前项，不使用 pill/button 外观。
- 桌面保持单行居中；移动端保持 44px 以上触控目标并允许横向滚动，focus 状态清晰。
  总项数建议不超过 5；更多内容改用目录结构，不挤压或静默隐藏 tabs。
- 当前没有获批品牌摄影时以排版、色块和细分隔线建立层级，不放置虚构图片。
- 创始人、团队、历史、工艺、产地、采购和认证只有真实资料获批后才能加入。

先构建实际页面需要的组件，不为假想场景建立大型 UI kit。

## 8. Product imagery

- 商品图必须真实，不用生成图替代具体商品。
- 独件商品图与实际交付物一一对应。
- Repeatable 商品说明天然纹理/颜色差异。
- 设定稳定 aspect ratio 防 CLS；保留高分辨率细节查看能力。
- 首屏主图按需 priority，其余 lazy load。
- 提供 WebP/AVIF 等现代格式和正确 `sizes`。
- Alt 包含区分商品所需的可见特征，不堆关键词。

AI 生成图可用于明确标注的概念/编辑插画，但不得伪装商品、客户、专家、产地、
工艺、包装或认证。

## 9. CRO 与信任

- Primary CTA 明确，不同时堆多个竞争按钮。
- PDP 使用 Add to bag 作为实心主 CTA，Buy now 作为下方 outline 次 CTA；两者
  不并排争夺注意力。
- Variant 选择项左侧显示本地化款式名，右侧显示当前 Market 价格；不显示供应商
  名称、素材文件名或内部中文备注。
- Price、availability、shipping/returns 摘要靠近购买决策。
- 不使用假倒计时、假低库存、假 social proof 或 guilt copy。
- Email popup 不在首屏立即遮挡核心内容；频率可控并易关闭。
- Policy、contact、materials、care、origin/treatment 在需要处可发现。
- Footer 的 Customer Care 提供 Contact、Shipping、Returns & Refunds；Legal 提供
  Privacy、Terms、Accessibility。当前不展示 FAQ、Disclaimer 或独立 Product Care。
- Reviews 未上线时不显示空星级或占位 testimonial。

## 10. Motion

- 动效解释层级或状态，不为“高级感”持续消耗资源。
- 避免滚动劫持、自动播放有声媒体和影响阅读的视差。
- Cart、dialog、menu 动效必须在 reduced motion 下近乎即时。
- Transition 不延迟关键操作反馈。

## 11. Design approval gate

开发视觉完成前需要批准：

- Moodboard 与竞争差异。
- Logo/colors/type 授权与 token。
- Home、Collection、PDP、Cart 的 mobile/desktop 关键稿。
- 内容页、Policy、404、loading/error/empty/sold-out 状态。
- Product photography spec。
- Accessibility 与 performance review。

获批后的具体 token、组件变体和内容规则再补入本文件。
