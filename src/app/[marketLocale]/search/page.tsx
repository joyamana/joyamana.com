import { notFound } from "next/navigation";
import { SearchPage } from "@/components/pages/search-page";
import { canadaLocaleFromSegment } from "@/lib/i18n/locales";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ marketLocale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  return <SearchPage locale={locale} query={(await searchParams).q || ""} />;
}
