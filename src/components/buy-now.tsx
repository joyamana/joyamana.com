"use client";

import { useId, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { useCart } from "./cart-provider";

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
              en: "Creates a separate one-item Shopify cart and leaves your bag unchanged.",
              es: "Crea un carrito de Shopify independiente con este artículo y no cambia tu bolsa.",
              fr: "Crée un panier Shopify distinct pour cet article sans modifier votre panier.",
            })
          : uiText(locale, {
              en: "Checkout code is connected, but remains disabled until shipping, returns, tax, legal, and hosted-checkout settings are approved.",
              es: "El código de pago está conectado, pero permanece desactivado hasta aprobar los ajustes de envío, devoluciones, impuestos, aspectos legales y pago alojado.",
              fr: "Le paiement est connecté, mais reste désactivé jusqu’à l’approbation de l’expédition, des retours, des taxes, des paramètres juridiques et du paiement hébergé.",
            })}
      </p>
      {failed && error ? (
        <p className="action-error" id={errorId} role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
