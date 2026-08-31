import type { Metadata } from "next";
import { RootDocument, rootMetadata } from "@/components/root-document";
import { LocaleShell } from "@/components/locale-shell";
import "../globals.css";

export const metadata: Metadata = rootMetadata;

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootDocument locale="en-US">
      <LocaleShell locale="en-US">{children}</LocaleShell>
    </RootDocument>
  );
}
