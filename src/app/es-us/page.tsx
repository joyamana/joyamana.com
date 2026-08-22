import { HomePage } from "@/components/pages/home-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Objetos modernos de cristal — prototipo",
  description:
    "Un prototipo en español para joyería moderna con cristales y objetos únicos del mercado estadounidense.",
  locale: "es-US",
});

export default function Page() {
  return <HomePage locale="es-US" />;
}
