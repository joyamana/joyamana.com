"use server";

import { cookies } from "next/headers";
import type {
  CartActionFailure,
  CartActionResult,
  CheckoutActionResult,
} from "@/lib/commerce/cart-types";
import { isBlockingInventoryWarning } from "@/lib/commerce/cart-types";
import {
  ShopifyCartError,
  addShopifyCartLineWithRecovery,
  assertValidCartQuantity,
  clearShopifyCart,
  createShopifyCart,
  emptyCartView,
  getShopifyCart,
  isShopifyCartId,
  isShopifyCartLineId,
  isShopifyVariantId,
  mapShopifyCart,
  removeShopifyCartLines,
  toSafeCartFailure,
  updateShopifyCartLines,
  validateCheckoutUrl,
  type ShopifyCartLanguage,
} from "@/lib/commerce/shopify-cart";

const cartCookieName = "joya-mana-shopify-cart-us";
const cartCookieMaxAge = 60 * 60 * 24 * 10;

function isCheckoutEnabled() {
  return process.env.SHOPIFY_CHECKOUT_ENABLED === "true";
}

function safeLanguageForLocale(locale: string): ShopifyCartLanguage {
  return locale === "es-US" ? "ES" : "EN";
}

function failure(
  code: CartActionFailure["error"]["code"],
  language: ShopifyCartLanguage,
): CartActionFailure {
  return toSafeCartFailure(new ShopifyCartError(code), language);
}

function requireCheckout() {
  if (!isCheckoutEnabled()) {
    throw new ShopifyCartError("CHECKOUT_DISABLED");
  }
}

function languageForLocale(locale: string): ShopifyCartLanguage {
  if (locale === "en-US") return "EN";
  if (locale === "es-US") return "ES";
  throw new ShopifyCartError("INVALID_INPUT");
}

async function getCartCookie() {
  const store = await cookies();
  const value = store.get(cartCookieName)?.value ?? null;
  return { store, value };
}

async function requireCartCookie() {
  const cookie = await getCartCookie();
  if (!cookie.value || !isShopifyCartId(cookie.value)) {
    if (cookie.value) cookie.store.delete(cartCookieName);
    throw new ShopifyCartError("CART_NOT_FOUND");
  }
  return { store: cookie.store, cartId: cookie.value };
}

function setCartCookie(
  store: Awaited<ReturnType<typeof cookies>>,
  cartId: string,
) {
  if (!isShopifyCartId(cartId)) {
    throw new ShopifyCartError("SHOPIFY_ERROR");
  }

  store.set(cartCookieName, cartId, {
    httpOnly: true,
    maxAge: cartCookieMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getCartAction(
  locale = "en-US",
): Promise<CartActionResult> {
  try {
    const language = languageForLocale(locale);
    const { store, value } = await getCartCookie();
    if (!value) return { ok: true, cart: emptyCartView() };
    if (!isShopifyCartId(value)) {
      store.delete(cartCookieName);
      return failure("CART_EXPIRED", language);
    }

    const cart = await getShopifyCart(value, language);
    if (!cart) {
      store.delete(cartCookieName);
      return failure("CART_EXPIRED", language);
    }
    return { ok: true, cart: mapShopifyCart(cart) };
  } catch (error) {
    return toSafeCartFailure(error, safeLanguageForLocale(locale));
  }
}

export async function addCartLineAction(
  merchandiseId: string,
  quantity = 1,
  locale = "en-US",
): Promise<CartActionResult> {
  try {
    assertValidCartQuantity(quantity);
    if (!isShopifyVariantId(merchandiseId)) {
      throw new ShopifyCartError("INVALID_INPUT");
    }
    const language = languageForLocale(locale);

    const { store, value } = await getCartCookie();
    const result = await addShopifyCartLineWithRecovery(
      value,
      { merchandiseId, quantity },
      language,
    );
    // Refresh the cookie lifetime whenever Shopify accepts a Bag mutation.
    // Shopify may also rotate the opaque Cart ID while returning the update.
    setCartCookie(store, result.cart.id);

    return {
      ok: true,
      cart: mapShopifyCart(result.cart, result.warnings),
    };
  } catch (error) {
    return toSafeCartFailure(error, safeLanguageForLocale(locale));
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
  locale = "en-US",
): Promise<CartActionResult> {
  try {
    assertValidCartQuantity(quantity);
    if (!isShopifyCartLineId(lineId)) {
      throw new ShopifyCartError("INVALID_INPUT");
    }
    const language = languageForLocale(locale);

    const { store, cartId } = await requireCartCookie();
    const result = await updateShopifyCartLines(
      cartId,
      [{ id: lineId, quantity }],
      language,
    );
    setCartCookie(store, result.cart.id);
    return {
      ok: true,
      cart: mapShopifyCart(result.cart, result.warnings),
    };
  } catch (error) {
    return toSafeCartFailure(error, safeLanguageForLocale(locale));
  }
}

export async function removeCartLineAction(
  lineId: string,
  locale = "en-US",
): Promise<CartActionResult> {
  try {
    if (!isShopifyCartLineId(lineId)) {
      throw new ShopifyCartError("INVALID_INPUT");
    }
    const language = languageForLocale(locale);

    const { store, cartId } = await requireCartCookie();
    const result = await removeShopifyCartLines(cartId, [lineId], language);
    setCartCookie(store, result.cart.id);
    return {
      ok: true,
      cart: mapShopifyCart(result.cart, result.warnings),
    };
  } catch (error) {
    return toSafeCartFailure(error, safeLanguageForLocale(locale));
  }
}

export async function clearCartAction(
  locale = "en-US",
): Promise<CartActionResult> {
  try {
    const language = languageForLocale(locale);
    const { store, cartId } = await requireCartCookie();
    const result = await clearShopifyCart(cartId, language);
    setCartCookie(store, result.cart.id);
    return {
      ok: true,
      cart: mapShopifyCart(result.cart, result.warnings),
    };
  } catch (error) {
    return toSafeCartFailure(error, safeLanguageForLocale(locale));
  }
}

export async function checkoutAction(
  locale = "en-US",
): Promise<CheckoutActionResult> {
  try {
    requireCheckout();
    const language = languageForLocale(locale);
    const { store, cartId } = await requireCartCookie();
    const cart = await getShopifyCart(cartId, language);
    if (!cart) {
      store.delete(cartCookieName);
      throw new ShopifyCartError("CART_EXPIRED");
    }
    if (cart.totalQuantity < 1 || cart.lines.nodes.length === 0) {
      throw new ShopifyCartError("EMPTY_CART");
    }
    if (cart.lines.nodes.some((line) => !line.merchandise.availableForSale)) {
      throw new ShopifyCartError("UNAVAILABLE");
    }

    return {
      ok: true,
      checkoutUrl: validateCheckoutUrl(cart.checkoutUrl),
    };
  } catch (error) {
    return toSafeCartFailure(error, safeLanguageForLocale(locale));
  }
}

export async function buyNowAction(
  merchandiseId: string,
  quantity = 1,
  locale = "en-US",
): Promise<CheckoutActionResult> {
  try {
    requireCheckout();
    assertValidCartQuantity(quantity);
    if (!isShopifyVariantId(merchandiseId)) {
      throw new ShopifyCartError("INVALID_INPUT");
    }
    const language = languageForLocale(locale);

    // Deliberately do not read or write the persistent Bag cookie. Buy now
    // always receives a fresh, independent, one-line Shopify Cart.
    const result = await createShopifyCart(
      [{ merchandiseId, quantity }],
      language,
    );
    const cart = mapShopifyCart(result.cart, result.warnings);
    const requestedLine = cart.lines.find(
      (line) => line.merchandiseId === merchandiseId,
    );
    if (
      cart.warnings.some((warning) =>
        isBlockingInventoryWarning(warning.code),
      ) ||
      cart.lines.length !== 1 ||
      cart.totalQuantity !== quantity ||
      requestedLine?.quantity !== quantity ||
      requestedLine?.availableForSale !== true
    ) {
      throw new ShopifyCartError("UNAVAILABLE");
    }

    return {
      ok: true,
      checkoutUrl: validateCheckoutUrl(result.cart.checkoutUrl),
    };
  } catch (error) {
    return toSafeCartFailure(error, safeLanguageForLocale(locale));
  }
}
