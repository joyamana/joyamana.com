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
    title: "Privacy Policy",
    description:
      "Read how Joya Mana collects, uses, and shares personal information.",
    kind: "privacy",
    locale: "en-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <PolicyPage locale="en-US" kind="privacy" />;
}
