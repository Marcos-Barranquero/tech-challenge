import {
  ListPokemonInfiniteOutputSchema,
  ListPokemonOutputSchema,
  PokemonDetailOutputSchema,
  PokemonTypeSchema,
  GenerationSchema,
  PokemonAIDescriptionOutputSchema,
  SearchWithEvolutionsOutputSchema,
} from "@tech-challenge/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./index.js";

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

describe("pokemon router contracts", () => {
  const caller = appRouter.createCaller({});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list output conforms to shared schema", async () => {
    listPokemonMock.mockResolvedValueOnce({
      items: [
        {
          id: 25,
          name: "pikachu",
          generation: "generation-i",
          types: ["electric"],
          image: "https://img/pikachu.png",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      hasNextPage: false,
    });

    const result = await caller.pokemon.list({
      search: "",
      page: 1,
      pageSize: 20,
      sort: "id-asc",
    });

    expect(() => ListPokemonOutputSchema.parse(result)).not.toThrow();
  });

  it("detail output conforms to shared schema", async () => {
    getPokemonDetailMock.mockResolvedValueOnce({
      id: 25,
      name: "pikachu",
      image: "https://img/pikachu.png",
      generation: "generation-i",
      types: ["electric"],
      stats: [{ name: "hp", value: 35 }],
      evolutions: [{ id: 25, name: "pikachu", image: "https://img/pikachu.png", isCurrent: true }],
    });

    const result = await caller.pokemon.detail({ id: 25 });

    expect(() => PokemonDetailOutputSchema.parse(result)).not.toThrow();
  });

  it("listInfinite output conforms to shared schema", async () => {
    listPokemonInfiniteMock.mockResolvedValueOnce({
      items: [
        {
          id: 25,
          name: "pikachu",
          generation: "generation-i",
          types: ["electric"],
          image: "https://img/pikachu.png",
        },
      ],
      total: 151,
      page: 1,
      pageSize: 20,
      hasNextPage: true,
      nextCursor: 2,
    });

    const result = await caller.pokemon.listInfinite({
      search: "",
      limit: 20,
      cursor: 1,
      sort: "id-asc",
    });

    expect(() => ListPokemonInfiniteOutputSchema.parse(result)).not.toThrow();
  });

  it("searchWithEvolutions output conforms to shared schema", async () => {
    searchWithEvolutionsMock.mockResolvedValueOnce({
      groups: [
        {
          chainId: 10,
          matches: [
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
          ],
        },
      ],
    });

    const result = await caller.pokemon.searchWithEvolutions({ term: "pik", limit: 10 });

    expect(() => SearchWithEvolutionsOutputSchema.parse(result)).not.toThrow();
  });

  it("meta output is consistent with shared enums", async () => {
    const result = await caller.pokemon.meta();

    expect(result.types).toEqual(PokemonTypeSchema.options);
    expect(result.generations).toEqual(GenerationSchema.options);
  });

  it("aiDescription output conforms to shared schema", async () => {
    getPokemonAIDescriptionMock.mockResolvedValueOnce({
      id: 25,
      name: "pikachu",
      funFact: "Pikachu stores electricity in its cheeks and discharges when threatened.",
      provider: "none",
      model: "none",
      generatedAt: "2026-02-20T10:00:00.000Z",
    });

    const result = await caller.pokemon.aiDescription({
      id: 25,
      locale: "en",
      forceRegenerate: false,
    });

    expect(() => PokemonAIDescriptionOutputSchema.parse(result)).not.toThrow();
  });
});
