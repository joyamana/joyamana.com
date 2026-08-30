import type { Metadata } from "next";
import { AccessibilityPage } from "@/components/pages/accessibility-page";
import { getShopifyContentPage } from "@/lib/content/shopify-content-pages";
import { buildMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getShopifyContentPage("accessibility", "en-US");
    if (page) {
      return buildMetadata({
        title: page.seoTitle,
        description: page.seoDescription,
        locale: "en-US",
        path: "/accessibility",
      });
    }
  } catch {
    // Never index an unavailable or unconfigured content source.
  }

  return buildNoIndexMetadata({
    title: "Accessibility",
    description: "Learn about accessibility at Joya Mana.",
  });
}

export default function Page() {
  return <AccessibilityPage locale="en-US" />;
}
