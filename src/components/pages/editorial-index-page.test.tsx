import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EnabledLocale } from "@/config/locales";
import type {
  EditorialKind,
  StorefrontEditorialIndex,
} from "@/lib/content/shopify-editorial";
import { formatDate } from "@/lib/format";
import { editorialCopy, editorialIndexCount } from "@/lib/i18n/editorial-copy";
import { localePath } from "@/lib/i18n/locales";
import { editorialArticle, editorialIndex } from "./editorial-index.fixtures";

const mocks = vi.hoisted(() => ({ index: vi.fn() }));
vi.mock("@/lib/content/shopify-editorial", () => ({
  getShopifyEditorialIndex: mocks.index,
}));

import { EditorialIndexPage } from "./editorial-index-page";

afterEach(() => vi.resetAllMocks());

async function renderIndex(
  index: StorefrontEditorialIndex | null,
  kind: EditorialKind = "blog",
  locale: EnabledLocale = "en-US",
) {
  mocks.index.mockResolvedValue(index);
  return renderToStaticMarkup(await EditorialIndexPage({ locale, kind }));
}

function rows(html: string) {
  return [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(
    (match) => match[1],
  );
}

describe("complete editorial lists", () => {
  it.each([1, 3, 57])("renders all %i Blog articles equally", async (count) => {
    const articles = Array.from({ length: count }, (_, i) =>
      editorialArticle(i + 1),
    );
    const html = await renderIndex(editorialIndex({ articles }));
    const rendered = rows(html);
    expect(rendered).toHaveLength(count);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<h2\b/g)).toHaveLength(count);
    expect(html).not.toMatch(/<h3\b|Featured|blog-featured/);
    rendered.forEach((row, i) => {
      expect(row).toContain(`>${articles[i].title}</h2>`);
      expect(row.match(/<a\b/g)).toHaveLength(1);
      expect(row).toContain(`href="/blog/${articles[i].handle}"`);
    });
    expect(html).toContain(
      `<span>${count} article${count === 1 ? "" : "s"}</span>`,
    );
  });

  it.each([1, 2, 3, 5])(
    "keeps %i Crystal guides in source order",
    async (count) => {
      const articles = Array.from({ length: count }, (_, i) =>
        editorialArticle(i + 1),
      );
      const html = await renderIndex(editorialIndex({ articles }), "crystals");
      const rendered = rows(html);
      expect(rendered).toHaveLength(count);
      expect(html.match(/<h2\b/g)).toHaveLength(count);
      expect(html).not.toMatch(/<img\b|crystal-directory__number|>0[1-5]</);
      rendered.forEach((row, i) => {
        expect(row).toContain(`>${articles[i].title}</h2>`);
        expect(row).toContain(`href="/crystals/${articles[i].handle}"`);
      });
      expect(html).toContain(
        `<span>${count} guide${count === 1 ? "" : "s"}</span>`,
      );
    },
  );

  for (const locale of ["en-US", "zh-Hant-US"] as const) {
    for (const kind of ["blog", "crystals"] as const) {
      it(`uses one named link per entry and localized cross-links for ${locale}/${kind}`, async () => {
        const articles = [editorialArticle(1), editorialArticle(2)];
        const html = await renderIndex(
          editorialIndex({ articles }),
          kind,
          locale,
        );
        const titleIds = new Set<string>();
        rows(html).forEach((row, i) => {
          const id = row.match(/<h2 id="([^"]+)"/)?.[1];
          expect(id).toBe(`${kind}-${articles[i].handle}-title`);
          titleIds.add(id!);
          expect(row).toContain(`aria-labelledby="${id}"`);
          expect(row).toContain(
            `href="${localePath(locale, `/${kind}/${articles[i].handle}`)}"`,
          );
          expect(row.match(/<a\b/g)).toHaveLength(1);
          expect(row).not.toMatch(/tabindex=|target=|<button\b/);
          expect(row).toContain(
            'class="editorial-entry__arrow" aria-hidden="true"',
          );
        });
        expect(titleIds.size).toBe(articles.length);
        const other = kind === "blog" ? "crystals" : "blog";
        expect(html).toContain(`href="${localePath(locale, `/${other}`)}"`);
        expect(html).toContain(editorialCopy(other, locale).title);
        expect(html).toContain(
          editorialIndexCount(kind, articles.length, locale),
        );
        expect(mocks.index).toHaveBeenCalledExactlyOnceWith(kind, locale);
        expect(html).not.toContain("<main");
      });
    }
  }
});

describe("real metadata and text", () => {
  it.each(["en-US", "zh-Hant-US"] as const)(
    "formats the real UTC publication date in %s",
    async (locale) => {
      const article = editorialArticle(1, {
        publishedAt: "2026-10-01T23:30:00-07:00",
      });
      const html = await renderIndex(
        editorialIndex({ articles: [article] }),
        "blog",
        locale,
      );
      expect(html).toContain(
        `<time dateTime="${article.publishedAt}">${formatDate(article.publishedAt, locale)}</time>`,
      );
    },
  );

  it("omits missing tags and their separator, without placeholder labels", async () => {
    const index = editorialIndex({
      articles: [editorialArticle(1, { tags: ["", "  "] })],
    });
    const blog = rows(await renderIndex(index))[0];
    expect(blog).toContain("<time ");
    expect(blog).not.toContain("·");
    expect(blog).not.toContain("editorial-entry__tag");
    const crystal = rows(await renderIndex(index, "crystals"))[0];
    expect(crystal).not.toContain("editorial-entry__tag");
    expect(crystal).not.toContain("<time");
  });

  it("uses the first nonempty Blog tag with its own language", async () => {
    const index = editorialIndex({
      articles: [
        editorialArticle(1, {
          tags: [" ", "保養", "其他"],
          tagsLocale: "zh-Hant-US",
        }),
      ],
    });
    const row = rows(await renderIndex(index))[0];
    expect(row).toContain('lang="zh-Hant-US">保養</span>');
    expect(row).toContain('<span aria-hidden="true">·</span>');
    expect(row).not.toContain("其他");
  });

  it.each(["  STORY   1 ", " CRYSTAL   GUIDE ", "水晶指南"])(
    "omits a Crystal tag repeating the title or column: %s",
    async (tag) => {
      const index = editorialIndex({
        articles: [editorialArticle(1, { tags: [tag] })],
      });
      expect(
        rows(await renderIndex(index, "crystals", "zh-Hant-US"))[0],
      ).not.toContain("editorial-entry__tag");
    },
  );

  it("keeps the first actual nonrepeated Crystal tag and its language", async () => {
    const index = editorialIndex({
      articles: [
        editorialArticle(1, {
          tags: ["", "Story 1", "Crystal guide", "礦物", "其他"],
          tagsLocale: "zh-Hant-US",
        }),
      ],
    });
    const row = rows(await renderIndex(index, "crystals"))[0];
    expect(row).toContain('lang="zh-Hant-US">礦物</p>');
    expect(row).not.toContain("其他");
  });

  it.each(["blog", "crystals"] as const)(
    "preserves and escapes complete long text in %s",
    async (kind) => {
      const title =
        "VeryLongWord".repeat(30) +
        " 中文長標題".repeat(20) +
        ' <script>alert("title")</script> &';
      const excerpt =
        "Full English and 繁中摘要 ".repeat(100) +
        "<img src=x onerror=alert(1)>";
      const html = await renderIndex(
        editorialIndex({ articles: [editorialArticle(1, { title, excerpt })] }),
        kind,
      );
      expect(html).toContain(renderToStaticMarkup(<>{title}</>));
      expect(html).toContain(renderToStaticMarkup(<>{excerpt}</>));
      expect(html).not.toMatch(/<script\b|<img\b|dangerouslySetInnerHTML/);
    },
  );

  it("keeps the Shopify SEO description and its actual language", async () => {
    const description = "An unabridged Shopify description. ".repeat(30);
    const html = await renderIndex(
      editorialIndex({
        seoDescription: description,
        descriptionLocale: "en-US",
      }),
      "blog",
      "zh-Hant-US",
    );
    expect(html).toContain(`<p lang="en-US">${description}</p>`);
    expect(html).not.toMatch(
      /Stories &amp; guidance|Material reference|故事與指南|材質參考/,
    );
  });

  it.each(["blog", "crystals"] as const)(
    "uses the original localized default description for %s",
    async (kind) => {
      const html = await renderIndex(
        editorialIndex({ seoDescription: "", descriptionLocale: "en-US" }),
        kind,
        "zh-Hant-US",
      );
      expect(html).toContain(
        `<p lang="zh-Hant-US">${editorialCopy(kind, "zh-Hant-US").description}</p>`,
      );
    },
  );
});

describe("fallbacks and content states", () => {
  it.each([true, false])(
    "preserves per-field languages and the existing notice condition: %s",
    async (usedDefaultLanguage) => {
      const article = editorialArticle(1, {
        title: "繁中標題",
        titleLocale: "zh-Hant-US",
        excerptLocale: "en-US",
        tags: ["保養"],
        tagsLocale: "zh-Hant-US",
        translationReady: false,
        usedDefaultLanguage,
      });
      const html = await renderIndex(
        editorialIndex({
          articles: [article],
          usedDefaultLanguage,
          translationReady: false,
        }),
        "blog",
        "zh-Hant-US",
      );
      expect(rows(html)).toHaveLength(1);
      expect(html).toContain('lang="zh-Hant-US">繁中標題</h2>');
      expect(html).toContain('lang="en-US">An excerpt for story 1.</p>');
      expect(html).toContain('lang="zh-Hant-US">保養</span>');
      expect(html.includes("本欄目內容目前以英文提供。")).toBe(
        usedDefaultLanguage,
      );
      expect(rows(html)[0]).not.toMatch(/<a[^>]* lang=/);
    },
  );

  it("does not drop articles when the whole index falls back to English", async () => {
    const html = await renderIndex(
      editorialIndex({
        articles: [
          editorialArticle(1, {
            usedDefaultLanguage: true,
            translationReady: false,
          }),
          editorialArticle(2),
        ],
        usedDefaultLanguage: true,
        translationReady: false,
      }),
      "crystals",
      "zh-Hant-US",
    );
    expect(rows(html)).toHaveLength(2);
    expect(html).toContain('lang="en-US">Story 1</h2>');
    expect(html).toContain("本欄目內容目前以英文提供。");
  });

  for (const kind of ["blog", "crystals"] as const) {
    it.each([null, editorialIndex({ articles: [] })])(
      `keeps a readable compact ${kind} empty state`,
      async (index) => {
        const html = await renderIndex(index, kind, "zh-Hant-US");
        expect(html.match(/<h1\b/g)).toHaveLength(1);
        expect(html).toContain(
          `>${editorialCopy(kind, "zh-Hant-US").title}</h1>`,
        );
        expect(html).toContain("目前沒有文章。");
        expect(rows(html)).toHaveLength(0);
        expect(html).not.toContain("editorial-index-footer");
        expect(html).not.toContain("共 0");
      },
    );

    it(`propagates the original upstream ${kind} rejection`, async () => {
      const error = new Error("Shopify read failed");
      mocks.index.mockRejectedValue(error);
      await expect(EditorialIndexPage({ locale: "en-US", kind })).rejects.toBe(
        error,
      );
    });
  }
});

it.each([
  ["blog", 1, "en-US", "1 article"],
  ["blog", 3, "en-US", "3 articles"],
  ["crystals", 1, "en-US", "1 guide"],
  ["crystals", 5, "en-US", "5 guides"],
  ["blog", 1, "zh-Hant-US", "共 1 篇文章"],
  ["blog", 3, "zh-Hant-US", "共 3 篇文章"],
  ["crystals", 1, "zh-Hant-US", "共 1 個條目"],
  ["crystals", 5, "zh-Hant-US", "共 5 個條目"],
] as const)(
  "formats count copy for %s/%i/%s",
  (kind, count, locale, expected) => {
    expect(editorialIndexCount(kind, count, locale)).toBe(expected);
  },
);
