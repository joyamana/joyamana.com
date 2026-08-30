import type { Locale } from "@/lib/i18n/locales";

export interface ProductCategoryDefinition {
  handle: string;
  taxonomyId: string;
  title: Record<"en-US" | "es-US", string>;
  description: Record<"en-US" | "es-US", string>;
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
    title: { "en-US": "Bracelets", "es-US": "Pulseras" },
    description: {
      "en-US": "Explore crystal bracelets currently available from Joya Mana.",
      "es-US": "Explora las pulseras con cristales disponibles actualmente en Joya Mana.",
    },
  },
  {
    handle: "rings",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-9",
    title: { "en-US": "Rings", "es-US": "Anillos" },
    description: {
      "en-US": "Explore crystal rings currently available from Joya Mana.",
      "es-US": "Explora los anillos con cristales disponibles actualmente en Joya Mana.",
    },
  },
  {
    handle: "necklaces",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-8",
    title: { "en-US": "Necklaces", "es-US": "Collares" },
    description: {
      "en-US": "Explore crystal necklaces currently available from Joya Mana.",
      "es-US": "Explora los collares con cristales disponibles actualmente en Joya Mana.",
    },
  },
  {
    handle: "earrings",
    taxonomyId: "gid://shopify/TaxonomyCategory/aa-6-6",
    title: { "en-US": "Earrings", "es-US": "Pendientes" },
    description: {
      "en-US": "Explore crystal earrings currently available from Joya Mana.",
      "es-US": "Explora los pendientes con cristales disponibles actualmente en Joya Mana.",
    },
  },
] as const satisfies readonly ProductCategoryDefinition[];

function enabledUsLocale(locale: Locale): "en-US" | "es-US" {
  return locale === "es-US" ? "es-US" : "en-US";
}

export function localizeProductCategory(
  definition: ProductCategoryDefinition,
  locale: Locale,
) {
  const enabledLocale = enabledUsLocale(locale);
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
