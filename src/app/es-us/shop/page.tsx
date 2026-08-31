import { ShopPage } from "@/components/pages/shop-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "Comprar",
    description:
      "Explora todos los productos disponibles actualmente en Joya Mana.",
    locale: "es-US",
    path: "/shop",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <ShopPage locale="es-US" />;
}
