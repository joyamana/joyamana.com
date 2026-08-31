import { SearchPage } from "@/components/pages/search-page";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Buscar",
  description: "Busca productos en el catálogo de Joya Mana.",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <SearchPage locale="es-US" query={(await searchParams).q || ""} />;
}
