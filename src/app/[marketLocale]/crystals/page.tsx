import { notFound } from "next/navigation";
import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { canadaLocaleFromSegment } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string }>;
}) {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  return <EditorialIndexPage locale={locale} kind="crystals" />;
}
