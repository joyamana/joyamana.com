import type { Collection, Product } from "./types";
import type { MarketId } from "@/config/markets";

export const collections: Collection[] = [
  {
    handle: "new-arrivals",
    title: { "en-US": "New forms", "es-US": "Nuevas formas" },
    description: {
      "en-US": "A prototype edit of recently added development samples.",
      "es-US": "Una selección de prototipo con muestras de desarrollo recientes.",
      "en-CA": "A prototype edit of recently added samples in the Canada catalog.",
      "fr-CA": "Une sélection prototype d’échantillons de développement récemment ajoutés.",
    },
  },
  {
    handle: "seven-chakra",
    title: {
      "en-US": "Seven-chakra classics",
      "es-US": "Clásicos de siete chakras",
      "fr-CA": "Classiques des sept chakras",
    },
    description: {
      "en-US": "The first working product series for the US prototype catalog.",
      "es-US": "La primera serie de producto provisional del catálogo de prototipo de EE. UU.",
      "en-CA": "The first working product series for the Canada prototype catalog.",
      "fr-CA": "La première série de produits provisoire du catalogue prototype canadien.",
    },
  },
];

export const products: Product[] = [
  {
    id: "proto_seven_chakra_classic_8mm",
    handle: "seven-chakra-classic-bracelet-8mm",
    title: {
      "en-US": "Seven-Chakra Classic Bracelet — 8mm",
      "es-US": "Pulsera Clásica de Siete Chakras — 8 mm",
      "fr-CA": "Bracelet classique des sept chakras — 8 mm",
    },
    description: {
      "en-US": "The first working basic style: a 22-bead bracelet concept with a seven-color stone sequence. Final arrangement, fit, construction, and supplier records require approval.",
      "es-US": "El primer diseño básico provisional: un concepto de pulsera de 22 cuentas con una secuencia de piedras de siete colores. La disposición, el ajuste, la construcción y los registros del proveedor requieren aprobación.",
      "fr-CA": "Le premier modèle de base provisoire : un concept de bracelet de 22 perles avec une séquence de pierres de sept couleurs. La disposition, l’ajustement, la fabrication et les dossiers fournisseurs doivent être approuvés.",
    },
    price: 68,
    currency: "USD",
    model: "standard",
    collectionHandles: ["new-arrivals", "seven-chakra"],
    crystal: "seven-chakra",
    material: {
      "en-US": "Working material list: amethyst, lapis lazuli, blue agate, green fluorite, yellow agate, orange agate, and red jasper",
      "es-US": "Lista provisional: amatista, lapislázuli, ágata azul, fluorita verde, ágata amarilla, ágata naranja y jaspe rojo",
      "fr-CA": "Liste provisoire : améthyste, lapis-lazuli, agate bleue, fluorite verte, agate jaune, agate orange et jaspe rouge",
    },
    dimensions: {
      "en-US": "Working specification: 8mm beads, 22 beads; wrist fit pending",
      "es-US": "Especificación provisional: cuentas de 8 mm, 22 cuentas; ajuste de muñeca pendiente",
      "fr-CA": "Spécification provisoire : perles de 8 mm, 22 perles; tour de poignet à confirmer",
    },
    care: {
      "en-US": "Avoid impact, water, and household chemicals. Final care instructions pending supplier review.",
      "es-US": "Evitar impactos, agua y productos químicos domésticos. Las instrucciones finales requieren revisión del proveedor.",
      "fr-CA": "Éviter les chocs, l’eau et les produits ménagers. Les instructions finales doivent être vérifiées par le fournisseur.",
    },
    palette: "chakra",
    available: true,
    isPrototype: true,
    variants: [
      {
        id: "proto_variant_white_pattern_stone",
        title: {
          "en-US": "White-pattern stone",
          "es-US": "Piedra de vetas blancas",
          "fr-CA": "Pierre à veines blanches",
        },
        image: "/images/products/seven-chakra/white-pattern-stone.png",
        imageAlt: {
          "en-US": "Provided concept image of the white-pattern stone option with 15 pale main beads and seven colored accent beads",
          "es-US": "Imagen conceptual proporcionada de la opción de piedra con vetas blancas, 15 cuentas principales claras y siete cuentas de color",
          "fr-CA": "Image conceptuelle fournie de l’option à veines blanches, avec 15 perles principales pâles et sept perles colorées",
        },
        available: true,
      },
      {
        id: "proto_variant_obsidian",
        title: {
          "en-US": "Obsidian",
          "es-US": "Obsidiana",
          "fr-CA": "Obsidienne",
        },
        image: "/images/products/seven-chakra/obsidian.png",
        imageAlt: {
          "en-US": "Provided concept image of the obsidian option with 15 black main beads and seven colored accent beads",
          "es-US": "Imagen conceptual proporcionada de la opción de obsidiana, 15 cuentas principales negras y siete cuentas de color",
          "fr-CA": "Image conceptuelle fournie de l’option en obsidienne, avec 15 perles principales noires et sept perles colorées",
        },
        available: true,
      },
      {
        id: "proto_variant_blue_pattern_stone",
        title: {
          "en-US": "Blue-pattern stone",
          "es-US": "Piedra de vetas azules",
          "fr-CA": "Pierre à veines bleues",
        },
        image: "/images/products/seven-chakra/blue-pattern-stone.png",
        imageAlt: {
          "en-US": "Provided concept image of the blue-pattern stone option with 15 blue main beads and seven colored accent beads",
          "es-US": "Imagen conceptual proporcionada de la opción de piedra con vetas azules, 15 cuentas principales azules y siete cuentas de color",
          "fr-CA": "Image conceptuelle fournie de l’option à veines bleues, avec 15 perles principales bleues et sept perles colorées",
        },
        available: true,
      },
      {
        id: "proto_variant_honey_wax_jade",
        title: {
          "en-US": "Honey-wax jade · working trade name",
          "es-US": "Jade color miel · nombre comercial provisional",
          "fr-CA": "Jade couleur miel · nom commercial provisoire",
        },
        image: "/images/products/seven-chakra/honey-wax-jade.png",
        imageAlt: {
          "en-US": "Provided concept image of the honey-yellow option with 15 main beads and seven colored accent beads",
          "es-US": "Imagen conceptual proporcionada de la opción amarillo miel, 15 cuentas principales y siete cuentas de color",
          "fr-CA": "Image conceptuelle fournie de l’option jaune miel, avec 15 perles principales et sept perles colorées",
        },
        available: true,
      },
      {
        id: "proto_variant_rose_quartz",
        title: {
          "en-US": "Rose quartz",
          "es-US": "Cuarzo rosa",
          "fr-CA": "Quartz rose",
        },
        image: "/images/products/seven-chakra/rose-quartz.png",
        imageAlt: {
          "en-US": "Provided concept image of the rose quartz option with 15 pink main beads and seven colored accent beads",
          "es-US": "Imagen conceptual proporcionada de la opción de cuarzo rosa, 15 cuentas principales rosas y siete cuentas de color",
          "fr-CA": "Image conceptuelle fournie de l’option en quartz rose, avec 15 perles principales roses et sept perles colorées",
        },
        available: true,
      },
    ],
  },
];

interface MockCatalog {
  productHandles: string[];
  prices: Record<string, number>;
  currency: "USD" | "CAD";
  availability: Record<string, boolean>;
}

export const marketCatalogs: Record<MarketId, MockCatalog> = {
  us: {
    productHandles: ["seven-chakra-classic-bracelet-8mm"],
    prices: { "seven-chakra-classic-bracelet-8mm": 68 },
    currency: "USD",
    availability: { "seven-chakra-classic-bracelet-8mm": true },
  },
  ca: {
    productHandles: ["seven-chakra-classic-bracelet-8mm"],
    prices: { "seven-chakra-classic-bracelet-8mm": 92 },
    currency: "CAD",
    availability: { "seven-chakra-classic-bracelet-8mm": true },
  },
};
