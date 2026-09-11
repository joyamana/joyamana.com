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
  const collection = await getDesignCollection(handle, "us", "zh-Hant-US");
  const description = getCollectionSeoDescription(collection);
  if (!collection || !description) {
    return buildNoIndexMetadata({
      title: collection?.title || "暫未能提供此系列",
      description: collection
        ? "探索此 Joya Mana 設計系列的商品。"
        : "此系列目前未能提供。",
    });
  }
  return buildMetadata({
    title: collection.seoTitle || collection.title,
    description,
    locale: "zh-Hant-US",
    path: `/collections/${handle}`,
    searchParams: await searchParams,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <CollectionPage locale="zh-Hant-US" handle={(await params).handle} />;
}
