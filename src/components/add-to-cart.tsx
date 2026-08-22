"use client";

import { useState } from "react";
import type { MarketId } from "@/config/markets";
import { useCart } from "./cart-provider";

export function AddToCart({
  productId,
  variantId,
  marketId,
  available,
  label,
  unavailableLabel,
}: {
  productId: string;
  variantId: string;
  marketId: MarketId;
  available: boolean;
  label: string;
  unavailableLabel: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className="button button--primary button--wide"
      type="button"
      disabled={!available}
      onClick={() => {
        addItem(productId, variantId, marketId);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {!available ? unavailableLabel : added ? "✓" : label}
    </button>
  );
}
