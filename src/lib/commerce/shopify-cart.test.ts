import { afterEach, describe, expect, it, vi } from "vitest";
import type { ShopifyCart } from "./shopify-cart";
import {
  ShopifyCartError,
  addShopifyCartLineWithRecovery,
  clearShopifyCart,
  createShopifyCart,
  getShopifyCart,
  isShopifyCartLineId,
  isValidCartQuantity,
  mapShopifyCart,
  toSafeCartFailure,
  updateShopifyCartLines,
  validateCheckoutUrl,
} from "./shopify-cart";

const mocks = vi.hoisted(() => ({
  shopifyFetch: vi.fn(),
}));

vi.mock("./shopify", () => ({
  shopifyFetch: mocks.shopifyFetch,
}));

const cartId = "gid://shopify/Cart/cart-token?key=cart-secret";
const lineId = "gid://shopify/CartLine/line-token?context=opaque";
const merchandiseId = "gid://shopify/ProductVariant/123456789";

function makeCart(overrides: Partial<ShopifyCart> = {}): ShopifyCart {
  return {
    id: cartId,
    checkoutUrl:
      "https://joya-mana.myshopify.com/cart/c/checkout-token?key=checkout-secret",
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: "136.00", currencyCode: "USD" },
    },
    lines: {
      nodes: [
        {
          id: lineId,
          quantity: 2,
          cost: {
            totalAmount: { amount: "136.00", currencyCode: "USD" },
          },
          merchandise: {
            id: merchandiseId,
            title: "Aquamarine",
            availableForSale: true,
            image: {
              url: "https://cdn.shopify.com/product.png",
              altText: "Aquamarine bracelet",
              width: 1200,
              height: 1200,
            },
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

function mutationPayload(cart = makeCart()) {
  return { cart, userErrors: [], warnings: [] };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("Shopify Cart mapper and validation", () => {
  it("maps a browser-safe cart without exposing the Cart ID or Checkout URL", () => {
    const cart = makeCart();
    const view = mapShopifyCart(cart, [
      {
        code: "MERCHANDISE_NOT_ENOUGH_STOCK",
        message: `Cart ${cartId} was adjusted`,
      },
    ]);

    expect(view).toMatchObject({
      totalQuantity: 2,
      subtotal: { amount: "136.00", currencyCode: "USD" },
      lines: [
        {
          id: lineId,
          merchandiseId,
          productHandle: "aquamarine-bracelet-9-mm",
          quantity: 2,
          quantityRule: { minimum: 1, maximum: null, increment: 1 },
          unitPrice: { amount: "68.00", currencyCode: "USD" },
        },
      ],
      warnings: [
        {
          code: "MERCHANDISE_NOT_ENOUGH_STOCK",
          message:
            "Shopify adjusted the cart. Review the updated items before checkout.",
        },
      ],
    });
    expect(JSON.stringify(view)).not.toContain(cartId);
    expect(JSON.stringify(view)).not.toContain("checkout-secret");
  });

  it.each(["CAD", "EUR"])(
    "rejects %s outside the enabled US USD cart context",
    (currencyCode) => {
      const cart = makeCart({
        cost: {
          subtotalAmount: { amount: "68.00", currencyCode },
        },
      });

      expect(() => mapShopifyCart(cart)).toThrowError(
        expect.objectContaining({ code: "SHOPIFY_ERROR" }),
      );
    },
  );

  it("rejects malformed Shopify money amounts", () => {
    const cart = makeCart({
      cost: {
        subtotalAmount: { amount: "68 dollars", currencyCode: "USD" },
      },
    });

    expect(() => mapShopifyCart(cart)).toThrowError(
      expect.objectContaining({ code: "SHOPIFY_ERROR" }),
    );
  });

  it("rejects an invalid contextual quantity rule", () => {
    const cart = makeCart();
    cart.lines.nodes[0].merchandise.quantityRule = {
      minimum: 2,
      maximum: 3,
      increment: 2,
    };

    expect(() => mapShopifyCart(cart)).toThrowError(
      expect.objectContaining({ code: "SHOPIFY_ERROR" }),
    );
  });

  it("accepts opaque CartLine GIDs but rejects unsafe or unrelated IDs", () => {
    expect(isShopifyCartLineId(lineId)).toBe(true);
    expect(isShopifyCartLineId("gid://shopify/CartLine/a/b:c_1?x=y&z=1")).toBe(
      true,
    );
    expect(isShopifyCartLineId("gid://shopify/ProductVariant/123")).toBe(
      false,
    );
    expect(isShopifyCartLineId("gid://shopify/CartLine/123\nInjected")).toBe(
      false,
    );
  });

  it("allows only whole-number storefront quantities from 1 through 99", () => {
    expect(isValidCartQuantity(1)).toBe(true);
    expect(isValidCartQuantity(99)).toBe(true);
    for (const invalid of [
      0,
      100,
      2_147_483_647,
      2_147_483_648,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]) {
      expect(isValidCartQuantity(invalid)).toBe(false);
    }
  });
});

describe("Shopify Cart Storefront operations", () => {
  it("reads the latest Cart without caching the query", async () => {
    mocks.shopifyFetch.mockResolvedValueOnce({ cart: makeCart() });

    const cart = await getShopifyCart(cartId, "ES");

    expect(cart?.id).toBe(cartId);
    const [query, variables, options] = mocks.shopifyFetch.mock.calls[0];
    expect(query).toContain("query JoyaManaCart");
    expect(query).toContain("language: $language");
    expect(variables).toEqual({ id: cartId, language: "ES" });
    expect(options).toEqual({ cache: "no-store" });
  });

  it("creates a US-context Cart without caching the mutation", async () => {
    mocks.shopifyFetch.mockResolvedValueOnce({
      cartCreate: mutationPayload(),
    });

    const result = await createShopifyCart([{ merchandiseId, quantity: 2 }]);

    expect(result.cart.id).toBe(cartId);
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables, options] = mocks.shopifyFetch.mock.calls[0];
    expect(query).toContain("mutation JoyaManaCartCreate");
    expect(query).toContain(
      "@inContext(country: US, language: $language)",
    );
    expect(variables).toEqual({
      input: {
        buyerIdentity: { countryCode: "US" },
        lines: [{ merchandiseId, quantity: 2 }],
      },
      language: "EN",
    });
    expect(options).toEqual({ cache: "no-store" });
  });

  it("replaces an expired Cart only while adding a line", async () => {
    const replacement = makeCart({
      id: "gid://shopify/Cart/replacement?key=new-secret",
    });
    mocks.shopifyFetch
      .mockResolvedValueOnce({
        cartLinesAdd: {
          cart: null,
          userErrors: [
            {
              code: "INVALID",
              field: ["cartId"],
              message: "The cart does not exist.",
            },
          ],
          warnings: [],
        },
      })
      .mockResolvedValueOnce({
        cartCreate: mutationPayload(replacement),
      });

    const result = await addShopifyCartLineWithRecovery(cartId, {
      merchandiseId,
      quantity: 1,
    });

    expect(result.replacedCart).toBe(true);
    expect(result.cart.id).toBe(replacement.id);
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(2);
    expect(mocks.shopifyFetch.mock.calls[0][0]).toContain(
      "mutation JoyaManaCartLinesAdd",
    );
    expect(mocks.shopifyFetch.mock.calls[1][0]).toContain(
      "mutation JoyaManaCartCreate",
    );
  });

  it("does not replace a Cart for merchandise or inventory errors", async () => {
    mocks.shopifyFetch.mockResolvedValueOnce({
      cartLinesAdd: {
        cart: null,
        userErrors: [
          {
            code: "INVALID_MERCHANDISE_LINE",
            field: ["lines", "0", "merchandiseId"],
            message: "Merchandise is unavailable.",
          },
        ],
        warnings: [],
      },
    });

    await expect(
      addShopifyCartLineWithRecovery(cartId, {
        merchandiseId,
        quantity: 1,
      }),
    ).rejects.toMatchObject({ code: "UNAVAILABLE" });
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(1);
  });

  it("fails an invalid update before making a Shopify request", async () => {
    await expect(
      updateShopifyCartLines(cartId, [{ id: lineId, quantity: 0 }]),
    ).rejects.toMatchObject({ code: "INVALID_QUANTITY" });
    expect(mocks.shopifyFetch).not.toHaveBeenCalled();
  });

  it("updates quantities through Shopify and preserves mutation warnings", async () => {
    mocks.shopifyFetch.mockResolvedValueOnce({
      cartLinesUpdate: {
        ...mutationPayload(),
        warnings: [
          {
            code: "MERCHANDISE_NOT_ENOUGH_STOCK",
            message: "Quantity was reduced to available stock.",
          },
        ],
      },
    });

    const result = await updateShopifyCartLines(cartId, [
      { id: lineId, quantity: 2 },
    ]);

    expect(result.warnings).toEqual([
      {
        code: "MERCHANDISE_NOT_ENOUGH_STOCK",
        message: "Quantity was reduced to available stock.",
      },
    ]);
    expect(mocks.shopifyFetch.mock.calls[0][0]).toContain(
      "mutation JoyaManaCartLinesUpdate",
    );
    expect(mocks.shopifyFetch.mock.calls[0][1]).toEqual({
      cartId,
      lines: [{ id: lineId, quantity: 2 }],
      language: "EN",
    });
    expect(mocks.shopifyFetch.mock.calls[0][2]).toEqual({
      cache: "no-store",
    });
  });

  it("clears all current lines using Shopify line IDs", async () => {
    const cleared = makeCart({
      totalQuantity: 0,
      cost: { subtotalAmount: { amount: "0.0", currencyCode: "USD" } },
      lines: { nodes: [] },
    });
    mocks.shopifyFetch
      .mockResolvedValueOnce({ cart: makeCart() })
      .mockResolvedValueOnce({
        cartLinesRemove: mutationPayload(cleared),
      });

    const result = await clearShopifyCart(cartId);

    expect(result.cart.totalQuantity).toBe(0);
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(2);
    expect(mocks.shopifyFetch.mock.calls[1][1]).toEqual({
      cartId,
      lineIds: [lineId],
      language: "EN",
    });
    expect(mocks.shopifyFetch.mock.calls[0][2]).toEqual({ cache: "no-store" });
    expect(mocks.shopifyFetch.mock.calls[1][2]).toEqual({ cache: "no-store" });
  });
});

describe("Shopify Checkout boundary", () => {
  it("accepts only explicitly configured checkout hosts", () => {
    expect(
      validateCheckoutUrl(
        "https://checkout.joyamana.com/cart/c/token?key=secret",
        {
          checkoutDomain: "checkout.joyamana.com",
          storeDomain: "joya-mana.myshopify.com",
        },
      ),
    ).toBe("https://checkout.joyamana.com/cart/c/token?key=secret");

    expect(
      validateCheckoutUrl(
        "https://joya-mana.myshopify.com/checkouts/token",
        { storeDomain: "joya-mana.myshopify.com" },
      ),
    ).toBe("https://joya-mana.myshopify.com/checkouts/token");
  });

  it.each([
    "http://joya-mana.myshopify.com/cart/c/token",
    "https://evil.example/cart/c/token",
    "https://another-store.myshopify.com/checkouts/token",
    "https://joya-mana.myshopify.com/products/example",
    "https://user:password@joya-mana.myshopify.com/cart/c/token",
    "javascript:alert(1)",
  ])("rejects an unsafe Checkout URL: %s", (url) => {
    expect(() =>
      validateCheckoutUrl(url, { storeDomain: "joya-mana.myshopify.com" }),
    ).toThrowError(expect.objectContaining({ code: "CHECKOUT_URL_INVALID" }));
  });

  it("returns only a stable public error code and message", () => {
    const failure = toSafeCartFailure(
      new ShopifyCartError(
        "SHOPIFY_ERROR",
        `Upstream leaked ${cartId} and checkout-secret`,
      ),
    );

    expect(failure).toEqual({
      ok: false,
      error: {
        code: "SHOPIFY_ERROR",
        message: "Shopify could not update the bag. Please try again.",
      },
    });
    expect(JSON.stringify(failure)).not.toContain("cart-secret");
  });
});
