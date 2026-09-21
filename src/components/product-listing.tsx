import Form from "next/form";
import Link from "next/link";
import type { ProductSummary } from "@/lib/commerce/types";
import { getListingState } from "@/lib/commerce/product-listing";
import { localePath, type Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import type { PageSearchParams } from "@/lib/seo";
import { ProductCard } from "./product-card";

export function ProductListing({
  products, locale, path, searchParams = {},
}: {
  products: ProductSummary[];
  locale: Locale;
  path: string;
  searchParams?: PageSearchParams;
}) {
  const state = getListingState(searchParams);
  const reset = uiText(locale, { en: "Clear filters", es: "Quitar filtros", zh: "清除篩選", fr: "Effacer les filtres" });

  return (
    <section className="section listing-section" id="products">
      <Form action={localePath(locale, path)} className="listing-controls">
        <div>
          <label htmlFor="availability">{uiText(locale, { en: "Availability", es: "Disponibilidad", zh: "供應狀況", fr: "Disponibilité" })}</label>
          <select id="availability" name="availability" defaultValue={state.availableOnly ? "available" : ""} key={String(state.availableOnly)}>
            <option value="">{uiText(locale, { en: "All pieces", es: "Todas las piezas", zh: "全部飾物", fr: "Toutes les pièces" })}</option>
            <option value="available">{uiText(locale, { en: "Available to purchase", es: "Disponibles para comprar", zh: "可購買", fr: "Disponibles à l’achat" })}</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort">{uiText(locale, { en: "Sort by", es: "Ordenar por", zh: "排序方式", fr: "Trier par" })}</label>
          <select id="sort" name="sort" defaultValue={state.sort} key={state.sort}>
            <option value="available">{uiText(locale, { en: "Available first", es: "Disponibles primero", zh: "可購買優先", fr: "Disponibles d’abord" })}</option>
            <option value="price-asc">{uiText(locale, { en: "Price: low to high", es: "Precio: menor a mayor", zh: "價格：由低至高", fr: "Prix croissant" })}</option>
            <option value="price-desc">{uiText(locale, { en: "Price: high to low", es: "Precio: mayor a menor", zh: "價格：由高至低", fr: "Prix décroissant" })}</option>
          </select>
        </div>
        <button className="button button--secondary" type="submit">{uiText(locale, { en: "Apply", es: "Aplicar", zh: "套用", fr: "Appliquer" })}</button>
        {Object.keys(searchParams).length ? <Link className="text-link" href={localePath(locale, path)}>{reset}</Link> : null}
      </Form>
      <p className="listing-count" role="status">{uiText(locale, {
        en: `${products.length} ${products.length === 1 ? "piece" : "pieces"}`,
        es: `${products.length} ${products.length === 1 ? "pieza" : "piezas"}`,
        zh: `${products.length} 件飾物`,
        fr: `${products.length} ${products.length === 1 ? "pièce" : "pièces"}`,
      })}</p>
      {products.length ? (
        <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div>
      ) : (
        <div className="empty-state empty-state--compact">
          <h2>{uiText(locale, { en: "No pieces to show.", es: "No hay piezas para mostrar.", zh: "暫無符合條件的飾物。", fr: "Aucune pièce à afficher." })}</h2>
          <Link className="text-link" href={localePath(locale, state.availableOnly ? path : "/shop")}>
            {state.availableOnly ? reset : uiText(locale, { en: "Shop all", es: "Ver todo", zh: "選購所有商品", fr: "Tout voir" })}
          </Link>
        </div>
      )}
    </section>
  );
}
