import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/pages/home-page";
import { canadaLocaleFromSegment } from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ marketLocale: string }>;
}): Promise<Metadata> {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  const french = locale === "fr-CA";
  return buildMetadata({
    title: french
      ? "Objets modernes en cristal — prototype Canada"
      : "Modern crystal objects — Canada prototype",
    description: french
      ? "Un prototype canadien pour des bijoux modernes en cristal et des objets singuliers."
      : "A Canadian prototype for modern crystal jewelry and singular objects.",
    locale,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string }>;
}) {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  return <HomePage locale={locale} />;
}
