import { isEnabledLocale, type EnabledLocale } from "./locales";
import type { Locale } from "@/lib/i18n/locales";

export interface ProductCategoryDefinition {
  handle: string;
  taxonomyId: string;
  title: Record<EnabledLocale, string>;
  description: Record<EnabledLocale, string>;
}

/**
 * Public category routes are an intentionally small merchandising allowlist.
 * Shopify's stable taxonomy ID remains the source used to assign products;
 * these records only map that identity to a storefront URL and approved copy.
 */
export const productCategoryDefinitions = [
  {
    handle: "bracelets",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-3",
    title: { "en-US": "Bracelets", "es-US": "Pulseras", "zh-Hant-US": "手鏈" },
    description: {
      "en-US": "Explore crystal bracelets currently available from Joya Mana.",
      "es-US": "Explora las pulseras con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶手鏈。",
    },
  },
  {
    handle: "rings",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-9",
    title: { "en-US": "Rings", "es-US": "Anillos", "zh-Hant-US": "戒指" },
    description: {
      "en-US": "Explore crystal rings currently available from Joya Mana.",
      "es-US": "Explora los anillos con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶戒指。",
    },
  },
  {
    handle: "necklaces",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-8",
    title: { "en-US": "Necklaces", "es-US": "Collares", "zh-Hant-US": "頸鏈" },
    description: {
      "en-US": "Explore crystal necklaces currently available from Joya Mana.",
      "es-US": "Explora los collares con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶頸鏈。",
    },
  },
  {
    handle: "earrings",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-6",
    title: { "en-US": "Earrings", "es-US": "Pendientes", "zh-Hant-US": "耳環" },
    description: {
      "en-US": "Explore crystal earrings currently available from Joya Mana.",
      "es-US": "Explora los pendientes con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶耳環。",
    },
  },
  {
    handle: "gemstones",
    taxonomyId: "gid://shopify/TaxonomyCategory/ae-2-2-6-2",
    title: { "en-US": "Gemstones", "es-US": "Gemas", "zh-Hant-US": "寶石" },
    description: {
      "en-US": "Explore gemstone objects currently available from Joya Mana.",
      "es-US": "Explora los objetos de gemas disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的寶石飾物。",
    },
  },
] as const satisfies readonly ProductCategoryDefinition[];


export function localizeProductCategory(
  definition: ProductCategoryDefinition,
  locale: Locale,
) {
  const enabledLocale = isEnabledLocale(locale) ? locale : "en-US";
  return {
    ...definition,
    title: definition.title[enabledLocale],
    description: definition.description[enabledLocale],
  };
}

export function productCategoryDefinitionForHandle(handle: string) {
  return productCategoryDefinitions.find(
    (definition) => definition.handle === handle,
  );
}

export function productCategoryDefinitionForTaxonomyId(taxonomyId: string) {
  return productCategoryDefinitions.find(
    (definition) => definition.taxonomyId === taxonomyId,
  );
}
