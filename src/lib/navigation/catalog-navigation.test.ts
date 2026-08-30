import { describe, expect, it } from "vitest";
import {
  COLLECTION_DROPDOWN_THRESHOLD,
  collectionNavigationFor,
  type CatalogNavigationLink,
} from "./catalog-navigation";

const links: CatalogNavigationLink[] = [
  { href: "/collections/one", label: "One" },
  { href: "/collections/two", label: "Two" },
  { href: "/collections/three", label: "Three" },
];

describe("collectionNavigationFor", () => {
  it("hides the collections navigation when no design series is published", () => {
    expect(collectionNavigationFor([])).toEqual({ kind: "hidden", links: [] });
  });

  it("shows one or two design series as direct links", () => {
    expect(collectionNavigationFor(links.slice(0, 1))).toEqual({
      kind: "direct",
      links: links.slice(0, 1),
    });
    expect(collectionNavigationFor(links.slice(0, 2))).toEqual({
      kind: "direct",
      links: links.slice(0, 2),
    });
  });

  it("groups three or more design series into a dropdown", () => {
    expect(COLLECTION_DROPDOWN_THRESHOLD).toBe(3);
    expect(collectionNavigationFor(links)).toEqual({
      kind: "dropdown",
      links,
    });
  });
});
