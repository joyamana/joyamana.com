import { describe, expect, it } from "vitest";
import { getCopy } from "./copy";
import { uiText } from "./text";
import { enabledLocales } from "./locales";

function leafKeys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, item]) => typeof item === "string" ? [`${prefix}${key}`] : leafKeys(item, `${prefix}${key}.`));
}

describe("UI translation completeness", () => {
  it("has identical nonempty keys for every enabled language", () => {
    for (const locale of enabledLocales) {
      expect(leafKeys(getCopy(locale))).toEqual(leafKeys(getCopy("en-US")));
      expect(JSON.stringify(getCopy(locale))).not.toContain(':""');
    }
  });

  it("selects Hong Kong written Chinese without an implicit English fallback", () => {
    expect(uiText("zh-Hant-US", {en: "Email", es: "Correo", fr: "Courriel", zh: "電郵"})).toBe("電郵");
    expect(getCopy("zh-Hant-US").labels.addToCart).toBe("加入購物袋");
    expect(getCopy("zh-Hant-US").nav.blog).toBe("Blog");
  });
});
