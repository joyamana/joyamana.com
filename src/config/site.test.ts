import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site";

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
});
