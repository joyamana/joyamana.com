import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "./product-card";

const product: Product = {
  id: "product-1",
  handle: "tigers-eye-bracelet-multicolour-14-mm",
  title: "Tiger's Eye Bracelet, Multicolour — 14 mm",
  description: "",
  descriptionHtml: "",
  availableForSale: true,
  priceRange: {
    minVariantPrice: { amount: "35.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "35.00", currencyCode: "USD" },
  },
  compareAtPrice: null,
  featuredImage: null,
  images: [],
  variants: [],
  category: null,
};

describe("Product card", () => {
  it("shows the complete name before its price without repeating normal availability", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={product} locale="en-US" />,
    );

    expect(html).toContain('class="product-card__price"');
    expect(html).not.toContain(">Available<");
    expect(html.indexOf("<h3>")).toBeLessThan(html.indexOf('class="product-card__price"'));
    expect(html).toContain("Tiger&#x27;s Eye Bracelet, Multicolour — 14 mm");
    expect(html).not.toContain("Shopify");
  });

  it("gives unavailable products a distinct visible state", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{ ...product, availableForSale: false }}
        locale="en-US"
      />,
    );

    expect(html).toContain("product-card__availability");
    expect(html.match(/>Unavailable</g)).toHaveLength(1);
    expect(html).toContain("Unavailable");
  });
});
