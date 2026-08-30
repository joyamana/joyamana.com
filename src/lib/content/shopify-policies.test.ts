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
  it("queries both policy sources in the requested market context", () => {
    expect(SHOPIFY_POLICIES_QUERY).toContain(
      "@inContext(country: $country, language: $language)",
    );
    expect(SHOPIFY_POLICIES_QUERY).toContain("refundPolicy");
    expect(SHOPIFY_POLICIES_QUERY).toContain("privacyPolicy");
  });

  it("keeps safe policy structure while removing executable markup and attributes", () => {
    const sanitized = sanitizeShopifyPolicyHtml(
      '<h1 onclick="bad()">Returns</h1><p>Keep &amp; read <a href="https://example.com" target="_blank" onclick="bad()">details</a>.</p><script>alert(1)</script><a href="javascript:bad()">bad</a><img src=x onerror=bad()>',
    );

    expect(sanitized).toBe(
      '<p>Keep &amp; read <a href="https://example.com">details</a>.</p><a>bad</a>',
    );
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).not.toContain("alert(1)");
    expect(sanitized).not.toContain("<img");
  });

  it("identifies Shopify default-language fallback for Spanish", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    const englishPolicies = {
      refundPolicy: policy("1", "Refund Policy", "<h1>Refund Policy</h1>"),
      privacyPolicy: policy("2", "Privacy Policy", "<h1>Privacy Policy</h1>"),
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
});
