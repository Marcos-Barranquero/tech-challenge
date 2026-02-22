import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/cache.js", () => ({
  getOrSetCache: vi.fn(async (_key: string, fn: () => Promise<unknown>) => fn()),
}));

vi.mock("./pokemon.service.js", () => ({
  getPokemonDetail: vi.fn(),
}));

vi.mock("../lib/ai-provider.js", () => ({
  generatePokemonDescription: vi.fn(),
}));

import { getOrSetCache } from "../lib/cache.js";
import { generatePokemonDescription } from "../lib/ai-provider.js";
import { getPokemonDetail } from "./pokemon.service.js";
import { getPokemonAIDescription } from "./pokemon-ai.service.js";

const getOrSetCacheMock = vi.mocked(getOrSetCache);
const getPokemonDetailMock = vi.mocked(getPokemonDetail);
const generatePokemonDescriptionMock = vi.mocked(generatePokemonDescription);

describe("pokemon-ai.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPokemonDetailMock.mockResolvedValue({
      id: 25,
      name: "pikachu",
      image: "https://img/pikachu.png",
      generation: "generation-i",
      types: ["electric"],
      stats: [{ name: "speed", value: 90 }],
      evolutions: [
        { id: 172, name: "pichu", image: "https://img/pichu.png", isCurrent: false },
        { id: 25, name: "pikachu", image: "https://img/pikachu.png", isCurrent: true },
      ],
    });
    generatePokemonDescriptionMock.mockResolvedValue({
      funFact: "Pikachu stores electricity in its cheeks.",
      provider: "none",
      model: "none",
    });
  });

  it("includes locale in cache key", async () => {
    await getPokemonAIDescription({ id: 25, locale: "de", forceRegenerate: false });

    expect(getOrSetCacheMock).toHaveBeenCalledWith(
      expect.stringContaining("ai-description:de"),
      expect.any(Function),
      1000 * 60 * 60 * 24,
    );
  });

  it("passes locale to ai provider context", async () => {
    await getPokemonAIDescription({ id: 25, locale: "it", aiProvider: "groq", forceRegenerate: true });

    expect(generatePokemonDescriptionMock).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "it", id: 25, name: "pikachu", requestedProvider: "groq" }),
    );
  });
});
