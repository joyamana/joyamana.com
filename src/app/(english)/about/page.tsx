import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/about-page";
import { buildAboutMetadata } from "@/lib/content/about-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  return buildAboutMetadata({
    locale: "en-US",
    searchParams: await searchParams,
  });
}

export default function Page() {
  return <AboutPage locale="en-US" />;
}
