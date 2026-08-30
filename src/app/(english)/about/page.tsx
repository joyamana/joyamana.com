import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/about-page";
import { buildAboutMetadata } from "@/lib/content/about-metadata";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildAboutMetadata({ locale: "en-US" });
}

export default function Page() {
  return <AboutPage locale="en-US" />;
}
