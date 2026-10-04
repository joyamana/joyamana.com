import { afterEach, describe, expect, it, vi } from "vitest";

const contentMocks = vi.hoisted(() => ({
  getShopifyContentPage: vi.fn(),
}));
const policyMocks = vi.hoisted(() => ({
  getShopifyPolicy: vi.fn(),
}));

vi.mock("./shopify-content-pages", () => contentMocks);
vi.mock("./shopify-policies", () => policyMocks);
vi.mock("@/config/indexing", () => ({
  indexingPolicy: {
    "en-US": {
      core: true,
      commerce: true,
      policies: true,
      editorial: true,
    },
    "zh-Hant-US": {
      core: true,
      commerce: true,
      policies: true,
      editorial: true,
    },
  },
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("service page metadata", () => {
  it("omits an untranslated Chinese Policy from English hreflang", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    policyMocks.getShopifyPolicy.mockImplementation(
      async (_kind: string, locale: string) => ({
        usedDefaultLanguage: locale === "zh-Hant-US",
      }),
    );
    const { buildPolicyPageMetadata } = await import("./service-page-metadata");

    const metadata = await buildPolicyPageMetadata({
      title: "Privacy Policy",
      description: "Privacy details.",
      kind: "privacy",
      locale: "en-US",
    });

    expect(metadata.alternates).toEqual({
      canonical: "https://www.joyamana.com/privacy",
      languages: {
        "en-US": "https://www.joyamana.com/privacy",
      },
    });
  });

  it("publishes bidirectional Accessibility hreflang only when both pages are localized", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    contentMocks.getShopifyContentPage.mockImplementation(
      async (_handle: string, locale: string) => ({
        seoTitle: locale === "zh-Hant-US" ? "無障礙使用" : "Accessibility",
        seoDescription: "Accessibility details.",
        usedDefaultLanguage: false,
        translationReady: true,
      }),
    );
    const { buildContentPageMetadata } =
      await import("./service-page-metadata");

    const metadata = await buildContentPageMetadata({
      title: "Accessibility",
      description: "Accessibility details.",
      handle: "accessibility",
      locale: "en-US",
    });

    expect(metadata.alternates).toEqual({
      canonical: "https://www.joyamana.com/accessibility",
      languages: {
        "en-US": "https://www.joyamana.com/accessibility",
        "zh-Hant-US": "https://www.joyamana.com/zh-hant-us/accessibility",
      },
    });
  });
  it.each([false, true])(
    "reads only the current Policy when hreflang is disabled or parameterized (%s)",
    async (indexable) => {
      vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", String(indexable));
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
      policyMocks.getShopifyPolicy.mockResolvedValue({
        usedDefaultLanguage: false,
      });
      const { buildPolicyPageMetadata } =
        await import("./service-page-metadata");
      await buildPolicyPageMetadata({
        title: "Privacy",
        description: "Privacy policy",
        kind: "privacy",
        locale: "en-US",
        searchParams: indexable ? { utm_source: "email" } : undefined,
      });
      expect(policyMocks.getShopifyPolicy).toHaveBeenCalledExactlyOnceWith(
        "privacy",
        "en-US",
      );
    },
  );
});
