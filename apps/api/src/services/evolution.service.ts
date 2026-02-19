import { getOrSetCache } from "../lib/cache.js";
import { pokeApiGet } from "../lib/pokeapi-client.js";
import { getIdFromResourceUrl } from "../lib/url.js";

type SpeciesResponse = {
  evolution_chain: { url: string };
};

type EvolutionNode = {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
};

type EvolutionChainResponse = {
  id: number;
  chain: EvolutionNode;
};

function flattenChain(node: EvolutionNode, acc: number[] = []): number[] {
  acc.push(getIdFromResourceUrl(node.species.url));
  for (const child of node.evolves_to) {
    flattenChain(child, acc);
  }
  return acc;
}

export async function getEvolutionChainIdByPokemonId(
  pokemonId: number,
): Promise<number> {
  return getOrSetCache(`pokemon:${pokemonId}:chain-id:v1`, async () => {
    const species = await pokeApiGet<SpeciesResponse>(`/pokemon-species/${pokemonId}`);
    return getIdFromResourceUrl(species.evolution_chain.url);
  });
}

export async function getEvolutionMemberIds(chainId: number): Promise<number[]> {
  return getOrSetCache(`evolution-chain:${chainId}:members:v1`, async () => {
    const chain = await pokeApiGet<EvolutionChainResponse>(`/evolution-chain/${chainId}`);
    const ids = flattenChain(chain.chain);
    return [...new Set(ids)].sort((a, b) => a - b);
  });
}
