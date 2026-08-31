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
      eyebrow: "Crystal jewelry · Singular pieces",
      title: "Natural forms. Personal meaning.",
      intro:
        "Modern crystal jewelry and singular pieces selected for their natural character—objects that invite reflection, intention, and everyday ritual.",
      cta: "Explore Joya Mana",
      secondaryCta: "View one-of-one pieces",
      featured: "Selected forms",
      featuredIntro:
        "Current products, prices, and availability are shown below.",
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
      eyebrow: "Joyería con cristales · Piezas singulares",
      title: "Formas naturales. Significado personal.",
      intro:
        "Joyería moderna con cristales y piezas singulares, elegidas por su carácter natural: objetos que invitan a la reflexión, la intención y los rituales cotidianos.",
      cta: "Descubrir Joya Mana",
      secondaryCta: "Ver piezas únicas",
      featured: "Formas seleccionadas",
      featuredIntro:
        "A continuación se muestran los productos, precios y disponibilidad actuales.",
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
      eyebrow: "Bijoux en cristal · Pièces singulières",
      title: "Formes naturelles. Sens personnel.",
      intro:
        "Bijoux modernes en cristal et pièces singulières choisis pour leur caractère naturel : des objets qui invitent à la réflexion, à l’intention et aux rituels du quotidien.",
      cta: "Découvrir Joya Mana",
      secondaryCta: "Voir les pièces uniques",
      featured: "Formes sélectionnées",
      featuredIntro:
        "Les produits, prix et disponibilités actuels sont présentés ci-dessous.",
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
