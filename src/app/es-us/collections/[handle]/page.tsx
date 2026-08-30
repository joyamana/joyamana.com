import type { Metadata } from "next";
import { CollectionPage } from "@/components/pages/collection-page";
import { getDesignCollection } from "@/lib/commerce/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getDesignCollection(handle, "us", "es-US");
  return buildMetadata({
    title: collection?.seoTitle || collection?.title || "Colección",
    description:
      collection?.seoDescription ||
      collection?.description ||
      "Colección de prototipo.",
    locale: "es-US",
    path: `/collections/${handle}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <CollectionPage locale="es-US" handle={(await params).handle} />;
}
