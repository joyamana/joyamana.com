"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  getProductQuantityMaximum,
  parseAvailableProductQuantity,
  isValidProductQuantity,
  isProductVariantPurchasable,
  type Product,
} from "@/lib/commerce/types";
import { formatMoney } from "@/lib/format";
import { getCopy } from "@/lib/i18n/copy";
import type { EnabledLocale as Locale } from "@/config/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  initialProductVariant,
  variantPath,
} from "@/lib/commerce/catalog-browse";
import { catalogCopy } from "@/lib/i18n/catalog-copy";
import { ProductDescription } from "./product-description";
import { ProductGallery } from "./product-gallery";
import { AddToCart } from "./add-to-cart";
import { BuyNow } from "./buy-now";

export function productShippingReturnsSummary(locale: Locale) {
  return uiText(locale, {
    zh: "訂單一般於 1–3 個工作天內備妥。符合條件的退貨可於收貨後 15 天內申請。運費及預計送達時間會在結帳時顯示。",
    en: "Orders are typically prepared within 1–3 business days. Eligible returns may be requested within 15 days of delivery. Rates and delivery estimates are shown at checkout.",
    es: "Los pedidos suelen prepararse en un plazo de 1 a 3 días hábiles. Las devoluciones elegibles pueden solicitarse dentro de los 15 días posteriores a la entrega. Las tarifas y las fechas estimadas de entrega se muestran al pagar.",
  });
}

interface ProductPurchaseProps {
  product: Product;
  locale: Locale;
  initialVariantId?: string | null;
}

export function ProductPurchase(props: ProductPurchaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const returnFocusToVariant = useRef<string | null>(null);
  const variantId =
    props.initialVariantId === undefined
      ? initialProductVariant(props.product)?.id
      : props.initialVariantId;

  useEffect(() => {
    if (!variantId || returnFocusToVariant.current !== variantId) return;
    containerRef.current
      ?.querySelector<HTMLButtonElement>(
        '.variant-picker [aria-pressed="true"]',
      )
      ?.focus({ preventScroll: true });
    returnFocusToVariant.current = null;
  }, [variantId, props.product]);

  return (
    <div ref={containerRef}>
      <ProductPurchaseOption
        key={variantId ?? "invalid"}
        {...props}
        onVariantSelect={(id) => {
          returnFocusToVariant.current = id;
        }}
      />
    </div>
  );
}

function ProductPurchaseOption({
  product,
  locale,
  initialVariantId,
  onVariantSelect,
}: ProductPurchaseProps & { onVariantSelect: (id: string) => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const browseCopy = catalogCopy(locale);
  const initialVariant =
    initialVariantId === undefined
      ? initialProductVariant(product)
      : product.variants.find((variant) => variant.id === initialVariantId);
  const selectionRequired = initialVariantId !== undefined && !initialVariant;
  const [quantityDraft, setQuantityDraft] = useState(
    String(initialVariant?.quantityRule.minimum ?? 1),
  );
  const [quantityTouched, setQuantityTouched] = useState(false);
  const selected = initialVariant ?? product.variants[0];
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
          })}
        </p>
      </section>
    );
  }

  const meaningfulOptions = (
    selectionRequired ? [] : selected.selectedOptions
  ).filter(
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
  const parsedQuantity = parseAvailableProductQuantity(
    quantityDraft,
    quantityRule,
    selected.quantityAvailable,
    selected.currentlyNotInStock,
  );
  const quantityValid = parsedQuantity !== null;
  const quantity = parsedQuantity ?? quantityRule.minimum;
  const quantityError = uiText(locale, {
    zh: "請輸入符合要求的有效數量。",
    en: "Enter a valid quantity within the available limits.",
    es: "Introduce una cantidad válida dentro de los límites disponibles.",
  });
  const inventorySupportsMinimum = maximumQuantity >= quantityRule.minimum;
  const purchasable = isProductVariantPurchasable(product, selected);
  const available = !selectionRequired && !pending && purchasable;
  const unavailableLabel = selectionRequired
    ? browseCopy.choose
    : pending
      ? browseCopy.updatingOption
      : quantityRuleSupported
        ? copy.labels.soldOut
        : uiText(locale, {
            zh: "暫未能網上購買",
            en: "Unavailable online",
            es: "No disponible en línea",
          });

  return (
    <section className="product-detail">
      <ProductGallery
        product={product}
        locale={locale}
        variant={selected}
        initialImageUrl={
          selectionRequired
            ? product.featuredImage?.url
            : initialVariant?.image?.url
        }
      />
      <div className="product-detail__info">
        <p className="eyebrow">
          {uiText(locale, {
            zh: "Joya Mana 系列",
            en: "Joya Mana collection",
            es: "Colección Joya Mana",
          })}
        </p>
        <h1>{product.title}</h1>
        <p className="display-price">
          {selectionRequired
            ? browseCopy.choose
            : formatMoney(selected.price, locale)}
          {!selectionRequired && selected.compareAtPrice ? (
            <del>{formatMoney(selected.compareAtPrice, locale)}</del>
          ) : null}
        </p>
        <ProductDescription
          description={product.description}
          descriptionHtml={product.descriptionHtml}
        />

        {selectionRequired ? (
          <p className="action-error" role="status">
            {browseCopy.invalidVariant}
          </p>
        ) : null}
        {pending ? <p role="status">{browseCopy.updating}</p> : null}

        {product.variants.length > 1 || selectionRequired ? (
          <fieldset className="variant-picker">
            <legend>
              {uiText(locale, {
                zh: "已選款式",
                en: "Selected option",
                es: "Opción seleccionada",
              })}
              :{" "}
              <strong>
                {selectionRequired ? browseCopy.choose : selected.title}
              </strong>
            </legend>
            <div className="variant-picker__grid">
              {product.variants.map((variant) => (
                <button
                  type="button"
                  key={variant.id}
                  className={
                    !selectionRequired && variant.id === selected.id
                      ? "is-selected"
                      : ""
                  }
                  disabled={
                    pending || !isProductVariantPurchasable(product, variant)
                  }
                  onClick={() => {
                    onVariantSelect(variant.id);
                    startTransition(() =>
                      router.push(
                        localePath(locale, variantPath(product, variant)),
                        { scroll: false },
                      ),
                    );
                  }}
                  aria-pressed={
                    !selectionRequired && variant.id === selected.id
                  }
                >
                  <span>{variant.title}</span>
                  <small>{formatMoney(variant.price, locale)}</small>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {!selectionRequired &&
        quantityRuleSupported &&
        inventorySupportsMinimum ? (
          <div className="quantity-picker">
            <span id="product-quantity-label">
              {uiText(locale, {
                zh: "數量",
                en: "Quantity",
                es: "Cantidad",
              })}
            </span>
            <div>
              <button
                type="button"
                aria-label={uiText(locale, {
                  zh: "減少數量",
                  en: "Decrease quantity",
                  es: "Disminuir cantidad",
                })}
                disabled={
                  quantity - quantityRule.increment < quantityRule.minimum
                }
                onClick={() =>
                  setQuantityDraft(
                    String(
                      Math.max(
                        quantityRule.minimum,
                        quantity - quantityRule.increment,
                      ),
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
                aria-invalid={!quantityValid}
                aria-describedby={
                  quantityTouched && !quantityValid
                    ? "product-quantity-error"
                    : undefined
                }
                onChange={(event) => setQuantityDraft(event.target.value)}
                onBlur={() => setQuantityTouched(true)}
                type="number"
                value={quantityDraft}
              />
              <button
                type="button"
                aria-label={uiText(locale, {
                  zh: "增加數量",
                  en: "Increase quantity",
                  es: "Aumentar cantidad",
                })}
                disabled={quantity + quantityRule.increment > maximumQuantity}
                onClick={() =>
                  setQuantityDraft(
                    String(
                      Math.min(
                        maximumQuantity,
                        quantity + quantityRule.increment,
                      ),
                    ),
                  )
                }
              >
                +
              </button>
            </div>
            {quantityTouched && !quantityValid ? (
              <p
                className="action-error"
                id="product-quantity-error"
                role="status"
              >
                {quantityError}
              </p>
            ) : null}
          </div>
        ) : !selectionRequired && !quantityRuleSupported ? (
          <p className="action-error" role="status">
            {uiText(locale, {
              zh: "此數量暫時未能網上訂購。",
              en: "This quantity option is not available online.",
              es: "Esta opción de cantidad no está disponible en línea.",
            })}
          </p>
        ) : null}

        <div className="purchase-actions">
          <AddToCart
            key={`add-to-cart:${selected.id}`}
            variantId={selected.id}
            quantity={quantity}
            available={available && quantityValid}
            maximumQuantity={maximumQuantity}
            label={copy.labels.addToCart}
            unavailableLabel={
              available && !quantityValid
                ? uiText(locale, {
                    zh: "請檢查數量",
                    en: "Check quantity",
                    es: "Revisa la cantidad",
                  })
                : unavailableLabel
            }
            limitReachedLabel={uiText(locale, {
              zh: "購物袋內已達可購買數量上限",
              en: "Maximum quantity is already in your bag",
              es: "La cantidad máxima ya está en tu bolsa",
            })}
            addedLabel={uiText(locale, {
              zh: "已加入",
              en: "Added",
              es: "Agregado",
            })}
          />
          <BuyNow
            key={`buy-now:${selected.id}`}
            variantId={selected.id}
            quantity={quantity}
            available={available && quantityValid}
            locale={locale}
          />
        </div>

        <dl className="fact-list">
          <div>
            <dt>
              {uiText(locale, {
                zh: "供應狀況",
                en: "Availability",
                es: "Disponibilidad",
              })}
            </dt>
            <dd>
              {available
                ? uiText(locale, {
                    zh: "可於美國購買。",
                    en: "Available for purchase in the United States.",
                    es: "Disponible para comprar en Estados Unidos.",
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
          <div>
            <dt>
              {uiText(locale, {
                zh: "送貨及退貨",
                en: "Shipping & returns",
                es: "Envío y devoluciones",
              })}
            </dt>
            <dd>
              <p>{productShippingReturnsSummary(locale)}</p>
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
