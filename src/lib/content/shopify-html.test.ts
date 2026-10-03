import { describe, expect, it } from "vitest";
import { safeContentHref, sanitizeShopifyHtml } from "./shopify-html";

describe("merchant HTML boundary", () => {
  it("handles named entities, double escaping and malformed Unicode without crashing", () => {
    expect(sanitizeShopifyHtml("<p>A &copy; B &ndash; C &amp;copy;</p>")).toBe(
      "<p>A © B – C &amp;copy;</p>",
    );
    for (const value of [
      "&#1114112;",
      "&#x110000;",
      "&#99999999999999999999999;",
    ])
      expect(() => sanitizeShopifyHtml(`<p>${value}</p>`)).not.toThrow();
    expect(sanitizeShopifyHtml("<p>&#x1f48e;</p>")).toContain("💎");
  });
  it("uses parsed attributes and removes scripts and unsafe destinations", () => {
    const html = sanitizeShopifyHtml(
      '<p title="a > b">Hello<script>alert(1)</script>' +
        '<a href="java&#x73;cript:alert(1)" onclick="alert(1)">bad</a>' +
        '<a href="https://example.com?a=1&amp;b=2" target="_blank">safe</a></p>',
    );
    expect(html).not.toMatch(/alert|onclick|javascript|title=/);
    expect(html).toContain(
      'href="https://example.com?a=1&amp;b=2" target="_blank" rel="noopener noreferrer"',
    );
  });
  it("preserves approved formatting and only approved editorial images", () => {
    const source =
      "<h1>Title</h1><table><tr><td><strong>Stone</strong></td></tr></table>" +
      '<img src="https://cdn.shopify.com/s/files/1/piece.jpg" alt="Piece" onerror="bad()">' +
      '<img src="https://cdn.shopify.com.evil.example/s/files/bad.jpg">';
    expect(
      sanitizeShopifyHtml(source, { removeLeadingH1: true }),
    ).not.toContain("Title");
    const html = sanitizeShopifyHtml(source, { allowImages: true });
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<strong>Stone</strong>");
    expect(html).toContain('alt="Piece" loading="lazy"');
    expect(html).not.toMatch(/evil|onerror/);
  });
  it.each([
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "https:\n//evil.example",
  ])("rejects unsafe content links: %s", (value) =>
    expect(safeContentHref(value)).toBeNull(),
  );
});
