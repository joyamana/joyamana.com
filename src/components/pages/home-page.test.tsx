import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/commerce/types";

const mocks = vi.hoisted(() => ({ getProducts: vi.fn() }));
vi.mock("@/lib/commerce/catalog", () => ({
  getProducts: mocks.getProducts,
}));

import { HomePage } from "./home-page";

function product(
  handle: string,
  title: string,
  availableForSale: boolean,
): Product {
  return {
    id: `product-${handle}`,
    handle,
    title,
    description: "",
    descriptionHtml: "",
    availableForSale,
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
}

beforeEach(() => {
  mocks.getProducts.mockReset();
  mocks.getProducts.mockResolvedValue([]);
});

describe("Home page", () => {
  it("uses the approved editorial hero and omits Blog and Collection modules", async () => {
    const html = renderToStaticMarkup(await HomePage({ locale: "en-US" }));

    expect(html).toContain("Natural forms. Personal meaning.");
    expect(html).toContain("Explore Joya Mana");
    expect(html).toContain("Discover a featured piece");
    expect(html).toContain("joya-mana-home-hero.webp");
    expect(html).not.toContain("bling-omen-editorial-hero.png");
    expect(html).not.toContain("From the blog");
    expect(html).not.toContain("collection-strip");
    expect(html).not.toContain("Shopify");
  });

  it("presents the About-aligned intention with a localized About link", async () => {
    const english = renderToStaticMarkup(
      await HomePage({ locale: "en-US" }),
    );
    const spanish = renderToStaticMarkup(
      await HomePage({ locale: "es-US" }),
    );

    expect(english).toContain("A crystal can be a way back to yourself.");
    expect(english).toContain('href="/about"');
    expect(english).toContain("Read our story");
    expect(spanish).toContain("Un cristal puede ser una forma de volver a ti.");
    expect(spanish).toContain('href="/es-us/about"');
    expect(spanish).toContain("Conoce nuestra historia");
  });

  it("excludes unavailable products from featured cards and the hero link", async () => {
    mocks.getProducts.mockResolvedValue([
      product("unavailable-piece", "Unavailable piece", false),
      product("available-piece", "Available piece", true),
    ]);

    const html = renderToStaticMarkup(await HomePage({ locale: "en-US" }));

    expect(html).toContain("Available piece");
    expect(html).toContain('href="/products/available-piece"');
    expect(html).not.toContain("Unavailable piece");
    expect(html).not.toContain('href="/products/unavailable-piece"');
  });
});
