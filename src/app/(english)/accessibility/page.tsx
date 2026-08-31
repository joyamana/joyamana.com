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
    locale: "en-US",
    title: "Accessibility",
    description: "Learn about accessibility at Joya Mana.",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <AccessibilityPage locale="en-US" />;
}
