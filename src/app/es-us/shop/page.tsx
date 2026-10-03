import { ShopPage } from "@/components/pages/shop-page";
import type { PageSearchParams } from "@/lib/seo";
import { buildCatalogHubMetadata } from "@/lib/commerce/catalog-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildCatalogHubMetadata({
    title: "Comprar",
    description:
      "Explora todos los productos disponibles actualmente en Joya Mana.",
    locale: "es-US",
    path: "/shop",
    searchParams: await searchParams,
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return <ShopPage locale="es-US" searchParams={await searchParams} />;
}
