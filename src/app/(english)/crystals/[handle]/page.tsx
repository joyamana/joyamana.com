import type { Metadata } from "next";
import { EditorialDetailPage } from "@/components/pages/editorial-detail-page";
import { buildEditorialArticleMetadata } from "@/lib/content/editorial-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  return buildEditorialArticleMetadata({
    handle: (await params).handle,
    kind: "crystals",
    locale: "en-US",
    searchParams: await searchParams,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <EditorialDetailPage
      locale="en-US"
      handle={(await params).handle}
      kind="crystals"
    />
  );
}
