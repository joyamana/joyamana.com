# Content, SEO and GEO Specification

Status: Draft — 内容运营与 crawler policy 待确认  
Owner: Content / SEO  
Last updated: 2026-08-30
Supersedes: `docs/archive/` 中两份 SEO/GEO 架构总结的实施结论

## 1. 核心原则

GEO 不是一套独立于 SEO 的隐藏技术。本项目通过以下方式同时服务人、搜索引擎
和 AI Search：

- 原创、具体、可验证且对购买有帮助的内容。
- 清晰页面意图和稳定实体关系。
- 初始 HTML 中的主要答案、事实与链接。
- 与可见内容一致的 metadata 和结构化数据。
- 真实作者、更新时间、引用、产品与政策。
- 合理内链、sitemap、robots 和 Merchant Center feed。

不创建 AI 专用页面、隐藏答案、crawler cloaking、关键词替换页或无业务价值
的程序化组合页。`llms.txt` 只在核心基础完成后评估。

## 2. 页面类型分工

| 类型 | 回答的问题 | 商业角色 |
|---|---|---|
| Product | 这个具体商品是什么、是否适合、能否购买 | 转化 |
| Shop | 当前有哪些在售商品 | 总览/发现 |
| Category | 哪些商品属于同一稳定商品形态 | 发现/比较 |
| Design Collection | 哪些商品属于同一原创设计世界 | 品牌叙事/发现 |
| Crystal Guide | 某种晶体是什么、如何辨识/护理、传统含义是什么 | 权威实体 |
| Article | 某个具体问题、比较、场景或方法 | 获取/教育 |
| Brand/Trust | 谁在销售、真实承诺、如何服务 | 信任 |
| Policy | 配送、退换、隐私和条款是什么 | 风险降低 |

同一搜索意图只设一个主要 URL。Crystal Guide 不写成商品列表，Blog 不复制
Guide 定义，Category 不复制 Design Collection，设计系列页也不伪装成晶石知识页。

## 3. MVP 信息架构

```text
/
├── /shop
├── /category
│   └── /category/{handle}
├── /collections
│   └── /collections/{handle}
├── /products/{handle}
├── /crystals
│   └── /crystals/{slug}
├── /blog
│   └── /blog/{slug}
├── /about
│   └── /about/{handle}
├── /contact
├── /shipping
├── /returns
├── /privacy
├── /terms
├── /accessibility
├── /search             noindex
└── /cart               noindex
```

Blog 是唯一栏目名称与路径。不得创建 `/journal`、Journal UI 别名或语义相同
的第二套栏目。

## 4. 内容事实来源

`D-009` 的已接受边界：

- Shopify Product Category：商品形态及 `/category/*` 归属。
- Shopify Product/Collection + Metafields：商品、设计系列商品归集、分类扩展内容，
  以及商品专属 Product Care 事实。只有
  `custom.collection_kind=design_series` 的 Collection 进入公开系列 URL。
- Shopify Policies：Shipping、Returns/Refund、Privacy、Terms 的完整事实。
- Shopify Pages：Contact 与其他获批的普通品牌页。
- Shopify `content_page` Metaobjects：About hub、由 root 直接引用的 About 子页、
  Accessibility，以及需要由 Headless storefront 读取的结构化品牌内容。

Next.js 使用稳定的品牌化 URL 呈现这些内容，不暴露 `/pages/*` 或 Shopify 默认
Policy/Metaobject URL。当前不设 FAQ、Disclaimer 或独立 Product Care URL；若未来恢复，必须先
确认独立页面价值、内容来源和索引条件。
- Shopify Blog/Article：`blog` 承载 Blog，`crystals` 承载 Crystal Guide；Article
  保存正文、发布状态、作者、日期、SEO，并按需使用 Metafields 保存结构化扩展。
- Shopify merchant-owned Metaobjects：Design Series、Author、Source、
  可复用 FAQ、Site Settings 等结构化实体。Design Series 保存系列故事与视觉；
  对应 Shopify Collection 保存公开 URL、SEO 和商品归集，职责不得双写。

只有满足 D-009 的升级触发条件才增加 Sanity 或其他 CMS。若升级，Commerce
字段仍不复制到 CMS；内容 ID、预览、webhook、translation 和 migration 必须
有 ADR。

## 5. 内容模型

### Organization / Site Settings

- brand display name
- legal name
- canonical domain
- logo
- verified social `sameAs`
- customer service contact
- founding/story facts
- shipping/return policy references
- sourcing/authenticity claims
- default market/locale

缺失字段不输出，不用占位填充 Organization Schema。

### Content Page / About

所有 `content_page` 条目的必填基础字段为 `title`、`body`、`last_updated`、
`seo_title`；`navigation_title`、`summary` 与 `seo_description` 为建议字段。前者缺失
时回退 title；summary 只有明确填写时才显示，seo_description 缺失时从可见 rich text
正文生成安全、有限长度的纯文本摘要。
About 使用下列受控关系：

- 固定 root handle 为 `about`；它对应 `/about`。
- 只有 root 的有序 `child_pages`（Content Page Metaobject reference list）直接引用的
  完整、Storefront 可见条目才能响应 `/about/{handle}`。
- root 自动成为页内导航第一项；child 顺序与引用列表一致。重复、自引用、不完整、
  非 `content_page` 或未引用条目全部 fail closed。
- 当前只允许一层子页面；child 自身的引用不生成更深 URL。
- 建议页内导航总项数不超过 5；超过时先重新评估目录模式，不静默截断内容。
- en-US 与 es-US 共享英文 handle；正文与 SEO 未完成真实翻译的 fallback 页面不得进入
  sitemap/hreflang。

### Product knowledge

Commerce 核心字段见 `COMMERCE_SPEC.md`。内容扩展包括：

- materials、dimensions、weight
- origin 与 treatment disclosure
- care、安全与天然差异
- craftsmanship/process
- packaging contents
- use/occasion（非医疗功效）
- visible FAQ
- related Crystal/Article
- source/reference（只有客观声明需要且可验证时）

### Design Series

- canonical name 与内部稳定 handle
- tagline、short introduction、long story
- hero、mobile hero、campaign/lookbook media
- launch date 与 published status
- material/design themes（品牌叙事，不替代商品事实）
- 对应唯一 Shopify Collection reference
- locale 与 visible markets

Design Series Metaobject 不另行生成第二个可索引页面；公开 canonical 保持对应
`/collections/{handle}`。SEO title/description 和商品成员归集由 Collection 维护。

### Crystal Guide Article

使用 Shopify 原生 Blog `crystals` 中的 Article；Article handle 对应
`/crystals/{handle}`。以下结构化字段可使用 Article Metafields，不另建一份同名
Crystal Metaobject 正文：

- canonical name
- aliases
- concise definition
- mineral class / composition
- hardness
- appearance / colors
- notable origins（不代表具体商品来源）
- common treatments / synthetics
- identification notes
- care and handling
- traditional/cultural associations，带明确限定
- limitations / safety notes
- sources
- real author / reviewer
- published / materially updated date
- related Products / Articles
- locale 与 visible markets

不要发明 `Crystal` Schema type；页面可用 `Article`/`WebPage`，并通过 `about`
关联 `DefinedTerm` 或适当的 `Thing`。

### Article

- title、slug
- summary / short answer
- key takeaways
- body blocks
- related questions
- references
- real author
- reviewer（只有真实审核发生时）
- published / materially updated
- related Crystal Guide / Product / Collection
- status
- locale 与 visible markets

### Person / Author

- name、slug
- bio
- actual expertise
- actual credentials
- verified sameAs
- authored/reviewed content

不得为了 E-E-A-T 虚构专家、资质、reviewer 或社交链接。

### Source

- title
- publisher/organization
- author（如有）
- URL
- publication/update date（如有）
- accessed date
- source type

引用应支持具体声明，不能只列一串未使用链接。

## 6. Editorial 与 claims policy

### 内容层级

1. **可验证商品事实**：材料、尺寸、价格、处理、来源、库存，来自业务记录或
   Shopify。
2. **矿物/护理事实**：来自可靠矿物学、宝石学、公共机构或专业来源。
3. **传统/文化表述**：清楚写明 “traditionally associated with”、
   “in some spiritual practices” 等范围，不写成科学因果。
4. **个人体验/UGC**：明确是个人观点，不能替代客观证据。

### 禁止

- 水晶可以诊断、治疗、治愈或预防疾病。
- 水晶被保证改善焦虑、抑郁、睡眠、免疫、生育、疼痛等健康结果。
- 用 testimonial、图片、商品名或上下文暗示无法直接声称的医疗功效。
- 用一条 disclaimer 抵消正文中明确或暗示的误导性功效承诺。
- 伪造科学研究、传统、产地、认证、可持续性或专家意见。

### 发布检查

- 这句话是事实、传统观点、品牌观点还是客户观点？
- 页面整体是否会让普通消费者推断出健康功效？
- 客观声明是否有与具体商品/主题匹配的可靠支持？
- 限定语是否靠近声明、清楚且不被其他元素抵消？
- 是否需要业务、合规或专家审核？

FTC 当前要求广告中的明确和暗示性客观健康声明真实、不误导并有适当依据；
最终政策需由合格专业人士审核。官方来源见 `REFERENCES.md`。

## 7. 写作格式

适用于 Guide 和高价值 Article：

1. 清楚标题和一句短答案。
2. Key takeaways。
3. 对概念、选择或步骤的完整解释。
4. 可验证事实与限制。
5. 实际例子或购买/护理应用。
6. 真实相关问题。
7. 相关实体和商品。
8. 作者、发布时间、实质更新时间和参考来源。

不是每页都必须硬塞 FAQ、reviewer 或引用。只有页面真实需要且内容存在时展示。

## 8. 内链

核心关系：

```text
Product ↔ Crystal Guide ↔ Article
   | \         |           /
Category   Design Collection
```

- PDP 链接主要 Crystal Guide、政策和真正相关内容。
- Guide 链接相关 Article 和当前在售 Product/Collection。
- Article 链接主要 Crystal 实体、必要政策和人工选择商品。
- Category 链接真正帮助筛选或选择的 Guide；Design Collection 链接其叙事所需的
  Guide/Article，而非堆砌所有关键词。
- Anchor text 描述目标，不使用重复、机械化关键词模板。
- 自动相关内容只能先生成候选，发布前需业务规则或人工确认。
- About 页内导航必须在初始 HTML 输出 `/about` 与 root 直接引用的可见子页链接；
  不使用只在客户端切换的隐藏 panel。

## 9. URL 与重定向

- US English 永久使用根路径，不创建 `/en-us/`。
- US Spanish 使用 `/es-us/`，与英文共享 US Catalog、价格、库存和政策事实。
- URL 只表达 language-region，不包含 Currency；币种切换不改变 canonical。
- 小写、短横线、单一尾斜杠策略；推荐无尾斜杠。
- Handle/slug 变更必须保留 301 映射。
- `/category/{handle}` 是商品类别唯一公开 URL；已公开的
  `/collections/bracelets` 等类别别名 301 到对应 Category，不得同时返回 200。
- `/collections/{handle}` 只响应 `design_series`；未知、普通后台或 merchandising
  Collection 不因 Shopify 可见就自动成为公开系列页。
- `/about/{handle}` 只响应 `about.child_pages` 直接引用的 Content Page；其他
  Content Page handle 返回 404。已公开 handle 变更必须保留明确 301 映射。
- 不在公开 URL 中暴露内部 GID、SKU 以外的敏感值或随机重复参数。
- 不根据 IP 强制 301；可以提示并保存用户主动选择。
- 未来只为真正上线的等价翻译/Market 页创建 `/en-ca/`、`/fr-ca/`、
  `/fr-fr/`、`/de-ch/` 等。
- `GB` 是国家代码；不把 `UK` 或 `EU` 当作 API country code。

## 10. Canonical、index 与 sitemap

### Canonical

- 干净、唯一、可索引页面使用 self-canonical。
- UTM、排序和不独立索引的 Variant 参数 canonical 到干净页面。
- 每个分页页在可索引时 self-canonical，不全部指向第 1 页。
- 真正具有独立价值的 market/translation 页面 self-canonical，不跨市场
  canonical 回美国页。
- Canonical override 是受控例外，不给编辑者任意配置。

### Noindex / exclude from sitemap

- `/search`
- `/cart`
- `/account/*`、login、callback
- Preview、draft、internal test
- 空/薄 Category 或 Design Collection
- filter、sort、tracking 和非独立 Variant 参数页
- 任何未上线 market/locale
- 缺字段、未被 root 引用或使用默认语言 fallback 的 About 子页

需要 crawler 读取 `noindex` 的页面不应同时在 robots.txt 中阻止抓取。

### Sitemap

- 只包含 200、canonical、indexable、published、当前市场可见的 URL。
- `lastmod` 只在商品或正文实质变化时更新，不因构建时间刷新。
- 小型站使用单一 sitemap；规模确有需要时再引入 sitemap index。
- 页面下线时同步 sitemap、内部链接、redirect 和状态码。

### 商品状态

- 暂时售罄 PDP 通常保持 200/index，并明确不可购买。
- 永久下架有等价替代才 301。
- 没有替代时保留有用归档、返回 404 或 410，按实际内容决定。
- 不批量跳转首页，不制造 soft 404。

## 11. hreflang 与多市场

测试站全站 noindex，不输出生产 hreflang。各 Market 的内容、商品与运营条件
完成审核并正式启用索引后：

- 每个等价页面双向输出 self 和 alternate。
- 只列 200、indexable、内容等价、当前运营的版本。
- Market、language、region 与 currency 分离，不能假设它们一一对应。
- Currency 不是 hreflang 或 URL 维度。
- 完全相同且无市场差异的英文知识内容优先保留一个权威 URL。
- 当前不输出 `x-default`，因为 `/` 是明确的 en-US 页面而非 Global 入口。
- 未来若按 D-027 增加 `/choose-region`，再评估将其作为 `x-default`。

## 12. Structured data

所有 JSON-LD 使用稳定 `@id` 和规范化实体，只输出页面可见、真实的数据。

| Page | Schema |
|---|---|
| Home | `Organization`, `WebSite`, `WebPage` |
| Product | `Product` + `Offer`/适用 Variant 模型 + `BreadcrumbList` |
| Shop / Category | `CollectionPage`, visible `ItemList`, `BreadcrumbList` |
| Design Collection | `CollectionPage`, visible `ItemList`, `BreadcrumbList` |
| Crystal Guide | `Article` 或 `WebPage`, `about`, `BreadcrumbList` |
| Blog Article | `BlogPosting`/`Article`, real author, `BreadcrumbList` |
| About hub | `AboutPage` + `BreadcrumbList` |
| About child | `WebPage` + `BreadcrumbList` |
| Contact | `ContactPage` |
| FAQ | `FAQPage`，仅当完整问答在 UI 可见且适用 |

规则：

- 可购买 PDP 遵循 Google merchant listing 所需的 Product/Offer 字段。
- Variant URL/选择方式确定后，再按 Google 当前 ProductGroup/variant 指南
  建模；不为 Schema 改造无价值的重复 PDP。
- Review/rating 只有真实、可见且符合规则时输出。
- Shipping/Return policy 只有与 Shopify/页面完全一致时挂到 Organization 或
  Offer。
- 不把 Schema eligibility 或 rich result 展示当作保证。
- 用自动测试验证 JSON-LD 可解析、关键字段与 UI 一致。

## 13. robots 与 AI crawler

### 固定原则

- 允许 Google/Bing 等获批搜索 crawler 访问公开索引内容。
- 不阻止 Next.js 必需静态资源。
- 私有页面依赖认证和 noindex，不把 robots.txt 当访问控制。
- 不按 crawler 改写正文、价格、库存或 Schema。

### 待决策略 D-016

搜索/用户触发 crawler 与训练 crawler 分开设置。上线前按供应商官方文档复核
User-Agent：

- OpenAI Search discovery 与 training 控制是不同信号。
- Anthropic Search/User 与 training crawler 也是不同信号。

具体名称和 IP 范围是时效性配置，不应硬编码在多个文件；集中生成 robots 并
定期复核。WAF、CDN 或 CAPTCHA 不应误伤获准 crawler，但安全防护仍须存在。

## 14. `llms.txt`

可在下列条件全部满足后添加：

- 核心 HTML、metadata、Schema、sitemap 和内链已通过。
- 品牌、政策、Guide 和 Product 实体稳定。
- 内容负责人能维护链接和描述。

它只提供品牌简介与权威入口，不复制整站内容，不作为排名或引用保证。

## 15. Performance 与 Accessibility 对 SEO 的要求

- 移动端 p75 目标：LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1。
- Product 主要内容和 Product JSON-LD 放在初始 HTML。
- 图片使用明确尺寸、响应式 source、稳定比例和合适优先级。
- 不用强制 Cookie wall、全屏弹窗或客户端渲染阻断公开内容。
- 语义 heading、landmark、link、button 和 form 控件必须正确。
- 第三方脚本延迟并按业务价值限制。

## 16. 发布与持续运营

### 上线前

- Search Console、Bing Webmaster、Merchant Center 所有权与 feed。
- Rich Results/Schema validation。
- robots、sitemap、canonical、redirect 和状态码 crawl。
- 关键页面无 JS 内容检查。
- Claims、author、sources、policy 和 Organization facts 审核。

### 上线后

- 按页面类型监控 submitted vs indexed、canonical、soft 404 和 rich-result error。
- 监控非品牌 query、landing page、PDP view→purchase 与 organic revenue。
- 每月审查陈旧内容、失效来源、下架商品和内部链接。
- 用固定高价值问题集记录 AI 引用/品牌提及和 referral，承认归因不完整。
- 不把 crawler hit、`llms.txt` 或单次 AI 回答当作业务 KPI。

## 17. 明确禁止的页面规模化方式

- crystal × intention/benefit × zodiac/chakra × color × product type 全组合。
- 每个 tag、filter、sort 或站内搜索自动生成 landing page。
- 相同英文 Blog/Guide 复制到 US/CA/GB。
- Product Variant 拆成近重复 PDP，除非用户和搜索价值真实独立。
- 为每个问题创建极短 FAQ 页面。
- AI 批量文章未经事实、重复意图和品牌审核直接发布。
