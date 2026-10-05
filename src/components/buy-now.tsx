"use client";

import { useId, useState } from "react";
import type { EnabledLocale as Locale } from "@/config/locales";
import { uiText } from "@/lib/i18n/text";
import type { CartActionFailure } from "@/lib/commerce/cart-types";
import { useCart } from "./cart-provider";

export function checkoutDisabledNote(locale: Locale) {
  return uiText(locale, {
    zh: "「立即購買」暫時未能使用，你仍可將此商品加入購物袋。",
    en: "Buy now is temporarily unavailable. You can still add this item to your bag.",
    es: "Comprar ahora no está disponible temporalmente. Aún puedes añadir este artículo a tu bolsa.",
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
  const { buyNow, checkoutEnabled, clearError, status } = useCart();
  const [error, setError] = useState<CartActionFailure["error"] | null>(null);
  const noteId = useId();
  const errorId = useId();
  const busy = status !== "ready";

  return (
    <div className="purchase-action">
      <button
        aria-busy={busy}
        aria-describedby={`${noteId}${error ? ` ${errorId}` : ""}`}
        className="button button--secondary button--wide"
        type="button"
        disabled={!available || !checkoutEnabled || busy}
        onClick={async () => {
          clearError();
          setError(null);
          const result = await buyNow(variantId, quantity);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          window.location.assign(result.checkoutUrl);
        }}
      >
        {uiText(locale, {
          zh: "立即購買",
          en: "Buy now",
          es: "Comprar ahora",
        })}
      </button>
      <p className="checkout-note" id={noteId}>
        {checkoutEnabled
          ? uiText(locale, {
              zh: "直接結帳購買此商品，不會改動購物袋。",
              en: "Starts checkout with this item without changing your bag.",
              es: "Inicia el pago con este artículo sin cambiar tu bolsa.",
            })
          : checkoutDisabledNote(locale)}
      </p>
      {error ? (
        <p className="action-error" id={errorId} role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
