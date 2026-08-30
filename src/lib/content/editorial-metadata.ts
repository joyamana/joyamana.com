import type { Metadata } from "next";
import { getCommerceProvider } from "@/lib/commerce/catalog";
import { enabledLocales, type Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";
import {
  getShopifyEditorialArticle,
  getShopifyEditorialIndex,
  type EditorialKind,
} from "./shopify-editorial";

function basePath(kind: EditorialKind) {
  return kind === "blog" ? "/blog" : "/crystals";
}

function fallbackTitle(kind: EditorialKind, locale: Locale) {
  return kind === "blog"
    ? "Blog"
    : uiText(locale, {
        en: "Crystal Guide",
        es: "Guía de cristales",
        fr: "Guide des cristaux",
      });
}

function fallbackDescription(kind: EditorialKind, locale: Locale) {
  return kind === "blog"
    ? uiText(locale, {
        en: "Stories and practical guidance about crystal objects, clear buying, and personal meaning.",
        es: "Historias y orientación práctica sobre cristales, compras claras y significado personal.",
        fr: "Histoires et conseils pratiques sur les cristaux, l’achat éclairé et le sens personnel.",
      })
    : uiText(locale, {
        en: "A reference guide to crystal characteristics, care, and traditional associations.",
        es: "Una guía de referencia sobre las características, el cuidado y las asociaciones tradicionales de los cristales.",
        fr: "Un guide de référence sur les caractéristiques, l’entretien et les associations traditionnelles des cristaux.",
      });
}

async function publishedIndexLocales(kind: EditorialKind) {
  const locales = await Promise.all(
    enabledLocales.map(async (locale) => {
      try {
        const index = await getShopifyEditorialIndex(kind, locale);
        return index &&
          index.articles.some((article) => !article.usedDefaultLanguage)
          ? locale
          : null;
      } catch {
        return null;
      }
    }),
  );
  return locales.filter((locale): locale is Locale => locale !== null);
}

async function publishedArticleLocales(kind: EditorialKind, handle: string) {
  const locales = await Promise.all(
    enabledLocales.map(async (locale) => {
      try {
        const article = await getShopifyEditorialArticle(kind, handle, locale);
        return article && !article.usedDefaultLanguage ? locale : null;
      } catch {
        return null;
      }
    }),
  );
  return locales.filter((locale): locale is Locale => locale !== null);
}

export async function buildEditorialIndexMetadata({
  kind,
  locale,
}: {
  kind: EditorialKind;
  locale: Locale;
}): Promise<Metadata> {
  const title = fallbackTitle(kind, locale);
  const description = fallbackDescription(kind, locale);
  if (getCommerceProvider() !== "shopify") {
    return buildNoIndexMetadata({ title, description });
  }

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
        alternateLocales: await publishedIndexLocales(kind),
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
}: {
  handle: string;
  kind: EditorialKind;
  locale: Locale;
}): Promise<Metadata> {
  const title = fallbackTitle(kind, locale);
  const description = fallbackDescription(kind, locale);
  if (getCommerceProvider() !== "shopify") {
    return buildNoIndexMetadata({ title, description });
  }

  try {
    const article = await getShopifyEditorialArticle(kind, handle, locale);
    if (article && !article.usedDefaultLanguage) {
      return buildMetadata({
        title: article.seoTitle,
        description: article.seoDescription,
        locale,
        path: `${basePath(kind)}/${article.handle}`,
        alternateLocales: await publishedArticleLocales(kind, handle),
      });
    }
  } catch {
    // Upstream or incomplete localized content stays out of the index.
  }
  return buildNoIndexMetadata({ title, description });
}
