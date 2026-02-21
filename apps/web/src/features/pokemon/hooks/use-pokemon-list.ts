"use client";

import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo } from "react";
import { usePokemonFiltersStore, pokemonFiltersSelectors } from "@/stores/pokemon-filters.store";
import type { PokemonListItem } from "@tech-challenge/shared";

export function usePokemonList() {
  const search = usePokemonFiltersStore(pokemonFiltersSelectors.search);
  const selectedType = usePokemonFiltersStore(pokemonFiltersSelectors.selectedType);
  const selectedGeneration = usePokemonFiltersStore(pokemonFiltersSelectors.selectedGeneration);
  const pageSize = usePokemonFiltersStore(pokemonFiltersSelectors.pageSize);

  const infiniteInput = useMemo(
    () => ({
      search,
      type: selectedType,
      generation: selectedGeneration,
      limit: pageSize,
      sort: "id-asc" as const
    }),
    [pageSize, search, selectedGeneration, selectedType]
  );

  const listQuery = trpc.pokemon.listInfinite.useInfiniteQuery(infiniteInput, {
    enabled: infiniteInput.search.length === 0,
    initialCursor: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const searchQuery = trpc.pokemon.searchWithEvolutions.useQuery(
    { term: infiniteInput.search, limit: 10 },
    {
      enabled: infiniteInput.search.length > 0
    }
  );

  useEffect(() => {
    const error = listQuery.error ?? searchQuery.error;
    if (error) {
      toast.error(error.message || "Could not load the Pokedex.");
    }
  }, [listQuery.error, searchQuery.error]);

  const items = useMemo(() => {
    if (infiniteInput.search.length === 0) {
      const pages = listQuery.data?.pages ?? [];
      const merged = pages.flatMap((page) => page.items);
      const seen = new Set<number>();
      return merged.filter((item) => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });
    }

    const grouped = searchQuery.data?.groups ?? [];
    const merged = grouped.flatMap((g) => g.matches);
    const seen = new Set<number>();

    return merged.filter((p: PokemonListItem) => {
      if (seen.has(p.id)) {
        return false;
      }
      seen.add(p.id);

      if (infiniteInput.type && !p.types.includes(infiniteInput.type)) {
        return false;
      }
      if (infiniteInput.generation && p.generation !== infiniteInput.generation) {
        return false;
      }
      return true;
    });
  }, [
    infiniteInput.generation,
    infiniteInput.search.length,
    infiniteInput.type,
    listQuery.data?.pages,
    searchQuery.data?.groups,
  ]);

  const total = infiniteInput.search.length === 0
    ? (listQuery.data?.pages?.[0]?.total ?? items.length)
    : items.length;
  const isLoading = listQuery.isLoading || searchQuery.isLoading;
  const isFetching = listQuery.isFetching || searchQuery.isFetching;
  const hasNextPage = infiniteInput.search.length === 0 ? (listQuery.hasNextPage ?? false) : false;
  const isFetchingNextPage = infiniteInput.search.length === 0 && listQuery.isFetchingNextPage;
  const isInitialLoading =
    infiniteInput.search.length === 0
      ? listQuery.isLoading && items.length === 0
      : searchQuery.isLoading && items.length === 0;

  const loadMore = useCallback(() => {
    if (infiniteInput.search.length > 0) {
      return;
    }
    if (listQuery.isFetchingNextPage) {
      return;
    }
    if (!listQuery.hasNextPage) {
      return;
    }

    void listQuery.fetchNextPage();
  }, [infiniteInput.search.length, listQuery]);

  return {
    items,
    total,
    hasNextPage,
    isInitialLoading,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError: listQuery.isError || searchQuery.isError,
    loadMore,
  };
}
