export interface CatalogNavigationLink {
  href: string;
  label: string;
}

export function collectionNavigationFor(
  links: CatalogNavigationLink[],
  allCollectionsLink: CatalogNavigationLink,
): CatalogNavigationLink[] {
  return [allCollectionsLink, ...links];
}
