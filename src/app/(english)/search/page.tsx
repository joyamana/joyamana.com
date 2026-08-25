import { SearchPage } from "@/components/pages/search-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Search",
  description: "Search the Joya Mana catalog and editorial content.",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <SearchPage locale="en-US" query={(await searchParams).q || ""} />;
}
