import type { Metadata } from "next";
import { RootDocument, rootMetadata } from "@/components/root-document";
import { LocaleShell } from "@/components/locale-shell";
import "../globals.css";

export const metadata: Metadata = rootMetadata;

export default function SpanishUSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootDocument locale="es-US">
      <LocaleShell locale="es-US">{children}</LocaleShell>
    </RootDocument>
  );
}
