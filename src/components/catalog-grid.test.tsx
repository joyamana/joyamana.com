import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { parseCatalogQuery } from "@/lib/commerce/catalog-browse";
import { CatalogGrid } from "./catalog-grid";

it("does not offer filter removal for an empty unfiltered catalog", () => {
  const html = renderToStaticMarkup(
    <CatalogGrid
      entries={[]}
      locale="en-US"
      path="/shop"
      query={parseCatalogQuery({ sort: "price-asc" })}
    />,
  );
  expect(html).toContain("No products yet.");
  expect(html).not.toContain("Clear filters");
  expect(html).not.toContain("match these filters");
});

it("offers filter removal while preserving the chosen sort for zero matches", () => {
  const html = renderToStaticMarkup(
    <CatalogGrid
      entries={[]}
      locale="en-US"
      path="/shop"
      query={parseCatalogQuery({
        color: "purple",
        available: "1",
        sort: "price-asc",
      })}
    />,
  );
  expect(html).toContain("No products match these filters.");
  expect(html).toContain('href="/shop?sort=price-asc"');
  expect(html).toContain("Clear filters");
});
