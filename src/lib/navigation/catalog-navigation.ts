export type CatalogNavigationIcon =
  | "all"
  | "bracelet"
  | "ring"
  | "necklace"
  | "earrings"
  | "gemstone"
  | "display"
  | "sparkle";

export interface CatalogNavigationLink {
  href: string;
  label: string;
  /** Decorative only; links without one use the neutral sparkle. */
  icon?: CatalogNavigationIcon;
}

/**
 * Icons follow the stable category handle, never the display name, so a
 * renamed or translated category keeps its icon and unknown ones stay neutral.
 */
const categoryNavigationIcons = new Map<string, CatalogNavigationIcon>([
  ["bracelets", "bracelet"],
  ["rings", "ring"],
  ["necklaces", "necklace"],
  ["earrings", "earrings"],
  ["gemstones", "gemstone"],
  ["taxonomy-bi-22-8", "display"],
]);

export function categoryNavigationIcon(handle: string): CatalogNavigationIcon {
  return categoryNavigationIcons.get(handle) ?? "sparkle";
}

export function collectionNavigationFor(
  links: CatalogNavigationLink[],
  allCollectionsLink: CatalogNavigationLink,
): CatalogNavigationLink[] {
  return [allCollectionsLink, ...links];
}
