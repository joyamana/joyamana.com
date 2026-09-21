import type { Locale } from "./locales";

const copy = {
  "zh-Hant-US": {
    nav: { shop: "選購", collections: "系列", crystals: "水晶指南", blog: "Blog", about: "關於我們", search: "搜尋", cart: "購物袋" },
    home: {
      eyebrow: "水晶首飾 · 獨特之選",
      title: "天然形態，自有意義。",
      intro: "現代水晶首飾與獨特飾物，因其天然個性而獲選，為日常留一點空間，沉澱思緒、梳理意念。",
      cta: "選購所有商品",

      featured: "精選飾物",

    },
    labels: { exactPiece: "實物如圖", naturalVariation: "天然差異", testPrice: "價格", viewPiece: "查看商品", addToCart: "加入購物袋", soldOut: "暫未能購買", details: "商品資料", care: "保養", shipping: "送貨", related: "你或許也會留意", all: "全部", read: "閱讀" },
  },
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
      cta: "Shop all",

      featured: "Selected pieces",

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
      cta: "Ver todas las piezas",

      featured: "Piezas seleccionadas",

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
      cta: "Tout voir",

      featured: "Formes sélectionnées",

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
