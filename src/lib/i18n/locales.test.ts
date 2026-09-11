import { describe, expect, it } from "vitest";
import {
  languageOptionsFor,
  localeForPath,
  locales,
  enabledLocales,
  isLocaleEnabled,
  localePath,
  marketIdForLocale,
  stripLocalePrefix,
} from "./locales";
import { localeRegistry, isEnabledLocale, shopifyContextForLocale } from "@/config/locales";

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
    expect(languageOptionsFor("en-CA")).toEqual([]);
    expect(isLocaleEnabled("en-CA")).toBe(false);
    expect(isLocaleEnabled("fr-CA")).toBe(false);
    expect(enabledLocales).toEqual(["en-US", "es-US", "zh-Hant-US"]);
  });

  it("keeps BCP 47 identity distinct from paths and provider/format codes", () => {
    for (const locale of locales) {
      expect(Intl.getCanonicalLocales(locale)).toEqual([locale]);
      const path = localePath(locale, "/products/example");
      expect(localeForPath(path)).toBe(locale);
      expect(stripLocalePrefix(path)).toBe("/products/example");
    }
    expect(localePath("zh-Hant-US")).toBe("/zh-hant-us");
    expect(localeForPath("/zh-hant-us-extra")).toBe("en-US");
    expect(stripLocalePrefix("/zh-hant-us-extra")).toBe("/zh-hant-us-extra");
    expect(shopifyContextForLocale("zh-Hant-US")).toEqual({country: "US", language: "ZH_TW"});
    expect(localeRegistry["zh-Hant-US"].formatLocale).toBe("zh-HK");
    expect(marketIdForLocale("zh-Hant-US")).toBe("us");
    expect(isEnabledLocale("zh-TW")).toBe(false);
    expect(isEnabledLocale("__proto__")).toBe(false);
    expect(isEnabledLocale("zh-Hant-US")).toBe(true);
    expect(languageOptionsFor("zh-Hant-US").map(o=>o.shortLabel)).toEqual(["EN", "ES", "繁中"]);
  });
});
