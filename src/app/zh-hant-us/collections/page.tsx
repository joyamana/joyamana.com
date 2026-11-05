import { CollectionsPage } from "@/components/pages/collections-page";
import type { PageSearchParams } from "@/lib/seo";
import { buildCatalogHubMetadata } from "@/lib/commerce/catalog-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildCatalogHubMetadata({
    title: "所有系列",
    description: "瀏覽 Joya Mana 的所有系列，探索不同主題與精選商品。",
    locale: "zh-Hant-US",
    path: "/collections",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <CollectionsPage locale="zh-Hant-US" />;
}
