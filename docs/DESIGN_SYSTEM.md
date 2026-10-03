# 品牌与设计规范

## 品牌表达

品牌为 Joya Mana。Logo、wordmark、字体授权、正式颜色与真实商品摄影/视频已确认，
实现只使用实际获批资产，不从文档推断未提供的文件或授权范围。
品牌文案与客服配置见 [brand.ts](../src/config/brand.ts)，视觉值见
[globals.css](../src/app/globals.css)，字体声明在三语言 layout。

现代、克制、温暖、关注自然纹理和日常佩戴是工作方向，不等于已批准的产品价值承诺。
“Design-led”等工作定位以及参考品牌只用于讨论信息层级，不直接成为事实。
不写未经验证的 luxury/premium/rare/ethical/healing/sustainable/certified，
不用恐惧、命运或焦虑推销，不把精神实践写成医疗功效。

商品信息比装饰更重要，先保证手机浏览、选款、Bag 和结账。首页用少量文案和编辑层级，
PDP 用清楚的媒体与决策布局；第三方参考只帮助构图，不复制素材、Logo、导航或具体设计。

## 配色与字体

主背景为米白，理念内容区为暖灰米色，浅紫用于选中状态，深棕用于操作与小面积细节；
花卉色只作辅助，不用深棕铺满大内容区。语义文字/错误颜色独立于品牌装饰色。
实际 token、混色和字号以 CSS 为唯一来源，文档不复制完整数值或历史对比度表。

- 主 CTA 深棕底白字，次 CTA 深棕 outline；focus 清晰，深色区域加隔离环。
- 选款/筛选用浅紫及边框，同时提供勾选、文字或 pressed 状态，不只靠颜色。
- 导航 hover 不通过淡化降低文字对比，Footer 链接 hover 保留清晰下划线。
- 不可购买卡片图片保留褪色效果与明确状态标签；效果只用于卡片，PDP 原图保持原色。

英/西语标题 Newsreader，正文、UI 和价格 Manrope；繁中品牌/PDP 标题 Noto Serif HK 500，
正文、商品卡、导航和操作 Noto Sans HK。拉丁字母/数字沿用既有字体。
加载期间有系统后备，自托管与中文分片规则见技术规格。

## 导航与页面

Header 固定保留 Shop All 和非空 Category，设计系列只计非空 Headless `design_series`：
0 个隐藏、1–2 个直接列名、3 个以上用 Collections dropdown 与 View All。
Category 与系列不混在同一目录，桌面/手机共用相同数据。当前没有 New；稳定上新且
至少 4–6 个近期商品时再评估是否建立独立入口。

桌面工具顺序 Search、Language、Bag，统一线性图标、文字、高度和交互。
Search/Bag 移动端可只显示图标，但必须有 accessible name。英文用 Bag/Add to bag，
西语 Bolsa；公开路径仍 `/cart`。不用国旗代表语言，Header 只切当前市场语言。
Footer 当前显示 US 和语言入口，不显示虚假的多地区/币种选择器。

桌面下拉从 Header 下方展开，支持键盘、Escape、焦点离开、遮罩点击与克制 hover 关闭。
手机 Header 为 Menu / 居中 wordmark / Search+Bag；全屏 Menu 的 Language 放底部，
锁定背景滚动，管理焦点、Escape 与关闭后焦点返回，目录使用 accordion。

首页使用获批抽象矿物编辑背景 [home hero](../public/images/joya-mana-home-hero.webp)，
它不对应在售实物，不能当成商品、产地或工艺照片。首页不放 Blog 推荐或系列条带。
Guide 是资料目录，Blog 是 Featured article 与编辑列表，服务端输出真实链接和摘要；
没有真实摄影时用排版，不制造占位图。

About 在共享文字 tabs 后直接进入左对齐正文，不另建纯文字 Hero。
无子页不显示单独 root tab；有子页时 root 第一项，当前项用细下划线与 aria-current。
手机 tabs 可横向滚动、触控目标足够，总项数建议不超过 5，更多内容应改目录结构，
不能静默隐藏。只有明确且不重复的 summary 才作导语，不注入工作品牌故事。

Footer Customer Care 提供 Contact、Shipping、Returns；Legal 提供 Privacy、Terms、
Accessibility。客户界面使用 Joya Mana 的商品/购买语言，不展示 Headless、字段名或
发布开关等实现细节；Privacy/Terms 为准确披露可保留必要供应商名称。

## 列表与购买交互

Shop/Category/系列共用紧凑 sticky 筛选条：可购买开关、颜色多选、排序、结果数和可移除
标签。选择立即生效，无 Apply；连续选择有即时反馈，更新时显示进度，旧数量不能当作
新结果。清除条件保留排序，颜色只显示真实文本标签，空值仅在浮层说明。
原生 details/GET 链接保留无 JavaScript 操作，Escape/外部点击关闭，键盘可切换，排序
后返回焦点。手机为两行工具，面板限制宽高；同款数据规则见交易规格。

桌面 PDP 大于 760px 时媒体/购买信息各半；左侧整个媒体面板在商品区 sticky，
进入相关推荐前释放，不建立独立滚动区域。图库为主图与横向缩略图；手机单列且不 sticky。
款式项左侧消费者名称、右侧当前市场价格，选择后同步图、主价、数量与动作。
Add to bag 是实心主 CTA，Buy now 是下方 outline 次 CTA，不并排争夺注意力。
价格、状态、真实政策摘要靠近购买操作；更新中/需选款/售罄各有准确说明。

不用供应商内部名、素材文件名或备注作消费者文案，不显示假评论、空星级、倒计时、
虚构低库存或 guilt copy。营销弹窗不遮挡首次核心任务，容易关闭。

## 图片、移动端与无障碍

商品图真实，独件图与交付物一致；标准商品说明天然纹理差异。生成图仅可作为明确的
概念/编辑内容，不伪装商品、客户、专家、来源、工艺或认证。
图片有稳定比例、尺寸、响应式 sizes 与有意义 alt，装饰图空 alt，不堆关键词。
首页 Hero preload，PDP 主图 eager/fetchPriority high，其他媒体按需加载；不让手机
下载无用重型资源。实际值和策略以组件为准。

目标为 WCAG 2.2 AA，不能声称未经验证的符合程度：

- 语义 HTML、skip link、landmark、单一 H1 与合理层级；原生控件优先。
- 交互支持键盘、可见 focus、menu/dialog 焦点管理，主要触控目标至少 44px。
- 表单有 label、关联错误与必要 live region，加载/空/不可用状态可理解。
- 文字/图形对比度、200% zoom/reflow、屏幕阅读与 reduced motion 人工检查。
- 页面不横向溢出、不被 sticky Header 遮挡；动效不延迟反馈，不滚动劫持或有声自动播放。

组件只随实际页面需求增长，不预建大型 UI kit。发布检查见 Runbook；
[WCAG 2.2](https://www.w3.org/TR/WCAG22/)为验收参考，自动检测不能替代人工检查。
