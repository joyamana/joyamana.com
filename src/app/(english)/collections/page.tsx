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
    title: "Design collections",
    description: "Explore original Joya Mana design series and their stories.",
    locale: "en-US",
    path: "/collections",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <CollectionsPage locale="en-US" />;
}
