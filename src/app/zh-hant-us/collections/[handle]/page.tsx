import type { Metadata } from "next";
import { CollectionPage } from "@/components/pages/collection-page";
import { buildCollectionMetadata } from "@/lib/commerce/catalog-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const { handle } = await params;
  return buildCollectionMetadata({
    handle,
    locale: "zh-Hant-US",
    searchParams: await searchParams,
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  return (
    <CollectionPage
      locale="zh-Hant-US"
      handle={(await params).handle}
      searchParams={await searchParams}
    />
  );
}
