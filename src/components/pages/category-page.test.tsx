import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EnabledLocale } from "@/config/locales";
import type { CatalogProduct } from "@/lib/commerce/types";
import { productCategoriesForProducts } from "@/lib/commerce/catalog";

const catalog = vi.hoisted(() => ({
  getBrowseCategory: vi.fn(),
  getProductCategory: vi.fn(),
}));
vi.mock("@/lib/commerce/catalog", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/commerce/catalog")>()),
  ...catalog,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  notFound: () => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  },
}));

function categoryProduct(locale: EnabledLocale): CatalogProduct {
  return {
    id: "gid://shopify/Product/1",
    handle: "crystal-object",
    title: locale === "zh-Hant-US" ? "水晶擺設" : "Crystal object",
    availableForSale: true,
    featuredImage: null,
    category: {
      id: "gid://shopify/TaxonomyCategory/rc-2",
      name: locale === "zh-Hant-US" ? "家居裝飾" : "Decor",
    },
    priceRange: {
      minVariantPrice: { amount: "68.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "68.00", currencyCode: "USD" },
    },
    variants: [
      {
        id: "gid://shopify/ProductVariant/101",
        title: "Default Title",
        availableForSale: true,
        currentlyNotInStock: false,
        quantityAvailable: 1,
        price: { amount: "68.00", currencyCode: "USD" },
        compareAtPrice: null,
        image: null,
        selectedOptions: [],
        quantityRule: { minimum: 1, maximum: null, increment: 1 },
        colors: [],
      },
    ],
  };
}

function categoryForRequest(handle: string, locale: EnabledLocale) {
  const product = categoryProduct(locale);
  const category = productCategoriesForProducts([product], locale).find(
    (entry) => entry.handle === handle,
  );
  return category ? { ...category, products: [product] } : null;
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
  catalog.getBrowseCategory.mockImplementation(
    async (handle: string, _market: string, locale: EnabledLocale) =>
      categoryForRequest(handle, locale),
  );
  catalog.getProductCategory.mockImplementation(
    async (handle: string, _market: string, locale: EnabledLocale) =>
      categoryForRequest(handle, locale),
  );
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

const cases = [
  { locale: "en-US", prefix: "", title: "Decor" },
  { locale: "zh-Hant-US", prefix: "/zh-hant-us", title: "家居裝飾" },
] as const;

for (const { locale, prefix, title } of cases) {
  describe(`${locale} automatic category page`, () => {
    it("renders the discovered category, product links and matching Schema in the initial HTML", async () => {
      const { CategoryPage } = await import("./category-page");
      const html = renderToStaticMarkup(
        await CategoryPage({ locale, handle: "taxonomy-rc-2" }),
      );
      const path = `${prefix}/category/taxonomy-rc-2`;
      const productPath = `${prefix}/products/crystal-object?variant=101`;

      expect(html).toContain(`<h1>${title}</h1>`);
      expect(html).toContain(`href="${productPath}"`);
      expect(html).toContain(`href="${path}?available=1"`);
      expect(catalog.getBrowseCategory).toHaveBeenCalledExactlyOnceWith(
        "taxonomy-rc-2",
        "us",
        locale,
      );

      const script = html.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/,
      );
      expect(script).not.toBeNull();
      const schema = JSON.parse(script![1]);
      expect(schema["@graph"]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            "@type": "CollectionPage",
            name: title,
            url: `https://www.joyamana.com${path}`,
          }),
          expect.objectContaining({
            "@type": "ItemList",
            numberOfItems: 1,
            itemListElement: [
              expect.objectContaining({
                url: `https://www.joyamana.com${productPath}`,
              }),
            ],
          }),
        ]),
      );
    });

    it("uses the same category for metadata and keeps filtered requests noindex", async () => {
      const { generateMetadata } =
        locale === "en-US"
          ? await import("@/app/(english)/category/[handle]/page")
          : await import("@/app/zh-hant-us/category/[handle]/page");
      const params = Promise.resolve({ handle: "taxonomy-rc-2" });
      const clean = await generateMetadata({
        params,
        searchParams: Promise.resolve({}),
      });
      const filtered = await generateMetadata({
        params,
        searchParams: Promise.resolve({ available: "1" }),
      });
      const canonical = `https://www.joyamana.com${prefix}/category/taxonomy-rc-2`;

      expect(clean.title).toBe(title);
      expect(clean.alternates?.canonical).toBe(canonical);
      expect(clean.alternates?.languages).toEqual({
        "en-US": "https://www.joyamana.com/category/taxonomy-rc-2",
        "zh-Hant-US":
          "https://www.joyamana.com/zh-hant-us/category/taxonomy-rc-2",
      });
      expect(clean.robots).toEqual({ index: true, follow: true });
      expect(filtered.alternates?.canonical).toBe(canonical);
      expect(filtered.alternates?.languages).toBeUndefined();
      expect(filtered.robots).toMatchObject({ index: false });

      const { CategoryPage } = await import("./category-page");
      const html = renderToStaticMarkup(
        await CategoryPage({
          locale,
          handle: "taxonomy-rc-2",
          searchParams: { available: "1" },
        }),
      );
      expect(html).toContain(`<h1>${title}</h1>`);
      expect(html).toContain(
        `href="${prefix}/products/crystal-object?variant=101"`,
      );
      expect(html).not.toContain("application/ld+json");
    });
  });
}

it("keeps discovered categories readable while deployment indexing is disabled", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "false");
  const { CategoryPage } = await import("./category-page");
  const { generateMetadata } =
    await import("@/app/(english)/category/[handle]/page");
  const html = renderToStaticMarkup(
    await CategoryPage({ locale: "en-US", handle: "taxonomy-rc-2" }),
  );
  const metadata = await generateMetadata({
    params: Promise.resolve({ handle: "taxonomy-rc-2" }),
    searchParams: Promise.resolve({}),
  });

  expect(html).toContain("<h1>Decor</h1>");
  expect(html).not.toContain("application/ld+json");
  expect(metadata.robots).toMatchObject({ index: false });
  expect(metadata.alternates).toBeUndefined();
});

it.each(cases)(
  "returns 404 for a missing category in $locale",
  async ({ locale }) => {
    const { CategoryPage } = await import("./category-page");

    await expect(
      CategoryPage({ locale, handle: "taxonomy-rc-missing" }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  },
);
