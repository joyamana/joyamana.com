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
    title: "Collections",
    description:
      "Browse all Joya Mana collections and explore their themes and selected pieces.",
    locale: "en-US",
    path: "/collections",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <CollectionsPage locale="en-US" />;
}
