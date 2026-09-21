import Link from "next/link";
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
  const results = query
    ? await searchCatalog(query, marketId, locale).catch(() => null)
    : [];

  return (
    <section className="search-page">
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
      {results === null ? (
        <div className="empty-state" role="status">
          <p>{uiText(locale, {
            en: "Search is temporarily unavailable. Submit your search again or browse the shop.",
            es: "La búsqueda no está disponible temporalmente. Vuelve a buscar o explora la tienda.",
            zh: "搜尋暫時未能使用，請重新搜尋或瀏覽商店。",
            fr: "La recherche est temporairement indisponible. Réessayez ou parcourez la boutique.",
          })}</p>
          <Link className="button" href={localePath(locale, "/shop")}>
            {uiText(locale, { en: "Shop all", es: "Ver todos los productos", zh: "選購全部商品", fr: "Voir tous les produits" })}
          </Link>
        </div>
      ) : query ? (
        <div className="search-results">
          <p>
            {uiText(locale, {
              zh: `「${query}」找到 ${results.length} 件商品`,
              en: `${results.length} product ${results.length === 1 ? "result" : "results"} for “${query}”`,
              es: `${results.length} ${results.length === 1 ? "resultado de producto" : "resultados de productos"} para “${query}”`,
              fr: `${results.length} ${results.length === 1 ? "résultat de produit" : "résultats de produits"} pour « ${query} »`,
            })}
          </p>
          {results.length === 0 ? (
            <div className="empty-state">
              <p>{uiText(locale, {
                en: "Try a different product name or material, or browse all pieces.",
                es: "Prueba con otro nombre de producto o material, o explora todos los productos.",
                zh: "請嘗試其他商品名稱或材質，或瀏覽全部商品。",
                fr: "Essayez un autre nom de produit ou matériau, ou parcourez tous les produits.",
              })}</p>
              <div className="button-row">
                <Link className="button button--primary" href={localePath(locale, "/shop")}>
                  {uiText(locale, { en: "Shop all", es: "Ver todos los productos", zh: "選購全部商品", fr: "Voir tous les produits" })}
                </Link>
                <Link className="button" href={localePath(locale, "/search")}>
                  {uiText(locale, { en: "Clear search", es: "Borrar búsqueda", zh: "清除搜尋", fr: "Effacer la recherche" })}
                </Link>
              </div>
            </div>
          ) : <div className="product-grid product-grid--three">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>}
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
