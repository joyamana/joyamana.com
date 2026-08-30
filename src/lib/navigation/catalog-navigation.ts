export const COLLECTION_DROPDOWN_THRESHOLD = 3;

export interface CatalogNavigationLink {
  href: string;
  label: string;
}

export type CollectionNavigation =
  | { kind: "hidden"; links: [] }
  | { kind: "direct"; links: CatalogNavigationLink[] }
  | { kind: "dropdown"; links: CatalogNavigationLink[] };

export function collectionNavigationFor(
  links: CatalogNavigationLink[],
): CollectionNavigation {
  if (links.length === 0) return { kind: "hidden", links: [] };
  if (links.length < COLLECTION_DROPDOWN_THRESHOLD) {
    return { kind: "direct", links };
  }
  return { kind: "dropdown", links };
}
