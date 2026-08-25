"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  STOREFRONT_MAX_QUANTITY,
  isValidProductQuantity,
  type Product,
  type ProductImage,
} from "@/lib/commerce/types";
import { formatMoney } from "@/lib/format";
import { getCopy } from "@/lib/i18n/copy";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { AddToCart } from "./add-to-cart";
import { BuyNow } from "./buy-now";
import { ProductArt } from "./product-art";

function uniqueImages(images: Array<ProductImage | null | undefined>) {
  const seen = new Set<string>();
  return images.filter((image): image is ProductImage => {
    if (!image || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}

export function ProductPurchase({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const initialVariant =
    product.variants.find((variant) => variant.availableForSale) ??
    product.variants[0];
  const [selectedId, setSelectedId] = useState(initialVariant?.id ?? "");
  const [quantity, setQuantity] = useState(
    initialVariant?.quantityRule.minimum ?? 1,
  );
  const selected =
    product.variants.find((variant) => variant.id === selectedId) ??
    product.variants[0];
  const galleryImages = useMemo(
    () =>
      uniqueImages([
        selected?.image,
        ...product.images,
        ...product.variants.map((variant) => variant.image),
        product.featuredImage,
      ]),
    [product.featuredImage, product.images, product.variants, selected?.image],
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState(
    galleryImages[0]?.url ?? "",
  );
  const activeImage =
    galleryImages.find((image) => image.url === selectedImageUrl) ??
    galleryImages[0];
  const copy = getCopy(locale);

  if (!selected) {
    return (
      <section className="empty-state">
        <h1>{product.title}</h1>
        <p>
          {uiText(locale, {
            en: "This Shopify product does not have a purchasable variant.",
            es: "Este producto de Shopify no tiene una variante disponible para comprar.",
            fr: "Ce produit Shopify n’a pas de variante pouvant être achetée.",
          })}
        </p>
      </section>
    );
  }

  const meaningfulOptions = selected.selectedOptions.filter(
    (option) =>
      option.name.toLowerCase() !== "title" ||
      option.value.toLowerCase() !== "default title",
  );
  const quantityRule = selected.quantityRule;
  const quantityRuleSupported = isValidProductQuantity(
    quantityRule.minimum,
    quantityRule,
  );
  const available =
    product.availableForSale &&
    selected.availableForSale &&
    quantityRuleSupported;
  const maximumQuantity = Math.min(
    quantityRule.maximum ?? STOREFRONT_MAX_QUANTITY,
    STOREFRONT_MAX_QUANTITY,
  );
  const unavailableLabel = quantityRuleSupported
    ? copy.labels.soldOut
    : uiText(locale, {
        en: "Unavailable online",
        es: "No disponible en línea",
        fr: "Indisponible en ligne",
      });

  return (
    <section className="product-detail">
      <div className="product-gallery">
        <div className="product-gallery__sticky">
          <div className="product-gallery__main">
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.altText || product.title}
                width={activeImage.width}
                height={activeImage.height}
                priority
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            ) : (
              <ProductArt palette="pearl" />
            )}
            {product.source === "mock" ? (
              <span className="sample-stamp">
                {uiText(locale, {
                  en: "Provided concept image",
                  es: "Imagen conceptual proporcionada",
                  fr: "Image conceptuelle fournie",
                })}
              </span>
            ) : null}
          </div>
          {galleryImages.length > 1 ? (
            <div
              className="product-gallery__thumbs"
              aria-label={uiText(locale, {
                en: "Product images",
                es: "Imágenes del producto",
                fr: "Images du produit",
              })}
            >
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image.url}
                  className={image.url === activeImage?.url ? "is-selected" : ""}
                  onClick={() => setSelectedImageUrl(image.url)}
                  aria-label={`${uiText(locale, {
                    en: "View image",
                    es: "Ver imagen",
                    fr: "Voir l’image",
                  })} ${index + 1}`}
                  aria-pressed={image.url === activeImage?.url}
                >
                  <Image
                    src={image.url}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="product-detail__info">
        <p className="eyebrow">
          {product.source === "shopify"
            ? uiText(locale, {
                en: "Live Shopify catalog",
                es: "Catálogo activo de Shopify",
                fr: "Catalogue Shopify actif",
              })
            : copy.labels.developmentSample}
        </p>
        <h1>{product.title}</h1>
        <p className="display-price">
          {formatMoney(selected.price, locale)}
          {selected.compareAtPrice ? (
            <del>{formatMoney(selected.compareAtPrice, locale)}</del>
          ) : null}
        </p>
        <div className="product-description">
          {product.description
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>

        {product.variants.length > 1 ? (
          <fieldset className="variant-picker">
            <legend>
              {uiText(locale, {
                en: "Selected option",
                es: "Opción seleccionada",
                fr: "Option sélectionnée",
              })}
              : <strong>{selected.title}</strong>
            </legend>
            <div className="variant-picker__grid">
              {product.variants.map((variant) => (
                <button
                  type="button"
                  key={variant.id}
                  className={variant.id === selected.id ? "is-selected" : ""}
                  disabled={!variant.availableForSale}
                  onClick={() => {
                    setSelectedId(variant.id);
                    setQuantity(variant.quantityRule.minimum);
                    if (variant.image) setSelectedImageUrl(variant.image.url);
                  }}
                  aria-pressed={variant.id === selected.id}
                >
                  <span>{variant.title}</span>
                  <small>{formatMoney(variant.price, locale)}</small>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {quantityRuleSupported ? (
          <div className="quantity-picker">
            <span id="product-quantity-label">
              {uiText(locale, {
                en: "Quantity",
                es: "Cantidad",
                fr: "Quantité",
              })}
            </span>
            <div>
              <button
                type="button"
                aria-label={uiText(locale, {
                  en: "Decrease quantity",
                  es: "Disminuir cantidad",
                  fr: "Diminuer la quantité",
                })}
                disabled={
                  quantity - quantityRule.increment < quantityRule.minimum
                }
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(
                      quantityRule.minimum,
                      current - quantityRule.increment,
                    ),
                  )
                }
              >
                −
              </button>
              <input
                aria-labelledby="product-quantity-label"
                inputMode="numeric"
                min={quantityRule.minimum}
                max={maximumQuantity}
                step={quantityRule.increment}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (isValidProductQuantity(next, quantityRule)) {
                    setQuantity(next);
                  }
                }}
                type="number"
                value={quantity}
              />
              <button
                type="button"
                aria-label={uiText(locale, {
                  en: "Increase quantity",
                  es: "Aumentar cantidad",
                  fr: "Augmenter la quantité",
                })}
                disabled={quantity + quantityRule.increment > maximumQuantity}
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(
                      maximumQuantity,
                      current + quantityRule.increment,
                    ),
                  )
                }
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <p className="action-error" role="status">
            {uiText(locale, {
              en: "This Shopify quantity rule cannot be fulfilled through the online storefront.",
              es: "Esta regla de cantidad de Shopify no se puede completar en la tienda en línea.",
              fr: "Cette règle de quantité Shopify ne peut pas être appliquée sur la boutique en ligne.",
            })}
          </p>
        )}

        <div className="purchase-actions">
          <AddToCart
            variantId={selected.id}
            quantity={quantity}
            available={available}
            label={copy.labels.addToCart}
            unavailableLabel={unavailableLabel}
            addedLabel={uiText(locale, {
              en: "Added",
              es: "Agregado",
              fr: "Ajouté",
            })}
          />
          <BuyNow
            variantId={selected.id}
            quantity={quantity}
            available={available}
            locale={locale}
          />
        </div>

        <dl className="fact-list">
          <div>
            <dt>
              {uiText(locale, {
                en: "Availability",
                es: "Disponibilidad",
                fr: "Disponibilité",
              })}
            </dt>
            <dd>
              {available
                ? uiText(locale, {
                    en: "Available for sale in the US Shopify catalog.",
                    es: "Disponible para la venta en el catálogo de Shopify de EE. UU.",
                    fr: "Disponible à la vente dans le catalogue Shopify des États-Unis.",
                  })
                : unavailableLabel}
            </dd>
          </div>
          {meaningfulOptions.length ? (
            <div>
              <dt>{copy.labels.details}</dt>
              <dd>
                {meaningfulOptions
                  .map((option) => `${option.name}: ${option.value}`)
                  .join(" · ")}
              </dd>
            </div>
          ) : null}
          {product.facts?.material ? (
            <div>
              <dt>{copy.labels.details}</dt>
              <dd>{product.facts.material}</dd>
            </div>
          ) : null}
          {product.facts?.dimensions ? (
            <div>
              <dt>
                {uiText(locale, {
                  en: "Dimensions",
                  es: "Medidas",
                  fr: "Dimensions",
                })}
              </dt>
              <dd>{product.facts.dimensions}</dd>
            </div>
          ) : null}
          {product.facts?.care ? (
            <div>
              <dt>{copy.labels.care}</dt>
              <dd>
                <p>{product.facts.care}</p>
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
          ) : null}
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
                  en: "Rates, timing, fulfillment origin, and return terms are pending approval and will be confirmed in Shopify Checkout.",
                  es: "Las tarifas, los plazos, el origen del envío y las condiciones de devolución están pendientes de aprobación y se confirmarán en el pago de Shopify.",
                  fr: "Les tarifs, délais, l’origine d’expédition et les conditions de retour sont en attente d’approbation et seront confirmés dans Shopify Checkout.",
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
