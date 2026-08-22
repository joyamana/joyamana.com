import { describe, expect, it } from "vitest";
import {
  getPublishedTrustPagePaths,
  getTrustPage,
  trustPageKinds,
} from "./trust-pages";

describe("trust page definitions", () => {
  it("keeps every local trust page in draft until approved content exists", () => {
    for (const kind of trustPageKinds) {
      expect(getTrustPage(kind, "en-US").status).toBe("draft");
    }
    expect(getPublishedTrustPagePaths("en-US")).toEqual([]);
  });

  it("uses a short returns URL with a complete customer-facing title", () => {
    const page = getTrustPage("returns", "en-US");
    expect(page.handle).toBe("returns");
    expect(page.title).toBe("Returns & Refunds");
  });

  it("keeps market context separate from language", () => {
    expect(getTrustPage("shipping", "es-US").marketLabel).toBe(
      "United States",
    );
    expect(getTrustPage("shipping", "fr-CA").marketLabel).toBe("Canada");
  });
});
