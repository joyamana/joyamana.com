import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/about-page";
import { buildAboutMetadata } from "@/lib/content/about-metadata";
import type { PageSearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<PageSearchParams>;
}): Promise<Metadata> {
  return buildAboutMetadata({
    handle: (await params).handle,
    locale: "es-US",
    searchParams: await searchParams,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <AboutPage handle={(await params).handle} locale="es-US" />;
}
