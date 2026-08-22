import { notFound } from "next/navigation";
import { EditorialDetailPage } from "@/components/pages/editorial-detail-page";
import { crystalGuides } from "@/lib/content/content";
import {
  canadaLocaleFromSegment,
  enabledCanadaLocaleSegments,
} from "@/lib/i18n/locales";

export function generateStaticParams() {
  return enabledCanadaLocaleSegments.flatMap((marketLocale) =>
    crystalGuides.map(({ handle }) => ({ marketLocale, handle })),
  );
}

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
      entries={crystalGuides}
      handle={handle}
      kind="crystals"
    />
  );
}
