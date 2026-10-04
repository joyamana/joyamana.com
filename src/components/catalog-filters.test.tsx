import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { parseCatalogQuery } from "@/lib/commerce/catalog-browse";
import { CatalogFilters } from "./catalog-filters";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("instant catalog filters", () => {
  it.each(["en-US", "zh-Hant-US"] as const)(
    "renders direct filter links and a removable stale color on %s",
    (locale) => {
      const html = renderToStaticMarkup(
        <CatalogFilters
          path="/shop"
          locale={locale}
          query={parseCatalogQuery({ color: "purple", sort: "price-asc" })}
          colors={[{ key: "purple", label: "Purple", count: 0 }]}
          count={0}
        />,
      );
      expect(html).not.toContain("<form");
      expect(html).not.toContain('type="submit"');
      expect(html).toContain('role="checkbox" aria-checked="true"');
      expect(html).toContain(
        'href="/shop?available=1&amp;color=purple&amp;sort=price-asc"',
      );
      expect(html).toContain('href="/shop?sort=price-asc"');
      expect(html).toContain('role="status"');
      expect(html).toContain('class="catalog-popover catalog-popover--colors"');
    },
  );

  it("uses actual color facets and preserves other conditions in each immediate action", () => {
    const html = renderToStaticMarkup(
      <CatalogFilters
        path="/shop"
        locale="en-US"
        query={parseCatalogQuery({
          available: "1",
          color: "red",
          sort: "price-desc",
        })}
        colors={[
          { key: "red", label: "Red", count: 2 },
          { key: "opal glow", label: "Opal Glow", count: 1 },
        ]}
        count={2}
      />,
    );
    expect(html).toContain("Opal Glow");
    expect(html).toContain(
      'href="/shop?available=1&amp;color=opal+glow&amp;color=red&amp;sort=price-desc"',
    );
    expect(html).toContain('href="/shop?available=1&amp;sort=price-desc"');
    expect(html).toContain(
      'href="/shop?available=1&amp;color=red&amp;sort=price-asc"',
    );
    expect(html).toContain('href="/shop?sort=price-desc"');
    expect(html).toContain('aria-current="true"');
  });
});
