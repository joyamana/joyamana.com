import { afterEach, describe, expect, it, vi } from "vitest";
import {
  aboutPageForHandle,
  getPublishedShopifyAboutPaths,
  getShopifyAboutTree,
  SHOPIFY_ABOUT_TREE_QUERY,
} from "./shopify-about-pages";

const originalEnv = { ...process.env };

function richText(text: string) {
  return JSON.stringify({
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: text }],
      },
    ],
  });
}

function pageNode({
  handle,
  language = "EN",
  translated = true,
  complete = true,
  navigationTitle,
}: {
  handle: string;
  language?: "EN" | "ES";
  translated?: boolean;
  complete?: boolean;
  navigationTitle?: string;
}) {
  const isSpanish = language === "ES" && translated;
  const labels: Record<string, { en: string; es: string }> = {
    about: { en: "About Joya Mana", es: "Sobre Joya Mana" },
    "our-approach": { en: "Our Approach", es: "Nuestro enfoque" },
    "product-standards": {
      en: "Product Standards",
      es: "Estándares de producto",
    },
  };
  const label = labels[handle] ?? { en: handle, es: handle };
  const title = isSpanish ? label.es : label.en;
  const body = isSpanish
    ? `Contenido traducido para ${label.es}.`
    : `English content for ${label.en}.`;

  return {
    id: `gid://shopify/Metaobject/${handle}`,
    type: "content_page",
    handle,
    updatedAt: "2026-08-31T12:00:00Z",
    fields: [
      { key: "title", type: "single_line_text_field", value: title },
      {
        key: "navigation_title",
        type: "single_line_text_field",
        value: navigationTitle ?? title,
      },
      {
        key: "summary",
        type: "multi_line_text_field",
        value: isSpanish ? `Resumen de ${label.es}.` : `Summary of ${label.en}.`,
      },
      { key: "body", type: "rich_text_field", value: richText(body) },
      { key: "last_updated", type: "date", value: "2026-08-31" },
      ...(complete
        ? [
            {
              key: "seo_title",
              type: "single_line_text_field",
              value: title,
            },
            {
              key: "seo_description",
              type: "multi_line_text_field",
              value: isSpanish
                ? `Descripción de ${label.es}.`
                : `Description of ${label.en}.`,
            },
          ]
        : []),
    ],
  };
}

function aboutResponse({
  language,
  translatedHandles = [],
  children = ["our-approach", "product-standards"],
  childFieldType = "list.metaobject_reference",
  hasNextPage = false,
}: {
  language: "EN" | "ES";
  translatedHandles?: string[];
  children?: string[];
  childFieldType?: string;
  hasNextPage?: boolean;
}) {
  const translated = (handle: string) =>
    language === "EN" || translatedHandles.includes(handle);
  const root = pageNode({
    handle: "about",
    language,
    translated: translated("about"),
  });

  return {
    ...root,
    childPages: {
      type: childFieldType,
      references: {
        nodes: children.map((handle) =>
          pageNode({
            handle,
            language,
            translated: translated(handle),
          }),
        ),
        pageInfo: { hasNextPage },
      },
    },
  };
}

function stubAbout(
  build: (language: "EN" | "ES") => ReturnType<typeof aboutResponse> | null,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((_url: string, request: RequestInit) => {
      const payload = JSON.parse(String(request.body)) as {
        variables: { language: "EN" | "ES" };
      };
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: { metaobject: build(payload.variables.language) },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    }),
  );
}

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("Shopify About pages", () => {
  it("queries the fixed About root and its ordered child references", () => {
    expect(SHOPIFY_ABOUT_TREE_QUERY).toContain(
      "@inContext(country: $country, language: $language)",
    );
    expect(SHOPIFY_ABOUT_TREE_QUERY).toContain(
      'metaobject(handle: { type: $type, handle: $handle })',
    );
    expect(SHOPIFY_ABOUT_TREE_QUERY).toContain(
      'childPages: field(key: "child_pages")',
    );
    expect(SHOPIFY_ABOUT_TREE_QUERY).toContain("references(first: 50)");
    expect(SHOPIFY_ABOUT_TREE_QUERY).toContain("... on Metaobject");
  });

  it("keeps the Shopify reference order and exposes only referenced pages", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) =>
      aboutResponse({
        language,
        children: ["product-standards", "our-approach"],
      }),
    );

    const tree = await getShopifyAboutTree("en-US");
    expect(tree?.children.map((page) => page.handle)).toEqual([
      "product-standards",
      "our-approach",
    ]);
    expect(tree?.children[0]).toMatchObject({
      navigationTitle: "Product Standards",
      html: "<p>English content for Product Standards.</p>",
    });
    expect(tree && aboutPageForHandle(tree, "accessibility")).toBeNull();
  });

  it("omits duplicate, self-referenced, invalid, and incomplete children", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) => {
      const response = aboutResponse({ language, children: [] });
      response.childPages.references.nodes = [
        pageNode({ handle: "about", language }),
        pageNode({ handle: "our-approach", language }),
        pageNode({ handle: "our-approach", language }),
        pageNode({ handle: "product-standards", language, complete: false }),
        { ...pageNode({ handle: "wrong-type", language }), type: "other" },
      ];
      return response;
    });

    const tree = await getShopifyAboutTree("en-US");
    expect(tree?.children.map((page) => page.handle)).toEqual([
      "our-approach",
    ]);
  });

  it("does not render an empty or partially paginated relationship", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) =>
      aboutResponse({ language, hasNextPage: true }),
    );

    await expect(getShopifyAboutTree("en-US")).resolves.toMatchObject({
      children: [],
    });
  });

  it("falls navigation titles back to the page title", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) => {
      const response = aboutResponse({ language, children: [] });
      response.childPages.references.nodes = [
        pageNode({
          handle: "our-approach",
          language,
          navigationTitle: "",
        }),
      ];
      return response;
    });

    const tree = await getShopifyAboutTree("en-US");
    expect(tree?.children[0].navigationTitle).toBe("Our Approach");
  });

  it("derives only the SEO description from body when optional fields are empty", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) => {
      const response = aboutResponse({ language, children: [] });
      response.fields = response.fields.filter(
        (field) => field.key !== "summary" && field.key !== "seo_description",
      );
      return response;
    });

    const tree = await getShopifyAboutTree("en-US");
    expect(tree?.root).toMatchObject({
      summary: "",
      seoDescription: "English content for About Joya Mana.",
    });
  });

  it("publishes only the translated portion of the Spanish About tree", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) =>
      aboutResponse({
        language,
        translatedHandles:
          language === "ES" ? ["about", "our-approach"] : [],
      }),
    );

    await expect(
      getPublishedShopifyAboutPaths("es-US"),
    ).resolves.toEqual(["/about", "/about/our-approach"]);
    const tree = await getShopifyAboutTree("es-US");
    expect(tree?.root.usedDefaultLanguage).toBe(false);
    expect(tree?.children).toMatchObject([
      { handle: "our-approach", usedDefaultLanguage: false },
      { handle: "product-standards", usedDefaultLanguage: true },
    ]);
  });

  it("does not publish a localized child that is absent from the default tree", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) =>
      aboutResponse({
        language,
        children:
          language === "ES"
            ? ["our-approach", "product-standards"]
            : ["our-approach"],
        translatedHandles:
          language === "ES"
            ? ["about", "our-approach", "product-standards"]
            : [],
      }),
    );

    const tree = await getShopifyAboutTree("es-US");
    expect(tree?.children.map((page) => page.handle)).toEqual([
      "our-approach",
    ]);
  });

  it("keeps an untranslated root and its children out of the sitemap", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout((language) => aboutResponse({ language }));

    await expect(
      getPublishedShopifyAboutPaths("es-US"),
    ).resolves.toEqual([]);
  });

  it("returns null when the About root is not Storefront-visible", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubAbout(() => null);

    await expect(getShopifyAboutTree("en-US")).resolves.toBeNull();
  });
});
