import Link from "next/link";
import {
  getProducts,
  productCategoriesForProducts,
} from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildCollectionStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";
import { ProductCard } from "@/components/product-card";

export async function ShopPage({ locale }: { locale: Locale }) {
  const marketId = marketIdForLocale(locale);
  const products = await getProducts(marketId, locale);
  const categories = productCategoriesForProducts(products, locale);
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const shopLabel = uiText(locale, {
    zh: "選購",
    en: "Shop",
    es: "Comprar",
    fr: "Boutique",
  });
  const pageDescription = uiText(locale, {
    zh: "瀏覽 Joya Mana 美國網店目前已發佈的所有商品。",
    en: "Browse all products currently published to the Joya Mana US storefront.",
    es: "Explora todos los productos publicados actualmente en la tienda estadounidense de Joya Mana.",
    fr: "Découvrez tous les produits actuellement publiés dans la boutique américaine Joya Mana.",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: shopLabel, path: "/shop" },
  ];
  const structuredData = serializeIndexableStructuredData(
    buildCollectionStructuredData({
      name: shopLabel,
      description: pageDescription,
      path: "/shop",
      products,
      locale,
      breadcrumbs,
    }),
    { locale, path: "/shop" },
  );

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      ) : null}
      <nav
        className="breadcrumbs"
        aria-label={uiText(locale, {
          zh: "頁面路徑",
          en: "Breadcrumb",
          es: "Ruta de navegación",
          fr: "Fil d’Ariane",
        })}
      >
        <Link href={localePath(locale, "/")}>{homeLabel}</Link>
        <span>/</span>
        <span>{shopLabel}</span>
      </nav>
      <header className="page-hero">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "美國商品目錄 · USD",
            en: "US catalog · USD",
            es: "Catálogo de EE. UU. · USD",
            fr: "Catalogue États-Unis · USD",
          })}
        </p>
        <h1>{shopLabel}</h1>
        <p>{pageDescription}</p>
      </header>
      {categories.length ? (
        <nav
          className="filter-row"
          aria-label={uiText(locale, {
            zh: "商品類別",
            en: "Product categories",
            es: "Categorías de productos",
            fr: "Catégories de produits",
          })}
        >
          <a href="#all">
            {uiText(locale, { zh: "全部", en: "All", es: "Todo", fr: "Tout" })}
          </a>
          {categories.map((category) => (
            <Link
              href={localePath(locale, `/category/${category.handle}`)}
              key={category.handle}
            >
              {category.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <section className="section" id="all">
        {products.length ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <h2>
              {uiText(locale, {
                zh: "目前沒有已發佈的商品。",
                en: "No products are published yet.",
                es: "Aún no hay productos publicados.",
                fr: "Aucun produit n’est encore publié.",
              })}
            </h2>
            <p>
              {uiText(locale, {
                zh: "瀏覽其他內容。",
                en: "New pieces will appear here as soon as they are available.",
                es: "Nuevas piezas aparecerán aquí en cuanto estén disponibles.",
                fr: "De nouvelles pièces apparaîtront ici dès qu’elles seront disponibles.",
              })}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
