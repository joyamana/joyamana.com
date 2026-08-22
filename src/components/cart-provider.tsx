"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MarketId } from "@/config/markets";

interface CartLine {
  marketId: MarketId;
  productId: string;
  variantId: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  countForMarket: (marketId: MarketId) => number;
  addItem: (productId: string, variantId: string, marketId: MarketId) => void;
  removeItem: (productId: string, variantId: string, marketId: MarketId) => void;
  clear: (marketId: MarketId) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "joya-mana-prototype-cart";
const legacyStorageKey = "bling-omen-prototype-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored =
          window.localStorage.getItem(storageKey) ??
          window.localStorage.getItem(legacyStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as CartLine[];
          setLines(
            parsed.filter(
              (line) =>
                typeof line.productId === "string" &&
                typeof line.variantId === "string" &&
                (line.marketId === "us" || line.marketId === "ca") &&
                typeof line.quantity === "number",
            ),
          );
        }
      } catch {
        // A prototype cart can safely start empty if browser storage is blocked.
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [hydrated, lines]);

  const addItem = useCallback(
    (productId: string, variantId: string, marketId: MarketId) => {
      setLines((current) => {
        const existing = current.find(
          (line) =>
            line.productId === productId &&
            line.variantId === variantId &&
            line.marketId === marketId,
        );
        if (existing) {
          return current.map((line) =>
            line.productId === productId &&
            line.variantId === variantId &&
            line.marketId === marketId
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          );
        }
        return [...current, { marketId, productId, variantId, quantity: 1 }];
      });
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string, variantId: string, marketId: MarketId) => {
      setLines((current) =>
        current.filter(
          (line) =>
            !(
              line.productId === productId &&
              line.variantId === variantId &&
              line.marketId === marketId
            ),
        ),
      );
    },
    [],
  );

  const clear = useCallback(
    (marketId: MarketId) =>
      setLines((current) =>
        current.filter((line) => line.marketId !== marketId),
      ),
    [],
  );
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const countForMarket = useCallback(
    (marketId: MarketId) =>
      lines
        .filter((line) => line.marketId === marketId)
        .reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );
  const value = useMemo(
    () => ({ lines, count, countForMarket, addItem, removeItem, clear }),
    [lines, count, countForMarket, addItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider.");
  return value;
}
