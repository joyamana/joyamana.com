import { SearchPage } from "@/components/pages/search-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Search",
  description: "Search products in the Joya Mana catalog.",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <SearchPage locale="en-US" query={(await searchParams).q || ""} />;
}
