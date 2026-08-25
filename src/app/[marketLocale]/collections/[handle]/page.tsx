import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/pages/collection-page";
import { getCollection, getCollections } from "@/lib/commerce/catalog";
import {
  canadaLocaleFromSegment,
  enabledCanadaLocaleSegments,
} from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  if (enabledCanadaLocaleSegments.length === 0) return [];

  const collections = await getCollections("ca", "en-CA");
  return enabledCanadaLocaleSegments.flatMap((marketLocale) =>
    collections.map(({ handle }) => ({ marketLocale, handle })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ marketLocale: string; handle: string }>;
}): Promise<Metadata> {
  const { marketLocale, handle } = await params;
  const locale = canadaLocaleFromSegment(marketLocale);
  if (!locale) notFound();
  const collection = await getCollection(handle, "ca", locale);
  return buildMetadata({
    title: collection?.title || "Collection",
    description: collection?.description || "Prototype collection.",
    locale,
    path: `/collections/${handle}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string; handle: string }>;
}) {
  const { marketLocale, handle } = await params;
  const locale = canadaLocaleFromSegment(marketLocale);
  if (!locale) notFound();
  return <CollectionPage locale={locale} handle={handle} />;
}
