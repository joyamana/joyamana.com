import type { Locale } from "./locales";

const copy = {
  "en-US": {
    nav: {
      shop: "Shop",
      collections: "Collections",
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
    },
    labels: {
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
      read: "Read",
    },
  },
  "es-US": {
    nav: {
      shop: "Comprar",
      collections: "Colecciones",
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
    },
    labels: {
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
      read: "Leer",
    },
  },
  "fr-CA": {
    nav: {
      shop: "Boutique",
      collections: "Collections",
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
    },
    labels: {
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
      read: "Lire",
    },
  },
} as const;

export function getCopy(locale: Locale) {
  return locale === "en-CA" ? copy["en-US"] : copy[locale];
}
