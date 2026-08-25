import type { MarketId } from "@/config/markets";
import type { Locale } from "@/lib/i18n/locales";
import {
  DEFAULT_PRODUCT_QUANTITY_RULE,
  localize,
  type Collection,
  type CurrencyCode,
  type LocalizedText,
  type Money,
  type Product,
  type ProductCollection,
  type ProductImage,
  type ProductModel,
} from "./types";

interface MockImageSeed {
  url: string;
  altText: LocalizedText;
  width: number;
  height: number;
}

interface MockVariantSeed {
  id: string;
  title: LocalizedText;
  image: MockImageSeed;
  availableForSale: boolean;
}

interface MockProductSeed {
  id: string;
  handle: string;
  title: LocalizedText;
  description: LocalizedText;
  model: ProductModel;
  collectionHandles: string[];
  facts: {
    material: LocalizedText;
    dimensions: LocalizedText;
    care: LocalizedText;
  };
  variants: MockVariantSeed[];
}

interface MockCollectionSeed {
  id: string;
  handle: string;
  title: LocalizedText;
  description: LocalizedText;
}

interface MockCatalog {
  productHandles: string[];
  prices: Record<string, string>;
  currencyCode: CurrencyCode;
  availability: Record<string, boolean>;
}

const collectionSeeds: MockCollectionSeed[] = [
  {
    id: "mock_collection_new_arrivals",
    handle: "new-arrivals",
    title: { "en-US": "New forms", "es-US": "Nuevas formas" },
    description: {
      "en-US": "A prototype edit of recently added development samples.",
      "es-US":
        "Una selección de prototipo con muestras de desarrollo recientes.",
    },
  },
  {
    id: "mock_collection_seven_chakra",
    handle: "seven-chakra",
    title: {
      "en-US": "Seven-chakra classics",
      "es-US": "Clásicos de siete chakras",
    },
    description: {
      "en-US": "The first working product series for the US prototype catalog.",
      "es-US":
        "La primera serie de producto provisional del catálogo de prototipo de EE. UU.",
    },
  },
];

const productSeeds: MockProductSeed[] = [
  {
    id: "proto_seven_chakra_classic_8mm",
    handle: "seven-chakra-classic-bracelet-8mm",
    title: {
      "en-US": "Seven-Chakra Classic Bracelet — 8mm",
      "es-US": "Pulsera Clásica de Siete Chakras — 8 mm",
    },
    description: {
      "en-US":
        "The first working basic style: a 22-bead bracelet concept with a seven-color stone sequence. Final arrangement, fit, construction, and supplier records require approval.",
      "es-US":
        "El primer diseño básico provisional: un concepto de pulsera de 22 cuentas con una secuencia de piedras de siete colores. La disposición, el ajuste, la construcción y los registros del proveedor requieren aprobación.",
    },
    model: "standard",
    collectionHandles: ["new-arrivals", "seven-chakra"],
    facts: {
      material: {
        "en-US":
          "Working material list: amethyst, lapis lazuli, blue agate, green fluorite, yellow agate, orange agate, and red jasper",
        "es-US":
          "Lista provisional: amatista, lapislázuli, ágata azul, fluorita verde, ágata amarilla, ágata naranja y jaspe rojo",
      },
      dimensions: {
        "en-US": "Working specification: 8mm beads, 22 beads; wrist fit pending",
        "es-US":
          "Especificación provisional: cuentas de 8 mm, 22 cuentas; ajuste de muñeca pendiente",
      },
      care: {
        "en-US":
          "Avoid impact, water, and household chemicals. Final care instructions pending supplier review.",
        "es-US":
          "Evitar impactos, agua y productos químicos domésticos. Las instrucciones finales requieren revisión del proveedor.",
      },
    },
    variants: [
      {
        id: "proto_variant_white_pattern_stone",
        title: {
          "en-US": "White-pattern stone",
          "es-US": "Piedra de vetas blancas",
        },
        image: {
          url: "/images/products/seven-chakra/white-pattern-stone.png",
          altText: {
            "en-US":
              "Provided concept image of the white-pattern stone option with 15 pale main beads and seven colored accent beads",
            "es-US":
              "Imagen conceptual proporcionada de la opción de piedra con vetas blancas, 15 cuentas principales claras y siete cuentas de color",
          },
          width: 1254,
          height: 1254,
        },
        availableForSale: true,
      },
      {
        id: "proto_variant_obsidian",
        title: { "en-US": "Obsidian", "es-US": "Obsidiana" },
        image: {
          url: "/images/products/seven-chakra/obsidian.png",
          altText: {
            "en-US":
              "Provided concept image of the obsidian option with 15 black main beads and seven colored accent beads",
            "es-US":
              "Imagen conceptual proporcionada de la opción de obsidiana, 15 cuentas principales negras y siete cuentas de color",
          },
          width: 1254,
          height: 1254,
        },
        availableForSale: true,
      },
      {
        id: "proto_variant_blue_pattern_stone",
        title: {
          "en-US": "Blue-pattern stone",
          "es-US": "Piedra de vetas azules",
        },
        image: {
          url: "/images/products/seven-chakra/blue-pattern-stone.png",
          altText: {
            "en-US":
              "Provided concept image of the blue-pattern stone option with 15 blue main beads and seven colored accent beads",
            "es-US":
              "Imagen conceptual proporcionada de la opción de piedra con vetas azules, 15 cuentas principales azules y siete cuentas de color",
          },
          width: 1254,
          height: 1254,
        },
        availableForSale: true,
      },
      {
        id: "proto_variant_honey_wax_jade",
        title: {
          "en-US": "Honey-wax jade · working trade name",
          "es-US": "Jade color miel · nombre comercial provisional",
        },
        image: {
          url: "/images/products/seven-chakra/honey-wax-jade.png",
          altText: {
            "en-US":
              "Provided concept image of the honey-yellow option with 15 main beads and seven colored accent beads",
            "es-US":
              "Imagen conceptual proporcionada de la opción amarillo miel, 15 cuentas principales y siete cuentas de color",
          },
          width: 1254,
          height: 1254,
        },
        availableForSale: true,
      },
      {
        id: "proto_variant_rose_quartz",
        title: { "en-US": "Rose quartz", "es-US": "Cuarzo rosa" },
        image: {
          url: "/images/products/seven-chakra/rose-quartz.png",
          altText: {
            "en-US":
              "Provided concept image of the rose quartz option with 15 pink main beads and seven colored accent beads",
            "es-US":
              "Imagen conceptual proporcionada de la opción de cuarzo rosa, 15 cuentas principales rosas y siete cuentas de color",
          },
          width: 1254,
          height: 1254,
        },
        availableForSale: true,
      },
    ],
  },
];

export const marketCatalogs: Record<MarketId, MockCatalog> = {
  us: {
    productHandles: ["seven-chakra-classic-bracelet-8mm"],
    prices: { "seven-chakra-classic-bracelet-8mm": "68.00" },
    currencyCode: "USD",
    availability: { "seven-chakra-classic-bracelet-8mm": true },
  },
  ca: {
    productHandles: [],
    prices: {},
    currencyCode: "CAD",
    availability: {},
  },
};

function mockMoney(amount: string, currencyCode: CurrencyCode): Money {
  return { amount, currencyCode };
}

function resolveImage(seed: MockImageSeed, locale: Locale): ProductImage {
  return {
    url: seed.url,
    altText: localize(seed.altText, locale),
    width: seed.width,
    height: seed.height,
  };
}

export function getMockProducts(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Product[] {
  const catalog = marketCatalogs[marketId];
  if (marketId !== "us" || !catalog.productHandles.length) return [];

  return productSeeds
    .filter((seed) => catalog.productHandles.includes(seed.handle))
    .map((seed) => {
      const amount = catalog.prices[seed.handle];
      const price = mockMoney(amount, catalog.currencyCode);
      const images = seed.variants.map((variant) =>
        resolveImage(variant.image, locale),
      );
      const productAvailable = catalog.availability[seed.handle];
      const title = localize(seed.title, locale);

      return {
        id: seed.id,
        handle: seed.handle,
        title,
        description: localize(seed.description, locale),
        availableForSale: productAvailable,
        priceRange: {
          minVariantPrice: price,
          maxVariantPrice: price,
        },
        compareAtPrice: null,
        featuredImage: images[0] ?? null,
        images,
        variants: seed.variants.map((variant, index) => ({
          id: variant.id,
          title: localize(variant.title, locale),
          availableForSale: productAvailable && variant.availableForSale,
          price,
          compareAtPrice: null,
          image: images[index] ?? images[0] ?? null,
          selectedOptions: [
            {
              name: locale === "es-US" ? "Piedra principal" : "Main stone",
              value: localize(variant.title, locale),
            },
          ],
          quantityRule: { ...DEFAULT_PRODUCT_QUANTITY_RULE },
        })),
        model: seed.model,
        facts: {
          material: localize(seed.facts.material, locale),
          dimensions: localize(seed.facts.dimensions, locale),
          care: localize(seed.facts.care, locale),
        },
        source: "mock" as const,
      };
    });
}

export function getMockCollections(
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): Collection[] {
  const availableProducts = getMockProducts(marketId, locale);
  if (!availableProducts.length) return [];

  return collectionSeeds.flatMap((seed) => {
    const product = productSeeds.find(
      (item) =>
        item.collectionHandles.includes(seed.handle) &&
        availableProducts.some((available) => available.id === item.id),
    );
    if (!product) return [];

    const image = availableProducts.find(
      (available) => available.id === product.id,
    )?.featuredImage;
    return [
      {
        id: seed.id,
        handle: seed.handle,
        title: localize(seed.title, locale),
        description: localize(seed.description, locale),
        image: image ?? null,
        source: "mock" as const,
      },
    ];
  });
}

export function getMockCollection(
  handle: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
): ProductCollection | null {
  const collection = getMockCollections(marketId, locale).find(
    (item) => item.handle === handle,
  );
  if (!collection) return null;

  const seed = productSeeds.filter((item) =>
    item.collectionHandles.includes(handle),
  );
  const products = getMockProducts(marketId, locale).filter((product) =>
    seed.some((item) => item.id === product.id),
  );
  if (!products.length) return null;

  return { ...collection, products };
}

export function searchMockProducts(
  query: string,
  marketId: MarketId = "us",
  locale: Locale = "en-US",
) {
  const normalized = query.trim().toLocaleLowerCase(locale);
  if (!normalized) return [];

  return getMockProducts(marketId, locale).filter((product) =>
    [
      product.title,
      product.description,
      product.facts?.material ?? "",
      ...product.variants.map((variant) => variant.title),
    ].some((value) => value.toLocaleLowerCase(locale).includes(normalized)),
  );
}

// Normalized en-US exports retained for non-provider build-time consumers while
// they migrate to the async catalog facade.
export const products = getMockProducts("us", "en-US");
export const collections = getMockCollections("us", "en-US");
