import { ShopPage } from "@/components/pages/shop-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "Shop",
    description: "Browse all products currently available from Joya Mana.",
    locale: "en-US",
    path: "/shop",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <ShopPage locale="en-US" />;
}
