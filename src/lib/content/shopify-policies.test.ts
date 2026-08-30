import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublishedShopifyPolicyPaths,
  getShopifyPolicy,
  sanitizeShopifyPolicyHtml,
  SHOPIFY_POLICIES_QUERY,
} from "./shopify-policies";

const originalEnv = { ...process.env };

function policy(id: string, title: string, body: string) {
  return {
    id: `gid://shopify/ShopPolicy/${id}`,
    title,
    url: `https://checkout.shopify.com/policies/${id}.html?locale=en`,
    body,
  };
}

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("Shopify policies", () => {
  it("queries all Shopify policy sources in the requested market context", () => {
    expect(SHOPIFY_POLICIES_QUERY).toContain(
      "@inContext(country: $country, language: $language)",
    );
    expect(SHOPIFY_POLICIES_QUERY).toContain("refundPolicy");
    expect(SHOPIFY_POLICIES_QUERY).toContain("privacyPolicy");
    expect(SHOPIFY_POLICIES_QUERY).toContain("shippingPolicy");
    expect(SHOPIFY_POLICIES_QUERY).toContain("termsOfService");
  });

  it("keeps safe policy structure while removing executable markup and attributes", () => {
    const sanitized = sanitizeShopifyPolicyHtml(
      '<h1 onclick="bad()">Returns</h1><p>Keep &amp; read <a href="https://example.com" target="_blank" rel="opener" onclick="bad()">details</a>.</p><a href="/privacy" target="_blank">privacy</a><a href="mailto:info@example.com" target="_blank">email</a><a href="https://example.org" target="_top">same tab</a><script>alert(1)</script><a href="javascript:bad()" target="_blank">bad</a><img src=x onerror=bad()>',
    );

    expect(sanitized).toBe(
      '<p>Keep &amp; read <a href="https://example.com" target="_blank" rel="noopener noreferrer">details</a>.</p><a href="/privacy">privacy</a><a href="mailto:info@example.com">email</a><a href="https://example.org">same tab</a><a>bad</a>',
    );
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).not.toContain("alert(1)");
    expect(sanitized).not.toContain("<img");
    expect(sanitized).not.toContain('rel="opener"');
    expect(sanitized.match(/target="_blank"/g)).toHaveLength(1);
  });

  it("identifies Shopify default-language fallback for Spanish", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    const englishPolicies = {
      refundPolicy: policy("1", "Refund Policy", "<h1>Refund Policy</h1>"),
      privacyPolicy: policy("2", "Privacy Policy", "<h1>Privacy Policy</h1>"),
      shippingPolicy: policy(
        "3",
        "Shipping Policy",
        "<h1>Shipping Policy</h1>",
      ),
      termsOfService: policy(
        "4",
        "Terms of Service",
        "<h1>Terms of Service</h1>",
      ),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ data: { shop: englishPolicies } }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        ),
      ),
    );

    const result = await getShopifyPolicy("returns", "es-US");

    expect(result).toMatchObject({
      requestedLocale: "es-US",
      contentLocale: "en-US",
      usedDefaultLanguage: true,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    await expect(getPublishedShopifyPolicyPaths("es-US")).resolves.toEqual(
      [],
    );
  });

  it("publishes an actual Spanish translation without a fallback notice", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((_url: string, request: RequestInit) => {
        const payload = JSON.parse(String(request.body)) as {
          variables: { language: "EN" | "ES" };
        };
        const isSpanish = payload.variables.language === "ES";
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                shop: {
                  refundPolicy: policy(
                    "1",
                    isSpanish ? "Política de devoluciones" : "Refund Policy",
                    isSpanish
                      ? "<h1>Política de devoluciones</h1>"
                      : "<h1>Refund Policy</h1>",
                  ),
                  privacyPolicy: null,
                  shippingPolicy: null,
                  termsOfService: null,
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ),
        );
      }),
    );

    await expect(getShopifyPolicy("returns", "es-US")).resolves.toMatchObject({
      contentLocale: "es-US",
      usedDefaultLanguage: false,
    });
  });

  it("maps shipping and terms and publishes their English paths", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(new Response(
          JSON.stringify({
            data: {
              shop: {
                refundPolicy: null,
                privacyPolicy: null,
                shippingPolicy: policy(
                  "3",
                  "Shipping Policy",
                  "<h1>Shipping Policy</h1><p>Ships in 1–3 days.</p>",
                ),
                termsOfService: policy(
                  "4",
                  "Terms of Service",
                  "<h1>Terms of Service</h1><p>Store terms.</p>",
                ),
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )),
      ),
    );

    await expect(getShopifyPolicy("shipping", "en-US")).resolves.toMatchObject(
      {
        kind: "shipping",
        title: "Shipping Policy",
        html: "<p>Ships in 1–3 days.</p>",
      },
    );
    await expect(getShopifyPolicy("terms", "en-US")).resolves.toMatchObject({
      kind: "terms",
      title: "Terms of Service",
      html: "<p>Store terms.</p>",
    });
    await expect(getPublishedShopifyPolicyPaths("en-US")).resolves.toEqual([
      "/shipping",
      "/terms",
    ]);
  });
});
