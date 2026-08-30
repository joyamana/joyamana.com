import { CollectionsPage } from "@/components/pages/collections-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Colecciones de diseño",
  description: "Explora las series de diseño originales de Joya Mana y sus historias.",
  locale: "es-US",
  path: "/collections",
});

export default function Page() {
  return <CollectionsPage locale="es-US" />;
}
