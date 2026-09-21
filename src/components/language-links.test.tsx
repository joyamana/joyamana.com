import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/zh-hant-us/products/rose-quartz" }));
import { LanguageLinks } from "./language-links";

describe("Shared page-preserving language links", () => {
  it.each([true, false])("keeps product identity for compact=%s", (compact) => {
    const html = renderToStaticMarkup(<LanguageLinks locale="zh-Hant-US" compact={compact} />);
    expect(html).toContain('href="/products/rose-quartz"');
    expect(html).toContain('href="/es-us/products/rose-quartz"');
    expect(html).toContain('href="/zh-hant-us/products/rose-quartz"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain("en-ca");
  });
});
