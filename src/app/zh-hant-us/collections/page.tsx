import { CollectionsPage } from "@/components/pages/collections-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "原創設計系列",
    description:
      "探索 Joya Mana 的原創設計系列與背後故事。",
    locale: "zh-Hant-US",
    path: "/collections",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <CollectionsPage locale="zh-Hant-US" />;
}
