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
    title: "退貨及退款",
    description:
      "查看 Joya Mana 的退貨及退款政策。",
    kind: "returns",
    locale: "zh-Hant-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <PolicyPage locale="zh-Hant-US" kind="returns" />;
}
