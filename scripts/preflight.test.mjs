import { describe, expect, it } from "vitest";
import { validateEnvironment } from "./preflight.mjs";

describe("environment preflight", () => {
  it("accepts a safe local fail-closed configuration", () => {
    expect(
      validateEnvironment({
        NEXT_PUBLIC_SITE_INDEXABLE: "false",
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        SHOPIFY_CHECKOUT_ENABLED: "false",
        CONTACT_FORM_ENABLED: "false",
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
      CONTACT_FORM_ENABLED: "false",
    });

    expect(errors).toContain(
      "Vercel Production NEXT_PUBLIC_SITE_URL must be https://www.joyamana.com.",
    );
    expect(errors).toContain(
      "SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN are required for Vercel deployments.",
    );
  });

  it("rejects indexable Preview and enabled integrations without their secrets", () => {
    const errors = validateEnvironment({
      VERCEL: "1",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_SITE_INDEXABLE: "true",
      NEXT_PUBLIC_SITE_URL: "https://preview.example.com",
      SHOPIFY_STORE_DOMAIN: "joya-mana.myshopify.com",
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: "private-token",
      SHOPIFY_CHECKOUT_ENABLED: "true",
      SHOPIFY_CHECKOUT_DOMAIN: "https://checkout.joyamana.com/path",
      CONTACT_FORM_ENABLED: "true",
    });

    expect(errors).toContain("Vercel Preview deployments must remain noindex.");
    expect(errors).toContain(
      "SHOPIFY_CHECKOUT_DOMAIN must be a bare hostname or HTTPS origin.",
    );
    expect(errors).toContain(
      "RESEND_API_KEY is required when CONTACT_FORM_ENABLED is true.",
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
});
