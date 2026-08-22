import { notFound } from "next/navigation";
import { CartView } from "@/components/cart-view";
import { canadaLocaleFromSegment } from "@/lib/i18n/locales";

export default async function Page({
  params,
}: {
  params: Promise<{ marketLocale: string }>;
}) {
  const locale = canadaLocaleFromSegment((await params).marketLocale);
  if (!locale) notFound();
  return (
    <section className="section">
      <CartView locale={locale} />
    </section>
  );
}
