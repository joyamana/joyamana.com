import { afterEach, describe, expect, it, vi } from "vitest";
import { cartLineIssue } from "./cart-types";
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
    updatedAt: "2026-10-05T00:00:00Z",
    checkoutUrl:
      "https://joya-mana.myshopify.com/cart/c/checkout-token?key=checkout-secret",
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: "136.00", currencyCode: "USD" },
    },
    lines: {
      pageInfo: { hasNextPage: false, endCursor: null },
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
            currentlyNotInStock: false,
            quantityAvailable: 2,
            image: {
              url: "https://cdn.shopify.com/product.png",
              altText: "Aquamarine bracelet",
              width: 1200,
              height: 1200,
            },
            quantityRule: { minimum: 1, maximum: null, increment: 1 },
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
  vi.resetAllMocks();
});

describe("Shopify Cart mapper and validation", () => {
  it.each([5, 100])(
    "preserves a saved quantity %i when current purchase rules no longer permit it",
    (quantity) => {
      const cart = makeCart({ totalQuantity: quantity });
      cart.lines.nodes[0].quantity = quantity;
      cart.lines.nodes[0].merchandise.quantityRule = {
        minimum: 10,
        maximum: 50,
        increment: 5,
      };
      expect(mapShopifyCart(cart).lines[0].quantity).toBe(quantity);
    },
  );
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
          currentlyNotInStock: false,
          quantityAvailable: 2,
          quantityRule: { minimum: 1, maximum: null, increment: 1 },
        },
      ],
      warnings: [
        {
          code: "MERCHANDISE_NOT_ENOUGH_STOCK",
          message: "Your bag was updated. Review the items before checkout.",
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
    expect(isShopifyCartLineId("gid://shopify/ProductVariant/123")).toBe(false);
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
  it("refuses an add that would merge into a quantity over the storefront limit", async () => {
    const cart = makeCart({ totalQuantity: 99 });
    cart.lines.nodes[0].quantity = 99;
    mocks.shopifyFetch.mockResolvedValueOnce({ cart });
    await expect(
      addShopifyCartLineWithRecovery(cartId, { merchandiseId, quantity: 1 }),
    ).rejects.toMatchObject({ code: "INVALID_QUANTITY" });
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(1);
  });
  it.each([251, 500])(
    "reads all %i Bag lines before exposing a complete view",
    async (count) => {
      const sample = makeCart().lines.nodes[0];
      const lines = Array.from({ length: count }, (_, index) => ({
        ...sample,
        id: `${lineId}-${index}`,
        quantity: 1,
      }));
      mocks.shopifyFetch
        .mockResolvedValueOnce({
          cart: makeCart({
            totalQuantity: count,
            lines: {
              nodes: lines.slice(0, 250),
              pageInfo: { hasNextPage: true, endCursor: "next" },
            },
          }),
        })
        .mockResolvedValueOnce({
          cart: {
            id: cartId,
            updatedAt: makeCart().updatedAt,
            cost: makeCart().cost,
            totalQuantity: count,
            lines: {
              nodes: lines.slice(250),
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      const cart = await getShopifyCart(cartId);
      expect(mapShopifyCart(cart!).lines).toHaveLength(count);
      expect(mocks.shopifyFetch.mock.calls[1][1]).toEqual({
        id: cartId,
        after: "next",
        language: "EN",
      });
    },
  );
  it("rejects pagination that repeats a line or changes the Bag while reading", async () => {
    const cart = makeCart({ totalQuantity: 4 });
    cart.lines.pageInfo = { hasNextPage: true, endCursor: "next" };
    mocks.shopifyFetch
      .mockResolvedValueOnce({ cart })
      .mockResolvedValueOnce({ cart });
    await expect(getShopifyCart(cartId)).rejects.toMatchObject({
      code: "SHOPIFY_ERROR",
    });
  });
  it("clears all 500 lines in two batches", async () => {
    const sample = makeCart().lines.nodes[0];
    const lines = Array.from({ length: 500 }, (_, index) => ({
      ...sample,
      id: `${lineId}-${index}`,
      quantity: 1,
    }));
    const paged = makeCart({
      totalQuantity: 500,
      lines: {
        nodes: lines.slice(0, 250),
        pageInfo: { hasNextPage: true, endCursor: "next" },
      },
    });
    const remainder = makeCart({
      totalQuantity: 250,
      lines: {
        nodes: lines.slice(250),
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });
    const empty = makeCart({
      totalQuantity: 0,
      lines: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
    });
    mocks.shopifyFetch
      .mockResolvedValueOnce({ cart: paged })
      .mockResolvedValueOnce({ cart: { ...paged, lines: remainder.lines } })
      .mockResolvedValueOnce({ cartLinesRemove: mutationPayload(remainder) })
      .mockResolvedValueOnce({ cartLinesRemove: mutationPayload(empty) });
    expect((await clearShopifyCart(cartId)).cart.totalQuantity).toBe(0);
    expect(mocks.shopifyFetch.mock.calls[2][1].lineIds).toHaveLength(250);
    expect(mocks.shopifyFetch.mock.calls[3][1].lineIds).toHaveLength(250);
  });
  it("reads the latest Cart without caching the query", async () => {
    mocks.shopifyFetch.mockResolvedValueOnce({ cart: makeCart() });

    const cart = await getShopifyCart(cartId, "ZH_TW");

    expect(cart?.id).toBe(cartId);
    const [query, variables, options] = mocks.shopifyFetch.mock.calls[0];
    expect(query).toContain("query JoyaManaCart");
    expect(query).toContain("language: $language");
    expect(query).toContain("quantityAvailable");
    expect(variables).toEqual({ id: cartId, language: "ZH_TW" });
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
    expect(query).toContain("@inContext(country: US, language: $language)");
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
      .mockResolvedValueOnce({ cart: makeCart() })
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

    expect(result.cart.id).toBe(replacement.id);
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(3);
    expect(mocks.shopifyFetch.mock.calls[1][0]).toContain(
      "mutation JoyaManaCartLinesAdd",
    );
    expect(mocks.shopifyFetch.mock.calls[2][0]).toContain(
      "mutation JoyaManaCartCreate",
    );
  });

  it("does not replace a Cart for merchandise or inventory errors", async () => {
    mocks.shopifyFetch.mockResolvedValueOnce({ cart: makeCart() });
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
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(2);
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
      lines: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
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

describe("Cart pagination failures", () => {
  function pages() {
    const first = makeCart();
    first.lines.nodes[0].quantity = 1;
    first.lines.pageInfo = { hasNextPage: true, endCursor: "next" };
    const last = makeCart({
      lines: {
        nodes: [{ ...first.lines.nodes[0], id: `${lineId}-second` }],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });
    return { first, last };
  }

  it.each(["version", "subtotal", "quantity"])(
    "discards mixed pages and reads once more when the %s changes",
    async (change) => {
      const { first, last } = pages();
      const changed = {
        ...last,
        ...(change === "version" ? { updatedAt: "2026-10-05T00:00:01Z" } : {}),
        ...(change === "subtotal"
          ? { cost: { subtotalAmount: { amount: "140", currencyCode: "USD" } } }
          : {}),
        ...(change === "quantity" ? { totalQuantity: 3 } : {}),
      };
      mocks.shopifyFetch
        .mockResolvedValueOnce({ cart: first })
        .mockResolvedValueOnce({ cart: changed })
        .mockResolvedValueOnce({ cart: first })
        .mockResolvedValueOnce({ cart: last });
      const cart = await getShopifyCart(cartId);
      expect(cart?.lines.nodes.map((line) => line.id)).toEqual([
        lineId,
        `${lineId}-second`,
      ]);
      expect(mocks.shopifyFetch).toHaveBeenCalledTimes(4);
      expect(mocks.shopifyFetch.mock.calls[2][1]).toEqual({
        id: cartId,
        language: "EN",
      });
    },
  );

  it("stops after the one allowed re-read when the Bag keeps changing", async () => {
    const { first, last } = pages();
    const changed = { ...last, updatedAt: "2026-10-05T00:00:01Z" };
    mocks.shopifyFetch
      .mockResolvedValueOnce({ cart: first })
      .mockResolvedValueOnce({ cart: changed })
      .mockResolvedValueOnce({ cart: first })
      .mockResolvedValueOnce({ cart: changed });
    await expect(getShopifyCart(cartId)).rejects.toMatchObject({
      code: "SHOPIFY_ERROR",
    });
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(4);
  });

  it("retains mutation warnings and only repeats reads after a page changes", async () => {
    const { first, last } = pages();
    const warnings = [
      { code: "MERCHANDISE_NOT_ENOUGH_STOCK", message: "Review quantity." },
    ];
    mocks.shopifyFetch
      .mockResolvedValueOnce({
        cartCreate: { ...mutationPayload(first), warnings },
      })
      .mockResolvedValueOnce({
        cart: { ...last, updatedAt: "2026-10-05T00:00:01Z" },
      })
      .mockResolvedValueOnce({ cart: first })
      .mockResolvedValueOnce({ cart: last });
    const result = await createShopifyCart([{ merchandiseId, quantity: 2 }]);
    expect(result.warnings).toEqual(warnings);
    expect(result.cart.lines.nodes).toHaveLength(2);
    const queries = mocks.shopifyFetch.mock.calls.map(
      (call) => call[0] as string,
    );
    expect(
      queries.filter((query) => query.includes("mutation JoyaManaCartCreate")),
    ).toHaveLength(1);
    expect(queries.slice(1).every((query) => !query.includes("mutation"))).toBe(
      true,
    );
  });

  it("rejects mismatched identities and invalid version data without recovery", async () => {
    for (const updatedAt of ["invalid", "2026-10-05T00:00:00Z"]) {
      mocks.shopifyFetch.mockReset();
      const { first, last } = pages();
      mocks.shopifyFetch
        .mockResolvedValueOnce({ cart: first })
        .mockResolvedValueOnce({
          cart: {
            ...last,
            updatedAt,
            id: "gid://shopify/Cart/another?key=opaque",
          },
        });
      await expect(getShopifyCart(cartId)).rejects.toMatchObject({
        code: "SHOPIFY_ERROR",
      });
      expect(mocks.shopifyFetch).toHaveBeenCalledTimes(2);
    }
  });

  it("compares decimal subtotals without requiring identical formatting", async () => {
    const { first, last } = pages();
    last.cost = { subtotalAmount: { amount: "136.0", currencyCode: "USD" } };
    mocks.shopifyFetch
      .mockResolvedValueOnce({ cart: first })
      .mockResolvedValueOnce({ cart: last });
    expect((await getShopifyCart(cartId))?.lines.nodes).toHaveLength(2);
    expect(mocks.shopifyFetch).toHaveBeenCalledTimes(2);
  });

  it.each([null, " "])(
    "rejects a missing next-page cursor: %s",
    async (endCursor) => {
      const cart = makeCart();
      cart.lines.pageInfo = { hasNextPage: true, endCursor };
      mocks.shopifyFetch.mockResolvedValueOnce({ cart });
      await expect(getShopifyCart(cartId)).rejects.toMatchObject({
        code: "SHOPIFY_ERROR",
      });
      expect(mocks.shopifyFetch).toHaveBeenCalledTimes(1);
    },
  );

  it("does not report an empty Bag when the second removal batch fails", async () => {
    const template = makeCart().lines.nodes[0];
    const nodes = Array.from({ length: 251 }, (_, i) => ({
      ...template,
      id: `gid://shopify/CartLine/${i}`,
      quantity: 1,
    }));
    const cart = makeCart({
      totalQuantity: 251,
      lines: {
        nodes: nodes.slice(0, 250),
        pageInfo: { hasNextPage: true, endCursor: "first" },
      },
    });
    const remaining = makeCart({
      totalQuantity: 1,
      lines: {
        nodes: nodes.slice(250),
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });
    mocks.shopifyFetch
      .mockResolvedValueOnce({ cart })
      .mockResolvedValueOnce({ cart: { ...cart, lines: remaining.lines } })
      .mockResolvedValueOnce({ cartLinesRemove: mutationPayload(remaining) })
      .mockRejectedValueOnce(new Error("Temporary upstream failure"));
    await expect(clearShopifyCart(cartId)).rejects.toThrow(
      "Temporary upstream failure",
    );
    expect(mocks.shopifyFetch.mock.calls[3][1].lineIds).toHaveLength(1);
  });
});

describe("Shopify Checkout boundary", () => {
  it.each([
    "/zh-tw/cart/c/token?key=secret",
    "/zh-tw/checkouts/token?key=secret",
  ])("accepts the verified Traditional Chinese prefix: %s", (path) => {
    const url = `https://checkout.joyamana.com${path}`;
    expect(
      validateCheckoutUrl(url, { checkoutDomain: "checkout.joyamana.com" }),
    ).toBe(url);
  });

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
      validateCheckoutUrl("https://joya-mana.myshopify.com/checkouts/token", {
        storeDomain: "joya-mana.myshopify.com",
      }),
    ).toBe("https://joya-mana.myshopify.com/checkouts/token");

    expect(
      validateCheckoutUrl(
        "https://joya-mana.myshopify.com/zh-tw/cart/c/token?key=secret",
        { storeDomain: "joya-mana.myshopify.com" },
      ),
    ).toBe("https://joya-mana.myshopify.com/zh-tw/cart/c/token?key=secret");
  });

  it.each([
    "http://joya-mana.myshopify.com/cart/c/token",
    "https://evil.example/cart/c/token",
    "https://another-store.myshopify.com/checkouts/token",
    "https://joya-mana.myshopify.com/products/example",
    "https://joya-mana.myshopify.com/fr/cart/c/token",
    "https://joya-mana.myshopify.com/zh-hant-us/cart/c/token",
    "https://joya-mana.myshopify.com/zh-cn/cart/c/token",
    "https://joya-mana.myshopify.com/zh-tw/products/token",
    "https://joya-mana.myshopify.com/zh-tw/cart/c/token#fragment",
    "https://joya-mana.myshopify.com:444/zh-tw/cart/c/token",
    "https://joya-mana.myshopify.com.evil.example/zh-tw/cart/c/token",
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
        message: "Your bag could not be updated. Please try again.",
      },
    });
    expect(JSON.stringify(failure)).not.toContain("cart-secret");
  });
});

describe("negative Shopify inventory", () => {
  it.each([true, false])(
    "keeps a negative-stock bag readable (backorder=%s)",
    (backorder) => {
      const cart = makeCart();
      cart.lines.nodes[0].merchandise.quantityAvailable = -1;
      cart.lines.nodes[0].merchandise.currentlyNotInStock = backorder;
      const view = mapShopifyCart(cart);
      expect(view.lines[0].quantityAvailable).toBe(-1);
      expect(cartLineIssue(view.lines[0])).toBe(
        backorder ? null : "INVALID_QUANTITY",
      );
      cart.lines.nodes[0].merchandise.availableForSale = false;
      expect(cartLineIssue(mapShopifyCart(cart).lines[0])).toBe("UNAVAILABLE");
    },
  );
});
