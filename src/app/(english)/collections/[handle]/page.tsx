import type { Metadata } from "next";
import { CollectionPage } from "@/components/pages/collection-page";
import { getDesignCollection } from "@/lib/commerce/catalog";
import {
  buildMetadata,
  buildNoIndexMetadata,
  getCollectionSeoDescription,
  type PageSearchParams,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getDesignCollection(handle, "us", "en-US");
  const description = getCollectionSeoDescription(collection);
  if (!collection || !description) {
    return buildNoIndexMetadata({
      title: collection?.title || "Collection unavailable",
      description: collection
        ? "Browse the pieces in this Joya Mana design collection."
        : "This collection is not currently available.",
    });
  }
  return buildMetadata({
    title: collection.seoTitle || collection.title,
    description,
    locale: "en-US",
    path: `/collections/${handle}`,
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
  return <CollectionPage locale="en-US" handle={(await params).handle} searchParams={await searchParams} />;
}
