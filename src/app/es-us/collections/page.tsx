import { CollectionsPage } from "@/components/pages/collections-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Colecciones — prototipo",
  description: "Explora el catálogo de prototipo compartido del mercado estadounidense.",
  locale: "es-US",
  path: "/collections",
});

export default function Page() {
  return <CollectionsPage locale="es-US" />;
}
