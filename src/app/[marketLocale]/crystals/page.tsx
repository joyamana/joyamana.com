import { notFound } from "next/navigation";
import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { crystalGuides } from "@/lib/content/content";
import { canadaLocaleFromSegment } from "@/lib/i18n/locales";

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string }>;
}) {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  return <EditorialIndexPage locale={locale} entries={crystalGuides} kind="crystals" />;
}
