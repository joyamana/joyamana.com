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
    title: "送貨政策",
    description:
      "查看 Joya Mana 美國訂單的送貨政策。",
    kind: "shipping",
    locale: "zh-Hant-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <PolicyPage locale="zh-Hant-US" kind="shipping" />;
}
