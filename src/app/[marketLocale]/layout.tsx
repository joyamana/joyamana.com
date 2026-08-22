import { notFound } from "next/navigation";
import { LocaleShell } from "@/components/locale-shell";
import {
  canadaLocaleFromSegment,
  enabledCanadaLocaleSegments,
} from "@/lib/i18n/locales";

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
  return <LocaleShell locale={locale}>{children}</LocaleShell>;
}
