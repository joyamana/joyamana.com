import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/commerce/catalog", () => ({
  getProducts: vi.fn().mockResolvedValue([]),
}));

import { HomePage } from "./home-page";

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
});
