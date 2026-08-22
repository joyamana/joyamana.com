import { EditorialIndexPage } from "@/components/pages/editorial-index-page";
import { crystalGuides } from "@/lib/content/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Guía de cristales — borrador",
  description: "Estructura de prototipo sin revisión para una guía de cristales.",
  locale: "es-US",
  path: "/crystals",
});

export default function Page() {
  return (
    <EditorialIndexPage locale="es-US" entries={crystalGuides} kind="crystals" />
  );
}
