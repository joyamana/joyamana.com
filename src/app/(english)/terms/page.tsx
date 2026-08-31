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
    title: "Terms of Service",
    description:
      "Read the terms that govern use of Joya Mana and purchases from the store.",
    kind: "terms",
    locale: "en-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <PolicyPage locale="en-US" kind="terms" />;
}
