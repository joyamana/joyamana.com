import { CollectionsPage } from "@/components/pages/collections-page";
import type { PageSearchParams } from "@/lib/seo";
import { buildCatalogHubMetadata } from "@/lib/commerce/catalog-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildCatalogHubMetadata({
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
