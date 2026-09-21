import { ContactPage } from "@/components/pages/contact-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "Contacto",
    description:
      "Contacta con Joya Mana sobre productos, pedidos, devoluciones o accesibilidad.",
    locale: "es-US",
    path: "/contact",
    searchParams: await searchParams,
  });
}

export default async function Page({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  return <ContactPage locale="es-US" hasParameters={Object.keys(await searchParams).length > 0} />;
}
