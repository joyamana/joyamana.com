import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { blogEntries } from "@/lib/content/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Blog — borrador",
  description: "Artículos de desarrollo sobre objetos de cristal y compras claras.",
  locale: "es-US",
  path: "/blog",
});

export default function Page() {
  return <EditorialIndexPage locale="es-US" entries={blogEntries} kind="blog" />;
}
