"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  addCartLineAction,
  buyNowAction,
  checkoutAction,
  clearCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/app/actions/cart";
import type {
  CartActionResult,
  CartActionFailure,
  CartView,
  CheckoutActionResult,
} from "@/lib/commerce/cart-types";
import {
  cartErrorMessage,
  isBlockingInventoryWarning,
} from "@/lib/commerce/cart-types";

type CartStatus = "loading" | "ready" | "updating";

interface CartContextValue {
  cart: CartView;
  count: number;
  status: CartStatus;
  error: CartActionFailure["error"] | null;
  checkoutEnabled: boolean;
  refresh: () => Promise<boolean>;
  addItem: (variantId: string, quantity?: number) => Promise<boolean>;
  updateItem: (lineId: string, quantity: number) => Promise<boolean>;
  removeItem: (lineId: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
  checkout: () => Promise<CheckoutActionResult>;
  buyNow: (
    variantId: string,
    quantity?: number,
  ) => Promise<CheckoutActionResult>;
  clearError: () => void;
}

const emptyCart: CartView = {
  lines: [],
  totalQuantity: 0,
  subtotal: { amount: "0.0", currencyCode: "USD" },
  warnings: [],
};

function connectionFailureForLanguage(
  language: "EN" | "ES",
): CartActionFailure {
  return {
    ok: false,
    error: {
      code: "SHOPIFY_ERROR",
      message:
        language === "ES"
          ? "La bolsa no pudo conectarse con Shopify. Inténtalo de nuevo."
          : "The bag could not reach Shopify. Please try again.",
    },
  };
}

const CartContext = createContext<CartContextValue | null>(null);

function cartResultSucceeded(result: CartActionResult) {
  return (
    result.ok &&
    !result.cart.warnings.some((warning) =>
      isBlockingInventoryWarning(warning.code),
    )
  );
}

export function CartProvider({
  children,
  checkoutEnabled,
}: {
  children: React.ReactNode;
  checkoutEnabled: boolean;
}) {
  const pathname = usePathname();
  const locale =
    pathname === "/es-us" || pathname.startsWith("/es-us/")
      ? "es-US"
      : "en-US";
  const language = locale === "es-US" ? "ES" : "EN";
  const connectionFailure = useMemo(
    () => connectionFailureForLanguage(language),
    [language],
  );
  const [cart, setCart] = useState<CartView>(emptyCart);
  const [status, setStatus] = useState<CartStatus>("loading");
  const [error, setError] = useState<CartActionFailure["error"] | null>(null);
  const operationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const requestVersionRef = useRef(0);

  const enqueueOperation = useCallback(
    <T,>(operation: () => Promise<T>): Promise<T> => {
      const pending = operationQueueRef.current.then(operation);
      operationQueueRef.current = pending.then(
        () => undefined,
        () => undefined,
      );
      return pending;
    },
    [],
  );

  const applyResult = useCallback((result: CartActionResult) => {
    if (result.ok) {
      setCart(result.cart);
      const stockWarning = result.cart.warnings.find((warning) =>
        isBlockingInventoryWarning(warning.code),
      );
      if (stockWarning) {
        setError({
          code: "UNAVAILABLE",
          message: cartErrorMessage("UNAVAILABLE", language),
        });
        return false;
      }
      setError(null);
      return true;
    }

    setError(result.error);
    if (result.error.code === "CART_EXPIRED") setCart(emptyCart);
    return false;
  }, [language]);

  const refresh = useCallback(
    () =>
      enqueueOperation(async () => {
        const requestVersion = ++requestVersionRef.current;
        setStatus("loading");
        try {
          const result = await getCartAction(locale);
          return requestVersion === requestVersionRef.current
            ? applyResult(result)
            : cartResultSucceeded(result);
        } catch {
          return requestVersion === requestVersionRef.current
            ? applyResult(connectionFailure)
            : false;
        } finally {
          if (requestVersion === requestVersionRef.current) {
            setStatus("ready");
          }
        }
      }),
    [applyResult, connectionFailure, enqueueOperation, locale],
  );

  useEffect(() => {
    let active = true;
    void enqueueOperation(async () => {
      if (!active) return;
      const requestVersion = ++requestVersionRef.current;
      setStatus("loading");
      try {
        const result = await getCartAction(locale);
        if (active && requestVersion === requestVersionRef.current) {
          applyResult(result);
        }
      } catch {
        if (active && requestVersion === requestVersionRef.current) {
          applyResult(connectionFailure);
        }
      } finally {
        if (active && requestVersion === requestVersionRef.current) {
          setStatus("ready");
        }
      }
    });
    return () => {
      active = false;
    };
  }, [applyResult, connectionFailure, enqueueOperation, locale]);

  const runCartMutation = useCallback(
    (action: () => Promise<CartActionResult>) =>
      enqueueOperation(async () => {
        const requestVersion = ++requestVersionRef.current;
        setStatus("updating");
        try {
          const result = await action();
          return requestVersion === requestVersionRef.current
            ? applyResult(result)
            : cartResultSucceeded(result);
        } catch {
          return requestVersion === requestVersionRef.current
            ? applyResult(connectionFailure)
            : false;
        } finally {
          if (requestVersion === requestVersionRef.current) {
            setStatus("ready");
          }
        }
      }),
    [applyResult, connectionFailure, enqueueOperation],
  );

  const addItem = useCallback(
    (variantId: string, quantity = 1) =>
      runCartMutation(() => addCartLineAction(variantId, quantity, locale)),
    [locale, runCartMutation],
  );
  const updateItem = useCallback(
    (lineId: string, quantity: number) =>
      runCartMutation(() => updateCartLineAction(lineId, quantity, locale)),
    [locale, runCartMutation],
  );
  const removeItem = useCallback(
    (lineId: string) =>
      runCartMutation(() => removeCartLineAction(lineId, locale)),
    [locale, runCartMutation],
  );
  const clear = useCallback(
    () => runCartMutation(() => clearCartAction(locale)),
    [locale, runCartMutation],
  );

  const runCheckoutAction = useCallback(
    (action: () => Promise<CheckoutActionResult>) =>
      enqueueOperation(async () => {
        const requestVersion = ++requestVersionRef.current;
        setStatus("updating");
        try {
          const result = await action();
          if (requestVersion === requestVersionRef.current) {
            if (result.ok) {
              setError(null);
            } else {
              setError(result.error);
            }
          }
          return result;
        } catch {
          if (requestVersion === requestVersionRef.current) {
            setError(connectionFailure.error);
          }
          return connectionFailure;
        } finally {
          if (requestVersion === requestVersionRef.current) {
            setStatus("ready");
          }
        }
      }),
    [connectionFailure, enqueueOperation],
  );
  const checkout = useCallback(
    () => runCheckoutAction(() => checkoutAction(locale)),
    [locale, runCheckoutAction],
  );
  const buyNow = useCallback(
    (variantId: string, quantity = 1) =>
      runCheckoutAction(() => buyNowAction(variantId, quantity, locale)),
    [locale, runCheckoutAction],
  );
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      cart,
      count: cart.totalQuantity,
      status,
      error,
      checkoutEnabled,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
      checkout,
      buyNow,
      clearError,
    }),
    [
      addItem,
      buyNow,
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
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider.");
  return value;
}
