import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/locales";
import { uiText } from "@/lib/i18n/text";
import { CartProvider } from "./cart-provider";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description:
    "Modern crystal jewelry and singular objects, selected for their form, symbolism, and natural character.",
  robots: siteConfig.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export function RootDocument({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const checkoutEnabled = process.env.SHOPIFY_CHECKOUT_ENABLED === "true";

  return (
    <html
      lang={locale}
      className={`${newsreader.variable} ${manrope.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          {uiText(locale, {
            en: "Skip to content",
            es: "Saltar al contenido",
            fr: "Aller au contenu",
          })}
        </a>
        <CartProvider checkoutEnabled={checkoutEnabled}>{children}</CartProvider>
      </body>
    </html>
  );
}
