# 品牌与设计规范

## 品牌与视觉

品牌为 Joya Mana，Logo、wordmark、字体授权、正式颜色与真实商品摄影/视频已确认。
只用已提供的获批资产。现代、克制、温暖、关注自然纹理和日常佩戴是设计方向，
不自动成为产品价值承诺。工作定位和参考品牌用于讨论层级，不复制具体素材或设计。
文案声明限制见 [内容与索引](CONTENT_SEO_GEO_SPEC.md#内容模型与审核)。

品牌/客服配置见 [brand.ts](../src/config/brand.ts)，色值/字号以
[globals.css](../src/app/globals.css) 为唯一来源，不在文档复制数值表。
米白为主背景，理念区用浅奶白与商品区区分，浅紫用于选中，深棕用于操作和细节，花卉色为辅助。
语义文字和错误色独立于装饰色，大内容区不铺满深棕。

正式资源在 [public/brand](../public/brand/)，来自获批 `【最终】joya mana logo.ai`：
图形保留原稿路径，字标将原稿内嵌朱雀仿宋的字形转为轮廓，保留字距、比例并裁掉画板留白。
不通过网页字体重排字标，不拉伸、重绘或添加未经确认的图形寓意。

| 资源 | 当前用途 |
|---|---|
| `wordmark-rust.svg` / `wordmark-lavender.svg` | 原版字标；Header 与手机菜单使用赭棕版 |
| `symbol-rust.svg` / `symbol-lavender.svg` | 独立图形；首页理念标题旁使用小尺寸赭棕版 |
| `lockup-rust.svg` / `lockup-lavender.svg` | 原稿上下组合；深棕 Footer 使用浅紫版 |
| `pattern-lavender.svg` | 保留第三页连续纹样资源；当前网页不展示 |
| `icon.svg` / `favicon.ico` / `apple-touch-icon.png` | 方形画布中的原版独立图形；两种语言共用 |
| 同名透明 PNG、`symbol-square-rust.png` | Shopify 品牌、Checkout 与通知资产；操作见 [Shopify 维护](SHOPIFY_CATALOG_SETUP.md#品牌资产与-checkout) |

[BrandLogo](../src/components/brand-logo.tsx)集中管理字标、图形、完整组合和深浅版本，
提供稳定图片尺寸。尺寸由 CSS 控制：桌面字标约 160–180px，手机约 120–140px，
理念图形桌面 56px、手机 48px，Footer 完整组合桌面 160px、手机 150px；
保留留白，窄屏优先保证操作区至少 44px。
已有 aria-label 的品牌链接内图片用空 alt，其余品牌展示读作 Joya Mana；理念图形为装饰。
图标保留原轮廓，发布时检查 16/32px 与手机收藏显示；未来小尺寸简化版须先确认。

- 主 CTA 深棕底白字，次 CTA 深棕 outline，focus 清晰；深色背景提供隔离环。
- 选款/筛选同时有文字、勾选或 pressed 状态，不只靠颜色。
- 导航 hover 不淡化文字，Footer hover 保留清晰下划线。
- 不可购买卡片图片褪色并有状态标签；PDP 原图保留原色。

英语标题 Newsreader，正文/UI/价格 Manrope；繁中品牌/PDP 标题 Noto Serif HK 500，
正文、商品卡和导航 Noto Sans HK。拉丁字母/数字沿用原字体，加载时有系统后备。
声明位置见 [RootDocument](../src/components/root-document.tsx) 与
[繁中 layout](../src/app/zh-hant-us/layout.tsx)，下载/分片规则归技术规格。

## 导航与页面

Header 保留 Shop All 与非空类别。Headless 非空设计系列：0 个隐藏，1–2 个直接列名，
3 个以上用 Collections dropdown / View All；桌面与手机共用数据，类别与系列分开。
当前没有 New，至少 4–6 个近期商品且稳定上新后再评估。

桌面工具依次 Search、Language、Bag，线性图标/文字/高度一致。手机 Search/Bag 可用
图标，但有可读名称。英语使用 Bag/Add to bag，繁中使用購物袋；路径仍 `/cart`。
语言仅显示当前开放的英语和繁中，不用国旗；Footer 显示 US，不做虚假地区/币种选择器。

桌面下拉支持键盘、Escape、焦点离开、遮罩点击和 hover 关闭。手机为 Menu / 居中
wordmark / Search+Bag，全屏菜单底部切语言。原生 `<dialog>` 锁定背景与滚动，Tab 留在
菜单内，Escape 关闭并回到按钮；切到桌面宽度时关闭并将焦点放到可见 Header 链接。
目录使用 accordion。

首页采用 [手链静物编辑背景](../public/images/joya-mana-home-hero-still-life.webp)，以 Shopify
当前 Golden Citrine Bracelet — 12 mm 的[真实商品照片](https://cdn.shopify.com/s/files/1/1013/9661/1381/files/BB-NN-CIC-C-YW-120-M-C-NA-00001-01_c792285c-ba49-4491-b4ff-2db7243c7ce5.jpg?v=1787295240)
为参考，石面、光线与整体静物构图为生成的品牌编辑视觉。该图不作为交付商品的实物照片，
不声称真实拍摄地点、产地或工艺，也不表示原商品细节经过像素级保留；商品卡与 PDP
继续使用 Shopify 原始商品摄影。桌面和平板用浅色主题与深色文字，左侧文案、右侧静物，
整块使用连续背景，文案与下方内容共用左右边界。手机采用[同一编辑场景的竖版构图](../public/images/joya-mana-home-hero-still-life-mobile.webp)，
文案与操作居中、正文控制行长，上方文案与下方手链以柔和过渡衔接，
次要入口用文字链接，避免分块背景和文字覆盖商品。手机裁去石台下方多余空地，
保持手链完整，让石台贴近首屏下缘。
精选商品标题区直接展示标题与介绍，币种随商品价格呈现。
不用 Blog 推荐或系列条带。没有可售候选时隐藏精选入口，显示准确空态。
理念区沿用已确认文案，桌面左侧为标题和故事链接，右侧为介绍及三条理念；标题控制行长，
原版独立图形只作标题旁的小标记。手机依次为标题、介绍与理念、故事链接：图形与小标题、
主标题、介绍和故事链接居中，三条理念的列表居中、编号与正文保持左对齐；理念区整块使用浅奶白背景。
Footer 直接衔接内容，不加纹样带；深棕背景保留浅紫完整组合，地区、语言和版权在底部。
手机端品牌组合与介绍居中；Explore 与 Customer Care 并排，Legal 横跨整行、三个链接横排，
底部地区、语言与版权居中，避免最后一组导航孤立在一侧。
理念区与 Footer 的内容宽度、左右留白沿用商品区的共享配置，背景保持通栏。
Guide 用资料目录，Blog 用精选文章与编辑列表，真实链接/摘要由服务端输出；没图则用排版。

About 的文字导航后直接是左对齐正文，不另建纯文字 Hero。无子页不显示单独 root tab，
有子页则 root 第一项，当前项用下划线和 aria-current。手机可横向滚动，总项数建议不
超过 5，更多则调整结构，不静默隐藏。只有明确且不重复的 summary 作导语。
Footer 的 Customer Care 提供 Contact/Shipping/Returns，Legal 提供 Privacy/Terms/Accessibility。
客服规则归交易规格；页面使用顾客能懂的语言，不暴露字段名或发布开关，法律披露可保留供应商名。

## 列表与购买交互

Shop/Category/系列共用 sticky 筛选条：可购买开关、颜色多选、排序、结果数、可移除标签。
选择立即生效，无 Apply；更新有即时进度，旧数量不当新结果。清除保留排序，仅有可清除
条件时提供清除操作，区分空目录和筛选零结果。颜色只显示真实文本，空值在浮层说明。
原生 details/GET 链接保留无 JS 操作，支持 Escape/外部点击、键盘与排序后焦点恢复。
手机为两行工具，面板限制宽高；卡片事实归 [交易规格](COMMERCE_SPEC.md#选款筛选与卡片)。

桌面 PDP 大于 760px 时媒体/购买区各半；媒体面板在商品区 sticky，进入推荐前释放，
不建独立纵向滚动。主图配单行横向滚动缩略图，不因图片多而换行；手机单列且不 sticky。
手机 PDP 信息区采用页面共用左右留白，标题、描述与购买操作使用同一完整内容宽度。
款式左侧名称、右侧市场价格，选择同步图、价、数量和动作。Add to bag 为实心主按钮，
Buy now 是下方 outline 次按钮。价格、状态和真实政策摘要靠近操作，更新/需选款/售罄
分别说明。数量按钮至少 44px，数量有效才可购买。

不用内部名称、素材文件名、假评论、空星级、倒计时、虚构低库存或带羞辱感的劝购文案。
营销弹窗不能遮挡首次核心任务，须容易关闭。

## 图片与无障碍

商品图真实，独件与交付物一致，标准品披露天然差异。生成图只作明确的概念/编辑内容，
不伪装商品、客户、专家、来源、工艺或认证。图片有稳定比例、尺寸、响应式 sizes、
有意义 alt；装饰图 alt 为空，不堆关键词。首页 Hero preload，PDP 主图优先加载，
其他媒体按需加载；实际策略以组件为准。

目标为 [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/)，未经验证不能宣称符合：

- 语义 HTML、skip link、landmark、单一 H1、合理标题层级，原生控件优先。
- 键盘、可见 focus、菜单焦点管理，主要触控目标至少 44px。
- 控件有 label/关联错误/必要 live region；加载、空态和错误能理解，故障有重试。
- 人工检查对比、200% zoom/reflow、读屏和 reduced motion。
- 页面无横向溢出，Header 不遮内容，不滚动劫持、自动有声播放或用动效延迟反馈。

组件随真实需要增长，不预建 UI kit。设备与支付验收统一见 [发布手册](LAUNCH_RUNBOOK.md)。
