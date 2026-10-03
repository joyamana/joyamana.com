import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("parameterized Schema gate", () => {
  it("keeps Schema on eligible clean pages and removes it for filter, sort and variant parameters", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    vi.resetModules();
    const { serializeIndexableStructuredData } =
      await import("./structured-data");
    expect(
      serializeIndexableStructuredData(
        { name: "Shop" },
        { locale: "en-US", path: "/shop" },
      ),
    ).not.toBeNull();
    for (const searchParams of [
      { color: "purple" },
      { sort: "price-asc" },
      { variant: "11" },
    ]) {
      expect(
        serializeIndexableStructuredData(
          { name: "Shop" },
          { locale: "en-US", path: "/shop", searchParams },
        ),
      ).toBeNull();
    }
  });
});
