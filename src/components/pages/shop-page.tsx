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
    en: "Home",
    es: "Inicio",
    fr: "Accueil",
  });
  const shopLabel = uiText(locale, {
    en: "Shop",
    es: "Comprar",
    fr: "Boutique",
  });
  const pageDescription = uiText(locale, {
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
        <span>{shopLabel}</span>
      </nav>
      <header className="page-hero">
        <p className="eyebrow">
          {uiText(locale, {
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
            en: "Product categories",
            es: "Categorías de productos",
            fr: "Catégories de produits",
          })}
        >
          <a href="#all">
            {uiText(locale, { en: "All", es: "Todo", fr: "Tout" })}
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
