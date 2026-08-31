import { afterEach, describe, expect, it, vi } from "vitest";

const originalIndexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

vi.mock("@/config/indexing", () => ({
  indexingPolicy: {
    locales: { "en-US": true, "es-US": false },
    groups: {
      core: true,
      commerce: false,
      policies: false,
      editorial: false,
    },
  },
}));

afterEach(() => {
  if (originalIndexable === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_INDEXABLE;
  } else {
    process.env.NEXT_PUBLIC_SITE_INDEXABLE = originalIndexable;
  }
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
  vi.resetModules();
});

describe("robots metadata", () => {
  it("allows crawlers to read page-level noindex directives while the gate is closed", async () => {
    process.env.NEXT_PUBLIC_SITE_INDEXABLE = "false";
    vi.resetModules();
    const { default: robots } = await import("./robots");

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: undefined,
    });
  });

  it("advertises the sitemap only while indexing is enabled", async () => {
    process.env.NEXT_PUBLIC_SITE_INDEXABLE = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://joyamana.com";
    vi.resetModules();
    const { default: robots } = await import("./robots");

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://joyamana.com/sitemap.xml",
    });
  });
});
