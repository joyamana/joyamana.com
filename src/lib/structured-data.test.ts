import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product } from "./commerce/types";
import {
  buildAboutStructuredData,
  buildCollectionStructuredData,
  buildEditorialStructuredData,
  buildProductStructuredData,
  serializeStructuredData,
} from "./structured-data";

const image = {
  url: "https://cdn.shopify.com/s/files/product.jpg",
  altText: "Aquamarine bracelet on a neutral background",
  width: 1200,
  height: 1200,
};

const product: Product = {
  id: "gid://shopify/Product/1",
  handle: "aquamarine-bracelet",
  title: "Aquamarine bracelet",
  description: "A pale-blue bracelet.",
  availableForSale: true,
  priceRange: {
    minVariantPrice: { amount: "35.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "42.00", currencyCode: "USD" },
  },
  compareAtPrice: null,
  category: {
    id: "gid://shopify/TaxonomyCategory/aa-6-3",
    name: "Bracelets",
  },
  featuredImage: image,
  images: [image],
  variants: [
    {
      id: "gid://shopify/ProductVariant/11",
      title: "Small",
      availableForSale: true,
      price: { amount: "35.00", currencyCode: "USD" },
      compareAtPrice: null,
      image,
      selectedOptions: [{ name: "Size", value: "Small" }],
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
    },
    {
      id: "gid://shopify/ProductVariant/12",
      title: "Large",
      availableForSale: false,
      price: { amount: "42.00", currencyCode: "USD" },
      compareAtPrice: null,
      image: null,
      selectedOptions: [{ name: "Size", value: "Large" }],
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
    },
  ],
  source: "shopify",
};

describe("product structured data", () => {
  it("uses normalized product offers, media, URLs, and availability", () => {
    const data = buildProductStructuredData({
      product,
      locale: "en-US",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Collections", path: "/collections" },
        { name: product.title, path: `/products/${product.handle}` },
      ],
    });

    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": "http://localhost:3000/products/aquamarine-bracelet#product",
          url: "http://localhost:3000/products/aquamarine-bracelet",
          name: "Aquamarine bracelet",
          description: "A pale-blue bracelet.",
          image: [image.url],
          offers: [
            {
              "@type": "Offer",
              url: "http://localhost:3000/products/aquamarine-bracelet",
              price: "35.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              price: "42.00",
              priceCurrency: "USD",
              availability: "https://schema.org/OutOfStock",
            },
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "http://localhost:3000/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Collections",
              item: "http://localhost:3000/collections",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Aquamarine bracelet",
              item: "http://localhost:3000/products/aquamarine-bracelet",
            },
          ],
        },
      ],
    });
    expect(
      buildProductStructuredData({
        product,
        locale: "en-US",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: product.title, path: `/products/${product.handle}` },
        ],
      }),
    ).toEqual(
      buildProductStructuredData({
        product,
        locale: "en-US",
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: product.title, path: `/products/${product.handle}` },
        ],
      }),
    );
  });
});

describe("collection structured data", () => {
  it("maps the visible product cards into a localized ItemList", () => {
    const data = buildCollectionStructuredData({
      name: "Todas las formas",
      description: "Catálogo de EE. UU.",
      path: "/collections",
      products: [product],
      locale: "es-US",
      breadcrumbs: [
        { name: "Inicio", path: "/" },
        { name: "Colecciones", path: "/collections" },
      ],
    });

    expect(data).toMatchObject({
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": "http://localhost:3000/es-us/collections#collection-page",
          url: "http://localhost:3000/es-us/collections",
          name: "Todas las formas",
          mainEntity: {
            "@id": "http://localhost:3000/es-us/collections#item-list",
          },
        },
        {
          "@type": "ItemList",
          numberOfItems: 1,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              url: "http://localhost:3000/es-us/products/aquamarine-bracelet",
              item: {
                "@type": "Product",
                name: "Aquamarine bracelet",
                image: image.url,
              },
            },
          ],
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { name: "Inicio", item: "http://localhost:3000/es-us" },
            {
              name: "Colecciones",
              item: "http://localhost:3000/es-us/collections",
            },
          ],
        },
      ],
    });
  });
});

describe("About structured data", () => {
  it("uses AboutPage for the hub and WebPage with breadcrumbs for a child", () => {
    const hub = buildAboutStructuredData({
      name: "About Joya Mana",
      description: "Our perspective and product standards.",
      path: "/about",
      locale: "en-US",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
      ],
      isRoot: true,
    });
    const child = buildAboutStructuredData({
      name: "Our Approach",
      path: "/about/our-approach",
      locale: "es-US",
      breadcrumbs: [
        { name: "Inicio", path: "/" },
        { name: "Nosotros", path: "/about" },
        { name: "Nuestro enfoque", path: "/about/our-approach" },
      ],
      isRoot: false,
    });

    expect(hub).toMatchObject({
      "@graph": [
        {
          "@type": "AboutPage",
          url: "http://localhost:3000/about",
          name: "About Joya Mana",
        },
        { "@type": "BreadcrumbList" },
      ],
    });
    expect(child).toMatchObject({
      "@graph": [
        {
          "@type": "WebPage",
          url: "http://localhost:3000/es-us/about/our-approach",
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { name: "Inicio", item: "http://localhost:3000/es-us" },
            {
              name: "Nosotros",
              item: "http://localhost:3000/es-us/about",
            },
            {
              name: "Nuestro enfoque",
              item: "http://localhost:3000/es-us/about/our-approach",
            },
          ],
        },
      ],
    });
  });
});

describe("editorial structured data", () => {
  it("uses BlogPosting for Blog and Article for Crystal Guide", () => {
    const blog = buildEditorialStructuredData({
      name: "How to choose clearly",
      description: "A practical buying guide.",
      path: "/blog/how-to-choose-clearly",
      locale: "en-US",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ],
      kind: "blog",
      author: "Tian Tian",
      publishedAt: "2026-08-30T12:00:00Z",
    });
    const crystal = buildEditorialStructuredData({
      name: "Amethyst",
      description: "A material reference.",
      path: "/crystals/amethyst",
      locale: "es-US",
      breadcrumbs: [
        { name: "Inicio", path: "/" },
        { name: "Guía de cristales", path: "/crystals" },
      ],
      kind: "crystals",
      publishedAt: "2026-08-30T12:00:00Z",
    });

    expect(blog).toMatchObject({
      "@graph": [
        {
          "@type": "BlogPosting",
          author: { "@type": "Person", name: "Tian Tian" },
        },
        { "@type": "BreadcrumbList" },
      ],
    });
    expect(crystal).toMatchObject({
      "@graph": [
        {
          "@type": "Article",
          url: "http://localhost:3000/es-us/crystals/amethyst",
        },
        { "@type": "BreadcrumbList" },
      ],
    });
  });
});

describe("structured data serialization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("escapes markup-closing characters before insertion into HTML", () => {
    const serialized = serializeStructuredData({
      name: "</script><script>alert(1)</script>",
    });

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
    expect(JSON.parse(serialized)).toEqual({
      name: "</script><script>alert(1)</script>",
    });
  });

  it("returns markup only when the site-wide indexability gate is open", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "false");
    vi.resetModules();
    const noindexModule = await import("./structured-data");
    expect(noindexModule.serializeIndexableStructuredData({ ok: true })).toBeNull();

    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://joyamana.com");
    vi.resetModules();
    const indexableModule = await import("./structured-data");
    expect(indexableModule.serializeIndexableStructuredData({ ok: true })).toBe(
      '{"ok":true}',
    );
  });
});
