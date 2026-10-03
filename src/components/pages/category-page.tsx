import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrowseCategory } from "@/lib/commerce/catalog";
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

export async function CategoryPage({
  locale,
  handle,
  searchParams = {},
}: {
  locale: Locale;
  handle: string;
  searchParams?: PageSearchParams;
}) {
  const category = await getBrowseCategory(
    handle,
    marketIdForLocale(locale),
    locale,
  );
  if (!category) notFound();
  const query = parseCatalogQuery(searchParams);
  const result = browseCatalog(category.products, query);
  const browsePath = localePath(locale, `/category/${category.handle}`);

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
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: shopLabel, path: "/shop" },
    { name: category.title, path: `/category/${category.handle}` },
  ];
  const structuredData = serializeIndexableStructuredData(
    buildCollectionStructuredData({
      name: category.title,
      description: category.description,
      path: `/category/${category.handle}`,
      products: result.entries.map((entry) => entry.product),
      entries: result.entries,
      locale,
      breadcrumbs,
    }),
    { locale, path: `/category/${category.handle}`, searchParams },
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
        })}
      >
        <Link href={localePath(locale, "/")}>{homeLabel}</Link>
        <span>/</span>
        <Link href={localePath(locale, "/shop")}>{shopLabel}</Link>
        <span>/</span>
        <span>{category.title}</span>
      </nav>
      <header className="page-hero catalog-heading">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "按類別選購",
            en: "Shop by category",
            es: "Comprar por categoría",
          })}
        </p>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
      </header>
      <CatalogFilters
        path={browsePath}
        query={query}
        colors={result.colors}
        count={result.entries.length}
        locale={locale}
      />
      <section className="section catalog-results">
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
