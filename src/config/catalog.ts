import { isEnabledLocale, type TranslatedLocale } from "./locales";
import type { Locale } from "@/lib/i18n/locales";
import type { ProductCategory } from "@/lib/commerce/types";

export interface ProductCategoryDefinition {
  handle: string;
  taxonomyId: string;
  title: Record<TranslatedLocale, string>;
  description: Record<TranslatedLocale, string>;
}

export interface ResolvedProductCategory {
  handle: string;
  taxonomyId: string;
  title: string;
  description: string;
}

/**
 * Preserve established category URLs and approved copy. Other Shopify taxonomy
 * categories use their stable identity for the URL and their real display name.
 */
export const productCategoryDefinitions = [
  {
    handle: "bracelets",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-3",
    title: { "en-US": "Bracelets", "es-US": "Pulseras", "zh-Hant-US": "手鏈" },
    description: {
      "en-US": "Explore crystal bracelets currently available from Joya Mana.",
      "es-US":
        "Explora las pulseras con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶手鏈。",
    },
  },
  {
    handle: "rings",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-9",
    title: { "en-US": "Rings", "es-US": "Anillos", "zh-Hant-US": "戒指" },
    description: {
      "en-US": "Explore crystal rings currently available from Joya Mana.",
      "es-US":
        "Explora los anillos con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶戒指。",
    },
  },
  {
    handle: "necklaces",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-8",
    title: { "en-US": "Necklaces", "es-US": "Collares", "zh-Hant-US": "頸鏈" },
    description: {
      "en-US": "Explore crystal necklaces currently available from Joya Mana.",
      "es-US":
        "Explora los collares con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶頸鏈。",
    },
  },
  {
    handle: "earrings",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-6",
    title: { "en-US": "Earrings", "es-US": "Pendientes", "zh-Hant-US": "耳環" },
    description: {
      "en-US": "Explore crystal earrings currently available from Joya Mana.",
      "es-US":
        "Explora los pendientes con cristales disponibles actualmente en Joya Mana.",
      "zh-Hant-US": "探索 Joya Mana 目前供應的水晶耳環。",
    },
  },
  {
    handle: "gemstones",
    taxonomyId: "gid://shopify/TaxonomyCategory/ae-2-2-6-2",
    title: { "en-US": "Gemstones", "es-US": "Gemas", "zh-Hant-US": "寶石" },
    description: {
      "en-US": "Explore gemstone objects currently available from Joya Mana.",
      "es-US":
        "Explora los objetos de gemas disponibles actualmente en Joya Mana.",
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

const taxonomyIdPattern =
  /^gid:\/\/shopify\/TaxonomyCategory\/([a-z]{2}(?:-\d+)*)$/;
const taxonomyHandlePattern = /^taxonomy-([a-z]{2}(?:-\d+)*)$/;

export function resolveProductCategory(
  category: ProductCategory | null,
  locale: Locale,
): ResolvedProductCategory | null {
  if (
    !category ||
    typeof category.id !== "string" ||
    typeof category.name !== "string"
  )
    return null;
  const match = taxonomyIdPattern.exec(category.id);
  const token = match?.[0] === category.id ? match[1] : undefined;
  const title = category.name.trim();
  if (!token || !title) return null;

  const definition = productCategoryDefinitionForTaxonomyId(category.id);
  if (definition) return localizeProductCategory(definition, locale);

  return {
    handle: `taxonomy-${token}`,
    taxonomyId: category.id,
    title,
    description:
      locale === "zh-Hant-US"
        ? "探索 Joya Mana 在此類別已發佈的商品。"
        : "Explore published products in this category from Joya Mana.",
  };
}

/** Reject malformed routes and aliases before reading the upstream catalog. */
export function isProductCategoryHandle(handle: string) {
  if (productCategoryDefinitionForHandle(handle)) return true;
  const match = taxonomyHandlePattern.exec(handle);
  const token = match?.[0] === handle ? match[1] : undefined;
  return Boolean(
    token &&
    !productCategoryDefinitionForTaxonomyId(
      `gid://shopify/TaxonomyCategory/${token}`,
    ),
  );
}

export function compareProductCategories(
  left: Pick<ResolvedProductCategory, "taxonomyId">,
  right: Pick<ResolvedProductCategory, "taxonomyId">,
) {
  const position = (taxonomyId: string) => {
    const index = productCategoryDefinitions.findIndex(
      (definition) => definition.taxonomyId === taxonomyId,
    );
    return index < 0 ? productCategoryDefinitions.length : index;
  };
  const difference = position(left.taxonomyId) - position(right.taxonomyId);
  if (difference) return difference;
  return left.taxonomyId < right.taxonomyId
    ? -1
    : left.taxonomyId > right.taxonomyId
      ? 1
      : 0;
}
