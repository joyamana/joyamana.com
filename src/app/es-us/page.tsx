import { HomePage } from "@/components/pages/home-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Joyería moderna con cristales y objetos singulares",
  description:
    "Joyería moderna con cristales y objetos singulares, seleccionados por su forma, simbolismo y carácter natural.",
  locale: "es-US",
});

export default function Page() {
  return <HomePage locale="es-US" />;
}
