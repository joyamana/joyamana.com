"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { localize } from "@/lib/commerce/types";
import { formatPrice } from "@/lib/format";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, marketIdForLocale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { AddToCart } from "./add-to-cart";

export function ProductPurchase({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const [selectedId, setSelectedId] = useState(product.variants[0].id);
  const selected =
    product.variants.find((variant) => variant.id === selectedId) ||
    product.variants[0];
  const copy = getCopy(locale);

  return (
    <section className="product-detail">
      <div className="product-gallery">
        <div className="product-gallery__sticky">
          <div className="product-gallery__main">
            <Image
              src={selected.image}
              alt={localize(selected.imageAlt, locale)}
              width={1250}
              height={1250}
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <span className="sample-stamp">
              {uiText(locale, {
                en: "Provided concept image",
                es: "Imagen conceptual proporcionada",
                fr: "Image conceptuelle fournie",
              })}
            </span>
          </div>
          <div
            className="product-gallery__thumbs"
            aria-label={uiText(locale, {
              en: "Image options",
              es: "Opciones de imagen",
              fr: "Options d’image",
            })}
          >
            {product.variants.map((variant) => (
              <button
                type="button"
                key={variant.id}
                className={variant.id === selected.id ? "is-selected" : ""}
                onClick={() => setSelectedId(variant.id)}
                aria-label={`${uiText(locale, { en: "View", es: "Ver", fr: "Voir" })} ${localize(variant.title, locale)}`}
                aria-pressed={variant.id === selected.id}
              >
                <Image
                  src={variant.image}
                  alt=""
                  width={160}
                  height={160}
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="product-detail__info">
        <p className="eyebrow">{copy.labels.naturalVariation}</p>
        <h1>{localize(product.title, locale)}</h1>
        <p className="display-price">
          {copy.labels.testPrice} ·{" "}
          {formatPrice(product.price, locale, product.currency)}
        </p>
        <p className="lede">{localize(product.description, locale)}</p>

        <fieldset className="variant-picker">
          <legend>
            {uiText(locale, {
              en: "Main stone",
              es: "Piedra principal",
              fr: "Pierre principale",
            })}
            :{" "}
            <strong>{localize(selected.title, locale)}</strong>
          </legend>
          <div className="variant-picker__grid">
            {product.variants.map((variant) => (
              <button
                type="button"
                key={variant.id}
                className={variant.id === selected.id ? "is-selected" : ""}
                onClick={() => setSelectedId(variant.id)}
                aria-pressed={variant.id === selected.id}
              >
                <span>{localize(variant.title, locale)}</span>
                <small>
                  {formatPrice(product.price, locale, product.currency)}
                </small>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="purchase-actions">
          <AddToCart
            productId={product.id}
            variantId={selected.id}
            marketId={marketIdForLocale(locale)}
            available={product.available && selected.available}
            label={copy.labels.addToCart}
            unavailableLabel={copy.labels.soldOut}
          />
          <button
            aria-describedby="buy-now-prototype-note"
            className="button button--secondary button--wide"
            type="button"
            disabled
          >
            {uiText(locale, {
              en: "Buy now",
              es: "Comprar ahora",
              fr: "Acheter maintenant",
            })}
          </button>
        </div>
        <p className="checkout-note" id="buy-now-prototype-note">
          {uiText(locale, {
            en: "Prototype only. Buy now will open a one-item Shopify Checkout after the store, real prices, and approved policies are connected. No order or inventory reservation is created now.",
            es: "Solo prototipo. Comprar ahora abrirá un pago de Shopify con un solo artículo cuando se conecten la tienda, los precios reales y las políticas aprobadas. Ahora no se crea ningún pedido ni se reserva inventario.",
            fr: "Prototype uniquement. Acheter maintenant ouvrira un paiement Shopify pour un seul article une fois la boutique, les prix réels et les politiques approuvées connectés. Aucun achat ni réservation de stock n’est créé actuellement.",
          })}
        </p>
        <dl className="fact-list">
          <div>
            <dt>{copy.labels.details}</dt>
            <dd>{localize(product.material, locale)}</dd>
          </div>
          <div>
            <dt>
              {uiText(locale, {
                en: "Prototype construction",
                es: "Construcción de prueba",
                fr: "Fabrication prototype",
              })}
            </dt>
            <dd>
              {uiText(locale, {
                en: "15 main-stone beads + 7 colored beads = 22 beads. Sequence and spacers require approval.",
                es: "15 cuentas de piedra principal + 7 cuentas de color = 22 cuentas. La secuencia y los separadores requieren aprobación.",
                fr: "15 perles de pierre principale + 7 perles colorées = 22 perles. La séquence et les séparateurs doivent être approuvés.",
              })}
            </dd>
          </div>
          <div>
            <dt>{uiText(locale, { en: "Dimensions", es: "Medidas", fr: "Dimensions" })}</dt>
            <dd>{localize(product.dimensions, locale)}</dd>
          </div>
          <div>
            <dt>{copy.labels.care}</dt>
            <dd>
              <p>{localize(product.care, locale)}</p>
              <Link
                className="fact-list__link"
                href={localePath(locale, "/product-care")}
              >
                {uiText(locale, {
                  en: "View product care",
                  es: "Ver cuidado del producto",
                  fr: "Voir l’entretien du produit",
                })}
              </Link>
            </dd>
          </div>
          <div>
            <dt>
              {uiText(locale, {
                en: "Shipping & returns",
                es: "Envío y devoluciones",
                fr: "Expédition et retours",
              })}
            </dt>
            <dd>
              <p>
                {uiText(locale, {
                  en: "Rates, timing, fulfillment origin, and return terms are pending approval.",
                  es: "Las tarifas, los plazos, el origen del envío y las condiciones de devolución están pendientes de aprobación.",
                  fr: "Les tarifs, délais, l’origine d’expédition et les conditions de retour sont en attente d’approbation.",
                })}
              </p>
              <span className="fact-list__links">
                <Link
                  className="fact-list__link"
                  href={localePath(locale, "/shipping")}
                >
                  {copy.labels.shipping}
                </Link>
                <Link
                  className="fact-list__link"
                  href={localePath(locale, "/returns")}
                >
                  {uiText(locale, {
                    en: "Returns & refunds",
                    es: "Devoluciones y reembolsos",
                    fr: "Retours et remboursements",
                  })}
                </Link>
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
