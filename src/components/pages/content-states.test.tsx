import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  about: vi.fn(),
  content: vi.fn(),
  policy: vi.fn(),
  index: vi.fn(),
}));
vi.mock("@/lib/content/shopify-about-pages", () => ({
  getShopifyAboutTree: mocks.about,
}));
vi.mock("@/lib/content/shopify-content-pages", () => ({
  getShopifyContentPage: mocks.content,
}));
vi.mock("@/lib/content/shopify-policies", () => ({
  getShopifyPolicy: mocks.policy,
}));
vi.mock("@/lib/content/shopify-editorial", () => ({
  getShopifyEditorialIndex: mocks.index,
}));

import { AboutPage } from "./about-page";
import { AccessibilityPage } from "./accessibility-page";
import { PolicyPage } from "./policy-page";
import { EditorialIndexPage } from "./editorial-index-page";

afterEach(() => vi.resetAllMocks());

it("propagates upstream failures to the retry boundary for each content page", async () => {
  const error = new Error("Read failed");
  for (const mock of Object.values(mocks)) mock.mockRejectedValue(error);
  for (const read of [
    () => AboutPage({ locale: "en-US" }),
    () => AccessibilityPage({ locale: "en-US" }),
    () => PolicyPage({ locale: "en-US", kind: "privacy" }),
    () => EditorialIndexPage({ locale: "en-US", kind: "blog" }),
  ])
    await expect(read()).rejects.toBe(error);
});

it("keeps an empty editorial index readable and marks its real description language", async () => {
  mocks.index.mockResolvedValue(null);
  const empty = renderToStaticMarkup(
    await EditorialIndexPage({ locale: "zh-Hant-US", kind: "blog" }),
  );
  expect(empty).toContain("目前沒有文章。");
  mocks.index.mockResolvedValue({
    seoDescription: "English section description.",
    descriptionLocale: "en-US",
    articles: [
      {
        handle: "story",
        title: "Story",
        titleLocale: "en-US",
        excerpt: "An excerpt.",
        excerptLocale: "en-US",
        tags: [],
      },
    ],
    usedDefaultLanguage: true,
    translationReady: false,
  });
  const recovered = renderToStaticMarkup(
    await EditorialIndexPage({ locale: "zh-Hant-US", kind: "blog" }),
  );
  expect(recovered).toContain(
    '<p lang="en-US">English section description.</p>',
  );
  expect(recovered).toContain('href="/zh-hant-us/blog/story"');
  mocks.index.mockResolvedValue({
    seoDescription: "",
    articles: [
      {
        handle: "story",
        title: "Story",
        titleLocale: "en-US",
        excerpt: "An excerpt.",
        excerptLocale: "en-US",
        tags: [],
      },
    ],
  });
  const fallback = renderToStaticMarkup(
    await EditorialIndexPage({ locale: "zh-Hant-US", kind: "blog" }),
  );
  expect(fallback).toContain('<p lang="zh-Hant-US">關於水晶飾物');
});
