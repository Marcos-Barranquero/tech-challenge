import { beforeEach, describe, expect, it, vi } from "vitest";
import { GenerationSchema, PokemonTypeSchema } from "@tech-challenge/shared";
import { appRouter } from "./index.js";
import { PokeApiError } from "../lib/pokeapi-client.js";

vi.mock("../services/pokemon.service.js", () => ({
  listPokemon: vi.fn(),
  getPokemonDetail: vi.fn(),
  searchWithEvolutions: vi.fn(),
}));

import {
  getPokemonDetail,
  listPokemon,
  searchWithEvolutions,
} from "../services/pokemon.service.js";

const listPokemonMock = vi.mocked(listPokemon);
const getPokemonDetailMock = vi.mocked(getPokemonDetail);
const searchWithEvolutionsMock = vi.mocked(searchWithEvolutions);

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
});
