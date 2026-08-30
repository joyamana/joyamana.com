import type { Metadata } from "next";
import { CollectionPage } from "@/components/pages/collection-page";
import { getDesignCollection } from "@/lib/commerce/catalog";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getDesignCollection(handle, "us", "en-US");
  const description = collection?.seoDescription || collection?.description;
  if (!collection || !description) {
    return buildNoIndexMetadata({
      title: collection?.title || "Collection unavailable",
      description: "This collection is not currently available.",
    });
  }
  return buildMetadata({
    title: collection.seoTitle || collection.title,
    description,
    locale: "en-US",
    path: `/collections/${handle}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <CollectionPage locale="en-US" handle={(await params).handle} />;
}
