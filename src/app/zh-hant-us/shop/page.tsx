import { ShopPage } from "@/components/pages/shop-page";
import type { PageSearchParams } from "@/lib/seo";
import { buildCatalogHubMetadata } from "@/lib/commerce/catalog-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildCatalogHubMetadata({
    title: "選購",
    description: "探索 Joya Mana 目前供應的所有商品。",
    locale: "zh-Hant-US",
    path: "/shop",
    searchParams: await searchParams,
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return <ShopPage locale="zh-Hant-US" searchParams={await searchParams} />;
}
