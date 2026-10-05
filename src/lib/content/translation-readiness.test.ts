import { beforeEach, expect, it, vi } from "vitest";
import {
  getShopifyAboutTree,
  getPublishedShopifyAboutPaths,
} from "./shopify-about-pages";
import {
  getShopifyContentPage,
  getPublishedShopifyContentPagePaths,
} from "./shopify-content-pages";
import {
  getShopifyEditorialArticle,
  getPublishedShopifyEditorialPaths,
} from "./shopify-editorial";
import { getPublishedShopifyPolicyPaths } from "./shopify-policies";

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@/lib/commerce/shopify", () => ({ shopifyFetch: mocks.fetch }));

function page(handle: string, translated: boolean) {
  const text = translated ? "我們的水晶飾物。" : "Our crystal objects.";
  return {
    id: `gid://shopify/Metaobject/${handle}`,
    type: "content_page",
    handle,
    fields: [
      {
        key: "title",
        type: "single_line_text_field",
        value: translated ? "關於我們" : "About",
      },
      {
        key: "body",
        type: "rich_text_field",
        value: JSON.stringify({
          type: "root",
          children: [
            { type: "paragraph", children: [{ type: "text", value: text }] },
          ],
        }),
      },
      { key: "last_updated", type: "date", value: "2026-09-01" },
      {
        key: "seo_title",
        type: "single_line_text_field",
        value: translated ? "關於我們" : "About",
      },
      { key: "seo_description", type: "multi_line_text_field", value: text },
    ],
    childPages: null,
  };
}

function article(translated: boolean) {
  return {
    id: "gid://shopify/Article/1",
    handle: "story",
    title: translated ? "水晶故事" : "Crystal story",
    excerpt: translated ? "我們的故事。" : "Our story.",
    content: translated ? "水晶飾物的故事。" : "The story of crystal objects.",
    contentHtml: translated
      ? "<p>水晶飾物的故事。</p>"
      : "<p>The story of crystal objects.</p>",
    publishedAt: "2026-09-01T00:00:00Z",
    image: null,
    seo: {
      title: translated ? "水晶故事" : "Crystal story",
      description: translated ? "我們的故事。" : "Our story.",
    },
    tags: ["Joya Mana"],
    authorV2: { name: "Tian Tian" },
  };
}

beforeEach(() => {
  mocks.fetch.mockReset();
});

it.each(["about", "accessibility"])(
  "ignores formatting when identifying %s body fallback",
  async (handle) => {
    mocks.fetch.mockImplementation((_query, variables) => {
      const node = page(handle, variables.language === "ZH_TW");
      node.fields.find((field) => field.key === "body")!.value = JSON.stringify(
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "Our crystal objects.",
                  bold: variables.language === "ZH_TW",
                },
              ],
            },
          ],
        },
      );
      return { metaobject: node };
    });
    const result =
      handle === "about"
        ? (await getShopifyAboutTree("zh-Hant-US"))?.root
        : await getShopifyContentPage("accessibility", "zh-Hant-US");
    expect(result).toMatchObject({
      contentLocale: "en-US",
      usedDefaultLanguage: true,
      translationReady: false,
    });
  },
);

it.each(["seo_title", "seo_description"])(
  "excludes Accessibility with fallback %s",
  async (key) => {
    mocks.fetch.mockImplementation((_query, variables) => {
      const node = page("accessibility", variables.language === "ZH_TW");
      node.fields.find((field) => field.key === key)!.value = page(
        "accessibility",
        false,
      ).fields.find((field) => field.key === key)!.value;
      return { metaobject: node };
    });
    expect(
      await getShopifyContentPage("accessibility", "zh-Hant-US"),
    ).toMatchObject({ contentLocale: "zh-Hant-US", translationReady: false });
    expect(await getPublishedShopifyContentPagePaths("zh-Hant-US")).toEqual([]);
  },
);

it("does not publish localized Accessibility without the default-language entity", async () => {
  mocks.fetch.mockImplementation((_query, variables) => ({
    metaobject:
      variables.language === "EN" ? null : page("accessibility", true),
  }));
  expect(await getShopifyContentPage("accessibility", "zh-Hant-US")).toBeNull();
});

it("retains the About brand-title exception with translated body and description", async () => {
  mocks.fetch.mockImplementation((_query, variables) => {
    const node = page("about", variables.language === "ZH_TW");
    for (const field of node.fields)
      if (field.key === "title" || field.key === "seo_title")
        field.value = "Joya Mana";
    return { metaobject: node };
  });
  expect(await getPublishedShopifyAboutPaths("zh-Hant-US")).toEqual(["/about"]);
});

it.each(["<h1>Title</h1>", "<p> </p><h2>Title</h2><h3>Subtitle</h3>"])(
  "rejects headings-only policy and article bodies: %s",
  async (contentHtml) => {
    mocks.fetch.mockImplementation((query) =>
      query.includes("ShopifyPolicies")
        ? {
            shop: {
              shippingPolicy: {
                id: "1",
                title: "Shipping",
                body: contentHtml,
                url: "/shipping",
              },
              refundPolicy: null,
              privacyPolicy: null,
              termsOfService: null,
            },
          }
        : {
            blog: {
              id: "1",
              handle: "blog",
              title: "Blog",
              seo: { title: null, description: null },
              articleByHandle: { ...article(false), contentHtml },
              articles: {
                nodes: [{ ...article(false), contentHtml }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          },
    );
    expect(await getPublishedShopifyPolicyPaths("en-US")).toEqual([]);
    expect(
      await getShopifyEditorialArticle("blog", "story", "en-US"),
    ).toBeNull();
    expect(await getPublishedShopifyEditorialPaths("blog", "en-US")).toEqual(
      [],
    );
  },
);

it.each([
  "body",
  "title",
  "excerpt",
  "seoTitle",
  "seoDescription",
  "indexDescription",
])(
  "excludes fallback %s while retaining actual body language",
  async (field) => {
    mocks.fetch.mockImplementation((_query, variables) => {
      const translated = variables.language === "ZH_TW";
      const node = article(translated);
      const original = article(false);
      if (translated) {
        if (field === "body")
          node.contentHtml =
            "<p><strong>The story of crystal objects.</strong></p>";
        if (field === "title") node.title = original.title;
        if (field === "excerpt") node.excerpt = original.excerpt;
        if (field === "seoTitle") node.seo.title = original.seo.title;
        if (field === "seoDescription")
          node.seo.description = original.seo.description;
      }
      return {
        blog: {
          id: "1",
          handle: "blog",
          title: "Blog",
          seo: {
            title: null,
            description:
              translated && field !== "indexDescription"
                ? "水晶故事。"
                : "Crystal stories.",
          },
          articleByHandle: node,
          articles: {
            nodes: [node],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      };
    });
    const result = await getShopifyEditorialArticle(
      "blog",
      "story",
      "zh-Hant-US",
    );
    expect(result?.contentLocale).toBe(
      field === "body" ? "en-US" : "zh-Hant-US",
    );
    expect(result?.translationReady).toBe(field === "indexDescription");
    expect(
      await getPublishedShopifyEditorialPaths("blog", "zh-Hant-US"),
    ).toEqual(field === "indexDescription" ? ["/blog/story"] : []);
  },
);

it("publishes complete Traditional Chinese articles without requiring brand tags or author translation", async () => {
  mocks.fetch.mockImplementation((_query, variables) => {
    const node = article(variables.language === "ZH_TW");
    return {
      blog: {
        id: "1",
        handle: "blog",
        title: "Blog",
        seo: { title: null, description: null },
        articleByHandle: node,
        articles: {
          nodes: [node],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    };
  });
  expect(await getPublishedShopifyEditorialPaths("blog", "zh-Hant-US")).toEqual(
    ["/blog", "/blog/story"],
  );
});
