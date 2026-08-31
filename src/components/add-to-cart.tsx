"use client";

import { useId, useState } from "react";
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
  const { addItem, cart, clearError, error, status } = useCart();
  const [added, setAdded] = useState(false);
  const [failed, setFailed] = useState(false);
  const errorId = useId();
  const busy = status !== "ready";
  const quantityInBag = cart.lines
    .filter((line) => line.merchandiseId === variantId)
    .reduce((total, line) => total + line.quantity, 0);
  const canAdd =
    available && quantityInBag + quantity <= maximumQuantity;

  return (
    <div className="purchase-action">
      <button
        aria-busy={busy}
        aria-describedby={failed ? errorId : undefined}
        className="button button--primary button--wide"
        type="button"
        disabled={!canAdd || busy}
        onClick={async () => {
          clearError();
          setFailed(false);
          setAdded(false);
          const success = await addItem(variantId, quantity);
          if (!success) {
            setFailed(true);
            return;
          }
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1600);
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
      {failed && error ? (
        <p className="action-error" id={errorId} role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
