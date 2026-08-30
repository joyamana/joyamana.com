import { notFound } from "next/navigation";
import { EditorialDetailPage } from "@/components/pages/editorial-detail-page";
import { canadaLocaleFromSegment } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string; handle: string }>;
}) {
  const { marketLocale, handle } = await params;
  const locale = canadaLocaleFromSegment(marketLocale);
  if (!locale) notFound();
  return (
    <EditorialDetailPage
      locale={locale}
      handle={handle}
      kind="blog"
    />
  );
}
