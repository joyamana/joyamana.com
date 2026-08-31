"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getProductQuantityMaximum,
  isValidAvailableProductQuantity,
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

function uniqueImages(images: Array<ProductImage | null | undefined>) {
  const seen = new Set<string>();
  return images.filter((image): image is ProductImage => {
    if (!image || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}

export function productShippingReturnsSummary(locale: Locale) {
  return uiText(locale, {
    en: "Orders are typically prepared within 1–3 business days. Eligible returns may be requested within 15 days of delivery. Rates and delivery estimates are shown at checkout.",
    es: "Los pedidos suelen prepararse en un plazo de 1 a 3 días hábiles. Las devoluciones elegibles pueden solicitarse dentro de los 15 días posteriores a la entrega. Las tarifas y las fechas estimadas de entrega se muestran al pagar.",
    fr: "Les modalités d’expédition et de retour seront confirmées avant l’ouverture du marché canadien.",
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
  const maximumQuantity = getProductQuantityMaximum(
    quantityRule,
    selected.quantityAvailable,
    selected.currentlyNotInStock,
  );
  const inventorySupportsMinimum =
    maximumQuantity >= quantityRule.minimum;
  const available =
    product.availableForSale &&
    selected.availableForSale &&
    quantityRuleSupported &&
    inventorySupportsMinimum;
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
              <div className="product-media-unavailable">
                {uiText(locale, {
                  en: "Product image unavailable",
                  es: "Imagen del producto no disponible",
                  fr: "Image du produit indisponible",
                })}
              </div>
            )}
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
          {uiText(locale, {
            en: "Shopify catalog",
            es: "Catálogo de Shopify",
            fr: "Catalogue Shopify",
          })}
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

        {quantityRuleSupported && inventorySupportsMinimum ? (
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
                  if (
                    isValidAvailableProductQuantity(
                      next,
                      quantityRule,
                      selected.quantityAvailable,
                      selected.currentlyNotInStock,
                    )
                  ) {
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
        ) : !quantityRuleSupported ? (
          <p className="action-error" role="status">
            {uiText(locale, {
              en: "This Shopify quantity rule cannot be fulfilled through the online storefront.",
              es: "Esta regla de cantidad de Shopify no se puede completar en la tienda en línea.",
              fr: "Cette règle de quantité Shopify ne peut pas être appliquée sur la boutique en ligne.",
            })}
          </p>
        ) : null}

        <div className="purchase-actions">
          <AddToCart
            variantId={selected.id}
            quantity={quantity}
            available={available}
            maximumQuantity={maximumQuantity}
            label={copy.labels.addToCart}
            unavailableLabel={unavailableLabel}
            limitReachedLabel={uiText(locale, {
              en: "Maximum quantity is already in your bag",
              es: "La cantidad máxima ya está en tu bolsa",
              fr: "La quantité maximale est déjà dans votre panier",
            })}
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
              <dd>{product.facts.care}</dd>
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
                {productShippingReturnsSummary(locale)}
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
