import { afterEach, describe, expect, it, vi } from "vitest";
import {
  shopifyFetch,
  shopifyMutation,
  ShopifyRequestError,
} from "./shopify";

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
    expect(request).toMatchObject({
      next: { revalidate: 300 },
    });
  });

  it("forwards only a validated buyer IP with private-token requests", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { ok: true } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await shopifyFetch("query { shop { name } }", {}, {
      buyerIp: "203.0.113.9",
      cache: "no-store",
    });
    await shopifyFetch("query { shop { name } }", {}, {
      buyerIp: "not-an-ip",
      cache: "no-store",
    });

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "Shopify-Storefront-Buyer-IP": "203.0.113.9",
    });
    expect(fetchMock.mock.calls[1]?.[1]?.headers).not.toHaveProperty(
      "Shopify-Storefront-Buyer-IP",
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
        kind: "configuration",
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
      kind: "http",
      message: "Shopify Storefront API returned 401.",
      status: 401,
    });
    await expect(request).rejects.not.toThrow("never-log-this");
  });

  it("classifies HTTP rate limits separately", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "never-log-this";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 429 })),
    );

    await expect(shopifyFetch("query { shop { name } }")).rejects.toMatchObject({
      kind: "rate_limit",
      status: 429,
    });
  });

  it("classifies an aborted Storefront request as a timeout", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, request: RequestInit) =>
        new Promise((_resolve, reject) => {
          request.signal?.addEventListener("abort", () => {
            reject(request.signal?.reason);
          });
        }),
      ),
    );

    await expect(
      shopifyFetch("query { shop { name } }", {}, { timeoutMs: 5 }),
    ).rejects.toMatchObject({
      kind: "timeout",
      message: "Shopify Storefront API request timed out.",
    });
  });

  it("rejects a URL or path instead of accepting an unvalidated shop domain", async () => {
    process.env.SHOPIFY_STORE_DOMAIN =
      "https://joya-mana.myshopify.com/admin?token=secret";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(shopifyFetch("query { shop { name } }")).rejects.toMatchObject({
      kind: "configuration",
      message: "SHOPIFY_STORE_DOMAIN must be a bare myshopify.com hostname.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid Storefront API version before making a request", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    process.env.SHOPIFY_STOREFRONT_API_VERSION = "../../admin";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(shopifyFetch("query { shop { name } }")).rejects.toMatchObject({
      kind: "configuration",
      message:
        "SHOPIFY_STOREFRONT_API_VERSION must be a dated quarterly API version.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("classifies GraphQL errors without returning their messages or credentials", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "never-log-this";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: { products: null },
            errors: [
              {
                message: "A raw upstream diagnostic should stay internal.",
                extensions: { code: "ACCESS_DENIED" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const request = shopifyFetch("query { products(first: 1) { nodes { id } } }");
    await expect(request).rejects.toMatchObject({
      kind: "graphql",
      message: "Shopify Storefront API returned GraphQL errors.",
      graphQLErrorCodes: ["ACCESS_DENIED"],
    });
    await expect(request).rejects.not.toThrow("raw upstream diagnostic");
    await expect(request).rejects.not.toThrow("never-log-this");
  });

  it("supports tagged query caching and explicitly uncached mutations", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { ok: true } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await shopifyFetch("query Catalog { shop { name } }", {}, {
      cache: "force-cache",
      revalidate: 60,
      tags: ["shopify:catalog:us"],
    });
    await shopifyMutation("mutation CartCreate { cartCreate { cart { id } } }");

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: { revalidate: 60, tags: ["shopify:catalog:us"] },
    });
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ cache: "no-store" });
    expect(fetchMock.mock.calls[1]?.[1]).not.toHaveProperty("next");
  });

  it("classifies network failures without exposing the underlying exception", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "joya-mana.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = "private-test-token";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("socket secret")));

    await expect(shopifyFetch("query { shop { name } }")).rejects.toMatchObject({
      kind: "network",
      message:
        "Shopify Storefront API request failed before receiving a response.",
    });
  });
});
