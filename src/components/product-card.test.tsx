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
  it("groups availability and price above a full-width product title", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={product} locale="en-US" />,
    );

    expect(html).toContain('class="product-card__meta"');
    expect(html).toContain('class="product-card__price"');
    expect(html).toContain("Available");
    expect(html).toContain("Tiger&#x27;s Eye Bracelet, Multicolour — 14 mm");
    expect(html).not.toContain("Shopify");
  });
});
