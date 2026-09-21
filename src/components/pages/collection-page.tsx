import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { productCategoryDefinitionForHandle } from "@/config/catalog";
import { getDesignCollection } from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { getCollectionSeoDescription } from "@/lib/seo";
import {
  buildCollectionStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";
import { ProductListing } from "@/components/product-listing";
import { listProducts } from "@/lib/commerce/product-listing";
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

  const collection = await getDesignCollection(
    handle,
    marketIdForLocale(locale),
    locale,
  );
  if (!collection) notFound();
  const products = listProducts(collection.products, searchParams);
  const homeLabel = uiText(locale, {
    zh: "首頁",
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const collectionsLabel = uiText(locale, {
    zh: "系列",
    en: "Collections",
    es: "Colecciones",
    fr: "Collections",
  });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: collectionsLabel, path: "/collections" },
    {
      name: collection.title,
      path: `/collections/${collection.handle}`,
    },
  ];
  const structuredData = !Object.keys(searchParams).length && getCollectionSeoDescription(collection)
    ? serializeIndexableStructuredData(
        buildCollectionStructuredData({
          name: collection.title,
          description: collection.description,
          path: `/collections/${collection.handle}`,
          products,
          locale,
          breadcrumbs,
        }),
        { locale, path: `/collections/${collection.handle}` },
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
          fr: "Fil d’Ariane",
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
      <header className="page-hero">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "設計系列",
            en: "Design collection",
            es: "Colección de diseño",
            fr: "Collection de design",
          })}
        </p>
        <h1>{collection.title}</h1>
        {collection.description ? <p>{collection.description}</p> : null}
        {collection.image ? (
          <Image className="collection-hero-image" src={collection.image.url} alt={collection.image.altText || collection.title} width={collection.image.width} height={collection.image.height} sizes="100vw" />
        ) : null}
      </header>
      <ProductListing products={products} locale={locale} path={`/collections/${collection.handle}`} searchParams={searchParams} />
    </>
  );
}
