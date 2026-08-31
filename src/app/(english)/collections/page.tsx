import { CollectionsPage } from "@/components/pages/collections-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
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
