import { describe, expect, it } from "vitest";
import { indexGroups, indexingPolicy } from "./indexing";

describe("version-controlled indexing policy", () => {
  it("enumerates every supported scope and records the approved release matrix", () => {
    expect(indexGroups).toEqual([
      "core",
      "commerce",
      "policies",
      "editorial",
    ]);
    expect(indexingPolicy.locales).toEqual({
      "en-US": true,
      "es-US": true,
    });
    expect(indexingPolicy.groups).toEqual({
      core: true,
      commerce: false,
      policies: true,
      editorial: false,
    });
  });
});
