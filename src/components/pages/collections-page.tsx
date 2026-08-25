import Link from "next/link";
import { getCollections, getProducts } from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildCollectionStructuredData,
  serializeIndexableStructuredData,
  type StructuredBreadcrumb,
} from "@/lib/structured-data";
import { ProductCard } from "@/components/product-card";

export async function CollectionsPage({ locale }: { locale: Locale }) {
  const marketId = marketIdForLocale(locale);
  const [collections, products] = await Promise.all([
    getCollections(marketId, locale),
    getProducts(marketId, locale),
  ]);
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
  const pageTitle = uiText(locale, {
    en: "All forms",
    es: "Todas las formas",
    fr: "Toutes les formes",
  });
  const pageDescription =
    marketId === "ca"
      ? uiText(locale, {
          en: "English and French views share this Canadian test catalog and CAD pricing context.",
          es: "El mercado canadiense de prueba usa su propio catálogo y precios CAD.",
          fr: "Les versions anglaise et française partagent ce catalogue canadien d’essai et son contexte de prix en CAD.",
        })
      : uiText(locale, {
          en: "English and Spanish views share this same US catalog, inventory model, and USD test pricing.",
          es: "La vista en español y la vista en inglés muestran el mismo catálogo estadounidense y los mismos precios en USD.",
          fr: "Les versions partagent le même catalogue américain et les prix d’essai en USD.",
        });
  const breadcrumbs: StructuredBreadcrumb[] = [
    { name: homeLabel, path: "/" },
    { name: collectionsLabel, path: "/collections" },
  ];
  const structuredData = serializeIndexableStructuredData(
    buildCollectionStructuredData({
      name: pageTitle,
      description: pageDescription,
      path: "/collections",
      products,
      locale,
      breadcrumbs,
    }),
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
        <span>{collectionsLabel}</span>
      </nav>
      <header className="page-hero">
        <p className="eyebrow">
          {marketId === "ca"
            ? uiText(locale, {
                en: "Canada catalog · CAD",
                es: "Canada catalog · CAD",
                fr: "Catalogue Canada · CAD",
              })
            : uiText(locale, {
                en: "US catalog · USD",
                es: "Catálogo de EE. UU. · USD",
                fr: "Catalogue États-Unis · USD",
              })}
        </p>
        <h1>{pageTitle}</h1>
        <p>{pageDescription}</p>
      </header>
      <nav
        className="filter-row"
        aria-label={uiText(locale, { en: "Collections", es: "Colecciones", fr: "Collections" })}
      >
        <a href="#all">{uiText(locale, { en: "All", es: "Todo", fr: "Tout" })}</a>
        {collections.map((collection) => (
          <Link
            href={localePath(locale, `/collections/${collection.handle}`)}
            key={collection.handle}
          >
            {collection.title}
          </Link>
        ))}
      </nav>
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
                en: "No products are published yet.",
                es: "Aún no hay productos publicados.",
                fr: "Aucun produit n’est encore publié.",
              })}
            </h2>
            <p>
              {uiText(locale, {
                en: "Publish products to the Headless channel in Shopify to show them here.",
                es: "Publica productos en el canal Headless de Shopify para mostrarlos aquí.",
                fr: "Publiez des produits sur le canal Headless de Shopify pour les afficher ici.",
              })}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
