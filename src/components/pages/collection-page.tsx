import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { productCategoryDefinitionForHandle } from "@/config/catalog";
import { getBrowseCollection } from "@/lib/commerce/catalog";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { getCollectionSeoDescription } from "@/lib/seo";
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

export async function CollectionPage({
  locale,
  handle,
  searchParams = {},
}: {
  locale: Locale;
  handle: string;
  searchParams?: PageSearchParams;
}) {
  if (productCategoryDefinitionForHandle(handle)) {
    permanentRedirect(localePath(locale, `/category/${handle}`));
  }

  const collection = await getBrowseCollection(
    handle,
    marketIdForLocale(locale),
    locale,
  );
  if (!collection) notFound();
  const query = parseCatalogQuery(searchParams);
  const result = browseCatalog(collection.products, query);
  const browsePath = localePath(locale, `/collections/${collection.handle}`);
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
  });
  const collectionsLabel = uiText(locale, {
    zh: "系列",
    en: "Collections",
    es: "Colecciones",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: collectionsLabel, path: "/collections" },
    {
      name: collection.title,
      path: `/collections/${collection.handle}`,
    },
  ];
  const structuredData = getCollectionSeoDescription(collection)
    ? serializeIndexableStructuredData(
        buildCollectionStructuredData({
          name: collection.title,
          description: collection.description,
          path: `/collections/${collection.handle}`,
          products: result.entries.map((entry) => entry.product),
          entries: result.entries,
          locale,
          breadcrumbs,
        }),
        { locale, path: `/collections/${collection.handle}`, searchParams },
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
        <Link href={localePath(locale, "/collections")}>
          {collectionsLabel}
        </Link>
        <span>/</span>
        <span>{collection.title}</span>
      </nav>
      <header className="page-hero catalog-heading">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "設計系列",
            en: "Design collection",
            es: "Colección de diseño",
          })}
        </p>
        <h1>{collection.title}</h1>
        {collection.description ? <p>{collection.description}</p> : null}
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
