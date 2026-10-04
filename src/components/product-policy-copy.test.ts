import { ProductDescription } from "./product-description";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { checkoutDisabledNote } from "./buy-now";
import { productShippingReturnsSummary } from "./product-purchase";

describe("product policy copy", () => {
  it("summarizes the confirmed US shipping and return terms", () => {
    expect(productShippingReturnsSummary("en-US")).toContain(
      "1–3 business days",
    );
    expect(productShippingReturnsSummary("en-US")).toContain("15 days");
  });

  it("keeps a disabled Buy-now explanation customer-facing", () => {
    expect(checkoutDisabledNote("en-US")).toContain("temporarily unavailable");
    expect(checkoutDisabledNote("en-US")).not.toMatch(
      /code|integration|approval|shopify/i,
    );
  });

  it("localizes the confirmed US terms and purchase fallback in Chinese", () => {
    expect(productShippingReturnsSummary("zh-Hant-US")).toContain(
      "1–3 個工作天",
    );
    expect(productShippingReturnsSummary("zh-Hant-US")).toContain("15 天");
    expect(checkoutDisabledNote("zh-Hant-US")).toContain(
      "你仍可將此商品加入購物袋",
    );
  });

  it("preserves sanitized Shopify product description structure", () => {
    const html = renderToStaticMarkup(
      createElement(ProductDescription, {
        description: "Plain fallback",
        descriptionHtml: "<h2>Details</h2><ul><li>Natural stone</li></ul>",
      }),
    );

    expect(html).toContain("<h2>Details</h2>");
    expect(html).toContain("<ul><li>Natural stone</li></ul>");
    expect(html).not.toContain("Plain fallback");
  });
});
