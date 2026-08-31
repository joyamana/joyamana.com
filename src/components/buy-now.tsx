"use client";

import { useId, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { useCart } from "./cart-provider";

export function checkoutDisabledNote(locale: Locale) {
  return uiText(locale, {
    en: "Buy now is temporarily unavailable. You can still add this item to your bag.",
    es: "Comprar ahora no está disponible temporalmente. Aún puedes añadir este artículo a tu bolsa.",
    fr: "L’achat immédiat est temporairement indisponible. Vous pouvez toujours ajouter cet article à votre panier.",
  });
}

export function BuyNow({
  variantId,
  quantity,
  available,
  locale,
}: {
  variantId: string;
  quantity: number;
  available: boolean;
  locale: Locale;
}) {
  const { buyNow, checkoutEnabled, clearError, error, status } = useCart();
  const [failed, setFailed] = useState(false);
  const noteId = useId();
  const errorId = useId();
  const busy = status !== "ready";

  return (
    <div className="purchase-action">
      <button
        aria-busy={busy}
        aria-describedby={`${noteId}${failed ? ` ${errorId}` : ""}`}
        className="button button--secondary button--wide"
        type="button"
        disabled={!available || !checkoutEnabled || busy}
        onClick={async () => {
          clearError();
          setFailed(false);
          const result = await buyNow(variantId, quantity);
          if (!result.ok) {
            setFailed(true);
            return;
          }
          window.location.assign(result.checkoutUrl);
        }}
      >
        {uiText(locale, {
          en: "Buy now",
          es: "Comprar ahora",
          fr: "Acheter maintenant",
        })}
      </button>
      <p className="checkout-note" id={noteId}>
        {checkoutEnabled
          ? uiText(locale, {
              en: "Starts checkout with this item without changing your bag.",
              es: "Inicia el pago con este artículo sin cambiar tu bolsa.",
              fr: "Commence le paiement avec cet article sans modifier votre panier.",
            })
          : checkoutDisabledNote(locale)}
      </p>
      {failed && error ? (
        <p className="action-error" id={errorId} role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
