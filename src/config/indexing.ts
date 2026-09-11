export const indexGroups = [
  "core",
  "commerce",
  "policies",
  "editorial",
] as const;

export type IndexGroup = (typeof indexGroups)[number];
export type IndexLocale = import("./locales").EnabledLocale;

/**
 * Version-controlled indexing release policy.
 *
 * A page is indexable only when the deployment-wide master environment gate,
 * its locale/page-group scope, and its content readiness checks all pass. Keep
 * unapproved scopes false; policy changes require review and deploy.
 */
export const indexingPolicy = {
  "zh-Hant-US": { core: true, commerce: true, policies: true, editorial: false },
  "en-US": {
    // Home, Contact, About, Accessibility
    core: true,
    // Shop, Category, Collection, Product
    commerce: true,
    // Shipping, Returns, Privacy, Terms
    policies: true,
    // Blog, Crystal Guide
    editorial: false,
  },
  "es-US": {
    // Home, Contact, About, Accessibility
    core: true,
    // Shop, Category, Collection, Product
    commerce: true,
    // Shipping, Returns, Privacy, Terms
    policies: true,
    // Blog, Crystal Guide
    editorial: false,
  },
} as const satisfies Record<IndexLocale, Record<IndexGroup, boolean>>;
