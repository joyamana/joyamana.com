import { HomePage } from "@/components/pages/home-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "Joyería moderna con cristales y objetos singulares",
    description:
      "Joyería moderna con cristales y objetos singulares, seleccionados por su forma, simbolismo y carácter natural.",
    locale: "es-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <HomePage locale="es-US" />;
}
