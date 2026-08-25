import { CollectionsPage } from "@/components/pages/collections-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Collections — prototype",
  description: "Browse the shared US prototype catalog.",
  locale: "en-US",
  path: "/collections",
});

export default function Page() {
  return <CollectionsPage locale="en-US" />;
}
