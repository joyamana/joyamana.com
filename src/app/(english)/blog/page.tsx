import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { blogEntries } from "@/lib/content/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Blog — draft",
  description: "Development articles about crystal objects and clear buying.",
  locale: "en-US",
  path: "/blog",
});

export default function Page() {
  return <EditorialIndexPage locale="en-US" entries={blogEntries} kind="blog" />;
}
