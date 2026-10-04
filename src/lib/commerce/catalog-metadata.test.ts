import { afterEach, describe, expect, it, vi } from "vitest";

const catalog = vi.hoisted(() => ({
  getProducts: vi.fn(),
  getDesignCollections: vi.fn(),
}));
vi.mock("./catalog", () => catalog);
vi.mock("@/config/site", () => ({
  siteConfig: { url: "https://www.joyamana.com", indexable: true },
  isIndexingEnabledFor: () => true,
}));

import { buildCatalogHubMetadata } from "./catalog-metadata";

afterEach(() => vi.resetAllMocks());

describe.each(["en-US", "zh-Hant-US"] as const)("%s catalog hubs", (locale) => {
  it.each(["/shop", "/collections"] as const)(
    "keeps %s out of indexing when empty or unavailable",
    async (path) => {
      const source =
        path === "/shop" ? catalog.getProducts : catalog.getDesignCollections;
      const args = { locale, path, title: "Catalog", description: "Browse." };
      source
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error("Unavailable"));
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = await buildCatalogHubMetadata(args);
        expect(result.robots).toMatchObject({ index: false });
        expect(result.alternates).toBeUndefined();
      }
      source.mockResolvedValue([{ handle: "published" }]);
      expect((await buildCatalogHubMetadata(args)).robots).toMatchObject({
        index: true,
      });
      expect(
        (
          await buildCatalogHubMetadata({
            ...args,
            searchParams: { color: "blue" },
          })
        ).robots,
      ).toMatchObject({ index: false });
    },
  );
});
