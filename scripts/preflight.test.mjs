import { describe, expect, it } from "vitest";
import { validateEnvironment } from "./preflight.mjs";

describe("environment preflight", () => {
  it("requires an origin whenever indexing is enabled, including outside Vercel", () => {
    expect(
      validateEnvironment({ NEXT_PUBLIC_SITE_INDEXABLE: "true" }),
    ).toContain(
      "NEXT_PUBLIC_SITE_URL is required for Vercel or indexable deployments.",
    );
  });
  it.each([" true ", "false ", " "])(
    "rejects ambiguous boolean values: %s",
    (value) => {
      expect(
        validateEnvironment({ SHOPIFY_CHECKOUT_ENABLED: value }),
      ).toContain("SHOPIFY_CHECKOUT_ENABLED must be either true or false.");
    },
  );
  it("accepts a safe local fail-closed configuration", () => {
    expect(
      validateEnvironment({
        NEXT_PUBLIC_SITE_INDEXABLE: "false",
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        SHOPIFY_CHECKOUT_ENABLED: "false",
      }),
    ).toEqual([]);
  });

  it("requires the approved canonical origin and Shopify credentials in Production", () => {
    const errors = validateEnvironment({
      VERCEL: "1",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_INDEXABLE: "false",
      NEXT_PUBLIC_SITE_URL: "https://joyamana.vercel.app",
      SHOPIFY_CHECKOUT_ENABLED: "false",
    });

    expect(errors).toContain(
      "Vercel Production NEXT_PUBLIC_SITE_URL must be https://www.joyamana.com.",
    );
    expect(errors).toContain(
      "SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are required for Vercel deployments.",
    );
  });

  it("rejects indexable Preview and an invalid Checkout domain", () => {
    const errors = validateEnvironment({
      VERCEL: "1",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_SITE_INDEXABLE: "true",
      NEXT_PUBLIC_SITE_URL: "https://preview.example.com",
      SHOPIFY_STORE_DOMAIN: "joya-mana.myshopify.com",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: "private-token",
      SHOPIFY_CHECKOUT_ENABLED: "true",
      SHOPIFY_CHECKOUT_DOMAIN: "https://checkout.joyamana.com/path",
    });

    expect(errors).toContain("Vercel Preview deployments must remain noindex.");
    expect(errors).toContain(
      "SHOPIFY_CHECKOUT_DOMAIN must be a bare hostname or HTTPS origin.",
    );
  });

  it("never includes secret values in validation errors", () => {
    const secret = "never-print-this-token";
    const errors = validateEnvironment({
      VERCEL: "1",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_SITE_URL: "not-an-origin",
      SHOPIFY_STORE_DOMAIN: "https://bad.example.com/path",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: secret,
    });

    expect(errors.join(" ")).not.toContain(secret);
  });

  it("leaves granular indexing scope to the version-controlled policy", () => {
    const errors = validateEnvironment({
      NEXT_PUBLIC_SITE_INDEXABLE: "true",
      NEXT_PUBLIC_SITE_URL: "https://www.joyamana.com",
      SHOPIFY_CHECKOUT_ENABLED: "false",
    });

    expect(errors).toEqual([]);
  });
});
