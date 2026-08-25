import { SearchPage } from "@/components/pages/search-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Buscar",
  description: "Busca en el catálogo y el contenido editorial de Joya Mana.",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <SearchPage locale="es-US" query={(await searchParams).q || ""} />;
}
