import { describe, expect, it } from "vitest";
import {
  buildMetadata,
  buildNoIndexMetadata,
  withoutTrailingBrand,
} from "./seo";

describe("metadata titles", () => {
  it("leaves the root layout as the single owner of the brand suffix", () => {
    const metadata = buildMetadata({
      title: "Aquamarine bracelet | Joya Mana",
      description: "A Shopify product.",
      locale: "en-US",
      path: "/products/aquamarine-bracelet",
    });

    expect(metadata.title).toBe("Aquamarine bracelet");
    expect(metadata.openGraph).toMatchObject({
      title: "Aquamarine bracelet",
    });
  });

  it("removes repeated separator-delimited suffixes without erasing the brand", () => {
    expect(withoutTrailingBrand("Piece — Joya Mana · Joya Mana")).toBe(
      "Piece",
    );
    expect(withoutTrailingBrand("Joya Mana")).toBe("Joya Mana");
    expect(withoutTrailingBrand("The Joya Mana story")).toBe(
      "The Joya Mana story",
    );
  });

  it("preserves the explicit noindex metadata helper", () => {
    expect(
      buildNoIndexMetadata({ title: "Bag", description: "Review your bag." }),
    ).toMatchObject({
      title: "Bag",
      robots: { index: false, follow: false, noarchive: true },
    });
  });
});
