# 内容、SEO 与 AI Search

## 内容原则

页面服务真实的阅读和购买任务。答案、事实、链接和适用结构化数据出现在
初始 HTML 中，人、搜索引擎与 AI crawler 读取相同内容。不制造隐藏 AI 页面、关键词
替换页、crawler cloaking 或批量薄文章。`llms.txt` 是可选入口，不能替代 HTML、内链、
sitemap、Schema 和内容质量。

同一意图只保留一个主要 URL：商品页说明具体商品，类别帮助按形态选择，设计系列说明
独立设计主题，Guide 解释晶体，Blog 解决具体问题，政策解释真实运营。

## URL 与内容来源

以下路径在三种 US 语言下共用 handle；语言前缀见项目说明。

| 路径 | 来源与用途 | 页面组 |
|---|---|---|
| `/`、`/contact` | 代码管理的品牌界面与集中客服配置 | Core |
| `/about`、`/about/{handle}`、`/accessibility` | Shopify `content_page` Metaobject | Core |
| `/shop`、`/category/{handle}` | 当前 Catalog 与 Shopify Standard Product Category | Commerce |
| `/collections`、`/collections/{handle}` | 非空 `design_series` Collection | Commerce |
| `/products/{handle}` | Shopify Product/Variant | Commerce |
| `/shipping`、`/returns`、`/privacy`、`/terms` | Shopify Policies | Policies |
| `/blog`、`/blog/{handle}` | Shopify Blog `blog` / Article | Editorial |
| `/crystals`、`/crystals/{handle}` | Shopify Blog `crystals` / Article | Editorial |
| `/search`、`/cart` | 商品搜索与私有购物袋 | 始终 noindex |

Blog 是唯一名称，不建立 Journal/Diario 别名。当前没有 `/category` hub、FAQ、Disclaimer、
独立 Product Care 或账户入口；护理留在 PDP，声明留在相关内容/Terms，问题由客服处理。
Shopify Pages 可用于未来获批页面，但当前没有公开路由从 Page 读取正文。

正文只从 Shopify 读取，不恢复本地政策、About 或 mock catalog。缺少必需字段的详情页
返回 404；上游故障显示错误或暂不可用，并提供重试，不编造后备内容。

## 可发布内容与翻译

`content_page` 的字段类型见 [Shopify 维护](SHOPIFY_CATALOG_SETUP.md#about-与-accessibility)。
必需字段完整、日期有效、正文可见才公开。navigation title 缺失用 title；summary 明确
且不重复才展示；SEO description 缺失取正文摘要。不完整条目不参与 sitemap/Schema。

About 固定 root handle `about`。只有 root 有序 `child_pages` 直接引用的完整可见条目
响应一级子 URL；重复、自引用、错误类型、不完整或未引用条目拒绝，不递归生成深层 URL。
root 是导航第一项，顺序随引用；无有效子页不显示 tabs，有子页时共享初始 HTML 真实链接。
默认语言回退的 ES 子页不出现在 ES root 导航，繁中有效子页保留访问入口。

政策和 Article 经过 HTML 清洗后检查可见正文：空标签、单独政策标题、危险标签不构成
完整内容；Article 日期有效，图片只用允许的 Shopify CDN 路径。
Rich text 忽略非法节点和不支持结构，安全链接使用受控协议，外开链接附安全 rel。
文章分页遇到重复 ID/handle、缺失或重复 cursor、Blog 变更或中途缺页时显示错误，
不发布部分目录。技术清洗边界见技术规格，不通过本地文案填补上游正文。

语言版本是同一 US 市场的翻译，handle/身份/币种/库存与政策事实不变。
缺译页面允许 Shopify 默认英语回退，可阅读但不等于译文已审核。正文是否回退与是否
可以索引分别判断：正文、标题、摘要、导航文字和文章标签按各自实际语言标记；About
的摘要或 SEO 未翻译，不会把已翻译正文标成英文，但仍不能索引。Accessibility 的正文
和标题须翻译完整。政策按清洗后的可见正文比较，翻译标题或改变格式不能掩盖英文回退。

已识别回退或不满足翻译条件的 About、Accessibility、Policy 和 Article 不进入对应语言
索引、sitemap、hreflang 或 Schema。文本比较不能证明译文质量；商品/系列也尚无自动
回退检测，发布时须人工确认 ES/繁中正文和 metadata，发现问题则修正或回退索引范围。

## 内容模型与维护

| 内容 | 保留信息 |
|---|---|
| 商品知识 | 真实材料/尺寸、来源/处理、护理、天然差异、包装、图片代表性、相关内容；详见交易规格 |
| 设计系列 | 名称、简介、故事、获批媒体、发布状态与唯一 Collection 关联；URL/SEO/商品归集归 Collection |
| Crystal Guide | 定义/别名、矿物与辨识信息、处理/合成、护理安全、带限定的文化含义、可靠来源与相关商品 |
| Article | 具体问题、短答案、完整解释、实际应用、必要限制、相关链接、真实作者与日期 |
| 作者/来源 | 真实姓名、实际背景/资历与审核；引用的标题、出版方、URL 和必要日期，支持具体声明 |
| Organization/Site Settings | 获批公开品牌/法律名称、Logo、客服、真实社交链接与政策；缺失不填占位值 |

Guide/Blog 使用原生 Article，按需用 Article metafields 扩展，不再复制一份同主题 Crystal
Metaobject 正文。Design Series 不再生成第二个系列页。商品知识、系列故事、作者/来源
扩展与 Organization 尚未完整接入，不能把此表写成已完成功能或提前输出相关 Schema。

项目负责人审核主题、事实与最终发布。AI 可帮助草拟，不是作者资历或事实来源。
About/Philosophy/Approach/Founder 当前 EN/ES 正文与其中经历陈述已获确认；新增团队、
工艺、产地、采购、认证、创始人经历或健康信息须有真实资料和批准。

## 声明与写作

区分可验证商品事实、矿物/护理事实、传统文化观点和个人体验。传统观点使用明确范围，
不能写成科学因果；UGC 不替代客观证据。不得保证财富、爱情、好运、保护或人生结果。
不得声称水晶诊断、治疗、治愈、预防疾病，或保证改善焦虑、睡眠、免疫、生育、疼痛等。
也不能用图片、商品名、testimonial 或一条 disclaimer 绕过这些限制。
来源、作者、专家、资历、产地、采购、环保与认证不得虚构。

文章先回答问题，再给解释、应用、限制和相关链接。必要时展示要点、真实相关问题、
作者、发布时间、实质更新时间与引用；不硬塞 FAQ/reviewer/来源清单。
引用支持具体声明，客观事实需人工核验；内容审核参考
[FTC 声明指导](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance)，
实际政策和法律文本仍由适格负责人确认。

## 内链与生命周期

PDP、Guide、Article、Category 和系列之间只连真正相关内容，anchor 描述目标。
自动推荐先产生候选，关联需业务规则或人工确认。知识页不能只是商品列表，Blog 不复制
Guide 定义，Category 与系列不能重复意图。

URL 使用小写短横线、统一无尾斜杠，不含 Currency，不按 IP 强制跳转。
`/` 保持 en-US，不建 `/en-us/`；未启用市场不生成 URL。未来地区建议由用户主动选择。
`/collections/bracelets|rings|necklaces|earrings` 在三语言下永久重定向对应 `/category/*`。
已公开 handle 修改须有明确迁移；只有真正等价替代才永久重定向，不批量跳首页。
暂时售罄 PDP 通常保持可读 200；永久下架按有用归档、等价替代、404/410 实际选择，
同步 sitemap、内链与状态，避免 soft 404。

## 索引、canonical 与 hreflang

索引同时取决于部署总开关 `NEXT_PUBLIC_SITE_INDEXABLE`、
[indexing.ts](../src/config/indexing.ts) 的语言/页面组矩阵，以及单页内容就绪判断。
三语言 Core/Commerce/Policies 已批准，Editorial 均关闭；配置批准不是内容/译文验收。
Preview 总开关关闭，Production origin 固定 `https://www.joyamana.com`。

- 干净可索引页 self-canonical；排序、颜色、可购买、tracking、Variant 等参数页
  noindex，符合 origin/内容条件时 canonical 到同语言干净 URL，不输出 hreflang/Schema。
  About/Article 参数也使用同一检查，不能漏传参数而保留 Schema。
- 空 Shop/Collections hub 显示空状态但 noindex，不输出商品 Schema 或进入 sitemap；
  筛选后无结果仍是正常参数页，不改变干净目录是否就绪的判断。
- Search、Cart、账户/登录/回调、预览/内部页、未上线市场与已识别回退页排除。
  需要抓取 noindex 的页面不同时被 robots 禁抓。
- sitemap 只含 200、已发布、干净、可索引且当前市场可见的 URL。lastmod 只表示实质
  内容变化，不用构建时间制造更新；规模确有需要再拆 sitemap index。
- hreflang 只列真实上线、可索引、内容等价版本，双向包含自身；不把币种当语言，
  不给未就绪回退页输出 alternate。跨市场真实不同页面各自 canonical。
- `/` 是 en-US，当前不输出 x-default。未来地区选择页若获批再决定是否适用。
- 真正可索引的分页页应 self-canonical，不全部指向第一页；不为筛选生成独立颜色页。

## JSON-LD

JSON-LD 使用稳定 @id 和页面同一份数据，只输出可见的真实内容。

| 页面 | 适用 Schema | 当前实现 |
|---|---|---|
| Product | Product/Offer、BreadcrumbList | 已有 mapper，受索引与参数检查限制 |
| Shop/Category/系列 | CollectionPage、可见 ItemList、BreadcrumbList | 已有 mapper，使用同一展示款 |
| About root/child | AboutPage 或 WebPage、BreadcrumbList | 已实现 |
| Blog/Guide Article | BlogPosting/Article、真实作者、BreadcrumbList | 已有 mapper，Editorial 索引仍关闭 |
| Home/Contact/政策 | Organization/WebSite/WebPage、ContactPage、适用政策关系 | 尚待接入与验收 |

不发明 Crystal Schema type；Guide 可按实际内容用 Article/WebPage 与 about 实体。
ProductGroup/变体模型以实际 URL/选择方式与官方指南为准，不为 Schema 拆近重复 PDP。
真实评论、Shipping/Returns 只有已展示且与事实一致时才挂入；不承诺 rich result 展示。
测试核对可解析性、关键字段与 UI。
官方说明：[商品结构化数据](https://developers.google.com/search/docs/appearance/structured-data/product)、
[变体](https://developers.google.com/search/docs/appearance/structured-data/product-variants)。

## robots 与持续检查

允许获准搜索 crawler 和必要静态资源，私有页面靠认证而非 robots；不能按机器人改写
正文或商品事实。搜索/用户访问与训练抓取分别决策，当前训练策略仍待确认。
实施时核对供应商当前 User-Agent/验证方式并集中配置，WAF 不误伤获准访问。

发布和持续检查见 [发布手册](LAUNCH_RUNBOOK.md)。AI 引用可用固定问题和 referral
观察趋势，单次回答或抓取次数不能证明排名与销售效果。
