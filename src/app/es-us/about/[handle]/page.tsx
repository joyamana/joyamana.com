import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/about-page";
import { buildAboutMetadata } from "@/lib/content/about-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  return buildAboutMetadata({
    handle: (await params).handle,
    locale: "es-US",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return <AboutPage handle={(await params).handle} locale="es-US" />;
}
