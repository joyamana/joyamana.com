import { expect, it } from "vitest";
import { notFoundResponse } from "./not-found";

it.each([
  ["en-US", "/shop", "/", "We couldn’t find that page."],
  ["es-US", "/es-us/shop", "/es-us", "No pudimos encontrar esta página."],
  ["zh-Hant-US", "/zh-hant-us/shop", "/zh-hant-us", "未能找到此頁面。"],
] as const)(
  "returns a complete localized no-JS 404: %s",
  async (locale, shop, home, title) => {
    const response = notFoundResponse(locale);
    const html = await response.text();
    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(html).toContain(`<html lang="${locale}">`);
    expect(html).toContain(`<h1>${title}</h1>`);
    expect(html).toContain('<main id="main-content">');
    expect(html).toContain(`href="${shop}"`);
    expect(html).toContain(`href="${home}"`);
    expect(html).not.toMatch(/<script|canonical|hreflang|en-ca|fr-ca/);
  },
);
