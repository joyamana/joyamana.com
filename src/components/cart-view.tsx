"use client";

import Image from "next/image";
import Link from "next/link";
import { getCatalogProducts } from "@/lib/commerce/catalog";
import { localize } from "@/lib/commerce/types";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { useCart } from "./cart-provider";

export function CartView({ locale }: { locale: Locale }) {
  const { lines, removeItem, clear } = useCart();
  const marketId = marketIdForLocale(locale);
  const products = getCatalogProducts(marketId);
  const rows = lines
    .filter((line) => line.marketId === marketId)
    .flatMap((line) => {
      const product = products.find((item) => item.id === line.productId);
      const variant = product?.variants.find(
        (item) => item.id === line.variantId,
      );
      return product && variant ? [{ ...line, product, variant }] : [];
    });
  const subtotal = rows.reduce(
    (sum, row) => sum + row.product.price * row.quantity,
    0,
  );

  if (!rows.length) {
    return (
      <div className="empty-state">
        <p className="eyebrow">{uiText(locale, { en: "Test bag", es: "Bolsa de prueba", fr: "Panier d’essai" })}</p>
        <h1>{uiText(locale, { en: "Your bag is empty.", es: "Tu bolsa está vacía.", fr: "Votre panier est vide." })}</h1>
        <p>
          {uiText(locale, {
            en: "Items added here are local prototype data only.",
            es: "Los artículos agregados aquí son solo datos locales del prototipo.",
            fr: "Les articles ajoutés ici sont uniquement des données locales du prototype.",
          })}
        </p>
        <Link className="button button--primary" href={localePath(locale, "/collections")}>
          {uiText(locale, { en: "Explore collections", es: "Explorar colecciones", fr: "Explorer les collections" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section>
        {rows.map(({ product, variant, quantity }) => (
          <article className="cart-line" key={`${product.id}:${variant.id}`}>
            <div className="cart-line__art">
              <Image
                src={variant.image}
                alt={localize(variant.imageAlt, locale)}
                width={180}
                height={180}
              />
            </div>
            <div>
              <p className="microcopy">
                {uiText(locale, { en: "Test item", es: "Artículo de prueba", fr: "Article d’essai" })} · {quantity}
              </p>
              <h2>{localize(product.title, locale)}</h2>
              <p>{localize(variant.title, locale)}</p>
              <p>
                {formatPrice(
                  product.price * quantity,
                  locale,
                  product.currency,
                )}
              </p>
              <button
                className="text-button"
                type="button"
                onClick={() => removeItem(product.id, variant.id, marketId)}
              >
                {uiText(locale, { en: "Remove", es: "Eliminar", fr: "Retirer" })}
              </button>
            </div>
          </article>
        ))}
      </section>
      <aside className="cart-summary">
        <p className="eyebrow">{uiText(locale, { en: "Summary", es: "Resumen", fr: "Résumé" })}</p>
        <h2>
          {uiText(locale, { en: "Test subtotal", es: "Subtotal de prueba", fr: "Sous-total d’essai" })}{" "}
          {formatPrice(
            subtotal,
            locale,
            rows[0]?.product.currency || "USD",
          )}
        </h2>
        <p>
          {uiText(locale, {
            en: "Shopify checkout will be enabled after a store, approved policies, and real prices are connected.",
            es: "El pago de Shopify se habilitará después de conectar una tienda, políticas y precios aprobados.",
            fr: "Le paiement Shopify sera activé après la connexion d’une boutique, de politiques approuvées et de prix réels.",
          })}
        </p>
        <button className="button button--primary button--wide" disabled>
          {uiText(locale, { en: "Checkout not connected", es: "Pago aún no disponible", fr: "Paiement non connecté" })}
        </button>
        <button className="text-button" type="button" onClick={() => clear(marketId)}>
          {uiText(locale, { en: "Clear test bag", es: "Vaciar bolsa de prueba", fr: "Vider le panier d’essai" })}
        </button>
      </aside>
    </div>
  );
}
