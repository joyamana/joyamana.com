import { afterEach, describe, expect, it, vi } from "vitest";
import { indexGroupForPath, resolveSiteUrl } from "./site";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("canonical site URL configuration", () => {
  it("allows a local HTTP origin while the storefront is noindex", () => {
    expect(resolveSiteUrl("http://localhost:3000", false)).toBe(
      "http://localhost:3000",
    );
  });

  it.each([
    undefined,
    "http://joyamana.com",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
  ])("fails closed for an indexable non-production origin: %s", (value) => {
    expect(() => resolveSiteUrl(value, true)).toThrow(
      "An indexable storefront requires a non-local HTTPS NEXT_PUBLIC_SITE_URL.",
    );
  });

  it("normalizes an indexable production origin", () => {
    expect(resolveSiteUrl("https://joyamana.com/", true)).toBe(
      "https://joyamana.com",
    );
  });

  it.each([
    "not-a-url",
    "ftp://joyamana.com",
    "https://user:secret@joyamana.com",
    "https://joyamana.com/store",
    "https://joyamana.com/?preview=1",
  ])("rejects a value that is not a clean HTTP(S) origin: %s", (value) => {
    expect(() => resolveSiteUrl(value, false)).toThrow(
      "NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) origin.",
    );
  });

  it.each([
    ["/", "core"],
    ["/about/our-approach", "core"],
    ["/products/aquamarine", "commerce"],
    ["/privacy", "policies"],
    ["/blog/story", "editorial"],
    ["/future-page", null],
  ])("classifies %s into the fail-closed index group %s", (path, group) => {
    expect(indexGroupForPath(path)).toBe(group);
  });

  it("applies the approved locale and page-group release matrix", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_INDEXABLE", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.joyamana.com");
    vi.resetModules();
    const { isIndexingEnabledFor } = await import("./site");

    expect(isIndexingEnabledFor("en-US", "/about")).toBe(true);
    expect(isIndexingEnabledFor("en-US", "/shop")).toBe(false);
    expect(isIndexingEnabledFor("es-US", "/about")).toBe(true);
    expect(isIndexingEnabledFor("en-US", "/privacy")).toBe(true);
    expect(isIndexingEnabledFor("es-US", "/terms")).toBe(true);
    expect(isIndexingEnabledFor("en-US", "/blog/story")).toBe(false);
    expect(isIndexingEnabledFor("en-US", "/future-page")).toBe(false);
  });
});
