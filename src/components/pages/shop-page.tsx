import Link from "next/link";
import {
  getBrowseProducts,
  productCategoriesForProducts,
} from "@/lib/commerce/catalog";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildCollectionStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";
import { CatalogFilters } from "@/components/catalog-filters";
import { CatalogGrid } from "@/components/catalog-grid";
import {
  browseCatalog,
  parseCatalogQuery,
} from "@/lib/commerce/catalog-browse";
import type { PageSearchParams } from "@/lib/seo";

export async function ShopPage({
  locale,
  searchParams = {},
}: {
  locale: Locale;
  searchParams?: PageSearchParams;
}) {
  const marketId = marketIdForLocale(locale);
  const products = await getBrowseProducts(marketId, locale);
  const categories = productCategoriesForProducts(products, locale);
  const query = parseCatalogQuery(searchParams);
  const result = browseCatalog(products, query);
  const browsePath = localePath(locale, "/shop");
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
  });
  const shopLabel = uiText(locale, {
    zh: "選購",
    en: "Shop",
    es: "Comprar",
  });
  const pageDescription = uiText(locale, {
    zh: "瀏覽 Joya Mana 美國網店目前已發佈的所有商品。",
    en: "Browse all products currently published to the Joya Mana US storefront.",
    es: "Explora todos los productos publicados actualmente en la tienda estadounidense de Joya Mana.",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: shopLabel, path: "/shop" },
  ];
  const structuredData = products.length
    ? serializeIndexableStructuredData(
        buildCollectionStructuredData({
          name: shopLabel,
          description: pageDescription,
          path: "/shop",
          products: result.entries.map((entry) => entry.product),
          entries: result.entries,
          locale,
          breadcrumbs,
        }),
        { locale, path: "/shop", searchParams },
      )
    : null;

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
        })}
      >
        <Link href={localePath(locale, "/")}>{homeLabel}</Link>
        <span>/</span>
        <span>{shopLabel}</span>
      </nav>
      <header className="page-hero catalog-heading">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "美國商品目錄 · USD",
            en: "US catalog · USD",
            es: "Catálogo de EE. UU. · USD",
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
          })}
        >
          <a href="#all">
            {uiText(locale, { zh: "全部", en: "All", es: "Todo" })}
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
      <CatalogFilters
        path={browsePath}
        query={query}
        colors={result.colors}
        count={result.entries.length}
        locale={locale}
      />
      <section className="section catalog-results" id="all">
        <CatalogGrid
          entries={result.entries}
          locale={locale}
          path={browsePath}
          query={query}
        />
      </section>
    </>
  );
}
