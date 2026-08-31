import { CollectionsPage } from "@/components/pages/collections-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "Colecciones de diseño",
    description:
      "Explora las series de diseño originales de Joya Mana y sus historias.",
    locale: "es-US",
    path: "/collections",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <CollectionsPage locale="es-US" />;
}
