import type { EnabledLocale } from "@/config/locales";
import type { EditorialKind } from "@/lib/content/shopify-editorial";
import { uiText } from "./text";

export function editorialCopy(kind: EditorialKind, locale: EnabledLocale) {
  const isBlog = kind === "blog";
  return {
    title: isBlog
      ? "Blog"
      : uiText(locale, {
          zh: "水晶指南",
          en: "Crystal guide",
          es: "Guía de cristales",
        }),
    description: isBlog
      ? uiText(locale, {
          zh: "關於水晶飾物、選購知識與個人意義的故事及實用指南。",
          en: "Stories and practical guidance about crystal objects, clear buying, and personal meaning.",
          es: "Historias y orientación práctica sobre cristales, compras claras y significado personal.",
        })
      : uiText(locale, {
          zh: "認識水晶的特質、保養方法與傳統文化寓意。",
          en: "A reference guide to crystal characteristics, care, and traditional associations.",
          es: "Una guía de referencia sobre las características, el cuidado y las asociaciones tradicionales de los cristales.",
        }),
  };
}
