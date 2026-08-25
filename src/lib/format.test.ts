import { describe, expect, it } from "vitest";
import { formatMoney, formatPrice, formatPriceRange } from "./format";

describe("formatPrice", () => {
  it("makes the US currency explicit", () => {
    expect(formatPrice(68, "en-US", "USD")).toBe("$68 USD");
  });

  it("makes the Canada currency explicit in every language", () => {
    expect(formatPrice(92, "en-CA", "CAD")).toBe("$92 CAD");
    expect(formatPrice(92, "fr-CA", "CAD")).toMatch(/92.*CAD$/);
  });

  it("preserves cents from Shopify MoneyV2 strings", () => {
    expect(formatPrice("35.50", "en-US", "USD")).toBe("$35.50 USD");
  });

  it("rejects malformed money instead of displaying a guessed price", () => {
    expect(() => formatPrice("not-money", "en-US", "USD")).toThrow(
      "Price amount must be a finite number.",
    );
  });

  it("formats Shopify MoneyV2 and honest variant ranges", () => {
    expect(
      formatMoney({ amount: "35.0", currencyCode: "USD" }, "en-US"),
    ).toBe("$35 USD");
    expect(
      formatPriceRange(
        {
          minVariantPrice: { amount: "35.0", currencyCode: "USD" },
          maxVariantPrice: { amount: "42.5", currencyCode: "USD" },
        },
        "en-US",
      ),
    ).toBe("$35 USD – $42.50 USD");
  });
});
