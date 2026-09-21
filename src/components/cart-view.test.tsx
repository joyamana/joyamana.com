import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CartActionFailure, CartView as CartData } from "@/lib/commerce/cart-types";

const mocks = vi.hoisted(() => ({
  state: {
    cart: { lines: [], warnings: [], subtotal: { amount: "0", currencyCode: "USD" }, totalQuantity: 0 } as CartData,
    status: "ready",
    error: null as CartActionFailure["error"] | null,
    checkoutEnabled: true,
    checkout: vi.fn(),
    clear: vi.fn(),
    clearError: vi.fn(),
    refresh: vi.fn(),
    removeItem: vi.fn(),
    updateItem: vi.fn(),
  },
}));
vi.mock("./cart-provider", () => ({ useCart: () => mocks.state }));

import { CartView } from "./cart-view";

beforeEach(() => {
  mocks.state.status = "ready";
  mocks.state.checkoutEnabled = true;
  mocks.state.error = null;
  mocks.state.cart = {
    lines: [{
      id: "line-1",
      merchandiseId: "variant-1",
      productHandle: "bracelet",
      productTitle: "Quartz bracelet",
      variantTitle: "12 mm",
      image: null,
      availableForSale: true,
      currentlyNotInStock: false,
      quantityAvailable: 3,
      quantity: 2,
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
      unitPrice: { amount: "29", currencyCode: "USD" },
      totalPrice: { amount: "58", currencyCode: "USD" },
      hasLineDiscount: false,
    }],
    warnings: [],
    totalQuantity: 2,
    subtotal: { amount: "58", currencyCode: "USD" },
  };
});

describe("Bag presentation and recovery", () => {
  it("distinguishes line totals from unit prices without repeating normal availability", () => {
    const html = renderToStaticMarkup(<CartView locale="en-US" />);
    expect(html).toContain("Quartz bracelet");
    expect(html).toContain("Each");
    expect(html).toMatch(/58/);
    expect(html).toMatch(/29/);
    expect(html).not.toContain(">Available<");
    expect(html).toContain('href="/shop"');
    expect(html).toContain("Continue shopping");
    expect(html).not.toContain("Item discounts");
  });

  it.each([
    ["en-US", "Item discounts are included in the total above."],
    ["es-US", "El total anterior incluye los descuentos de este artículo."],
    ["zh-Hant-US", "上方合計已計入商品折扣。"],
  ] as const)("explains line discounts beside Shopify prices in %s", (locale, copy) => {
    mocks.state.cart.lines[0].unitPrice.amount = "49";
    mocks.state.cart.lines[0].totalPrice.amount = "78";
    mocks.state.cart.lines[0].hasLineDiscount = true;
    const html = renderToStaticMarkup(<CartView locale={locale} />);
    expect(html).toContain(copy);
    expect(html).toMatch(/49/);
    expect(html).toMatch(/78/);
    expect(html).not.toMatch(/39/);
  });

  it("keeps known availability issues visible once and offers an explicit refresh", () => {
    mocks.state.cart.lines[0].availableForSale = false;
    mocks.state.error = { code: "UNAVAILABLE", message: "This item is no longer available in the requested quantity." };
    mocks.state.cart.warnings = [{ code: "OUT_OF_STOCK", message: "An item is out of stock." }];
    const html = renderToStaticMarkup(<CartView locale="en-US" />);
    expect(html).toContain("Review availability");
    expect(html.match(/This item is no longer available in the requested quantity\./g)).toHaveLength(1);
    expect(html).toContain("Refresh bag");
  });

  it("keeps checkout disabled while a bag update is pending", () => {
    mocks.state.status = "updating";
    const html = renderToStaticMarkup(<CartView locale="en-US" />);
    expect(html.match(/<button[^>]*>Checkout<\/button>/)?.[0]).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
  });

  it("offers a useful empty-bag path without asserting browser storage lifetime", () => {
    mocks.state.cart.lines = [];
    const html = renderToStaticMarkup(<CartView locale="zh-Hant-US" />);
    expect(html).toContain("購物袋內暫無商品");
    expect(html).toContain('href="/zh-hant-us/shop"');
    expect(html).not.toContain("瀏覽器");
  });
});
