import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/commerce/types";
import { ProductCard } from "./product-card";
import {
  browseCatalog,
  parseCatalogQuery,
} from "@/lib/commerce/catalog-browse";

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
  featuredImage: null,
  images: [],
  variants: [],
  category: null,
};

describe("Product card", () => {
  it("keeps the matched variant image, exact price and both links together", () => {
    const item: Product = {
      ...product,
      handle: "bracelet",
      variants: [
        {
          id: "gid://shopify/ProductVariant/123",
          title: "Purple",
          colors: ["Purple"],
          availableForSale: true,
          currentlyNotInStock: false,
          quantityAvailable: 2,
          price: { amount: "60.00", currencyCode: "USD" },
          compareAtPrice: null,
          image: {
            url: "https://cdn.shopify.com/purple.jpg",
            altText: "Purple bracelet",
            width: 1200,
            height: 1200,
          },
          selectedOptions: [],
          quantityRule: { minimum: 1, maximum: null, increment: 1 },
        },
      ],
    };
    const entry = browseCatalog([item], parseCatalogQuery({ color: "purple" }))
      .entries[0];
    const html = renderToStaticMarkup(
      <ProductCard product={item} presentation={entry} locale="en-US" />,
    );
    expect(
      html.match(/href="\/products\/bracelet\?variant=123"/g),
    ).toHaveLength(2);
    expect(decodeURIComponent(html)).toContain("purple.jpg");
    expect(html).toContain("$60 USD");
    expect(html).not.toContain("$35 USD");
    expect(html).toContain("product-card__variant");
    const missingImage = {
      ...entry,
      variant: { ...entry.variant, image: null },
    };
    const unavailable = renderToStaticMarkup(
      <ProductCard
        product={{ ...item, featuredImage: entry.variant.image }}
        presentation={missingImage}
        locale="en-US"
      />,
    );
    expect(unavailable).toContain("Image unavailable");
    expect(unavailable).not.toContain("purple.jpg");
  });

  it("groups availability and price above a full-width product title", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={product} locale="en-US" />,
    );

    expect(html).toContain("product-card--available");
    expect(html).toContain('class="product-card__meta"');
    expect(html).toContain("product-card__availability--available");
    expect(html).toContain("product-card__availability-dot");
    expect(html).toContain('class="product-card__price"');
    expect(html).toContain("Available");
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

    expect(html).toContain("product-card--unavailable");
    expect(html).toContain("product-card__availability--unavailable");
    expect(html).toContain("product-card__availability-badge");
    expect(html).toContain("Unavailable");
  });
});
