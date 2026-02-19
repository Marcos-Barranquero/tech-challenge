"use client";

import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { useEffect, useMemo } from "react";
import { usePokemonFiltersStore, pokemonFiltersSelectors } from "@/stores/pokemon-filters.store";
import type { PokemonListItem } from "@tech-challenge/shared";

export function usePokemonList() {
  const search = usePokemonFiltersStore(pokemonFiltersSelectors.search);
  const selectedType = usePokemonFiltersStore(pokemonFiltersSelectors.selectedType);
  const selectedGeneration = usePokemonFiltersStore(pokemonFiltersSelectors.selectedGeneration);

  const queryInput = useMemo(
    () => ({
      search,
      type: selectedType,
      generation: selectedGeneration,
      page: 1,
      pageSize: 60,
      sort: "id-asc" as const
    }),
    [search, selectedGeneration, selectedType]
  );

  const listQuery = trpc.pokemon.list.useQuery(queryInput, {
    enabled: queryInput.search.length === 0
  });

  const searchQuery = trpc.pokemon.searchWithEvolutions.useQuery(
    { term: queryInput.search, limit: 10 },
    {
      enabled: queryInput.search.length > 0
    }
  );

  useEffect(() => {
    const error = listQuery.error ?? searchQuery.error;
    if (error) {
      toast.error(error.message || "Could not load the Pokedex.");
    }
  }, [listQuery.error, searchQuery.error]);

  const items = useMemo(() => {
    if (queryInput.search.length === 0) {
      return listQuery.data?.items ?? [];
    }

    const grouped = searchQuery.data?.groups ?? [];
    const merged = grouped.flatMap((g) => g.matches);
    const seen = new Set<number>();

    return merged.filter((p: PokemonListItem) => {
      if (seen.has(p.id)) {
        return false;
      }
      seen.add(p.id);

      if (queryInput.type && !p.types.includes(queryInput.type)) {
        return false;
      }
      if (queryInput.generation && p.generation !== queryInput.generation) {
        return false;
      }
      return true;
    });
  }, [listQuery.data?.items, queryInput.generation, queryInput.search.length, queryInput.type, searchQuery.data?.groups]);

  const total = queryInput.search.length === 0 ? (listQuery.data?.total ?? 0) : items.length;
  const isLoading = listQuery.isLoading || searchQuery.isLoading;
  const isFetching = listQuery.isFetching || searchQuery.isFetching;

  return {
    items,
    total,
    isLoading,
    isFetching,
    isError: listQuery.isError || searchQuery.isError
  };
}
