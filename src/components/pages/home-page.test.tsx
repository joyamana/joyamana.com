import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/commerce/catalog", () => ({
  getProducts: vi.fn().mockResolvedValue([]),
}));

import { HomePage } from "./home-page";

describe("Home page", () => {
  it("uses a text-only hero and omits Blog and Collection modules", async () => {
    const html = renderToStaticMarkup(await HomePage({ locale: "en-US" }));

    expect(html).toContain("Objects with presence.");
    expect(html).not.toContain("bling-omen-editorial-hero.png");
    expect(html).not.toContain("From the blog");
    expect(html).not.toContain("collection-strip");
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
