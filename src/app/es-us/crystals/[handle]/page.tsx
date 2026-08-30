import type { Metadata } from "next";
import { EditorialDetailPage } from "@/components/pages/editorial-detail-page";
import { buildEditorialArticleMetadata } from "@/lib/content/editorial-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  return buildEditorialArticleMetadata({
    handle: (await params).handle,
    kind: "crystals",
    locale: "es-US",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <EditorialDetailPage
      locale="es-US"
      handle={(await params).handle}
      kind="crystals"
    />
  );
}
