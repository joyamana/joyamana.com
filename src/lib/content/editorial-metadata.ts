import type { Metadata } from "next";
import { publishedAlternateLocales } from "./metadata-locales";
import type { EnabledLocale as Locale } from "@/config/locales";
import { editorialCopy } from "@/lib/i18n/editorial-copy";
import {
  buildMetadata,
  buildNoIndexMetadata,
  type PageSearchParams,
} from "@/lib/seo";
import {
  getShopifyEditorialArticle,
  getShopifyEditorialIndex,
  type EditorialKind,
} from "./shopify-editorial";

function basePath(kind: EditorialKind) {
  return kind === "blog" ? "/blog" : "/crystals";
}

export async function buildEditorialIndexMetadata({
  kind,
  locale,
  searchParams,
}: {
  kind: EditorialKind;
  locale: Locale;
  searchParams?: PageSearchParams;
}): Promise<Metadata> {
  const { title, description } = editorialCopy(kind, locale);
  try {
    const index = await getShopifyEditorialIndex(kind, locale);
    if (
      index &&
      index.articles.some((article) => !article.usedDefaultLanguage)
    ) {
      return buildMetadata({
        title: index.seoTitle || title,
        description: index.seoDescription || description,
        locale,
        path: basePath(kind),
        alternateLocales: await publishedAlternateLocales(
          locale,
          basePath(kind),
          searchParams,
          async (candidate) => {
            const candidateIndex = await getShopifyEditorialIndex(
              kind,
              candidate,
            );
            return Boolean(
              candidateIndex?.articles.some(
                (entry) => !entry.usedDefaultLanguage,
              ),
            );
          },
        ),
        searchParams,
      });
    }
  } catch {
    // Upstream or incomplete localized content stays out of the index.
  }
  return buildNoIndexMetadata({ title, description });
}

export async function buildEditorialArticleMetadata({
  handle,
  kind,
  locale,
  searchParams,
}: {
  handle: string;
  kind: EditorialKind;
  locale: Locale;
  searchParams?: PageSearchParams;
}): Promise<Metadata> {
  const { title, description } = editorialCopy(kind, locale);
  try {
    const article = await getShopifyEditorialArticle(kind, handle, locale);
    if (article && !article.usedDefaultLanguage) {
      return buildMetadata({
        title: article.seoTitle,
        description: article.seoDescription,
        locale,
        path: `${basePath(kind)}/${article.handle}`,
        alternateLocales: await publishedAlternateLocales(
          locale,
          `${basePath(kind)}/${article.handle}`,
          searchParams,
          async (candidate) => {
            const candidateArticle = await getShopifyEditorialArticle(
              kind,
              handle,
              candidate,
            );
            return Boolean(
              candidateArticle && !candidateArticle.usedDefaultLanguage,
            );
          },
        ),
        searchParams,
      });
    }
  } catch {
    // Upstream or incomplete localized content stays out of the index.
  }
  return buildNoIndexMetadata({ title, description });
}
