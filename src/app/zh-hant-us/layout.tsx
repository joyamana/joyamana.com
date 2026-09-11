import type { Metadata } from "next";
import { RootDocument, rootMetadata } from "@/components/root-document";
import { LocaleShell } from "@/components/locale-shell";
import "../globals.css";

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
    <RootDocument locale="zh-Hant-US">
      <LocaleShell locale="zh-Hant-US">{children}</LocaleShell>
    </RootDocument>
  );
}
