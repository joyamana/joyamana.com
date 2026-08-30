import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

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

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const checkoutEnabled =
    process.env.COMMERCE_PROVIDER === "shopify" &&
    process.env.SHOPIFY_CHECKOUT_ENABLED === "true";

  return (
    <html
      lang="en-US"
      className={`${newsreader.variable} ${manrope.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <CartProvider checkoutEnabled={checkoutEnabled}>{children}</CartProvider>
      </body>
    </html>
  );
}
