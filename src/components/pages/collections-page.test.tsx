import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const catalog = vi.hoisted(() => ({ getCollections: vi.fn() }));
vi.mock("@/lib/commerce/catalog", () => catalog);
import { CollectionsPage } from "./collections-page";

afterEach(() => vi.resetAllMocks());

describe("collections hub", () => {
  it.each([
    ["en-US", ""],
    ["zh-Hant-US", "/zh-hant-us"],
  ] as const)(
    "renders every accessible collection in %s",
    async (locale, prefix) => {
      const collections = [
        {
          handle: "patron-saint",
          title: "Patron Saint",
          description: "A theme.",
          hasProducts: true,
        },
        {
          handle: "mineral-specimens",
          title: "Mineral Specimens",
          description: "",
          hasProducts: true,
        },
        {
          handle: "coming-soon",
          title: "Coming Soon",
          description: "",
          hasProducts: false,
        },
      ];
      catalog.getCollections.mockResolvedValue(collections);
      const html = renderToStaticMarkup(await CollectionsPage({ locale }));
      for (const collection of collections) {
        expect(html).toContain(
          `href="${prefix}/collections/${collection.handle}"`,
        );
        expect(html).toContain(collection.title);
      }
      expect(catalog.getCollections).toHaveBeenCalledExactlyOnceWith(
        "us",
        locale,
      );
      expect(html).not.toContain("Design collections");
    },
  );

  it("shows an honest empty hub when no collections are published", async () => {
    catalog.getCollections.mockResolvedValue([]);
    const html = renderToStaticMarkup(
      await CollectionsPage({ locale: "en-US" }),
    );
    expect(html).toContain("No collections are published yet.");
    expect(html).not.toContain("collection-strip");
  });
});
