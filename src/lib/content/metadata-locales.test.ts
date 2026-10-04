import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it.each([
  [false, "/about", undefined],
  [true, "/blog", undefined],
  [true, "/about", { utm_source: "email" }],
] as const)(
  "skips alternate reads when the current page cannot publish hreflang (%s, %s)",
  async (indexable, path, params) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", String(indexable));
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    const { publishedAlternateLocales } = await import("./metadata-locales");
    const ready = vi.fn().mockResolvedValue(true);
    expect(
      await publishedAlternateLocales("en-US", path, params, ready),
    ).toEqual([]);
    expect(ready).not.toHaveBeenCalled();
  },
);

it("reuses the current locale and reads only enabled equivalents", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
  const { publishedAlternateLocales } = await import("./metadata-locales");
  const ready = vi.fn().mockResolvedValue(true);
  expect(
    await publishedAlternateLocales("en-US", "/about", undefined, ready),
  ).toEqual(["en-US", "zh-Hant-US"]);
  expect(ready).toHaveBeenCalledExactlyOnceWith("zh-Hant-US");
  ready.mockRejectedValue(new Error("Alternate unavailable"));
  expect(
    await publishedAlternateLocales("en-US", "/about", undefined, ready),
  ).toEqual(["en-US"]);
});
