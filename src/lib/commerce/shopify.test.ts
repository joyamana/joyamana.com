import { afterEach, describe, expect, it, vi } from "vitest";
import { shopifyFetch, ShopifyRequestError } from "./shopify";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("Shopify Storefront API client", () => {
  it("keeps the Headless private token in the server-only private header", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { shop: { name: "Joya Mana" } } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      shopifyFetch<{ shop: { name: string } }>("query { shop { name } }"),
    ).resolves.toEqual({ shop: { name: "Joya Mana" } });

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.headers).toMatchObject({
      "Shopify-Storefront-Private-Token": "private-test-token",
    });
    expect(request.headers).not.toHaveProperty(
      "X-Shopify-Storefront-Access-Token",
    );
  });

  it("fails before making a request when credentials are missing", async () => {
    delete process.env.SHOPIFY_STORE_DOMAIN;
    delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(shopifyFetch("query { shop { name } }")).rejects.toEqual(
      expect.objectContaining<Partial<ShopifyRequestError>>({
        name: "ShopifyRequestError",
        message: "Shopify Storefront API credentials are not configured.",
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports HTTP failures without including credentials", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "never-log-this";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    const request = shopifyFetch("query { shop { name } }");
    await expect(request).rejects.toMatchObject({
      name: "ShopifyRequestError",
      message: "Shopify Storefront API returned 401.",
      status: 401,
    });
    await expect(request).rejects.not.toThrow("never-log-this");
  });
});
