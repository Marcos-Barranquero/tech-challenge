import { describe, expect, it } from "vitest";
import { getIdFromResourceUrl, officialArtwork } from "./url.js";

describe("url helpers", () => {
  it("parses id from resource URLs with and without trailing slash", () => {
    expect(getIdFromResourceUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
    expect(getIdFromResourceUrl("https://pokeapi.co/api/v2/pokemon-species/151")).toBe(151);
  });

  it("throws for invalid resource URLs", () => {
    expect(() => getIdFromResourceUrl("https://pokeapi.co/api/v2/pokemon/")).toThrow(
      "Could not parse id",
    );
  });

  it("builds official artwork URL", () => {
    expect(officialArtwork(6)).toContain("/official-artwork/6.png");
  });
});

