import type { Metadata } from "next";
import { PolicyPage } from "@/components/pages/policy-page";
import { buildPolicyPageMetadata } from "@/lib/content/service-page-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  return buildPolicyPageMetadata({
    title: "服務條款",
    description:
      "查看使用 Joya Mana 網站及購物時適用的條款。",
    kind: "terms",
    locale: "zh-Hant-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <PolicyPage locale="zh-Hant-US" kind="terms" />;
}
