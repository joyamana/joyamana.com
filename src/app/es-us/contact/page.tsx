import { ContactPage } from "@/components/pages/contact-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contacto",
  description:
    "Contacta con Joya Mana sobre productos, pedidos, devoluciones o accesibilidad.",
  locale: "es-US",
  path: "/contact",
});

export default function Page() {
  return <ContactPage locale="es-US" />;
}
