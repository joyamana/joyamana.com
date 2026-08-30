import type { Metadata } from "next";
import { CategoryPage } from "@/components/pages/category-page";
import { getProductCategory } from "@/lib/commerce/catalog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const category = await getProductCategory(handle, "us", "en-US");
  return buildMetadata({
    title: category?.title || "Product category",
    description: category?.description || "Joya Mana product category.",
    locale: "en-US",
    path: `/category/${handle}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <CategoryPage locale="en-US" handle={(await params).handle} />;
}
