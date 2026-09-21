import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const fontOptions = vi.hoisted(() => new Map<string, unknown>());

vi.mock("next/font/google", () => ({
  Newsreader: () => ({ variable: "newsreader-variable" }),
  Manrope: () => ({ variable: "manrope-variable" }),
  Noto_Serif_HK: (options: unknown) => {
    fontOptions.set("serif", options);
    return { variable: "noto-serif-hk-variable" };
  },
  Noto_Sans_HK: (options: unknown) => {
    fontOptions.set("sans", options);
    return { variable: "noto-sans-hk-variable" };
  },
}));
vi.mock("./cart-provider", () => ({
  CartProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("./locale-shell", () => ({
  LocaleShell: ({ children }: { children: ReactNode }) => children,
}));

import EnglishLayout from "@/app/(english)/layout";
import SpanishUSLayout from "@/app/es-us/layout";
import TraditionalChineseUSLayout from "@/app/zh-hant-us/layout";
import { rootMetadata } from "./root-document";

describe("Root document fonts", () => {
  it("provides a brand share image to routes without page-specific Open Graph metadata", () => {
    expect(rootMetadata.openGraph).toMatchObject({
      images: [{
        url: new URL("/brand/joya-mana-opengraph.png", rootMetadata.metadataBase!).toString(),
        width: 1200,
        height: 630,
        alt: "Joya Mana",
      }],
    });
  });

  it.each([
    ["en-US", EnglishLayout],
    ["es-US", SpanishUSLayout],
  ] as const)("keeps the existing Latin fonts on %s", (locale, Layout) => {
    const html = renderToStaticMarkup(<Layout><main>Page</main></Layout>);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain('class="newsreader-variable manrope-variable"');
    expect(html).not.toContain("noto-");
  });

  it("adds both HK font variables without replacing the Latin fonts", () => {
    const html = renderToStaticMarkup(
      <TraditionalChineseUSLayout><main>天然形態</main></TraditionalChineseUSLayout>,
    );
    expect(html).toContain('lang="zh-Hant-US"');
    expect(html).toContain(
      'class="newsreader-variable manrope-variable noto-serif-hk-variable noto-sans-hk-variable"',
    );
    expect(html).toContain("天然形態");
  });

  it("uses on-demand HK fonts with visible fallback text, not CJK preloads", () => {
    expect(fontOptions.get("serif")).toEqual({
      weight: "500",
      variable: "--font-noto-serif-hk",
      display: "swap",
      preload: false,
      adjustFontFallback: false,
    });
    expect(fontOptions.get("sans")).toEqual({
      variable: "--font-noto-sans-hk",
      display: "swap",
      preload: false,
      adjustFontFallback: false,
    });
  });
});
