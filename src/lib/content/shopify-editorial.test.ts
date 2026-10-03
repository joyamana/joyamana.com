import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublishedShopifyEditorialPaths,
  getShopifyEditorialArticle,
  getShopifyEditorialIndex,
  SHOPIFY_EDITORIAL_ARTICLE_QUERY,
  SHOPIFY_EDITORIAL_INDEX_QUERY,
} from "./shopify-editorial";

const originalEnv = { ...process.env };

function articleNode({
  handle,
  language,
  translated,
  excerpt = "",
}: {
  handle: string;
  language: "EN" | "ES";
  translated: boolean;
  excerpt?: string;
}) {
  const isSpanish = language === "ES" && translated;
  return {
    id: `gid://shopify/Article/${handle}`,
    handle,
    title: isSpanish ? `Artículo ${handle}` : `Article ${handle}`,
    excerpt,
    content: isSpanish
      ? `Contenido traducido para ${handle}.`
      : `English content for ${handle}.`,
    contentHtml: isSpanish
      ? `<p>Contenido traducido para ${handle}.</p>`
      : `<p>English content for ${handle}.</p>`,
    publishedAt: "2026-08-30T12:00:00Z",
    image: null,
    seo: { title: null, description: null },
    tags: ["Guidance"],
    authorV2: { name: "Tian Tian" },
  };
}

function stubEditorial({
  translatedHandles = [],
}: {
  translatedHandles?: string[];
} = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((_url: string, request: RequestInit) => {
      const payload = JSON.parse(String(request.body)) as {
        variables: {
          language: "EN" | "ES";
          blogHandle: "blog" | "crystals";
          articleHandle?: string;
        };
      };
      const { language, blogHandle, articleHandle } = payload.variables;
      const handles =
        blogHandle === "blog" ? ["first-story", "second-story"] : ["amethyst"];
      const node = (handle: string) =>
        articleNode({
          handle,
          language,
          translated: language === "EN" || translatedHandles.includes(handle),
        });
      const blog = {
        id: `gid://shopify/Blog/${blogHandle}`,
        handle: blogHandle,
        title: blogHandle === "blog" ? "Blog" : "Crystals",
        seo: { title: null, description: null },
        ...(articleHandle
          ? {
              articleByHandle: handles.includes(articleHandle)
                ? node(articleHandle)
                : null,
            }
          : {
              articles: {
                nodes: handles.map(node),
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            }),
      };
      return Promise.resolve(
        new Response(JSON.stringify({ data: { blog } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }),
  );
}

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("Shopify editorial content", () => {
  it("rejects content that becomes empty after sanitizing and validates image hosts", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    const node = articleNode({
      handle: "first-story",
      language: "EN",
      translated: true,
    });
    node.contentHtml =
      '<h1>Title</h1><p onclick="bad()">Visible body &copy;</p><script>alert(1)</script>';
    const fixture = {
      ...node,
      image: {
        url: "https://example.com/cdn.shopify.com/image.jpg",
        altText: "Image",
        width: 1200,
        height: 900,
      },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                blog: {
                  id: "gid://shopify/Blog/1",
                  handle: "blog",
                  articleByHandle: fixture,
                },
              },
            }),
          ),
        ),
      ),
    );
    const entry = await getShopifyEditorialArticle(
      "blog",
      "first-story",
      "en-US",
    );
    expect(entry?.contentHtml).toContain("<h2>Title</h2>");
    expect(entry?.contentHtml).toContain("Visible body ©");
    expect(entry?.contentHtml).not.toMatch(/onclick|script|alert/);
    expect(entry?.image).toBeNull();
    fixture.contentHtml = "<script>alert(1)</script>";
    expect(
      await getShopifyEditorialArticle("blog", "first-story", "en-US"),
    ).toBeNull();
  });

  it("queries Shopify Blog and Article resources in market context", () => {
    expect(SHOPIFY_EDITORIAL_INDEX_QUERY).toContain(
      "@inContext(country: $country, language: $language)",
    );
    expect(SHOPIFY_EDITORIAL_INDEX_QUERY).toContain(
      "blog(handle: $blogHandle)",
    );
    expect(SHOPIFY_EDITORIAL_INDEX_QUERY).toContain(
      "articles(first: 50, after: $after",
    );
    expect(SHOPIFY_EDITORIAL_ARTICLE_QUERY).toContain(
      "articleByHandle(handle: $articleHandle)",
    );
  });

  it("maps the two native Shopify blogs to their branded routes", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubEditorial();

    await expect(
      getShopifyEditorialIndex("blog", "en-US"),
    ).resolves.toMatchObject({
      handle: "blog",
      articles: [
        {
          handle: "first-story",
          excerpt: "English content for first-story.",
          usedDefaultLanguage: false,
        },
        { handle: "second-story" },
      ],
    });
    await expect(
      getPublishedShopifyEditorialPaths("crystals", "en-US"),
    ).resolves.toEqual(["/crystals", "/crystals/amethyst"]);
  });

  it("keeps untranslated Spanish articles visible as fallback but out of published paths", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubEditorial();

    await expect(
      getShopifyEditorialArticle("blog", "first-story", "es-US"),
    ).resolves.toMatchObject({
      contentLocale: "en-US",
      requestedLocale: "es-US",
      usedDefaultLanguage: true,
    });
    await expect(
      getPublishedShopifyEditorialPaths("blog", "es-US"),
    ).resolves.toEqual([]);
  });

  it("publishes only the translated portion of a Spanish blog", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubEditorial({ translatedHandles: ["first-story"] });

    const index = await getShopifyEditorialIndex("blog", "es-US");
    expect(index?.articles).toMatchObject([
      { handle: "first-story", usedDefaultLanguage: false },
      { handle: "second-story", usedDefaultLanguage: true },
    ]);
    await expect(
      getPublishedShopifyEditorialPaths("blog", "es-US"),
    ).resolves.toEqual(["/blog", "/blog/first-story"]);
  });

  it("returns null for an unknown article handle", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubEditorial();

    await expect(
      getShopifyEditorialArticle("blog", "missing", "en-US"),
    ).resolves.toBeNull();
    await expect(
      getShopifyEditorialArticle("blog", "Not Safe", "en-US"),
    ).resolves.toBeNull();
  });
});
