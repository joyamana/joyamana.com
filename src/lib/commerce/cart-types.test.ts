import { describe, expect, it } from "vitest";
import {
  cartForFailure,
  cartLineCorrection,
  cartLineIssue,
} from "./cart-types";

function line(overrides: Partial<Parameters<typeof cartLineIssue>[0]> = {}) {
  return {
    availableForSale: true,
    quantity: 10,
    quantityAvailable: 3,
    currentlyNotInStock: false,
    quantityRule: { minimum: 1, maximum: null, increment: 1 },
    ...overrides,
  };
}

describe("saved Bag quantity recovery", () => {
  it("drops stale lines for an expired or missing Cart but preserves them on a connection failure", () => {
    for (const code of ["CART_EXPIRED", "CART_NOT_FOUND"] as const) {
      expect(
        cartForFailure({ ok: false, error: { code, message: "Try again." } }),
      ).toMatchObject({
        lines: [],
        totalQuantity: 0,
      });
    }
    expect(
      cartForFailure({
        ok: false,
        error: { code: "SHOPIFY_ERROR", message: "Try again." },
      }),
    ).toBeUndefined();
  });
  it("offers a direct adjustment after stock falls below the saved quantity", () => {
    expect(cartLineIssue(line())).toBe("INVALID_QUANTITY");
    expect(cartLineCorrection(line())).toBe(3);
    expect(cartLineIssue(line({ quantity: 3 }))).toBeNull();
  });
  it("uses the new minimum and increment instead of requiring invalid intermediate steps", () => {
    expect(
      cartLineCorrection(
        line({
          quantity: 5,
          quantityAvailable: 20,
          quantityRule: { minimum: 10, maximum: 20, increment: 5 },
        }),
      ),
    ).toBe(10);
    expect(
      cartLineCorrection(
        line({
          quantity: 7,
          quantityAvailable: 20,
          quantityRule: { minimum: 2, maximum: 20, increment: 2 },
        }),
      ),
    ).toBe(6);
  });
  it("requires removal when the minimum cannot be fulfilled or the item is unavailable", () => {
    expect(
      cartLineCorrection(
        line({ quantityRule: { minimum: 5, maximum: null, increment: 1 } }),
      ),
    ).toBeNull();
    expect(cartLineCorrection(line({ availableForSale: false }))).toBeNull();
  });
  it("keeps unknown inventory and backorders separate from a known inventory cap", () => {
    expect(cartLineIssue(line({ quantityAvailable: null }))).toBeNull();
    expect(cartLineIssue(line({ currentlyNotInStock: true }))).toBeNull();
    expect(
      cartLineCorrection(line({ quantity: 100, quantityAvailable: null })),
    ).toBe(99);
  });

  it("corrects a saved quantity beyond the cap to a valid purchase increment", () => {
    const saved = line({
      quantity: 100,
      quantityAvailable: 200,
      quantityRule: { minimum: 2, maximum: null, increment: 2 },
    });
    const quantity = cartLineCorrection(saved);
    expect(quantity).toBe(98);
    expect(cartLineIssue({ ...saved, quantity: quantity! })).toBeNull();
  });
});
