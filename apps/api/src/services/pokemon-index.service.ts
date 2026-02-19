import {
  GenerationSchema,
  PokemonTypeSchema,
  type Generation,
  type PokemonListItem,
  type PokemonType,
} from "@tech-challenge/shared";
import { getOrSetCache } from "../lib/cache.js";
import { pokeApiGet } from "../lib/pokeapi-client.js";
import { getIdFromResourceUrl, officialArtwork } from "../lib/url.js";

type GenerationResponse = {
  pokemon_species: Array<{ name: string; url: string }>;
};

type TypeResponse = {
  pokemon: Array<{ pokemon: { name: string; url: string } }>;
};

type PokemonListResponse = {
  results: Array<{ name: string; url: string }>;
};

type PokemonIndex = {
  list: PokemonListItem[];
  byId: Map<number, PokemonListItem>;
  nameToId: Map<string, number>;
};

const GENERATIONS = GenerationSchema.options;
const TYPES = PokemonTypeSchema.options;

export async function getPokemonIndex(): Promise<PokemonIndex> {
  return getOrSetCache("pokemon:index:v1", async () => {
    const generationEntries = await Promise.all(
      GENERATIONS.map(async (gen, idx) => {
        const data = await pokeApiGet<GenerationResponse>(`/generation/${idx + 1}`);
        return [gen, data] as const;
      }),
    );

    const generationBySpeciesId = new Map<number, Generation>();
    const speciesIds = new Set<number>();

    for (const [generation, data] of generationEntries) {
      for (const species of data.pokemon_species) {
        const id = getIdFromResourceUrl(species.url);
        generationBySpeciesId.set(id, generation);
        speciesIds.add(id);
      }
    }

    const typeEntries = await Promise.all(
      TYPES.map(async (type) => {
        const data = await pokeApiGet<TypeResponse>(`/type/${type}`);
        return [type, data] as const;
      }),
    );

    const typesById = new Map<number, Set<PokemonType>>();
    for (const [type, data] of typeEntries) {
      for (const { pokemon } of data.pokemon) {
        const id = getIdFromResourceUrl(pokemon.url);
        if (!speciesIds.has(id)) {
          continue;
        }

        if (!typesById.has(id)) {
          typesById.set(id, new Set<PokemonType>());
        }
        typesById.get(id)?.add(type);
      }
    }

    const pokemonList = await pokeApiGet<PokemonListResponse>(
      "/pokemon?limit=2000&offset=0",
    );

    const candidates: PokemonListItem[] = [];

    for (const p of pokemonList.results) {
      const id = getIdFromResourceUrl(p.url);
      if (!speciesIds.has(id)) {
        continue;
      }

      const generation = generationBySpeciesId.get(id);
      const typeSet = typesById.get(id);
      if (!generation || !typeSet || typeSet.size === 0) {
        continue;
      }

      candidates.push({
        id,
        name: p.name,
        generation,
        types: Array.from(typeSet).sort(),
        image: officialArtwork(id),
      });
    }

    candidates.sort((a, b) => a.id - b.id);

    const byId = new Map<number, PokemonListItem>();
    const nameToId = new Map<string, number>();

    for (const p of candidates) {
      byId.set(p.id, p);
      nameToId.set(p.name.toLowerCase(), p.id);
    }

    return { list: candidates, byId, nameToId };
  });
}
