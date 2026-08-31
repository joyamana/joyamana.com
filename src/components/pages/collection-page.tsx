import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { productCategoryDefinitionForHandle } from "@/config/catalog";
import { getDesignCollection } from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildCollectionStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";
import { ProductCard } from "@/components/product-card";

export async function CollectionPage({
  locale,
  handle,
}: {
  locale: Locale;
  handle: string;
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
  const homeLabel = uiText(locale, {
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const collectionsLabel = uiText(locale, {
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
  const structuredData = serializeIndexableStructuredData(
    buildCollectionStructuredData({
      name: collection.title,
      description: collection.description,
      path: `/collections/${collection.handle}`,
      products: collection.products,
      locale,
      breadcrumbs,
    }),
    { locale, path: `/collections/${collection.handle}` },
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
            en: "Design collection",
            es: "Colección de diseño",
            fr: "Collection de design",
          })}
        </p>
        <h1>{collection.title}</h1>
        {collection.description ? <p>{collection.description}</p> : null}
      </header>
      <section className="section">
        {collection.products.length ? (
          <div className="product-grid">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <p>
            {uiText(locale, {
              en: "No published products are currently assigned to this collection.",
              es: "Actualmente no hay productos publicados asignados a esta colección.",
              fr: "Aucun produit publié n’est actuellement attribué à cette collection.",
            })}
          </p>
        )}
      </section>
    </>
  );
}
