import { describe, expect, it } from "vitest";
import {
  collectionNavigationFor,
  type CatalogNavigationLink,
} from "./catalog-navigation";

const links: CatalogNavigationLink[] = [
  { href: "/collections/one", label: "One" },
  { href: "/collections/two", label: "Two" },
  { href: "/collections/three", label: "Three" },
];

describe("collectionNavigationFor", () => {
  it.each([0, 1, 2, 3])(
    "always starts with the hub link for %i collections",
    (count) => {
      const hub = { href: "/collections", label: "View all collections" };
      expect(collectionNavigationFor(links.slice(0, count), hub)).toEqual([
        hub,
        ...links.slice(0, count),
      ]);
    },
  );

  it("preserves every link, its order, and its localized destination", () => {
    const hub = { href: "/zh-hant-us/collections", label: "查看所有系列" };
    const manyLinks = Array.from({ length: 40 }, (_, index) => ({
      href: `/zh-hant-us/collections/series-${index}`,
      label: `系列 ${index}`,
    }));
    expect(collectionNavigationFor(manyLinks, hub)).toEqual([
      hub,
      ...manyLinks,
    ]);
  });
});
