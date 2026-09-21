import { describe, expect, it } from "vitest";
import { formatDate, formatMoney, formatPrice, formatPriceRange } from "./format";

describe("formatPrice", () => {
  it("uses Hong Kong formatting without turning USD into HKD", () => {
    expect(formatPrice("35.50", "zh-Hant-US", "USD")).toBe("USD\u00a035.50");
    expect(formatDate("2026-09-11T00:00:00Z", "zh-Hant-US")).toBe("2026年9月11日");
  });
  it("makes the US currency explicit", () => {
    expect(formatPrice(68, "en-US", "USD")).toBe("USD\u00a068");
  });

  it("makes the Canada currency explicit in every language", () => {
    expect(formatPrice(92, "en-CA", "CAD")).toBe("CAD\u00a092");
    expect(formatPrice(92, "fr-CA", "CAD")).toMatch(/92.*CAD$/);
  });

  it("preserves cents from Shopify MoneyV2 strings", () => {
    expect(formatPrice("35.50", "en-US", "USD")).toBe("USD\u00a035.50");
  });

  it("rejects malformed money instead of displaying a guessed price", () => {
    expect(() => formatPrice("not-money", "en-US", "USD")).toThrow(
      "Price amount must be a finite number.",
    );
  });

  it("formats Shopify MoneyV2 and honest variant ranges", () => {
    expect(
      formatMoney({ amount: "35.0", currencyCode: "USD" }, "en-US"),
    ).toBe("USD\u00a035");
    expect(
      formatPriceRange(
        {
          minVariantPrice: { amount: "35.0", currencyCode: "USD" },
          maxVariantPrice: { amount: "42.5", currencyCode: "USD" },
        },
        "en-US",
      ),
    ).toBe("USD\u00a035 – USD\u00a042.50");
  });

  it.each(["en-US", "es-US", "zh-Hant-US"] as const)(
    "shows exactly one currency code without a second symbol in %s",
    (locale) => {
      const formatted = formatPrice("1234.50", locale, "USD");
      expect(formatted.match(/USD/g)).toHaveLength(1);
      expect(formatted).not.toContain("$");
      expect(formatted).toBe("USD\u00a01,234.50");
    },
  );
});
