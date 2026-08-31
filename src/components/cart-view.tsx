"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  cartErrorMessage,
  isBlockingInventoryWarning,
} from "@/lib/commerce/cart-types";
import { isValidAvailableProductQuantity } from "@/lib/commerce/types";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { useCart } from "./cart-provider";

export function CartView({ locale }: { locale: Locale }) {
  const {
    cart,
    checkout,
    checkoutEnabled,
    clear,
    clearError,
    error,
    refresh,
    removeItem,
    status,
    updateItem,
  } = useCart();
  const [checkoutFailed, setCheckoutFailed] = useState(false);
  const checkoutErrorId = useId();
  const busy = status !== "ready";

  if (status === "loading") {
    return (
      <div className="empty-state" aria-live="polite">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Your selection",
            es: "Tu selección",
            fr: "Votre sélection",
          })}
        </p>
        <h1>
          {uiText(locale, {
            en: "Loading your bag…",
            es: "Cargando tu bolsa…",
            fr: "Chargement de votre panier…",
          })}
        </h1>
      </div>
    );
  }

  if (!cart.lines.length) {
    return (
      <div className="empty-state">
        <p className="eyebrow">
          {uiText(locale, {
            en: "Your selection",
            es: "Tu selección",
            fr: "Votre sélection",
          })}
        </p>
        <h1>
          {uiText(locale, {
            en: "Your bag is empty.",
            es: "Tu bolsa está vacía.",
            fr: "Votre panier est vide.",
          })}
        </h1>
        {error ? (
          <div className="cart-feedback" role="alert">
            <p>{error.message}</p>
            <button className="text-button" type="button" onClick={() => refresh()}>
              {uiText(locale, {
                en: "Try again",
                es: "Intentar de nuevo",
                fr: "Réessayer",
              })}
            </button>
          </div>
        ) : (
          <p>
            {uiText(locale, {
              en: "Items added here are saved for this browser session.",
              es: "Los artículos añadidos aquí se guardan durante esta sesión del navegador.",
              fr: "Les articles ajoutés ici sont enregistrés pour cette session de navigation.",
            })}
          </p>
        )}
        <Link
          className="button button--primary"
          href={localePath(locale, "/shop")}
        >
          {uiText(locale, {
            en: "Explore products",
            es: "Explorar productos",
            fr: "Explorer les produits",
          })}
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section aria-label={uiText(locale, { en: "Bag items", es: "Artículos de la bolsa", fr: "Articles du panier" })}>
        <header className="cart-heading">
          <p className="eyebrow">
            {uiText(locale, {
              en: "Your selection",
              es: "Tu selección",
              fr: "Votre sélection",
            })}
          </p>
          <h1>
            {uiText(locale, {
              en: "Your bag",
              es: "Tu bolsa",
              fr: "Votre panier",
            })}
          </h1>
        </header>
        {cart.warnings.map((warning) => (
          <p className="cart-feedback" key={`${warning.code}:${warning.message}`} role="status">
            {isBlockingInventoryWarning(warning.code)
              ? cartErrorMessage(
                  "UNAVAILABLE",
                  locale === "es-US" ? "ES" : "EN",
                )
              : warning.message}
          </p>
        ))}
        {error ? (
          <p className="cart-feedback" role="alert">
            {error.message}
          </p>
        ) : null}
        {cart.lines.map((line) => {
          const decreaseQuantity =
            line.quantity - line.quantityRule.increment;
          const increaseQuantity =
            line.quantity + line.quantityRule.increment;

          return (
          <article className="cart-line" key={line.id}>
            <Link
              className="cart-line__art"
              href={localePath(locale, `/products/${line.productHandle}`)}
            >
              {line.image ? (
                <Image
                  src={line.image.url}
                  alt={line.image.altText || line.productTitle}
                  width={line.image.width ?? 180}
                  height={line.image.height ?? 180}
                  sizes="150px"
                />
              ) : (
                <span className="product-media-unavailable product-media-unavailable--cart">
                  {uiText(locale, {
                    en: "Image unavailable",
                    es: "Imagen no disponible",
                    fr: "Image indisponible",
                  })}
                </span>
              )}
            </Link>
            <div>
              <p className="microcopy">
                {line.availableForSale
                  ? uiText(locale, {
                      en: "Available",
                      es: "Disponible",
                      fr: "Disponible",
                    })
                  : uiText(locale, {
                      en: "Review availability",
                      es: "Revisar disponibilidad",
                      fr: "Vérifier la disponibilité",
                    })}
              </p>
              <h2>
                <Link href={localePath(locale, `/products/${line.productHandle}`)}>
                  {line.productTitle}
                </Link>
              </h2>
              {line.variantTitle !== "Default Title" ? (
                <p>{line.variantTitle}</p>
              ) : null}
              <p>
                {formatPrice(
                  line.totalPrice.amount,
                  locale,
                  line.totalPrice.currencyCode,
                )}
              </p>
              <div className="cart-line__actions">
                <div className="cart-quantity" aria-label={uiText(locale, { en: "Quantity", es: "Cantidad", fr: "Quantité" })}>
                  <button
                    type="button"
                    disabled={
                      busy ||
                      !isValidAvailableProductQuantity(
                        decreaseQuantity,
                        line.quantityRule,
                        line.quantityAvailable,
                        line.currentlyNotInStock,
                      )
                    }
                    aria-label={uiText(locale, { en: "Decrease quantity", es: "Disminuir cantidad", fr: "Diminuer la quantité" })}
                    onClick={() => updateItem(line.id, decreaseQuantity)}
                  >
                    −
                  </button>
                  <span aria-live="polite">{line.quantity}</span>
                  <button
                    type="button"
                    disabled={
                      busy ||
                      !isValidAvailableProductQuantity(
                        increaseQuantity,
                        line.quantityRule,
                        line.quantityAvailable,
                        line.currentlyNotInStock,
                      )
                    }
                    aria-label={uiText(locale, { en: "Increase quantity", es: "Aumentar cantidad", fr: "Augmenter la quantité" })}
                    onClick={() => updateItem(line.id, increaseQuantity)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-button"
                  type="button"
                  disabled={busy}
                  onClick={() => removeItem(line.id)}
                >
                  {uiText(locale, {
                    en: "Remove",
                    es: "Eliminar",
                    fr: "Retirer",
                  })}
                </button>
              </div>
            </div>
          </article>
          );
        })}
      </section>
      <aside className="cart-summary">
        <p className="eyebrow">
          {uiText(locale, { en: "Summary", es: "Resumen", fr: "Résumé" })}
        </p>
        <h2>
          {uiText(locale, {
            en: "Subtotal",
            es: "Subtotal",
            fr: "Sous-total",
          })}{" "}
          {formatPrice(
            cart.subtotal.amount,
            locale,
            cart.subtotal.currencyCode,
          )}
        </h2>
        <p>
          {uiText(locale, {
            en: "Discounts, tax, shipping, and the final total are confirmed at checkout.",
            es: "Los descuentos, los impuestos, el envío y el total final se confirman al pagar.",
            fr: "Les réductions, taxes, frais d’expédition et le total final sont confirmés au moment du paiement.",
          })}
        </p>
        <button
          aria-describedby={checkoutFailed ? checkoutErrorId : undefined}
          className="button button--primary button--wide"
          disabled={!checkoutEnabled || busy}
          onClick={async () => {
            clearError();
            setCheckoutFailed(false);
            const result = await checkout();
            if (!result.ok) {
              setCheckoutFailed(true);
              return;
            }
            window.location.assign(result.checkoutUrl);
          }}
          type="button"
        >
          {checkoutEnabled
            ? uiText(locale, {
                en: "Checkout",
                es: "Ir al pago",
                fr: "Passer au paiement",
              })
            : uiText(locale, {
                en: "Checkout unavailable",
                es: "Pago no disponible",
                fr: "Paiement indisponible",
              })}
        </button>
        {!checkoutEnabled ? (
          <p className="checkout-note">
            {uiText(locale, {
              en: "Checkout is temporarily unavailable.",
              es: "El pago no está disponible temporalmente.",
              fr: "Le paiement est temporairement indisponible.",
            })}
          </p>
        ) : null}
        {checkoutFailed && error ? (
          <p className="action-error" id={checkoutErrorId} role="alert">
            {error.message}
          </p>
        ) : null}
        <button
          className="text-button"
          type="button"
          disabled={busy}
          onClick={() => clear()}
        >
          {uiText(locale, {
            en: "Clear bag",
            es: "Vaciar bolsa",
            fr: "Vider le panier",
          })}
        </button>
      </aside>
    </div>
  );
}
