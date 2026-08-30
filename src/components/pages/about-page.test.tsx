import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type {
  StorefrontAboutPage,
  StorefrontAboutTree,
} from "@/lib/content/shopify-about-pages";
import { AboutContentPage } from "./about-page";

function page(
  handle: string,
  title: string,
  overrides: Partial<StorefrontAboutPage> = {},
): StorefrontAboutPage {
  return {
    id: `gid://shopify/Metaobject/${handle}`,
    handle,
    title,
    navigationTitle: title,
    summary: `${title} summary.`,
    richText: "{}",
    html: `<p>${title} body.</p>`,
    lastUpdated: "2026-08-31",
    seoTitle: title,
    seoDescription: `${title} description.`,
    contentLocale: "en-US",
    requestedLocale: "en-US",
    usedDefaultLanguage: false,
    ...overrides,
  };
}

describe("About content page", () => {
  it("does not render a tab navigation when the root has no children", () => {
    const root = page("about", "About Joya Mana");
    const tree: StorefrontAboutTree = { root, children: [] };
    const html = renderToStaticMarkup(
      <AboutContentPage locale="en-US" page={root} tree={tree} />,
    );

    expect(html).not.toContain("about-tabs");
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("<h1>About Joya Mana</h1>");
  });

  it("does not expose the SEO description as a visible summary", () => {
    const root = page("about", "About Joya Mana", { summary: "" });
    const tree: StorefrontAboutTree = { root, children: [] };
    const html = renderToStaticMarkup(
      <AboutContentPage locale="en-US" page={root} tree={tree} />,
    );

    expect(html).not.toContain("About Joya Mana description.");
    expect(html).toContain("About Joya Mana body.");
  });

  it("renders real links in Shopify reference order with the root active", () => {
    const root = page("about", "About Joya Mana");
    const approach = page("our-approach", "Our Approach");
    const standards = page("product-standards", "Product Standards");
    const tree: StorefrontAboutTree = {
      root,
      children: [approach, standards],
    };
    const html = renderToStaticMarkup(
      <AboutContentPage locale="en-US" page={root} tree={tree} />,
    );

    expect(html).toContain('<nav aria-label="About Joya Mana sections"');
    expect(html).not.toContain('role="tab"');
    expect(html).toMatch(
      /<a(?=[^>]*aria-current="page")(?=[^>]*href="\/about")[^>]*>/,
    );
    expect(html.indexOf("Our Approach")).toBeLessThan(
      html.indexOf("Product Standards"),
    );
    expect(html).toContain('href="/about/our-approach"');
    expect(html).toContain('href="/about/product-standards"');
  });

  it("localizes child URLs and marks the child page as current", () => {
    const root = page("about", "Sobre Joya Mana", {
      contentLocale: "es-US",
      requestedLocale: "es-US",
    });
    const approach = page("our-approach", "Nuestro enfoque", {
      contentLocale: "es-US",
      requestedLocale: "es-US",
    });
    const tree: StorefrontAboutTree = { root, children: [approach] };
    const html = renderToStaticMarkup(
      <AboutContentPage
        handle="our-approach"
        locale="es-US"
        page={approach}
        tree={tree}
      />,
    );

    expect(html).toContain('href="/es-us/about"');
    expect(html).toMatch(
      /<a(?=[^>]*aria-current="page")(?=[^>]*href="\/es-us\/about\/our-approach")[^>]*>/,
    );
  });

  it("keeps untranslated children out of root navigation", () => {
    const root = page("about", "Sobre Joya Mana", {
      contentLocale: "es-US",
      requestedLocale: "es-US",
    });
    const fallback = page("product-standards", "Product Standards", {
      requestedLocale: "es-US",
      usedDefaultLanguage: true,
    });
    const tree: StorefrontAboutTree = { root, children: [fallback] };
    const html = renderToStaticMarkup(
      <AboutContentPage locale="es-US" page={root} tree={tree} />,
    );

    expect(html).not.toContain("about-tabs");
    expect(html).not.toContain("Product Standards");
  });
});
