import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/pages/collection-page";
import { getCollection, getCollections } from "@/lib/commerce/catalog";
import { localize } from "@/lib/commerce/types";
import {
  canadaLocaleFromSegment,
  enabledCanadaLocaleSegments,
} from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const collections = await getCollections();
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
  const collection = await getCollection(handle, "ca");
  return buildMetadata({
    title: collection ? localize(collection.title, locale) : "Collection",
    description: collection
      ? localize(collection.description, locale)
      : "Prototype collection.",
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
