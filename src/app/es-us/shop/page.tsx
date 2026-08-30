import { ShopPage } from "@/components/pages/shop-page";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Comprar",
  description: "Explora todos los productos disponibles actualmente en Joya Mana.",
  locale: "es-US",
  path: "/shop",
});

export default function Page() {
  return <ShopPage locale="es-US" />;
}
