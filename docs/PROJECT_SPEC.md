# 项目说明

## 范围

Joya Mana 是面向美国市场的水晶品牌站，收入来自商品销售。优先做好品牌体验与信任，
其次是可靠购买、搜索可见性和未来扩展。购买不要求注册、问卷或营销订阅，不放广告。

当前只运营 US / US Catalog / USD。英语 en-US 使用根路径，香港繁中 zh-Hant-US 使用
`/zh-hant-us/`，两种语言共享商品、库存、价格和政策。西语 es-US 暂停上线：不展示入口，
旧地址返回 404/noindex；语言映射和共享译文保留，恢复前须重新批准。Canada 只保留
未启用配置。URL 和索引规则见 [内容与索引](CONTENT_SEO_GEO_SPEC.md)。

生产站点为 `https://www.joyamana.com`，apex 对应路径 308 至 www；Shopify 托管结账使用
`checkout.joyamana.com`。dev 对应 Vercel Preview，main 对应 Production。

## 用户流程与当前能力

| 顾客任务 | 当前流程 |
|---|---|
| 购物 | 首页 → Shop/类别/设计系列 → 商品选款 → Bag → Shopify Checkout |
| 了解商品 | Crystal Guide/Blog → 相关目录或商品 → 购买 |
| 礼赠 | 核对商品、包装、配送与退换 → Bag → Checkout |
| 订单后服务 | Shopify 确认邮件与 Order Status → 必要时电邮客服 |

网站已有英语和繁中页面、商品搜索、同款颜色/可购买筛选、展示款价格排序、选款深链接、
数量规则和图库。Bag 支持恢复、修改、完整分页、独立 Buy now 和结账前检查。
About、Accessibility、政策和文章从 Shopify 读取。metadata、sitemap、适用 JSON-LD
受部署、页面组和内容条件控制。工程使用 Node 24、固定依赖和 GitHub CI。

各领域规则分别见 [技术](TECH_SPEC.md)、[交易](COMMERCE_SPEC.md)、
[内容与索引](CONTENT_SEO_GEO_SPEC.md)、[设计](DESIGN_SYSTEM.md)。

## 当前限制

- 商品知识、图片代表性披露、内容关联和系列故事尚未完整接入。
- 缺译正文可回退英文；已识别的回退内容不索引。商品/系列尚无自动回退检测，
  上线前仍需逐页检查繁中正文和 metadata。
- 准确低库存文案暂停；库存、数量和可购买判断继续运行。
- 搜索只检索商品；Editorial 关闭索引，测试文章不能当正式内容。
- 客服只通过电邮联系。账户、订阅、Wishlist、Reviews、积分、推荐奖励和实时定制器未实现。
- Organization/Site Settings、Home/Contact/政策 Schema、Analytics 和营销隐私流程未实现。
  Google verification 配置不能证明账号已验证。
- 动态缺失详情的初始 404 正文存在框架限制，见技术规格。

业务方已确认支付能力、Payment test mode 流程、法律实体、履约方式、政策审批责任和
客服流程。品牌资产归设计规范，商品随附内容和现行配送退换承诺归交易规格。
仓库不复制非公开商标、成本、利润或法律记录。

## 上线要求

顾客无需注册即可购买；页面、购物袋、metadata 和适用 Schema 的事实须一致。
索引页初始 HTML 可读，手机和键盘核心流程可用，内容和译文经过人工检查。
支付批准不代表已执行真实扣款、退款或到账核对；每次部署仍须验收自己的启用范围。

剩余代码工作、未决运营输入和候选只维护在 [Roadmap](ROADMAP.md)，
实际发布检查见 [发布手册](LAUNCH_RUNBOOK.md)。
