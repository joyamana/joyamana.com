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
    expect(indexingPolicy).toEqual({
      "en-US": {
        core: true,
        commerce: true,
        policies: true,
        editorial: false,
      },
      "es-US": {
        core: true,
        commerce: true,
        policies: true,
        editorial: false,
      },
    });
  });
});
