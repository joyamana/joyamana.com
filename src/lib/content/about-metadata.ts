import type { Metadata } from "next";
import { publishedAlternateLocales } from "./metadata-locales";
import type { EnabledLocale as Locale } from "@/config/locales";
import { uiText } from "@/lib/i18n/text";
import {
  buildMetadata,
  buildNoIndexMetadata,
  type PageSearchParams,
} from "@/lib/seo";
import { aboutPageForHandle, getShopifyAboutTree } from "./shopify-about-pages";

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
    zh: "關於 Joya Mana",
    en: "About Joya Mana",
    es: "Sobre Joya Mana",
  });
  const fallbackDescription = uiText(locale, {
    zh: "了解 Joya Mana 的理念與商品標準。",
    en: "Learn about Joya Mana's perspective and product standards.",
    es: "Conoce la perspectiva y los estándares de producto de Joya Mana.",
  });

  try {
    const tree = await getShopifyAboutTree(locale);
    const page = tree ? aboutPageForHandle(tree, handle) : null;
    if (tree && page && tree.root.translationReady && page.translationReady) {
      return buildMetadata({
        title: page.seoTitle,
        description: page.seoDescription,
        locale,
        path: handle ? `/about/${page.handle}` : "/about",
        alternateLocales: await publishedAlternateLocales(
          locale,
          handle ? `/about/${page.handle}` : "/about",
          searchParams,
          async (candidate) => {
            const candidateTree = await getShopifyAboutTree(candidate);
            const candidatePage = candidateTree
              ? aboutPageForHandle(candidateTree, handle)
              : null;
            return Boolean(
              candidateTree?.root.translationReady &&
              candidatePage?.translationReady,
            );
          },
        ),
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
