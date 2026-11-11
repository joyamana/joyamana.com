import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("./cart-provider", () => ({ useCart: () => ({ count: 0 }) }));
vi.mock("./language-switch", () => ({ LanguageSwitch: () => null }));

import { SiteHeader } from "./site-header";

describe("Collections header navigation", () => {
  it.each([0, 1, 2, 40])(
    "keeps the fixed desktop and mobile menus with %i collections",
    (count) => {
      const links = Array.from({ length: count }, (_, index) => ({
        href: `/collections/collection-${index}`,
        label: index === 0 ? "Patron Saint" : `Collection ${index}`,
      }));
      const html = renderToStaticMarkup(
        <SiteHeader
          categoryLinks={[]}
          collectionLinks={links}
          locale="en-US"
        />,
      );
      const menus = [...html.matchAll(/<details\b[^>]*>.*?<\/details>/g)]
        .map((match) => match[0])
        .filter((menu) => menu.includes("<span>Collections</span>"));
      expect(menus).toHaveLength(2);
      for (const menu of menus) {
        const anchors = [
          ...menu.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g),
        ];
        expect(anchors.map((anchor) => anchor[1])).toEqual([
          "/collections",
          ...links.map((link) => link.href),
        ]);
        expect(anchors[0][2]).toContain("View all collections");
        for (const link of links) expect(menu).toContain(link.label);
      }
    },
  );

  it("localizes the hub and every collection link", () => {
    const html = renderToStaticMarkup(
      <SiteHeader
        categoryLinks={[]}
        collectionLinks={[
          {
            href: "/zh-hant-us/collections/mineral-specimens",
            label: "礦物標本",
          },
        ]}
        locale="zh-Hant-US"
      />,
    );
    expect(html).toContain('href="/zh-hant-us/collections"');
    expect(html).toContain('href="/zh-hant-us/collections/mineral-specimens"');
    expect(html).toContain("礦物標本");
  });
});

describe("Catalog navigation icons", () => {
  it("adds one decorative icon to every Shop and Collections link", () => {
    const html = renderToStaticMarkup(
      <SiteHeader
        categoryLinks={[
          {
            href: "/category/bracelets",
            icon: "bracelet",
            label: "Bracelets",
          },
          { href: "/category/taxonomy-rc-2", label: "Religious Items" },
        ]}
        collectionLinks={[
          { href: "/collections/patron-saint", label: "Patron Saint" },
        ]}
        locale="en-US"
      />,
    );
    const menus = [...html.matchAll(/<details\b[^>]*>.*?<\/details>/g)].map(
      (match) => match[0],
    );
    expect(menus).toHaveLength(4);
    for (const menu of menus) {
      const anchors = [...menu.matchAll(/<a\b[^>]*>(.*?)<\/a>/g)];
      expect(anchors.length).toBeGreaterThan(1);
      for (const anchor of anchors) {
        const icons = anchor[1].match(/<svg\b[^>]*>/g) ?? [];
        expect(icons).toHaveLength(1);
        expect(icons[0]).toContain('aria-hidden="true"');
        expect(icons[0]).toContain('class="nav-link-icon"');
        expect(anchor[1].replace(/<svg\b.*?<\/svg>/g, "")).toMatch(/\S/);
      }
    }
    expect(menus.join("").match(/<circle\b/g)).toHaveLength(16);
  });
});
