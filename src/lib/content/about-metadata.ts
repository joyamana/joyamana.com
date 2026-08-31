import type { Metadata } from "next";
import { enabledLocales, type Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildMetadata,
  buildNoIndexMetadata,
  type PageSearchParams,
} from "@/lib/seo";
import {
  aboutPageForHandle,
  getShopifyAboutTree,
} from "./shopify-about-pages";

async function publishedAlternateLocales(handle?: string) {
  const locales = await Promise.all(
    enabledLocales.map(async (locale) => {
      try {
        const tree = await getShopifyAboutTree(locale);
        const page = tree ? aboutPageForHandle(tree, handle) : null;
        return tree &&
          page &&
          !tree.root.usedDefaultLanguage &&
          !page.usedDefaultLanguage
          ? locale
          : null;
      } catch {
        return null;
      }
    }),
  );

  return locales.filter((locale): locale is Locale => locale !== null);
}

export async function buildAboutMetadata({
  handle,
  locale,
  searchParams,
}: {
  handle?: string;
  locale: Locale;
  searchParams?: PageSearchParams;
}): Promise<Metadata> {
  const fallbackTitle = uiText(locale, {
    en: "About Joya Mana",
    es: "Sobre Joya Mana",
    fr: "À propos de Joya Mana",
  });
  const fallbackDescription = uiText(locale, {
    en: "Learn about Joya Mana's perspective and product standards.",
    es: "Conoce la perspectiva y los estándares de producto de Joya Mana.",
    fr: "Découvrez la perspective et les normes produit de Joya Mana.",
  });

  try {
    const tree = await getShopifyAboutTree(locale);
    const page = tree ? aboutPageForHandle(tree, handle) : null;
    if (tree && page && !tree.root.usedDefaultLanguage && !page.usedDefaultLanguage) {
      return buildMetadata({
        title: page.seoTitle,
        description: page.seoDescription,
        locale,
        path: handle ? `/about/${page.handle}` : "/about",
        alternateLocales: await publishedAlternateLocales(handle),
        searchParams,
      });
    }
  } catch {
    // Missing configuration, incomplete translations, and upstream failures
    // must never turn a fallback About page into an indexable source.
  }

  return buildNoIndexMetadata({
    title: fallbackTitle,
    description: fallbackDescription,
  });
}
