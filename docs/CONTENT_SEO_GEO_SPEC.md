# 内容、SEO 与 AI Search

## 内容与 URL

页面服务真实阅读和购买任务；人、搜索引擎与 AI crawler 读取相同初始 HTML、事实和链接。
不建隐藏 AI 页面、关键词替换页、批量薄文章或 crawler cloaking。`llms.txt` 仅为可选辅助。
同一意图只保留一个主要 URL，不把内容页变成换词商品列表。

以下路径在英语和繁中共用 handle，前缀见 [项目说明](PROJECT_SPEC.md)：

| 路径 | 来源与用途 | 页面组 |
|---|---|---|
| `/`、`/contact` | 品牌界面与客服配置 | Core |
| `/about`、`/about/{handle}`、`/accessibility` | Shopify `content_page` | Core |
| `/shop`、`/category/{handle}` | 当前 Catalog / Standard Product Category | Commerce |
| `/collections`、`/collections/{handle}` | 非空 `design_series` Collection | Commerce |
| `/products/{handle}` | Product/Variant | Commerce |
| `/shipping`、`/returns`、`/privacy`、`/terms` | Shopify Policies | Policies |
| `/blog`、`/blog/{handle}` | Blog `blog` / Article | Editorial |
| `/crystals`、`/crystals/{handle}` | Blog `crystals` / Article | Editorial |
| `/search`、`/cart` | 商品搜索 / 私有 Bag | 始终 noindex |

正文只从 Shopify 读取。缺失商品、文章和 About 子页返回 404；About 首页、固定政策和 Accessibility
缺正文时显示暂不可用，保持 200/noindex，不输出 Schema 或进 sitemap。上游失败
提供可重试错误，不造本地后备正文。
Blog 是唯一名称，不建 Journal/Diario 别名。当前无 `/category` hub、FAQ、Disclaimer、独立
Product Care 或账户页；护理归 PDP，声明归相关内容/Terms。当前路由不从 Shopify Page 取正文。

## 内容可用与翻译

`content_page` 字段见 [Shopify 维护](SHOPIFY_CATALOG_SETUP.md#about-与-accessibility)。
必需字段完整、日期有效、正文可见才公开；navigation title 缺失用 title，summary 仅在明确
且不重复时展示，SEO description 缺失取正文摘要。不完整条目不进 sitemap/Schema。

About root handle 固定 `about`，只公开其有序 `child_pages` 直接引用的完整可见子页。
重复、自引用、错误类型、不完整或未引用条目拒绝，不递归生成深层 URL。
有效繁中子页即使正文回退英文也保留真实链接；导航交互见设计规范。

Policy/Article 清洗后须有可见正文，空标签、单独标题和危险标签不构成内容。
Article 日期须有效，图片只用允许的 Shopify CDN 路径；分页异常不能发布部分目录。
Rich text 忽略非法节点，链接限制协议，外开链接附安全 rel。清洗与请求边界见技术规格。

同一 US 市场各语言保持身份、handle、币种、库存、引用关系和政策事实。
缺译允许默认英语回退；标题、正文、摘要、导航、栏目简介和文章标签分别标注实际语言。
正文语言与索引资格分别判断：

| 内容 | 翻译完成条件 |
|---|---|
| Policy | 清洗后的可见正文已译 |
| About | 正文、已有摘要及搜索摘要已译；搜索标题须译，品牌标题可保留 |
| Accessibility | 标题、正文、搜索标题和摘要已译 |
| Article | 标题、正文、摘要、搜索标题和摘要已译 |
| Blog/Guide 目录 | 至少有合格文章，已有栏目搜索标题和简介已译；Blog 等栏目名称可保留 |

各类型比较可见正文，换粗体、段落、空白或链接包装不能掩盖英文回退。
摘要或搜索信息回退不会把已译正文标成英文。品牌名、作者和品牌标签不要求改写。

已识别回退或翻译不完整的 About、Accessibility、Policy、Article 不进对应索引、sitemap、
hreflang、Schema。文本比较不能证明译文质量；商品/系列尚无自动检测，发布时人工检查
繁中正文与 metadata，问题页先修正或缩小索引范围。
西语暂停，保留共享词典和 Shopify 译文；任何后台语言设置不自动开放本站西语路由。

## 内容模型与审核

| 内容 | 需要真实资料 |
|---|---|
| 商品知识 | 交易规格规定的材料、尺寸、来源/处理、护理、差异、包装、图片说明与关联 |
| 设计系列 | 名称、简介、故事、媒体与唯一 Collection 关联；URL/SEO/商品归 Collection |
| Crystal Guide | 定义/别名、矿物辨识、处理/合成、护理安全、有范围的文化含义、来源和相关商品 |
| Article | 具体问题、短答案、解释、应用、限制、相关链接、真实作者与日期 |
| 作者/引用 | 真实背景、资历、审核；支持具体声明的标题、出版方、URL 与必要日期 |
| Organization/Site Settings | 获批公开名称、Logo、客服、真实社交与政策；不填占位事实 |

Guide/Blog 用原生 Article，必要扩展用 Article metafields，不再复制同主题 Crystal 正文。
相关接入待办见 Roadmap。
项目负责人审核事实与最终发布；AI 草稿不代表作者资历。已有 About/Philosophy/Approach/
Founder 的 EN/ES 正文及经历已获确认，暂停西语不撤销该确认。新增团队、工艺、产地、
采购、认证、经历或健康信息须有真实资料与批准。

写作先回答问题，再说明解释、应用、限制和相关链接；按需给作者、真实日期和引用，不硬塞
FAQ/审核者/来源清单。商品事实、矿物护理事实、传统观点和个人体验须区分。传统文化不能
写成科学因果，UGC 不代替证据。不得保证财富、爱情、好运、保护或人生结果，不声称诊断、
治疗、治愈、预防疾病或改善焦虑、睡眠、免疫、生育、疼痛。图片、名称、testimonial 和
单条 disclaimer 不能绕过限制；专家、来源、采购、环保与认证不得虚构。
审核参考 [FTC 指导](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance)，
法律政策仍由适格负责人确认。

## 链接与下架

内链只连真正相关内容，anchor 说明目标；自动推荐须有业务规则或人工确认。
URL 小写短横线、无尾斜杠、不含 Currency，不强制 IP 跳转。`/` 为 en-US，不建 `/en-us/`；
未来市场不生成入口或路径。英语/繁中的 `/collections/bracelets|rings|necklaces|earrings`
永久跳到对应 `/category/*`。

暂停西语的 `/es-us` 及全部子路径返回完整 404 文档，HTML 与 `X-Robots-Tag` 均 noindex，
`Cache-Control: no-store`，提供英语恢复链接。没有西语类别跳转、canonical、hreflang 或
Schema，不用 robots 禁抓阻止搜索引擎看到状态。未来恢复须重新批准并验收路由和译文。

已公开 handle 修改先确定迁移，只有真正等价替代才永久跳转，不批量跳首页。
暂时售罄 PDP 通常保持可读 200；永久下架按内容价值选择归档、等价替代或 404/410，
同步 sitemap 与内链，避免空内容返回 200。

## 索引与 hreflang

须同时满足部署总开关、[indexing.ts](../src/config/indexing.ts) 的当前公开语言/页面组矩阵
和单页内容条件。英语/繁中 Core、Commerce、Policies 已获批，Editorial 关闭；上线前
仍须核对内容与译文。Preview 始终 noindex，Production origin 为 `https://www.joyamana.com`。

- 干净索引页 self-canonical。排序、颜色、可购买、tracking、Variant 和内容页参数均
  noindex；内容/origin 合格时指向同语言干净 canonical，不输出 hreflang/Schema。
- 空 Shop/Collections hub 有空态但 noindex、无商品 Schema、不进 sitemap；筛选零结果
  不改变干净目录是否有内容的判断，不为筛选生成颜色索引页。
- Search、Cart、内部/预览、账户/登录/回调、暂停语言、未来市场与已识别回退页排除。
  noindex 页允许抓取；私有内容靠认证保护。
- sitemap 只列 200、已发布、干净、可索引且当前市场可见的 URL；lastmod 只表示实质更新，
  不用构建时间。规模确有需要再拆 sitemap。
- hreflang 只列真实上线、可索引、等价版本，双向含自身。跨市场页面各自 canonical；
  币种不当语言，当前不输出 x-default。未来地区选择页获批后再评估。
- 真正可索引分页 self-canonical，不全部指向第一页。

## JSON-LD 与 crawler

稳定 @id 与页面共用数据，只输出可见真实内容，受索引与参数条件限制：

| 页面 | 当前 Schema |
|---|---|
| Product | Product/Offer、BreadcrumbList |
| Shop/Category/系列 | CollectionPage、可见 ItemList、BreadcrumbList；使用同一展示款 |
| About root/child | AboutPage/WebPage、BreadcrumbList |
| Blog/Guide Article | BlogPosting/Article、真实作者、BreadcrumbList；Editorial 索引仍关闭 |
| Home/Contact/政策 | 尚未接入，待 Roadmap 实施 |

不发明 Crystal type；变体 Schema 按真实 URL/选款方式，不为它拆近重复 PDP。
评论与 Shipping/Returns 只有展示且与事实一致时才加入，不承诺 rich result。
官方指南：[Product](https://developers.google.com/search/docs/appearance/structured-data/product)、
[variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants)。

获准搜索 crawler 和静态资源可访问，不按机器人改写事实。搜索/用户触发抓取与模型训练
分别决策，训练策略仍待确认；实施时核对供应商当前 User-Agent/验证方式及 WAF。
持续检查见 [发布手册](LAUNCH_RUNBOOK.md)，AI 引用/referral 只能观察趋势，不能据单次回答
或抓取次数宣称排名与销售改善。
