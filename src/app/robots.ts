import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.indexable) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/es-us/cart",
        "/en-ca/cart",
        "/fr-ca/cart",
        "/search",
        "/es-us/search",
        "/en-ca/search",
        "/fr-ca/search",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
