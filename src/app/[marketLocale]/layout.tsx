import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RootDocument, rootMetadata } from "@/components/root-document";
import { LocaleShell } from "@/components/locale-shell";
import {
  canadaLocaleFromSegment,
  enabledCanadaLocaleSegments,
} from "@/lib/i18n/locales";
import "../globals.css";

export const metadata: Metadata = rootMetadata;

export function generateStaticParams() {
  return enabledCanadaLocaleSegments.map((marketLocale) => ({ marketLocale }));
}

export default async function CanadaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ marketLocale: string }>;
}) {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  return (
    <RootDocument locale={locale}>
      <LocaleShell locale={locale}>{children}</LocaleShell>
    </RootDocument>
  );
}
