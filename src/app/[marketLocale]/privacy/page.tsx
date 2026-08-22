import { notFound } from "next/navigation";
import { PolicyPage } from "@/components/pages/policy-page";
import { canadaLocaleFromSegment } from "@/lib/i18n/locales";

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string }>;
}) {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  return <PolicyPage locale={locale} kind="privacy" />;
}
