import type { EnabledLocale } from "@/config/locales";
import { publishedAlternateLocales } from "@/lib/content/metadata-locales";
import {
  buildMetadata,
  buildNoIndexMetadata,
  getCollectionSeoDescription,
  type PageSearchParams,
} from "@/lib/seo";
import { getCollection, getCollections, getProducts } from "./catalog";

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
    const loadItems = (candidate: EnabledLocale) =>
      path === "/shop"
        ? getProducts("us", candidate)
        : getCollections("us", candidate);
    const items = await loadItems(locale);
    if (items.length) {
      const alternateLocales = await publishedAlternateLocales(
        locale,
        path,
        searchParams,
        async (candidate) => (await loadItems(candidate)).length > 0,
      );
      return buildMetadata({
        title,
        description,
        locale,
        path,
        searchParams,
        alternateLocales,
      });
    }
  } catch {
    // Unavailable data cannot establish that this hub is ready for indexing.
  }
  return buildNoIndexMetadata({ title, description });
}

export async function buildCollectionMetadata({
  handle,
  locale,
  searchParams,
}: {
  handle: string;
  locale: EnabledLocale;
  searchParams?: PageSearchParams;
}) {
  const collection = await getCollection(handle, "us", locale);
  const description = getCollectionSeoDescription(collection);
  if (!collection || !description) {
    return buildNoIndexMetadata({
      title:
        collection?.title ||
        (locale === "zh-Hant-US"
          ? "暫未能提供此系列"
          : "Collection unavailable"),
      description: collection
        ? locale === "zh-Hant-US"
          ? "探索此 Joya Mana 系列的商品。"
          : "Browse the pieces in this Joya Mana collection."
        : locale === "zh-Hant-US"
          ? "此系列目前未能提供。"
          : "This collection is not currently available.",
    });
  }

  const path = `/collections/${collection.handle}`;
  const alternateLocales = await publishedAlternateLocales(
    locale,
    path,
    searchParams,
    async (candidate) =>
      Boolean(
        getCollectionSeoDescription(
          await getCollection(collection.handle, "us", candidate),
        ),
      ),
  );
  return buildMetadata({
    title: collection.seoTitle || collection.title,
    description,
    locale,
    path,
    searchParams,
    alternateLocales,
  });
}
