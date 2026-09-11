import { SearchPage } from "@/components/pages/search-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "搜尋",
  description: "搜尋 Joya Mana 商品目錄。",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <SearchPage locale="zh-Hant-US" query={(await searchParams).q || ""} />;
}
