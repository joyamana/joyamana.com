import { HomePage } from "@/components/pages/home-page";
import { buildMetadata, type PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return buildMetadata({
    title: "現代水晶首飾與獨特飾物",
    description:
      "現代水晶首飾與獨特飾物，因其形態、寓意與天然個性而獲選。",
    locale: "zh-Hant-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <HomePage locale="zh-Hant-US" />;
}
