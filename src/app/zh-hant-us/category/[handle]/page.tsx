import type { Metadata } from "next";
import { CategoryPage } from "@/components/pages/category-page";
import { getProductCategory } from "@/lib/commerce/catalog";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  const { handle } = await params;
  const category = await getProductCategory(handle, "us", "zh-Hant-US");
  return buildMetadata({
    title: category?.title || "商品類別",
    description: category?.description || "Joya Mana 商品類別。",
    locale: "zh-Hant-US",
    path: `/category/${handle}`,
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
  return <CategoryPage locale="zh-Hant-US" handle={(await params).handle} searchParams={await searchParams} />;
}
