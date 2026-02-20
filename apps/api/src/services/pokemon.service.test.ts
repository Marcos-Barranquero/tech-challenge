import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PokemonListItem } from "@tech-challenge/shared";

vi.mock("../lib/cache.js", () => ({
  getOrSetCache: vi.fn(async (_key: string, fn: () => Promise<unknown>) => fn()),
}));

vi.mock("../lib/pokeapi-client.js", () => ({
  pokeApiGet: vi.fn(),
}));

vi.mock("./pokemon-index.service.js", () => ({
  getPokemonIndex: vi.fn(),
}));

vi.mock("./evolution.service.js", () => ({
  getEvolutionChainIdByPokemonId: vi.fn(),
  getEvolutionMemberIds: vi.fn(),
}));

import { pokeApiGet } from "../lib/pokeapi-client.js";
import { getEvolutionChainIdByPokemonId, getEvolutionMemberIds } from "./evolution.service.js";
import { getPokemonIndex } from "./pokemon-index.service.js";
import { getPokemonDetail, listPokemon, searchWithEvolutions } from "./pokemon.service.js";

const pokeApiGetMock = vi.mocked(pokeApiGet);
const getPokemonIndexMock = vi.mocked(getPokemonIndex);
const getEvolutionChainIdByPokemonIdMock = vi.mocked(getEvolutionChainIdByPokemonId);
const getEvolutionMemberIdsMock = vi.mocked(getEvolutionMemberIds);

const makeIndex = (list: PokemonListItem[]) => ({
  list,
  byId: new Map(list.map((p) => [p.id, p])),
  nameToId: new Map(list.map((p) => [p.name.toLowerCase(), p.id])),
});

const sampleList: PokemonListItem[] = [
  {
    id: 172,
    name: "pichu",
    generation: "generation-ii",
    types: ["electric"],
    image: "https://img/pichu.png",
  },
  {
    id: 25,
    name: "pikachu",
    generation: "generation-i",
    types: ["electric"],
    image: "https://img/pikachu.png",
  },
  {
    id: 26,
    name: "raichu",
    generation: "generation-i",
    types: ["electric"],
    image: "https://img/raichu.png",
  },
  {
    id: 4,
    name: "charmander",
    generation: "generation-i",
    types: ["fire"],
    image: "https://img/charmander.png",
  },
];

describe("pokemon.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPokemonIndexMock.mockResolvedValue(makeIndex(sampleList));
  });

  it("filters list by type/generation/search and paginates", async () => {
    const result = await listPokemon({
      search: "char",
      type: "fire",
      generation: "generation-i",
      page: 1,
      pageSize: 10,
      sort: "id-asc",
    });

    expect(result.items.map((p) => p.name)).toEqual(["charmander"]);
    expect(result.total).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it("keeps deterministic id ordering and handles pagination window", async () => {
    const result = await listPokemon({
      search: "",
      page: 2,
      pageSize: 2,
      sort: "id-asc",
      type: undefined,
      generation: undefined,
    });

    expect(result.items.map((p) => p.id)).toEqual([26, 172]);
    expect(result.total).toBe(4);
    expect(result.hasNextPage).toBe(false);
  });

  it("builds pokemon detail including chain evolutions", async () => {
    pokeApiGetMock.mockResolvedValueOnce({
      id: 25,
      name: "pikachu",
      stats: [
        { base_stat: 35, stat: { name: "hp" } },
        { base_stat: 55, stat: { name: "attack" } },
      ],
      types: [{ type: { name: "electric" } }],
    });
    getEvolutionChainIdByPokemonIdMock.mockResolvedValueOnce(10);
    getEvolutionMemberIdsMock.mockResolvedValueOnce([172, 25, 26]);

    const detail = await getPokemonDetail({ name: "Pikachu" });

    expect(detail.id).toBe(25);
    expect(detail.name).toBe("pikachu");
    expect(detail.generation).toBe("generation-i");
    expect(detail.types).toEqual(["electric"]);
    expect(detail.evolutions.map((e) => `${e.id}:${e.isCurrent}`)).toEqual([
      "172:false",
      "25:true",
      "26:false",
    ]);
  });

  it("throws NOT_FOUND for unknown pokemon", async () => {
    await expect(getPokemonDetail({ name: "missingno" })).rejects.toBeInstanceOf(TRPCError);
    await expect(getPokemonDetail({ name: "missingno" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("searches with evolutions and deduplicates chain fetches", async () => {
    getEvolutionChainIdByPokemonIdMock.mockImplementation(async (pokemonId) => {
      if (pokemonId === 172 || pokemonId === 25 || pokemonId === 26) {
        return 10;
      }
      return 11;
    });
    getEvolutionMemberIdsMock.mockImplementation(async (chainId) => {
      if (chainId === 10) {
        return [172, 25, 26];
      }
      return [4];
    });

    const output = await searchWithEvolutions({ term: "chu", limit: 10 });

    expect(output.groups).toHaveLength(1);
    expect(output.groups[0]?.matches.map((m) => m.name)).toEqual([
      "pichu",
      "pikachu",
      "raichu",
    ]);
    expect(getEvolutionMemberIdsMock).toHaveBeenCalledTimes(1);
    expect(getEvolutionMemberIdsMock).toHaveBeenCalledWith(10);
  });
});
