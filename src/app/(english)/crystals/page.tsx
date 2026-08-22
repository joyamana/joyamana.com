import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { crystalGuides } from "@/lib/content/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Crystal guide — draft",
  description: "Unreviewed prototype crystal guide structure.",
  locale: "en-US",
  path: "/crystals",
});

export default function Page() {
  return (
    <EditorialIndexPage locale="en-US" entries={crystalGuides} kind="crystals" />
  );
}
