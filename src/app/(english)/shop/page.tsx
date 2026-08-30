import { ShopPage } from "@/components/pages/shop-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Shop",
  description: "Browse all products currently available from Joya Mana.",
  locale: "en-US",
  path: "/shop",
});

export default function Page() {
  return <ShopPage locale="en-US" />;
}
