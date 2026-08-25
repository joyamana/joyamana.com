import type { Locale } from "./locales";

const copy = {
  "en-US": {
    prototype:
      "Storefront prototype — Shopify catalog data is live; policies and translations remain under review.",
    nav: {
      series: "Shop",
      crystals: "Crystal guide",
      blog: "Blog",
      about: "About",
      search: "Search",
      cart: "Bag",
    },
    home: {
      eyebrow: "A study in natural character",
      title: "Objects with presence.",
      intro:
        "Modern crystal jewelry and singular pieces, selected for their form, symbolism, and giftability.",
      cta: "Shop the catalog",
      secondaryCta: "View one-of-one pieces",
      featured: "Selected forms",
      featuredIntro:
        "Products, current prices, and availability come directly from the Joya Mana Shopify catalog.",
      principles: "Designed for clarity",
      principlesIntro:
        "Beautiful objects need clear facts. The launch experience will distinguish exact pieces, natural variation, materials, dimensions, care, and fulfillment.",
      blog: "From the blog",
    },
    labels: {
      developmentSample: "Development sample",
      exactPiece: "Exact piece shown",
      naturalVariation: "Natural variation",
      testPrice: "Price",
      viewPiece: "View piece",
      addToCart: "Add to bag",
      soldOut: "Unavailable",
      details: "Product facts",
      care: "Care",
      shipping: "Shipping",
      related: "You may also notice",
      all: "All",
      read: "Read draft",
    },
  },
  "es-US": {
    prototype:
      "Prototipo de tienda — el catálogo de Shopify está activo; las políticas y traducciones siguen en revisión.",
    nav: {
      series: "Comprar",
      crystals: "Guía de cristales",
      blog: "Blog",
      about: "Nosotros",
      search: "Buscar",
      cart: "Bolsa",
    },
    home: {
      eyebrow: "Un estudio del carácter natural",
      title: "Objetos con presencia.",
      intro:
        "Joyería moderna con cristales y piezas singulares, elegidas por su forma, simbolismo y capacidad de convertirse en regalo.",
      cta: "Comprar el catálogo",
      secondaryCta: "Ver piezas únicas",
      featured: "Formas seleccionadas",
      featuredIntro:
        "Los productos, precios actuales y disponibilidad provienen directamente del catálogo de Shopify de Joya Mana.",
      principles: "Diseñado con claridad",
      principlesIntro:
        "Los objetos bellos también necesitan datos claros. La experiencia final distinguirá piezas exactas, variación natural, materiales, medidas, cuidado y entrega.",
      blog: "Del blog",
    },
    labels: {
      developmentSample: "Muestra de desarrollo",
      exactPiece: "Pieza exacta en la foto",
      naturalVariation: "Variación natural",
      testPrice: "Precio",
      viewPiece: "Ver pieza",
      addToCart: "Agregar a la bolsa",
      soldOut: "No disponible",
      details: "Datos del producto",
      care: "Cuidado",
      shipping: "Envío",
      related: "También podría interesarte",
      all: "Todo",
      read: "Leer borrador",
    },
  },
  "fr-CA": {
    prototype:
      "Prototype de boutique — le catalogue Shopify est actif; les politiques et traductions restent à réviser.",
    nav: {
      series: "Boutique",
      crystals: "Guide des cristaux",
      blog: "Blog",
      about: "À propos",
      search: "Rechercher",
      cart: "Panier",
    },
    home: {
      eyebrow: "Une étude du caractère naturel",
      title: "Des objets qui ont une présence.",
      intro:
        "Bijoux modernes en cristaux et pièces singulières, choisis pour leur forme, leur symbolisme et leur potentiel de cadeau.",
      cta: "Voir le catalogue",
      secondaryCta: "Voir les pièces uniques",
      featured: "Formes sélectionnées",
      featuredIntro:
        "Les produits, prix actuels et disponibilités proviennent directement du catalogue Shopify de Joya Mana.",
      principles: "Conçu avec clarté",
      principlesIntro:
        "Les beaux objets ont aussi besoin de faits clairs. L’expérience finale distinguera les pièces exactes, les variations naturelles, les matériaux, les dimensions, l’entretien et la livraison.",
      blog: "Du blog",
    },
    labels: {
      developmentSample: "Échantillon de développement",
      exactPiece: "Pièce exacte présentée",
      naturalVariation: "Variation naturelle",
      testPrice: "Prix",
      viewPiece: "Voir la pièce",
      addToCart: "Ajouter au panier",
      soldOut: "Indisponible",
      details: "Détails du produit",
      care: "Entretien",
      shipping: "Expédition",
      related: "Vous pourriez aussi remarquer",
      all: "Tout",
      read: "Lire le brouillon",
    },
  },
} as const;

export function getCopy(locale: Locale) {
  return locale === "en-CA" ? copy["en-US"] : copy[locale];
}
