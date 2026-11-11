import { isValidElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const getCatalogNavigationData = vi.hoisted(() => vi.fn());

vi.mock("@/lib/commerce/catalog", () => ({ getCatalogNavigationData }));

import { LocaleShell } from "./locale-shell";

afterEach(() => {
  vi.resetAllMocks();
});

describe("LocaleShell", () => {
  it("keeps the page usable with base navigation when Shopify Header data fails", async () => {
    getCatalogNavigationData.mockRejectedValue(
      new Error("Shopify unavailable"),
    );

    const shell = await LocaleShell({
      locale: "en-US",
      children: <p>Page content</p>,
    });

    expect(isValidElement(shell)).toBe(true);
    const children = Array.isArray(shell.props.children)
      ? shell.props.children
      : [shell.props.children];
    const header = children[0];
    expect(isValidElement(header)).toBe(true);
    expect(header.props).toMatchObject({
      categoryLinks: [],
      collectionLinks: [],
      locale: "en-US",
    });
  });

  it("gives category links their handle icon and leaves collections neutral", async () => {
    getCatalogNavigationData.mockResolvedValue({
      categories: [
        { handle: "bracelets", title: "手鏈" },
        { handle: "taxonomy-rc-2", title: "Religious Items" },
      ],
      collections: [{ handle: "patron-saint", title: "Patron Saint" }],
    });

    const shell = await LocaleShell({
      locale: "zh-Hant-US",
      children: <p>Page content</p>,
    });

    expect(shell.props.children[0].props).toMatchObject({
      categoryLinks: [
        {
          href: "/zh-hant-us/category/bracelets",
          icon: "bracelet",
          label: "手鏈",
        },
        {
          href: "/zh-hant-us/category/taxonomy-rc-2",
          icon: "sparkle",
          label: "Religious Items",
        },
      ],
      collectionLinks: [
        { href: "/zh-hant-us/collections/patron-saint", label: "Patron Saint" },
      ],
    });
  });
});
