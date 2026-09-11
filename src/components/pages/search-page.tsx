import { searchCatalog } from "@/lib/commerce/catalog";
import type { Locale } from "@/lib/i18n/locales";
import { marketIdForLocale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { ProductCard } from "@/components/product-card";

export async function SearchPage({
  locale,
  query,
}: {
  locale: Locale;
  query: string;
}) {
  const marketId = marketIdForLocale(locale);
  const results = await searchCatalog(query, marketId, locale);

  return (
    <section className="search-page">
      <p className="eyebrow">
        {marketId === "ca"
          ? uiText(locale, { zh: "加拿大商品目錄 · CAD", en: "Canada catalog · CAD", es: "Canada catalog · CAD", fr: "Catalogue Canada · CAD" })
          : uiText(locale, { zh: "共用美國商品目錄", en: "Shared US catalog", es: "Catálogo compartido de EE. UU.", fr: "Catalogue partagé des États-Unis" })}
      </p>
      <h1>{uiText(locale, { zh: "搜尋", en: "Search", es: "Buscar", fr: "Rechercher" })}</h1>
      <form className="search-form" action={localePath(locale, "/search")}>
        <label className="sr-only" htmlFor="catalog-search">
          {uiText(locale, { zh: "搜尋商品", en: "Search products", es: "Buscar productos", fr: "Rechercher des produits" })}
        </label>
        <input
          id="catalog-search"
          type="search"
          name="q"
          defaultValue={query}
          placeholder={uiText(locale, { zh: "按名稱或水晶搜尋", en: "Search by name or crystal", es: "Buscar por nombre o cristal", fr: "Rechercher par nom ou cristal" })}
        />
        <button className="button button--primary" type="submit">
          {uiText(locale, { zh: "搜尋", en: "Search", es: "Buscar", fr: "Rechercher" })}
        </button>
      </form>
      {query ? (
        <div className="search-results">
          <p>
            {uiText(locale, {
              zh: `「${query}」找到 ${results.length} 件商品`,
              en: `${results.length} product ${results.length === 1 ? "result" : "results"} for “${query}”`,
              es: `${results.length} ${results.length === 1 ? "resultado de producto" : "resultados de productos"} para “${query}”`,
              fr: `${results.length} ${results.length === 1 ? "résultat de produit" : "résultats de produits"} pour « ${query} »`,
            })}
          </p>
          <div className="product-grid product-grid--three">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </div>
      ) : (
        <p>
          {uiText(locale, {
            zh: "按商品名稱或材質搜尋。",
            en: "Search by product name or material.",
            es: "Busca por nombre de producto o material.",
            fr: "Recherchez par nom de produit ou matériau.",
          })}
        </p>
      )}
    </section>
  );
}
