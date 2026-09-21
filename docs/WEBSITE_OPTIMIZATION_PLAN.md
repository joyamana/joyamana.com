# 官网优化交付记录

状态：本轮代码与本地验收完成；业务源数据、部署及下述限制仍待跟进。
日期：2026-09-21；本地验收基线 `dev` / `29e23ec`。
发布目标为 `dev` Preview；实时构建与部署状态以对应提交的 Checks 为准。

用户已明确授权执行全部优化。附件 v1 作为待评估建议，品牌原稿作为资产依据；
与既有 Accepted 决策冲突的建议按 D-050 处理。当前规范分别由
[Design System](DESIGN_SYSTEM.md)、[Commerce](COMMERCE_SPEC.md) 和
[Content / SEO / GEO](CONTENT_SEO_GEO_SPEC.md) 维护，本文不再重复完整规格。

## 已落实

| 范围 | 本轮结果 |
|---|---|
| 品牌 | 从正式 AI/PDF 原稿提取字标、符号、正反色组合与纹样；统一浅紫、赭棕、暖白；补 favicon、touch icon、品牌分享图 |
| 共享界面 | 正式 Logo 接入 Header/Footer；表单、按钮、焦点、错误状态同步；页脚切换语言保留当前路径 |
| 首页 | 真实在售商品图、四件精选、实际分类入口、简短品牌叙事；查询限制为所需商品量 |
| 商品卡和目录 | 名称优先、保留图片原色、缺货仅提示一次；完整目录服务端筛选及价格排序；参数页保留 noindex/nofollow |
| PDP | 可选真实知识字段及变体覆盖；关键披露未齐时保留购买前正文并提供跳转；正文留在服务端，相关推荐有限查询且失败独立 |
| Bag | 删除重复可售提示；统一金额、真实购物车单价、错误刷新、继续购物；不改变独立 Buy now 与 Hosted Checkout 边界 |
| SEO | Home/Contact 品牌实体、实际商品分享图、Schema/可售状态一致性；参数页保护；保留原 URL、市场和索引范围 |
| 工程 | Next.js 16.3.5、Vitest 5.0.1、Node 24；严格锁文件安装；新增不依赖部署 secrets 的 CI；删除无使用组件及旧样式 |
| 文档 | 设计规范缩为约 80 行；删除重复状态与过时任务；真实内容、译文、素材和发布输入集中到 OPEN_QUESTIONS |

Logo 不重绘；图案使用原构图作为装饰，不声称可无缝平铺。原字体体系保持不变。
不虚构图片语义、产地、处理方式、评论、库存或购买承诺。

## 本轮保留的边界

- 继续使用 Blog、桌面 50/50 PDP、自适应系列导航；首页不增加 Blog/系列推荐。
- 当前只启用 US/USD 三语言；CA 路径继续 404。
- 商品、Cart、Checkout 保持 Shopify/no-store；内容与导航保持五分钟再验证。
- 暂不增加分页：当前所有参数页 noindex/nofollow，分页索引需独立设计。
- 暂不加入追踪、营销、Reviews、CMS 或其他客户数据处理平台。
- 缺译商品保持可访问并允许 Shopify 英文回退；UI 多语言不代表业务正文审校完成。

## 外部依赖

统一见 [Q-201～207](OPEN_QUESTIONS.md#external-setup-and-release-dependencies)。
当前仅具 Storefront 访问能力，未代填 Shopify 知识字段、改写正式文章或上传未提供的照片。
测试 Guide、Patron Saint 正文、佩戴/guidebook 照片与正式译文应由各自负责人完成源数据更新。
代码已提供读取与缺失保护；这些依赖不会隐藏现有商品或扩大为全站阻塞。

## 本地验证记录

- Node 24.21.0 / pnpm 12.3.4：preflight、lint、typecheck、**39 文件 / 294 tests**、production build 全部通过。
  frozen/strict-peer 安装成功；最终构建无 metadataBase 警告；GitHub CI 结果见对应提交的 Checks。
- Chrome CDP：320 px Shop/Bag、390 px Home/PDP/Bag、768 px 繁中 PDP、1440 px 西文首页/英文 PDP
  取样无页面横向溢出；200% 字体放大暴露的面包屑溢出已修复并复验。
  生产构建手机菜单打开/关闭及焦点返回已验证；不等同于 Safari、真机或完整无障碍审计。
- 实际 Storefront：三语言有限商品查询、PDP/推荐、GET 筛选/排序、变体选中和主价格同步、
  加购、库存数量上限、跨语言 Bag、移除后空状态均通过取样。Buy now 进入 Shopify 托管结账，
  返回后原 Bag 商品/金额保持不变。测试商品已移除；未填写客户资料、创建订单或付款。
- 本地 production HTML：正常页有单 H1/main/正确文档语言；Preview 全部 noindex、无索引 Schema，
  sitemap 为空。参数守卫、canonical/hreflang、Schema 与库存语义另有自动回归覆盖。
- 文档相对链接与 `git diff --check` 通过。没有变更 Shopify Admin 内容、Vercel 配置或线上发布。

## 验收限制与剩余工作

- **404 初始 HTML**：未知路径、不存在商品和 CA 路径正确返回 404/noindex；浏览器恢复为本语言
  提示，但首次 HTML 仍是 Next 的错误恢复壳。当前多 root layout 下未找到同时保留真 404 和
  非实验 API 的局部修复；不把浏览器通过写成无 JavaScript 通过，继续见 Roadmap。
- **图片优化链路**：本机代理把 Shopify CDN 解析为私有地址，Next 图片优化的安全保护拒绝读取。
  视觉检查只在浏览器临时直读相同 CDN 原图；没有修改生产安全配置。
  正式部署需复验优化图片响应、清晰度和传输量。
- **内容和发布**：实际抽查知识字段仍为空，缺字段商品因此保持购买前正文；正式稿、照片、
  人工译文与发布责任见 Q-201～207。未做 Safari/真机、真实用户 CWV 或付款测试。

## 官方依据

- [Next.js App Router](https://nextjs.org/docs/app)：维持 Server Components，交互仅使用必要客户端组件。
- [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image)：明确 sizes/尺寸，关键图使用 preload。
- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)：集中 metadataBase 与可覆盖分享图。
- [Shopify Product Recommendations](https://shopify.dev/docs/api/storefront/2026-07/queries/productRecommendations)：有限 RELATED 查询。
- [Shopify CartLineCost](https://shopify.dev/docs/api/storefront/2026-07/objects/CartLineCost)：购物车金额以 Shopify 为准。
- [Google 分页指导](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)：不把后续可索引分页统一 canonical 到第一页。

性能验收不等于转化提升证明；本次未采集真实用户 CWV 或启用 Analytics。
