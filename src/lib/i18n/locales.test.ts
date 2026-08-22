import { describe, expect, it } from "vitest";
import {
  alternateLanguageLocale,
  canadaLocaleFromSegment,
  enabledLocales,
  isLocaleEnabled,
  localePath,
  marketIdForLocale,
  stripLocalePrefix,
} from "./locales";

describe("locale routing", () => {
  it("keeps English at the root", () => {
    expect(localePath("en-US", "/collections")).toBe("/collections");
  });

  it("places Spanish under /es-us", () => {
    expect(localePath("es-US", "/collections")).toBe("/es-us/collections");
    expect(localePath("es-US", "/")).toBe("/es-us");
  });

  it("can switch a Spanish pathname back to its shared route", () => {
    expect(stripLocalePrefix("/es-us/products/example")).toBe(
      "/products/example",
    );
  });

  it("retains future Canada paths without enabling the market", () => {
    expect(localePath("en-CA", "/products/example")).toBe(
      "/en-ca/products/example",
    );
    expect(localePath("fr-CA", "/products/example")).toBe(
      "/fr-ca/products/example",
    );
    expect(marketIdForLocale("en-CA")).toBe("ca");
    expect(marketIdForLocale("fr-CA")).toBe("ca");
    expect(alternateLanguageLocale("en-CA")).toBe("fr-CA");
    expect(isLocaleEnabled("en-CA")).toBe(false);
    expect(isLocaleEnabled("fr-CA")).toBe(false);
    expect(canadaLocaleFromSegment("en-ca")).toBeNull();
    expect(canadaLocaleFromSegment("fr-ca")).toBeNull();
    expect(enabledLocales).toEqual(["en-US", "es-US"]);
  });
});
