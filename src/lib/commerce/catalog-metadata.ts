import type { EnabledLocale } from "@/config/locales";
import {
  buildMetadata,
  buildNoIndexMetadata,
  type PageSearchParams,
} from "@/lib/seo";
import { getDesignCollections, getProducts } from "./catalog";

export async function buildCatalogHubMetadata({
  title,
  description,
  locale,
  path,
  searchParams,
}: {
  title: string;
  description: string;
  locale: EnabledLocale;
  path: "/shop" | "/collections";
  searchParams?: PageSearchParams;
}) {
  try {
    const items =
      path === "/shop"
        ? await getProducts("us", locale)
        : await getDesignCollections("us", locale);
    if (items.length)
      return buildMetadata({ title, description, locale, path, searchParams });
  } catch {
    // Unavailable data cannot establish that this hub is ready for indexing.
  }
  return buildNoIndexMetadata({ title, description });
}
