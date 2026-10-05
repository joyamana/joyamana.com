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
import { localeForPath } from "@/lib/i18n/locales";
import {
  isEnabledLocale,
  localeRegistry,
  type StorefrontLanguage,
} from "@/config/locales";
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
import { recoverCartMutation } from "@/lib/commerce/cart-recovery";
import {
  cartErrorMessage,
  cartForFailure,
  emptyCartView,
  isBlockingInventoryWarning,
} from "@/lib/commerce/cart-types";

type CartStatus = "loading" | "ready" | "updating";

interface CartContextValue {
  cart: CartView;
  count: number;
  status: CartStatus;
  hasLoaded: boolean;
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

function connectionFailureForLanguage(
  language: StorefrontLanguage,
): CartActionFailure {
  return {
    ok: false,
    error: {
      code: "SHOPIFY_ERROR",
      message: cartErrorMessage("SHOPIFY_ERROR", language),
    },
  };
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  checkoutEnabled,
}: {
  children: React.ReactNode;
  checkoutEnabled: boolean;
}) {
  const pathname = usePathname();
  const pathLocale = localeForPath(pathname);
  const locale = isEnabledLocale(pathLocale) ? pathLocale : "en-US";
  const language = localeRegistry[locale].shopify.language;
  const connectionFailure = useMemo(
    () => connectionFailureForLanguage(language),
    [language],
  );
  const [cart, setCart] = useState<CartView>(emptyCartView);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [status, setStatus] = useState<CartStatus>("loading");
  const [error, setError] = useState<CartActionFailure["error"] | null>(null);
  const operationQueueRef = useRef<Promise<void>>(Promise.resolve());

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

  const applyResult = useCallback(
    (result: CartActionResult) => {
      if (result.ok) {
        setCart(result.cart);
        setHasLoaded(true);
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
      const latest = cartForFailure(result);
      if (latest) {
        setCart(latest);
        setHasLoaded(true);
      }
      return false;
    },
    [language],
  );

  const refresh = useCallback(
    () =>
      enqueueOperation(async () => {
        setStatus("loading");
        try {
          const result = await getCartAction(locale);
          return applyResult(result);
        } catch {
          return applyResult(connectionFailure);
        } finally {
          setStatus("ready");
        }
      }),
    [applyResult, connectionFailure, enqueueOperation, locale],
  );

  useEffect(() => {
    let active = true;
    void enqueueOperation(async () => {
      if (!active) return;
      setStatus("loading");
      try {
        const result = await getCartAction(locale);
        if (active) {
          applyResult(result);
        }
      } catch {
        if (active) {
          applyResult(connectionFailure);
        }
      } finally {
        if (active) {
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
        setStatus("updating");
        try {
          const result = await recoverCartMutation(
            action,
            () => getCartAction(locale),
            connectionFailure,
          );
          return applyResult(result);
        } finally {
          setStatus("ready");
        }
      }),
    [applyResult, connectionFailure, enqueueOperation, locale],
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
    (action: () => Promise<CheckoutActionResult>, updateBag = true) =>
      enqueueOperation(async () => {
        setStatus("updating");
        try {
          const result = await action();
          if (result.ok) setError(null);
          else if (updateBag) applyResult(result);
          else setError(result.error);
          return result;
        } catch {
          setError(connectionFailure.error);
          return connectionFailure;
        } finally {
          setStatus("ready");
        }
      }),
    [applyResult, connectionFailure, enqueueOperation],
  );
  const checkout = useCallback(
    () => runCheckoutAction(() => checkoutAction(locale)),
    [locale, runCheckoutAction],
  );
  const buyNow = useCallback(
    (variantId: string, quantity = 1) =>
      runCheckoutAction(() => buyNowAction(variantId, quantity, locale), false),
    [locale, runCheckoutAction],
  );
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      cart,
      count: cart.totalQuantity,
      status,
      hasLoaded,
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
      hasLoaded,
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
