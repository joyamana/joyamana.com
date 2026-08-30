import { CollectionsPage } from "@/components/pages/collections-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Design collections",
  description: "Explore original Joya Mana design series and their stories.",
  locale: "en-US",
  path: "/collections",
});

export default function Page() {
  return <CollectionsPage locale="en-US" />;
}
