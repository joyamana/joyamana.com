import type { Metadata } from "next";
import { AccessibilityPage } from "@/components/pages/accessibility-page";
import { buildContentPageMetadata } from "@/lib/content/service-page-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  return buildContentPageMetadata({
    handle: "accessibility",
    locale: "zh-Hant-US",
    title: "無障礙使用",
    description: "了解 Joya Mana 的無障礙使用措施。",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <AccessibilityPage locale="zh-Hant-US" />;
}
