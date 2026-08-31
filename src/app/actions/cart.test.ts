import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ShopifyCart } from "@/lib/commerce/shopify-cart";
import {
  addCartLineAction,
  buyNowAction,
  checkoutAction,
  clearCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "./cart";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  addWithRecovery: vi.fn(),
  clearCart: vi.fn(),
  createCart: vi.fn(),
  getCart: vi.fn(),
  removeLines: vi.fn(),
  updateLines: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
}));

vi.mock("@/lib/commerce/shopify-cart", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/commerce/shopify-cart")>();
  return {
    ...actual,
    addShopifyCartLineWithRecovery: mocks.addWithRecovery,
    clearShopifyCart: mocks.clearCart,
    createShopifyCart: mocks.createCart,
    getShopifyCart: mocks.getCart,
    removeShopifyCartLines: mocks.removeLines,
    updateShopifyCartLines: mocks.updateLines,
  };
});

const originalEnv = { ...process.env };
const oldCartId = "gid://shopify/Cart/old-cart?key=old-secret";
const newCartId = "gid://shopify/Cart/new-cart?key=new-secret";
const lineId = "gid://shopify/CartLine/line?context=opaque";
const merchandiseId = "gid://shopify/ProductVariant/123456789";

function makeCart(overrides: Partial<ShopifyCart> = {}): ShopifyCart {
  return {
    id: newCartId,
    checkoutUrl:
      "https://joya-mana.myshopify.com/cart/c/checkout-token?key=checkout-secret",
    totalQuantity: 1,
    cost: { subtotalAmount: { amount: "68.00", currencyCode: "USD" } },
    lines: {
      nodes: [
        {
          id: lineId,
          quantity: 1,
          cost: {
            totalAmount: { amount: "68.00", currencyCode: "USD" },
          },
          merchandise: {
            id: merchandiseId,
            title: "Default Title",
            availableForSale: true,
            currentlyNotInStock: false,
            quantityAvailable: 1,
            image: null,
            quantityRule: { minimum: 1, maximum: null, increment: 1 },
            price: { amount: "68.00", currencyCode: "USD" },
            product: {
              handle: "aquamarine-bracelet-9-mm",
              title: "Aquamarine Bracelet",
            },
          },
        },
      ],
    },
    ...overrides,
  };
}

function cookieStore(initialValue: string | null = null) {
  let value = initialValue;
  return {
    get: vi.fn(() => (value ? { value } : undefined)),
    set: vi.fn((_name: string, nextValue: string) => {
      value = nextValue;
    }),
    delete: vi.fn(() => {
      value = null;
    }),
  };
}

beforeEach(() => {
  process.env.SHOPIFY_CHECKOUT_ENABLED = "false";
  process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
  delete process.env.SHOPIFY_CHECKOUT_DOMAIN;
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.clearAllMocks();
});

describe("Bag server actions", () => {
  it("returns an empty public Cart without creating a Shopify Cart", async () => {
    const store = cookieStore();
    mocks.cookies.mockResolvedValue(store);

    await expect(getCartAction()).resolves.toEqual({
      ok: true,
      cart: {
        lines: [],
        totalQuantity: 0,
        subtotal: { amount: "0.0", currencyCode: "USD" },
        warnings: [],
      },
    });
    expect(mocks.getCart).not.toHaveBeenCalled();
  });

  it("stores only a recovered Cart ID in a hardened US Bag cookie", async () => {
    const store = cookieStore(oldCartId);
    const cart = makeCart();
    mocks.cookies.mockResolvedValue(store);
    mocks.addWithRecovery.mockResolvedValue({
      cart,
      warnings: [],
      replacedCart: true,
    });

    const result = await addCartLineAction(merchandiseId, 1);

    expect(mocks.addWithRecovery).toHaveBeenCalledWith(
      oldCartId,
      { merchandiseId, quantity: 1 },
      "EN",
    );
    expect(store.set).toHaveBeenCalledWith(
      "joya-mana-shopify-cart-us",
      newCartId,
      {
        httpOnly: true,
        maxAge: 864000,
        path: "/",
        sameSite: "lax",
        secure: false,
      },
    );
    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toContain(newCartId);
    expect(JSON.stringify(result)).not.toContain("checkout-secret");
  });

  it("rejects invalid quantities before reading cookies or calling Shopify", async () => {
    const invalidQuantities = [0, 100];

    for (const quantity of invalidQuantities) {
      await expect(
        addCartLineAction(merchandiseId, quantity),
      ).resolves.toMatchObject({
        ok: false,
        error: { code: "INVALID_QUANTITY" },
      });
    }

    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.addWithRecovery).not.toHaveBeenCalled();
  });

  it("does not silently recreate a missing Cart for an update", async () => {
    mocks.cookies.mockResolvedValue(cookieStore());

    const result = await updateCartLineAction(lineId, 2);

    expect(result).toMatchObject({
      ok: false,
      error: { code: "CART_NOT_FOUND" },
    });
    expect(mocks.updateLines).not.toHaveBeenCalled();
    expect(mocks.createCart).not.toHaveBeenCalled();
  });

  it("updates, removes, and clears only the Cart referenced by the cookie", async () => {
    const store = cookieStore(oldCartId);
    const cart = makeCart({ id: oldCartId });
    mocks.cookies.mockResolvedValue(store);
    mocks.updateLines.mockResolvedValue({ cart, warnings: [] });
    mocks.removeLines.mockResolvedValue({ cart, warnings: [] });
    mocks.clearCart.mockResolvedValue({ cart, warnings: [] });

    await expect(updateCartLineAction(lineId, 2)).resolves.toMatchObject({
      ok: true,
    });
    await expect(removeCartLineAction(lineId)).resolves.toMatchObject({
      ok: true,
    });
    await expect(clearCartAction()).resolves.toMatchObject({ ok: true });

    expect(mocks.updateLines).toHaveBeenCalledWith(
      oldCartId,
      [{ id: lineId, quantity: 2 }],
      "EN",
    );
    expect(mocks.removeLines).toHaveBeenCalledWith(oldCartId, [lineId], "EN");
    expect(mocks.clearCart).toHaveBeenCalledWith(oldCartId, "EN");
    expect(mocks.createCart).not.toHaveBeenCalled();
  });

  it("requests localized Cart merchandise for the US Spanish route", async () => {
    mocks.cookies.mockResolvedValue(cookieStore(oldCartId));
    mocks.getCart.mockResolvedValue(makeCart({ id: oldCartId }));

    await expect(getCartAction("es-US")).resolves.toMatchObject({ ok: true });
    expect(mocks.getCart).toHaveBeenCalledWith(oldCartId, "ES");
  });

  it("rejects locales outside the enabled US storefront", async () => {
    const result = await getCartAction("fr-CA");

    expect(result).toMatchObject({
      ok: false,
      error: { code: "INVALID_INPUT" },
    });
    expect(mocks.cookies).not.toHaveBeenCalled();
  });
});

describe("Checkout server actions", () => {
  it("keeps Checkout closed by default without reading the Bag cookie", async () => {
    const result = await checkoutAction();

    expect(result).toMatchObject({
      ok: false,
      error: { code: "CHECKOUT_DISABLED" },
    });
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.getCart).not.toHaveBeenCalled();
  });

  it("returns a localized safe Checkout error on the Spanish route", async () => {
    const result = await checkoutAction("es-US");

    expect(result).toEqual({
      ok: false,
      error: {
        code: "CHECKOUT_DISABLED",
        message: "El pago aún no está disponible.",
      },
    });
  });

  it("re-reads the current Cart before returning its latest Checkout URL", async () => {
    process.env.SHOPIFY_CHECKOUT_ENABLED = "true";
    mocks.cookies.mockResolvedValue(cookieStore(oldCartId));
    mocks.getCart.mockResolvedValue(makeCart({ id: oldCartId }));

    const result = await checkoutAction();

    expect(mocks.getCart).toHaveBeenCalledWith(oldCartId, "EN");
    expect(result).toEqual({
      ok: true,
      checkoutUrl:
        "https://joya-mana.myshopify.com/cart/c/checkout-token?key=checkout-secret",
    });
  });

  it("rejects an untrusted Checkout URL without returning upstream details", async () => {
    process.env.SHOPIFY_CHECKOUT_ENABLED = "true";
    mocks.cookies.mockResolvedValue(cookieStore(oldCartId));
    mocks.getCart.mockResolvedValue(
      makeCart({
        id: oldCartId,
        checkoutUrl: "https://evil.example/cart/c/stolen",
      }),
    );

    const result = await checkoutAction();

    expect(result).toEqual({
      ok: false,
      error: {
        code: "CHECKOUT_URL_INVALID",
        message: "Shopify returned an invalid checkout destination.",
      },
    });
    expect(JSON.stringify(result)).not.toContain("evil.example");
  });

  it("does not open Checkout when a saved Cart line is no longer available", async () => {
    process.env.SHOPIFY_CHECKOUT_ENABLED = "true";
    mocks.cookies.mockResolvedValue(cookieStore(oldCartId));
    const cart = makeCart({ id: oldCartId });
    cart.lines.nodes[0].merchandise.availableForSale = false;
    mocks.getCart.mockResolvedValue(cart);

    const result = await checkoutAction();

    expect(result).toMatchObject({
      ok: false,
      error: { code: "UNAVAILABLE" },
    });
    expect(JSON.stringify(result)).not.toContain("checkout-secret");
  });

  it("creates an independent one-line Buy-now Cart without touching Bag cookies", async () => {
    process.env.SHOPIFY_CHECKOUT_ENABLED = "true";
    mocks.createCart.mockResolvedValue({ cart: makeCart(), warnings: [] });

    const result = await buyNowAction(merchandiseId, 1);

    expect(mocks.createCart).toHaveBeenCalledWith(
      [{ merchandiseId, quantity: 1 }],
      "EN",
    );
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.addWithRecovery).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: true,
      checkoutUrl: expect.stringContaining("/cart/c/checkout-token"),
    });
  });

  it("does not open Checkout when Shopify removes an out-of-stock Buy-now line", async () => {
    process.env.SHOPIFY_CHECKOUT_ENABLED = "true";
    mocks.createCart.mockResolvedValue({
      cart: makeCart({
        totalQuantity: 0,
        cost: { subtotalAmount: { amount: "0.0", currencyCode: "USD" } },
        lines: { nodes: [] },
      }),
      warnings: [
        {
          code: "MERCHANDISE_OUT_OF_STOCK",
          message: "The requested merchandise is out of stock.",
        },
      ],
    });

    const result = await buyNowAction(merchandiseId, 1);

    expect(result).toEqual({
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "This item is no longer available in the requested quantity.",
      },
    });
    expect(mocks.cookies).not.toHaveBeenCalled();
  });
});
