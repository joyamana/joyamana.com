import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublishedShopifyContentPagePaths,
  getShopifyContentPage,
  renderShopifyRichText,
  SHOPIFY_CONTENT_PAGE_QUERY,
} from "./shopify-content-pages";

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

function contentPage(language: "EN" | "ES", translated = false) {
  const isSpanish = language === "ES" && translated;
  return {
    id: "gid://shopify/Metaobject/1",
    type: "content_page",
    handle: "accessibility",
    updatedAt: "2026-08-30T12:00:00Z",
    fields: [
      {
        key: "internal_name",
        type: "single_line_text_field",
        value: "Accessibility",
      },
      {
        key: "title",
        type: "single_line_text_field",
        value: isSpanish ? "Accesibilidad" : "Accessibility",
      },
      {
        key: "body",
        type: "rich_text_field",
        value: richText(isSpanish ? "Contenido accesible." : "Accessible content."),
      },
      { key: "last_updated", type: "date", value: "2026-08-30" },
      {
        key: "seo_title",
        type: "single_line_text_field",
        value: isSpanish ? "Accesibilidad" : "Accessibility",
      },
      {
        key: "seo_description",
        type: "multi_line_text_field",
        value: isSpanish ? "Información de accesibilidad." : "Accessibility information.",
      },
    ],
  };
}

function stubContentPage(translated = false) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((_url: string, request: RequestInit) => {
      const payload = JSON.parse(String(request.body)) as {
        variables: { language: "EN" | "ES" };
      };
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              metaobject: contentPage(payload.variables.language, translated),
            },
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

describe("Shopify content pages", () => {
  it("queries a content page by type and handle in market context", () => {
    expect(SHOPIFY_CONTENT_PAGE_QUERY).toContain(
      "@inContext(country: $country, language: $language)",
    );
    expect(SHOPIFY_CONTENT_PAGE_QUERY).toContain(
      "metaobject(handle: { type: $type, handle: $handle })",
    );
  });

  it("renders Shopify rich text with a small safe HTML allowlist", () => {
    const html = renderShopifyRichText(
      JSON.stringify({
        type: "root",
        children: [
          {
            type: "heading",
            level: 1,
            children: [{ type: "text", value: "Section" }],
          },
          {
            type: "paragraph",
            children: [
              { type: "text", value: "Safe & ", bold: true },
              {
                type: "link",
                url: "mailto:info@joyamana.com",
                target: "_blank",
                children: [{ type: "text", value: "email" }],
              },
              {
                type: "link",
                url: "https://example.com",
                target: "_blank",
                children: [{ type: "text", value: "external" }],
              },
              {
                type: "link",
                url: "/privacy",
                target: "_blank",
                children: [{ type: "text", value: "internal" }],
              },
              {
                type: "link",
                url: "javascript:alert(1)",
                target: "_blank",
                children: [{ type: "text", value: "bad" }],
              },
            ],
          },
          {
            type: "script",
            children: [{ type: "text", value: "alert(1)" }],
          },
        ],
      }),
    );

    expect(html).toBe(
      '<h2>Section</h2><p><strong>Safe &amp; </strong><a href="mailto:info@joyamana.com">email</a><a href="https://example.com" target="_blank" rel="noopener noreferrer">external</a><a href="/privacy">internal</a>bad</p>',
    );
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("alert(1)");
    expect(html.match(/target="_blank"/g)).toHaveLength(1);
  });

  it("maps the published English accessibility entry", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubContentPage();

    await expect(
      getShopifyContentPage("accessibility", "en-US"),
    ).resolves.toMatchObject({
      handle: "accessibility",
      title: "Accessibility",
      html: "<p>Accessible content.</p>",
      contentLocale: "en-US",
      usedDefaultLanguage: false,
    });
    await expect(
      getPublishedShopifyContentPagePaths("en-US"),
    ).resolves.toEqual(["/accessibility"]);
  });

  it("keeps an untranslated Spanish fallback out of published paths", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubContentPage();

    await expect(
      getShopifyContentPage("accessibility", "es-US"),
    ).resolves.toMatchObject({
      contentLocale: "en-US",
      requestedLocale: "es-US",
      usedDefaultLanguage: true,
    });
    await expect(
      getPublishedShopifyContentPagePaths("es-US"),
    ).resolves.toEqual([]);
  });

  it("publishes a complete Spanish translation", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    stubContentPage(true);

    await expect(
      getShopifyContentPage("accessibility", "es-US"),
    ).resolves.toMatchObject({
      title: "Accesibilidad",
      contentLocale: "es-US",
      usedDefaultLanguage: false,
    });
  });
});
