import type { CurrencyCode, ProductQuantityRule } from "./types";
import type { StorefrontLanguage } from "@/config/locales";

export interface CartMoney {
  amount: string;
  currencyCode: CurrencyCode;
}

export interface CartImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

/**
 * Safe browser-facing representation of a Shopify Cart line.
 *
 * A line ID and merchandise ID are required for subsequent cart mutations.
 * The secret Cart ID and hosted Checkout URL are deliberately absent.
 */
export interface CartLineView {
  id: string;
  merchandiseId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image: CartImage | null;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  quantityAvailable: number | null;
  quantity: number;
  quantityRule: ProductQuantityRule;
  unitPrice: CartMoney;
  totalPrice: CartMoney;
  hasLineDiscount: boolean;
}

export interface CartWarningView {
  code: string;
  message: string;
}

export function isBlockingInventoryWarning(code: string) {
  return /(?:NOT_ENOUGH_STOCK|OUT_OF_STOCK|UNAVAILABLE|INVENTORY)/i.test(code);
}

/** Public Cart state. Never add a Cart ID or Checkout URL to this type. */
export interface CartView {
  lines: CartLineView[];
  totalQuantity: number;
  subtotal: CartMoney;
  warnings: CartWarningView[];
}

export type CartActionErrorCode =
  | "CART_EXPIRED"
  | "CART_NOT_FOUND"
  | "CHECKOUT_DISABLED"
  | "CHECKOUT_URL_INVALID"
  | "EMPTY_CART"
  | "INVALID_INPUT"
  | "INVALID_QUANTITY"
  | "SHOPIFY_ERROR"
  | "UNAVAILABLE";

const cartErrorMessages: Record<
  StorefrontLanguage,
  Record<CartActionErrorCode, string>
> = {
  ZH_TW: {
    CART_EXPIRED: "購物袋已過期，請重新加入商品。",
    CART_NOT_FOUND: "未能找到你的購物袋。",
    CHECKOUT_DISABLED: "結帳服務暫時未能使用。",
    CHECKOUT_URL_INVALID: "結帳服務暫時未能使用，請再試一次。",
    EMPTY_CART: "購物袋內暫無商品。",
    INVALID_INPUT: "購物袋請求無效，請重新操作。",
    INVALID_QUANTITY: "請選擇有效的整數數量。",
    SHOPIFY_ERROR: "未能更新購物袋，請再試一次。",
    UNAVAILABLE: "此商品目前無法提供所選數量。",
  },
  EN: {
    CART_EXPIRED: "Your bag expired. Add the item again to start a new bag.",
    CART_NOT_FOUND: "Your bag could not be found.",
    CHECKOUT_DISABLED: "Checkout is not available yet.",
    CHECKOUT_URL_INVALID: "Checkout is temporarily unavailable. Please try again.",
    EMPTY_CART: "Your bag is empty.",
    INVALID_INPUT: "The cart request was invalid.",
    INVALID_QUANTITY: "Choose a valid whole-number quantity.",
    SHOPIFY_ERROR: "Your bag could not be updated. Please try again.",
    UNAVAILABLE: "This item is no longer available in the requested quantity.",
  },
  ES: {
    CART_EXPIRED:
      "Tu bolsa venció. Añade el artículo de nuevo para comenzar otra.",
    CART_NOT_FOUND: "No se pudo encontrar tu bolsa.",
    CHECKOUT_DISABLED: "El pago aún no está disponible.",
    CHECKOUT_URL_INVALID:
      "El pago no está disponible temporalmente. Inténtalo de nuevo.",
    EMPTY_CART: "Tu bolsa está vacía.",
    INVALID_INPUT: "La solicitud de la bolsa no es válida.",
    INVALID_QUANTITY: "Elige una cantidad válida en números enteros.",
    SHOPIFY_ERROR: "No se pudo actualizar tu bolsa. Inténtalo de nuevo.",
    UNAVAILABLE:
      "Este artículo ya no está disponible en la cantidad solicitada.",
  },
};

export function cartErrorMessage(
  code: CartActionErrorCode,
  language: StorefrontLanguage = "EN",
) {
  return cartErrorMessages[language][code];
}

export interface CartActionFailure {
  ok: false;
  error: {
    code: CartActionErrorCode;
    message: string;
  };
}

export type CartActionResult =
  | { ok: true; cart: CartView }
  | CartActionFailure;

/** The URL is returned only after an explicit Checkout or Buy-now action. */
export type CheckoutActionResult =
  | { ok: true; checkoutUrl: string }
  | CartActionFailure;
