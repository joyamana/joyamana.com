"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  getLowStockCount,
  getProductQuantityMaximum,
  isValidAvailableProductQuantity,
  isValidProductQuantity,
  type Product,
  type ProductImage,
} from "@/lib/commerce/types";
import { formatMoney } from "@/lib/format";
import { productCategoryDefinitionForTaxonomyId } from "@/config/catalog";
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
    zh: "訂單一般於 1–3 個工作天內備妥。符合條件的退貨可於收貨後 15 天內申請。運費及預計送達時間會在結帳時顯示。",
    en: "Orders are typically prepared within 1–3 business days. Eligible returns may be requested within 15 days of delivery. Rates and delivery estimates are shown at checkout.",
    es: "Los pedidos suelen prepararse en un plazo de 1 a 3 días hábiles. Las devoluciones elegibles pueden solicitarse dentro de los 15 días posteriores a la entrega. Las tarifas y las fechas estimadas de entrega se muestran al pagar.",
    fr: "Les modalités d’expédition et de retour seront confirmées avant l’ouverture du marché canadien.",
  });
}

export function lowStockMessage(locale: Locale, count: number) {
  return uiText(locale, {
    zh: `庫存不多 · 僅餘 ${count} 件`,
    en: `Low stock · Only ${count} left`,
    es:
      count === 1
        ? "Pocas unidades · Solo queda 1"
        : `Pocas unidades · Solo quedan ${count}`,
    fr:
      count === 1
        ? "Stock faible · Plus qu’un article"
        : `Stock faible · Plus que ${count} articles`,
  });
}

export function ProductPurchase({
  product,
  locale,
  description,
}: {
  product: Omit<Product, "description" | "descriptionHtml">;
  locale: Locale;
  description: ReactNode;
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
            zh: "此商品暫時未能購買。",
            en: "This product is not currently available for purchase.",
            es: "Este producto no está disponible para comprar en este momento.",
            fr: "Ce produit n’est pas disponible à l’achat pour le moment.",
          })}
        </p>
        {description}
      </section>
    );
  }

  const meaningfulOptions = selected.selectedOptions.filter(
    (option) =>
      option.name.toLowerCase() !== "title" ||
      option.value.toLowerCase() !== "default title",
  );
  const facts = { ...product.facts, ...selected.facts };
  const isBracelet = product.category
    ? productCategoryDefinitionForTaxonomyId(product.category.id)?.handle === "bracelets"
    : false;
  const hasSizeFacts = isBracelet
    ? facts.dimensions && facts.fit
    : facts.dimensions || facts.fit;
  const hasKeyFacts = Boolean(facts.material && facts.treatment && hasSizeFacts);
  const hasVisibleFacts = Boolean(
    facts.material ||
    facts.dimensions ||
    facts.fit ||
    facts.treatment ||
    facts.imageRepresentation ||
    (product.variants.length === 1 && meaningfulOptions.length),
  );
  const detailLabel = uiText(locale, {
    zh: "商品資料",
    en: "Product details",
    es: "Detalles del producto",
    fr: "Détails du produit",
  });
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
  const lowStockCount = available
    ? getLowStockCount(product.model, selected)
    : null;
  const unavailableLabel = quantityRuleSupported
    ? copy.labels.soldOut
    : uiText(locale, {
        zh: "暫未能網上購買",
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
                preload
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            ) : (
              <div className="product-media-unavailable">
                {uiText(locale, {
                  zh: "暫無商品圖片",
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
                zh: "商品圖片",
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
                    zh: "查看圖片",
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
        <h1>{product.title}</h1>
        <p className="display-price">
          {formatMoney(selected.price, locale)}
          {selected.compareAtPrice ? (
            <del>{formatMoney(selected.compareAtPrice, locale)}</del>
          ) : null}
        </p>
        {facts.summary ? <p className="product-summary">{facts.summary}</p> : null}
        {!hasKeyFacts ? (
          <>
            <a className="product-purchase-jump text-link" href="#product-purchase-options">
              {uiText(locale, {
                zh: "查看選購選項",
                en: "View purchase options",
                es: "Ver opciones de compra",
                fr: "Voir les options d’achat",
              })}
            </a>
            {description}
          </>
        ) : null}

        <div
          className="product-purchase-options"
          id="product-purchase-options"
          tabIndex={-1}
        >
          {product.variants.length > 1 ? (
            <fieldset className="variant-picker">
              <legend>
                {uiText(locale, {
                  zh: "已選款式",
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

          {hasVisibleFacts ? <dl className="product-key-facts">
            {product.variants.length === 1 && meaningfulOptions.length ? (
              <div>
                <dt>{copy.labels.details}</dt>
                <dd>{meaningfulOptions.map((option) => `${option.name}: ${option.value}`).join(" · ")}</dd>
              </div>
            ) : null}
            {facts.material ? (
              <div>
                <dt>{uiText(locale, { zh: "材質", en: "Material", es: "Material", fr: "Matière" })}</dt>
                <dd>{facts.material}</dd>
              </div>
            ) : null}
            {facts.dimensions ? (
              <div>
                <dt>{uiText(locale, { zh: "尺寸", en: "Dimensions", es: "Medidas", fr: "Dimensions" })}</dt>
                <dd>{facts.dimensions}</dd>
              </div>
            ) : null}
            {facts.fit ? (
              <div>
                <dt>{uiText(locale, { zh: "佩戴尺寸", en: "Fit", es: "Ajuste", fr: "Taille" })}</dt>
                <dd>{facts.fit}</dd>
              </div>
            ) : null}
            {facts.treatment ? (
              <div>
                <dt>{uiText(locale, { zh: "處理方式", en: "Treatment", es: "Tratamiento", fr: "Traitement" })}</dt>
                <dd>{facts.treatment}</dd>
              </div>
            ) : null}
            {facts.imageRepresentation ? (
              <div>
                <dt>{uiText(locale, { zh: "商品圖片", en: "Product photography", es: "Fotografía del producto", fr: "Photographie du produit" })}</dt>
                <dd>{facts.imageRepresentation === "exact-item"
                  ? uiText(locale, { zh: "你收到的將是圖片中的實物。", en: "You will receive the exact piece shown.", es: "Recibirás la pieza exacta que se muestra.", fr: "Vous recevrez la pièce exacte présentée." })
                  : uiText(locale, { zh: "圖片為同款商品示例；你收到的商品可能有天然差異。", en: "Images show a representative piece; natural variations may occur in the item you receive.", es: "Las imágenes muestran una pieza representativa; la que recibas puede presentar variaciones naturales.", fr: "Les images montrent une pièce représentative ; celle que vous recevrez peut présenter des variations naturelles." })}</dd>
              </div>
            ) : null}
          </dl> : null}

          {quantityRuleSupported && inventorySupportsMinimum ? (
            <div className="quantity-picker">
              <span id="product-quantity-label">
                {uiText(locale, {
                  zh: "數量",
                  en: "Quantity",
                  es: "Cantidad",
                  fr: "Quantité",
                })}
              </span>
              <div>
                <button
                  type="button"
                  aria-label={uiText(locale, {
                    zh: "減少數量",
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
                    zh: "增加數量",
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
                zh: "此數量暫時未能網上訂購。",
                en: "This quantity option is not available online.",
                es: "Esta opción de cantidad no está disponible en línea.",
                fr: "Cette option de quantité n’est pas disponible en ligne.",
              })}
            </p>
          ) : null}

          {lowStockCount !== null ? (
            <p className="low-stock-note" aria-live="polite">
              {lowStockMessage(locale, lowStockCount)}
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
                zh: "購物袋內已達可購買數量上限",
                en: "Maximum quantity is already in your bag",
                es: "La cantidad máxima ya está en tu bolsa",
                fr: "La quantité maximale est déjà dans votre panier",
              })}
              addedLabel={uiText(locale, {
                zh: "已加入",
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
        </div>

        <dl className="fact-list product-service-facts">
          <div>
            <dt>
              {uiText(locale, {
                zh: "送貨及退貨",
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
                    zh: "退貨及退款",
                    en: "Returns & refunds",
                    es: "Devoluciones y reembolsos",
                    fr: "Retours et remboursements",
                  })}
                </Link>
              </span>
            </dd>
          </div>
          {facts.packageContents ? (
            <div>
              <dt>{uiText(locale, { zh: "隨附內容", en: "Included with your piece", es: "Incluido con tu pieza", fr: "Inclus avec votre pièce" })}</dt>
              <dd>{facts.packageContents}</dd>
            </div>
          ) : null}
          {facts.care ? (
            <div>
              <dt>{copy.labels.care}</dt>
              <dd>{facts.care}</dd>
            </div>
          ) : null}
        </dl>
        {hasKeyFacts ? (
          <section className="product-long-description" aria-labelledby="product-details-heading">
            <h2 id="product-details-heading">{detailLabel}</h2>
            {description}
          </section>
        ) : null}
        {facts.relatedContent?.length ? (
          <nav className="product-related-content" aria-label={uiText(locale, { zh: "相關閱讀", en: "Related reading", es: "Lecturas relacionadas", fr: "Lectures connexes" })}>
            {facts.relatedContent.map((entry) => (
              <Link className="text-link" key={entry.id} href={localePath(locale, entry.path)}>{entry.title}</Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
