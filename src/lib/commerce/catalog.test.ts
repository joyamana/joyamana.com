import { describe, expect, it } from "vitest";
import { activeMarket, markets } from "@/config/markets";
import { getCollection, getProduct, searchCatalog } from "./catalog";

describe("prototype catalog", () => {
  it("starts with only the approved seven-chakra basic style", async () => {
    const collection = await getCollection("seven-chakra");
    expect(collection?.products).toHaveLength(1);
    expect(collection?.products[0].handle).toBe(
      "seven-chakra-classic-bracelet-8mm",
    );
  });

  it("supports English and Spanish search terms", async () => {
    expect(await searchCatalog("bracelet")).toHaveLength(1);
    expect(await searchCatalog("pulsera")).toHaveLength(1);
  });

  it("marks every prototype product as non-production content", async () => {
    const product = await getProduct("seven-chakra-classic-bracelet-8mm");
    expect(product?.isPrototype).toBe(true);
  });

  it("uses one US catalog for English and Spanish", () => {
    expect(activeMarket.regions).toEqual(["US"]);
    expect(activeMarket.defaultCurrency).toBe("USD");
    expect(activeMarket.currencies).toEqual(["USD"]);
    expect(activeMarket.locales).toEqual(["en-US", "es-US"]);
    expect(activeMarket.catalog).toBe("us");
  });

  it("keeps the planned Canada model isolated without publishing it", async () => {
    const usProduct = await getProduct(
      "seven-chakra-classic-bracelet-8mm",
      "us",
    );
    const caProduct = await getProduct(
      "seven-chakra-classic-bracelet-8mm",
      "ca",
    );

    expect(markets.ca.catalog).toBe("ca");
    expect(markets.ca.status).toBe("planned");
    expect(markets.ca.locales).toEqual(["en-CA", "fr-CA"]);
    expect(usProduct?.id).toBe(caProduct?.id);
    expect(usProduct?.currency).toBe("USD");
    expect(caProduct?.currency).toBe("CAD");
    expect(usProduct?.price).not.toBe(caProduct?.price);
  });
});
