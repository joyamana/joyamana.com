import type { Metadata } from "next";
import { Noto_Sans_HK, Noto_Serif_HK } from "next/font/google";
import { RootDocument, rootMetadata } from "@/components/root-document";
import { LocaleShell } from "@/components/locale-shell";
import "../globals.css";

// Keep CJK font assets in this locale's layout. Unicode-range subsets are
// self-hosted by Next and fetched on demand, never preloaded in their entirety.
const notoSerifHK = Noto_Serif_HK({
  weight: "500",
  variable: "--font-noto-serif-hk",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

const notoSansHK = Noto_Sans_HK({
  variable: "--font-noto-sans-hk",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  ...rootMetadata,
  description: "現代水晶首飾與獨特飾物，因其形態、寓意與天然個性而獲選。",
  robots: { index: false, follow: false, noarchive: true },
};

export default function TraditionalChineseUSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootDocument
      locale="zh-Hant-US"
      fontClassName={`${notoSerifHK.variable} ${notoSansHK.variable}`}
    >
      <LocaleShell locale="zh-Hant-US">{children}</LocaleShell>
    </RootDocument>
  );
}
