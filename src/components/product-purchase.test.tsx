import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/lib/commerce/types";

const mocks = vi.hoisted(() => ({ status: "ready" }));
vi.mock("./cart-provider", () => ({
  useCart: () => ({
    cart: { lines: [] },
    status: mocks.status,
    checkoutEnabled: true,
    error: null,
    addItem: vi.fn(),
    buyNow: vi.fn(),
    clearError: vi.fn(),
  }),
}));

import { ProductPurchase } from "./product-purchase";

function product(): Omit<Product, "description" | "descriptionHtml"> {
  return {
    id: "gid://shopify/Product/1",
    handle: "sample-bracelet",
    title: "Sample bracelet",
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "29", currencyCode: "USD" },
      maxVariantPrice: { amount: "29", currencyCode: "USD" },
    },
    compareAtPrice: null,
    featuredImage: null,
    images: [],
    category: null,
    model: "standard",
    variants: [{
      id: "gid://shopify/ProductVariant/1",
      title: "Default Title",
      availableForSale: true,
      currentlyNotInStock: false,
      quantityAvailable: 2,
      price: { amount: "29", currencyCode: "USD" },
      compareAtPrice: null,
      image: null,
      selectedOptions: [{ name: "Title", value: "Default Title" }],
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
    }],
  };
}

function render(item = product()) {
  return renderToStaticMarkup(
    <ProductPurchase
      product={item}
      locale="en-US"
      description={<p>Full Shopify disclosure: heat-treated quartz, 12 mm beads.</p>}
    />,
  );
}

beforeEach(() => { mocks.status = "ready"; });

describe("PDP disclosures and purchase readiness", () => {
  it("keeps the complete original disclosure before buying when facts are missing", () => {
    const html = render();
    expect(html.indexOf("Full Shopify disclosure")).toBeLessThan(html.indexOf("Add to bag"));
    expect(html).toContain('href="#product-purchase-options"');
    expect(html).not.toContain('class="product-key-facts"');
    expect(html).not.toContain("You will receive the exact piece shown.");
    expect(html).toContain("Low stock · Only 2 left");
  });

  it("shows partial verified facts without treating a short summary as complete disclosure", () => {
    const item = product();
    item.facts = { summary: "A warm-toned bracelet.", treatment: "Heat-treated quartz" };
    const html = render(item);
    expect(html).toContain("A warm-toned bracelet.");
    expect(html).toContain("Heat-treated quartz");
    expect(html.indexOf("Full Shopify disclosure")).toBeLessThan(html.indexOf("Add to bag"));
  });

  it("places complete selected-variant facts before buying and keeps the long description open after", () => {
    const item = product();
    item.facts = {
      material: "Quartz",
      dimensions: "12 mm beads",
      treatment: "Product-level treatment",
      care: "Keep away from abrasive cleaners.",
    };
    item.variants[0].facts = {
      fit: "Approx. 16.5 cm wrist",
      treatment: "Heat-treated quartz",
      imageRepresentation: "representative",
    };
    const html = render(item);
    expect(html).not.toContain("Product-level treatment");
    expect(html.indexOf("Heat-treated quartz")).toBeLessThan(html.indexOf("Add to bag"));
    expect(html.indexOf("Approx. 16.5 cm wrist")).toBeLessThan(html.indexOf("Add to bag"));
    expect(html.indexOf("Full Shopify disclosure")).toBeGreaterThan(html.indexOf("Add to bag"));
    expect(html.match(/Full Shopify disclosure/g)).toHaveLength(1);
    expect(html).toContain("Images show a representative piece");
    expect(html).not.toContain("<details");
  });

  it("keeps bracelet sizing disclosure before buying until both dimensions and fit exist", () => {
    const item = product();
    item.category = { id: "gid://shopify/TaxonomyCategory/aa-6-3", name: "Bracelets" };
    item.facts = { material: "Quartz", treatment: "Heat-treated quartz", dimensions: "12 mm beads" };
    expect(render(item).indexOf("Full Shopify disclosure")).toBeLessThan(render(item).indexOf("Add to bag"));
    item.variants[0].facts = { fit: "Approx. 16.5 cm wrist" };
    const complete = render(item);
    expect(complete.indexOf("Approx. 16.5 cm wrist")).toBeLessThan(complete.indexOf("Add to bag"));
    expect(complete.indexOf("Full Shopify disclosure")).toBeGreaterThan(complete.indexOf("Add to bag"));
  });

  it("does not infer a bracelet category from the product title", () => {
    const item = product();
    item.facts = { material: "Quartz", treatment: "Heat-treated quartz", dimensions: "12 mm" };
    const html = render(item);
    expect(html.indexOf("Full Shopify disclosure")).toBeGreaterThan(html.indexOf("Add to bag"));
  });

  it("preserves the cart-readiness gate for both purchase buttons", () => {
    mocks.status = "loading";
    const html = render();
    expect(html.match(/<button[^>]*>Add to bag<\/button>/)?.[0]).toContain('disabled=""');
    expect(html.match(/<button[^>]*>Buy now<\/button>/)?.[0]).toContain('disabled=""');
  });
});
