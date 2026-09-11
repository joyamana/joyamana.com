import { ShopPage } from "@/components/pages/shop-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "選購",
    description:
      "探索 Joya Mana 目前供應的所有商品。",
    locale: "zh-Hant-US",
    path: "/shop",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <ShopPage locale="zh-Hant-US" />;
}
