import type { EnabledLocale as Locale } from "@/config/locales";

const copy = {
  "zh-Hant-US": {
    nav: {
      shop: "選購",
      collections: "系列",
      crystals: "水晶指南",
      blog: "Blog",
      about: "關於我們",
      search: "搜尋",
      cart: "購物袋",
    },
    home: {
      eyebrow: "水晶首飾 · 獨特之選",
      title: "天然形態，自有意義。",
      intro:
        "現代水晶首飾與獨特飾物，因其天然個性而獲選，為日常留一點空間，沉澱思緒、梳理意念。",
      cta: "探索 Joya Mana",
      featured: "精選飾物",
      featuredIntro: "瀏覽目前的商品、價格及供應狀況。",
    },
    labels: {
      viewPiece: "查看商品",
      addToCart: "加入購物袋",
      soldOut: "暫未能購買",
      details: "商品資料",
      shipping: "送貨",
      related: "你或許也會留意",
    },
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
      cta: "Explore Joya Mana",
      featured: "Selected forms",
      featuredIntro:
        "Current products, prices, and availability are shown below.",
    },
    labels: {
      viewPiece: "View piece",
      addToCart: "Add to bag",
      soldOut: "Unavailable",
      details: "Product facts",
      shipping: "Shipping",
      related: "You may also notice",
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
      featured: "Formas seleccionadas",
      featuredIntro:
        "A continuación se muestran los productos, precios y disponibilidad actuales.",
    },
    labels: {
      viewPiece: "Ver pieza",
      addToCart: "Agregar a la bolsa",
      soldOut: "No disponible",
      details: "Datos del producto",
      shipping: "Envío",
      related: "También podría interesarte",
    },
  },
} as const;

export function getCopy(locale: Locale) {
  return copy[locale];
}
