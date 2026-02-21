import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenerationSchema, PokemonTypeSchema } from "@tech-challenge/shared";
import { appRouter } from "./index.js";
import { PokeApiError } from "../lib/pokeapi-client.js";
import { AiProviderError } from "../lib/ai-provider.js";

vi.mock("../services/pokemon.service.js", () => ({
  listPokemon: vi.fn(),
  listPokemonInfinite: vi.fn(),
  getPokemonDetail: vi.fn(),
  searchWithEvolutions: vi.fn(),
}));

vi.mock("../services/pokemon-ai.service.js", () => ({
  getPokemonAIDescription: vi.fn(),
}));

import {
  getPokemonDetail,
  listPokemonInfinite,
  listPokemon,
  searchWithEvolutions,
} from "../services/pokemon.service.js";
import { getPokemonAIDescription } from "../services/pokemon-ai.service.js";

const listPokemonMock = vi.mocked(listPokemon);
const listPokemonInfiniteMock = vi.mocked(listPokemonInfinite);
const getPokemonDetailMock = vi.mocked(getPokemonDetail);
const searchWithEvolutionsMock = vi.mocked(searchWithEvolutions);
const getPokemonAIDescriptionMock = vi.mocked(getPokemonAIDescription);

describe("pokemon router", () => {
  const caller = appRouter.createCaller({});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps PokeApiError to BAD_GATEWAY on list", async () => {
    listPokemonMock.mockRejectedValueOnce(new PokeApiError("boom", 503, "/pokemon"));

    await expect(
      caller.pokemon.list({
        search: "",
        page: 1,
        pageSize: 10,
        sort: "id-asc",
      }),
    ).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "PokeAPI is unavailable",
    });
  });

  it("maps PokeApiError to BAD_GATEWAY on listInfinite", async () => {
    listPokemonInfiniteMock.mockRejectedValueOnce(new PokeApiError("boom", 503, "/pokemon"));

    await expect(
      caller.pokemon.listInfinite({
        search: "",
        cursor: 1,
        limit: 10,
        sort: "id-asc",
      }),
    ).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "PokeAPI is unavailable",
    });
  });

  it("returns meta values", async () => {
    const meta = await caller.pokemon.meta();
    expect(meta.types).toEqual(PokemonTypeSchema.options);
    expect(meta.generations).toEqual(GenerationSchema.options);
  });

  it("delegates to service for detail and searchWithEvolutions", async () => {
    getPokemonDetailMock.mockResolvedValueOnce({
      id: 25,
      name: "pikachu",
      image: "https://img/pikachu.png",
      generation: "generation-i",
      types: ["electric"],
      stats: [{ name: "hp", value: 35 }],
      evolutions: [{ id: 25, name: "pikachu", image: "https://img/pikachu.png", isCurrent: true }],
    });
    searchWithEvolutionsMock.mockResolvedValueOnce({
      groups: [],
    });

    const detail = await caller.pokemon.detail({ id: 25 });
    const search = await caller.pokemon.searchWithEvolutions({ term: "pik", limit: 5 });

    expect(detail.id).toBe(25);
    expect(search.groups).toEqual([]);
  });

  it("returns aiDescription from service", async () => {
    getPokemonAIDescriptionMock.mockResolvedValueOnce({
      id: 25,
      name: "pikachu",
      funFact: "Pikachu stores electricity in its cheeks and discharges when threatened.",
      provider: "none",
      model: "none",
      generatedAt: "2026-02-20T10:00:00.000Z",
    });

    const result = await caller.pokemon.aiDescription({ id: 25, locale: "en", forceRegenerate: false });

    expect(result.funFact).toContain("Pikachu");
    expect(result.provider).toBe("none");
  });

  it("maps AiProviderError to BAD_GATEWAY on aiDescription", async () => {
    getPokemonAIDescriptionMock.mockRejectedValueOnce(new AiProviderError("timeout", 408));

    await expect(caller.pokemon.aiDescription({ id: 25, locale: "en", forceRegenerate: false })).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "AI provider is unavailable",
    });
  });
});
