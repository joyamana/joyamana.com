export const indexGroups = [
  "core",
  "commerce",
  "policies",
  "editorial",
] as const;

export type IndexGroup = (typeof indexGroups)[number];
export type IndexLocale = "en-US" | "es-US";

/**
 * Version-controlled indexing release policy.
 *
 * A page is indexable only when the deployment-wide master environment gate,
 * its locale flag, its page-group flag, and its content readiness checks all
 * pass. Keep unapproved scopes false; policy changes require review and deploy.
 */
export const indexingPolicy = {
  locales: {
    "en-US": true,
    "es-US": true,
  },
  groups: {
    // Home, Contact, About, Accessibility
    core: true,
    // Shop, Category, Collection, Product
    commerce: false,
    // Shipping, Returns, Privacy, Terms
    policies: true,
    // Blog, Crystal Guide
    editorial: false,
  },
} as const satisfies {
  locales: Record<IndexLocale, boolean>;
  groups: Record<IndexGroup, boolean>;
};
