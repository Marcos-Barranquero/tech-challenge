import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/cache.js", () => ({
  getOrSetCache: vi.fn(async (_key: string, fn: () => Promise<unknown>) => fn()),
}));

vi.mock("../lib/pokeapi-client.js", () => ({
  pokeApiGet: vi.fn(),
}));

import { getOrSetCache } from "../lib/cache.js";
import { pokeApiGet } from "../lib/pokeapi-client.js";
import { getEvolutionChainIdByPokemonId, getEvolutionMemberIds } from "./evolution.service.js";

const getOrSetCacheMock = vi.mocked(getOrSetCache);
const pokeApiGetMock = vi.mocked(pokeApiGet);

describe("evolution.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves chain id from pokemon species endpoint", async () => {
    pokeApiGetMock.mockResolvedValueOnce({
      evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/67/" },
    });

    const chainId = await getEvolutionChainIdByPokemonId(25);

    expect(chainId).toBe(67);
    expect(getOrSetCacheMock).toHaveBeenCalledWith(
      "pokemon:25:chain-id:v1",
      expect.any(Function),
    );
    expect(pokeApiGetMock).toHaveBeenCalledWith("/pokemon-species/25");
  });

  it("returns deduplicated and sorted member ids from nested evolution chain", async () => {
    pokeApiGetMock.mockResolvedValueOnce({
      id: 1,
      chain: {
        species: { name: "pichu", url: "https://pokeapi.co/api/v2/pokemon-species/172/" },
        evolves_to: [
          {
            species: { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon-species/25/" },
            evolves_to: [
              {
                species: { name: "raichu", url: "https://pokeapi.co/api/v2/pokemon-species/26/" },
                evolves_to: [],
              },
              {
                species: {
                  name: "pikachu-alt",
                  url: "https://pokeapi.co/api/v2/pokemon-species/25/",
                },
                evolves_to: [],
              },
            ],
          },
        ],
      },
    });

    const members = await getEvolutionMemberIds(1);

    expect(members).toEqual([25, 26, 172]);
    expect(getOrSetCacheMock).toHaveBeenCalledWith(
      "evolution-chain:1:members:v1",
      expect.any(Function),
    );
    expect(pokeApiGetMock).toHaveBeenCalledWith("/evolution-chain/1");
  });
});

