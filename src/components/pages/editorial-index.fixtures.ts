import type {
  StorefrontEditorialArticle,
  StorefrontEditorialIndex,
} from "@/lib/content/shopify-editorial";

export function editorialArticle(
  number = 1,
  overrides: Partial<StorefrontEditorialArticle> = {},
): StorefrontEditorialArticle {
  return {
    id: `gid://shopify/Article/${number}`,
    handle: `story-${number}`,
    title: `Story ${number}`,
    excerpt: `An excerpt for story ${number}.`,
    contentHtml: `<p>Body for story ${number}.</p>`,
    publishedAt: "2026-10-02T00:30:00Z",
    image: null,
    seoTitle: `Story ${number}`,
    seoDescription: `An excerpt for story ${number}.`,
    tags: ["Crystal care"],
    author: "Joya Mana",
    contentLocale: "en-US",
    titleLocale: "en-US",
    excerptLocale: "en-US",
    tagsLocale: "en-US",
    translationReady: true,
    usedDefaultLanguage: false,
    ...overrides,
  };
}

export function editorialIndex(
  overrides: Partial<StorefrontEditorialIndex> = {},
): StorefrontEditorialIndex {
  return {
    id: "gid://shopify/Blog/1",
    handle: "blog",
    title: "Blog",
    seoTitle: "Blog",
    seoDescription: "English section description.",
    descriptionLocale: "en-US",
    articles: [editorialArticle()],
    translationReady: true,
    usedDefaultLanguage: false,
    ...overrides,
  };
}
