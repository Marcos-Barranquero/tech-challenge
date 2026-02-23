import {
  ListPokemonInfiniteOutputSchema,
  ListPokemonOutputSchema,
  type ListPokemonInfiniteInput,
  type ListPokemonInfiniteOutput,
  PokemonDetailOutputSchema,
  type ListPokemonInput,
  type ListPokemonOutput,
  type PokemonDetailInput,
  type PokemonDetailOutput,
  type SearchWithEvolutionsInput,
  type SearchWithEvolutionsOutput,
  type PokemonType,
} from "@tech-challenge/shared";
import { TRPCError } from "@trpc/server";
import { getOrSetCache } from "../lib/cache.js";
import { pokeApiGet } from "../lib/pokeapi-client.js";
import { getEvolutionChainIdByPokemonId, getEvolutionMemberIds } from "./evolution.service.js";
import { getPokemonIndex } from "./pokemon-index.service.js";

type PokemonDetailApiResponse = {
  id: number;
  name: string;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  types: Array<{ type: { name: string } }>;
};

function normalizeTerm(input: string): string {
  return input.trim().toLowerCase();
}

function resolveRequestedTypes(input: { types?: PokemonType[]; type?: PokemonType }): PokemonType[] | undefined {
  if (input.types && input.types.length > 0) {
    return input.types;
  }
  if (input.type) {
    return [input.type];
  }
  return undefined;
}

export async function listPokemon(input: ListPokemonInput): Promise<ListPokemonOutput> {
  const index = await getPokemonIndex();
  const term = normalizeTerm(input.search);
  const requestedTypes = resolveRequestedTypes(input);

  let filtered = index.list;

  if (requestedTypes && requestedTypes.length > 0) {
    filtered = filtered.filter((p) => requestedTypes.every((type) => p.types.includes(type)));
  }

  if (input.generation) {
    filtered = filtered.filter((p) => p.generation === input.generation);
  }

  if (term) {
    filtered = filtered.filter((p) => p.name.includes(term));
  }

  filtered = filtered.slice().sort((a, b) => a.id - b.id);

  const start = (input.page - 1) * input.pageSize;
  const end = start + input.pageSize;
  const items = filtered.slice(start, end);

  return ListPokemonOutputSchema.parse({
    items,
    total: filtered.length,
    page: input.page,
    pageSize: input.pageSize,
    hasNextPage: end < filtered.length,
  });
}

export async function listPokemonInfinite(
  input: ListPokemonInfiniteInput,
): Promise<ListPokemonInfiniteOutput> {
  const page = input.cursor ?? 1;
  const pageSize = input.limit;
  const base = await listPokemon({
    search: input.search,
    types: input.types,
    type: input.type,
    generation: input.generation,
    page,
    pageSize,
    sort: input.sort,
  });

  return ListPokemonInfiniteOutputSchema.parse({
    ...base,
    nextCursor: base.hasNextPage ? page + 1 : null,
  });
}

export async function getPokemonDetail(
  input: PokemonDetailInput,
): Promise<PokemonDetailOutput> {
  const index = await getPokemonIndex();

  const resolvedId = input.id ?? index.nameToId.get(input.name!.toLowerCase());
  if (!resolvedId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Pokemon not found",
    });
  }

  const base = index.byId.get(resolvedId);
  if (!base) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Pokemon not found in index",
    });
  }

  const detailApi = await getOrSetCache(`pokemon:${resolvedId}:detail:v1`, () =>
    pokeApiGet<PokemonDetailApiResponse>(`/pokemon/${resolvedId}`),
  );

  const chainId = await getEvolutionChainIdByPokemonId(resolvedId);
  const evolutionIds = await getEvolutionMemberIds(chainId);

  const evolutions = evolutionIds
    .map((id) => index.byId.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      isCurrent: item.id === resolvedId,
    }));

  const output = {
    id: detailApi.id,
    name: detailApi.name,
    image: base.image,
    generation: base.generation,
    types: detailApi.types.map((t) => t.type.name),
    stats: detailApi.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    evolutions,
  };

  return PokemonDetailOutputSchema.parse(output);
}

export async function searchWithEvolutions(
  input: SearchWithEvolutionsInput,
): Promise<SearchWithEvolutionsOutput> {
  const index = await getPokemonIndex();
  const term = normalizeTerm(input.term);

  const matched = index.list
    .filter((p) => p.name.includes(term))
    .sort((a, b) => a.id - b.id)
    .slice(0, input.limit);

  const chainIds = await Promise.all(
    matched.map(async (p) => getEvolutionChainIdByPokemonId(p.id)),
  );
  const uniqueChainIds = [...new Set(chainIds)];
  const chainMap = new Map<number, number[]>();

  await Promise.all(
    uniqueChainIds.map(async (chainId) => {
      const members = await getEvolutionMemberIds(chainId);
      chainMap.set(chainId, members);
    }),
  );

  const groups = Array.from(chainMap.entries())
    .map(([chainId, memberIds]) => ({
      chainId,
      matches: memberIds
        .map((id) => index.byId.get(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    }))
    .filter((group) => group.matches.length > 0)
    .sort((a, b) => a.chainId - b.chainId);

  return { groups };
}
