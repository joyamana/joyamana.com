"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CartActionFailure } from "@/lib/commerce/cart-types";
import { useCart } from "./cart-provider";

export function AddToCart({
  variantId,
  quantity,
  available,
  maximumQuantity,
  label,
  unavailableLabel,
  limitReachedLabel,
  addedLabel = "Added",
}: {
  variantId: string;
  quantity: number;
  available: boolean;
  maximumQuantity: number;
  label: string;
  unavailableLabel: string;
  limitReachedLabel: string;
  addedLabel?: string;
}) {
  const { addItem, cart, clearError, status } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<CartActionFailure["error"] | null>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );
  const errorId = useId();
  const busy = status !== "ready";
  const quantityInBag = cart.lines
    .filter((line) => line.merchandiseId === variantId)
    .reduce((total, line) => total + line.quantity, 0);
  const canAdd = available && quantityInBag + quantity <= maximumQuantity;

  return (
    <div className="purchase-action">
      <button
        aria-busy={busy}
        aria-describedby={error ? errorId : undefined}
        className="button button--primary button--wide"
        type="button"
        disabled={!canAdd || busy}
        onClick={async () => {
          clearError();
          setError(null);
          if (addedTimer.current) clearTimeout(addedTimer.current);
          setAdded(false);
          const result = await addItem(variantId, quantity);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setAdded(true);
          addedTimer.current = setTimeout(() => setAdded(false), 1600);
        }}
      >
        {!available
          ? unavailableLabel
          : added
            ? `✓ ${addedLabel}`
            : canAdd
              ? label
              : limitReachedLabel}
      </button>
      {error ? (
        <p className="action-error" id={errorId} role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
