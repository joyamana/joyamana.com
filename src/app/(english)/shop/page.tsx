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
    title: "Shop",
    description: "Browse all products currently available from Joya Mana.",
    locale: "en-US",
    path: "/shop",
    searchParams: await searchParams,
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return <ShopPage locale="en-US" searchParams={await searchParams} />;
}
