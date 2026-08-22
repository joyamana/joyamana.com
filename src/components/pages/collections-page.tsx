import { getCollections, getProducts } from "@/lib/commerce/catalog";
import { localize } from "@/lib/commerce/types";
import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";

export async function CollectionsPage({ locale }: { locale: Locale }) {
  const marketId = marketIdForLocale(locale);
  const [collections, products] = await Promise.all([
    getCollections(),
    getProducts(marketId),
  ]);

  return (
    <>
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
        <h1>
          {uiText(locale, {
            en: "All forms",
            es: "Todas las formas",
            fr: "Toutes les formes",
          })}
        </h1>
        <p>
          {marketId === "ca"
            ? uiText(locale, {
                en: "English and French views share this Canadian test catalog and CAD pricing context.",
                es: "El mercado canadiense de prueba usa su propio catálogo y precios CAD.",
                fr: "Les versions anglaise et française partagent ce catalogue canadien d’essai et son contexte de prix en CAD.",
              })
            : uiText(locale, {
                en: "English and Spanish views share this same US catalog, inventory model, and USD test pricing.",
                es: "La vista en español y la vista en inglés muestran el mismo catálogo estadounidense y los mismos precios en USD.",
                fr: "Les versions partagent le même catalogue américain et les prix d’essai en USD.",
              })}
        </p>
      </header>
      <nav
        className="filter-row"
        aria-label={uiText(locale, { en: "Collections", es: "Colecciones", fr: "Collections" })}
      >
        <a href="#all">{uiText(locale, { en: "All", es: "Todo", fr: "Tout" })}</a>
        {collections.map((collection) => (
          <a href={`#${collection.handle}`} key={collection.handle}>
            {localize(collection.title, locale)}
          </a>
        ))}
      </nav>
      <section className="section" id="all">
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>
    </>
  );
}
