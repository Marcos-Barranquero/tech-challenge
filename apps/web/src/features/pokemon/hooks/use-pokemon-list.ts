"use client";

import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo } from "react";
import type { ListPokemonInfiniteInput, ListPokemonInfiniteOutput, PokemonListItem } from "@tech-challenge/shared";
import { usePokemonQueryState } from "./use-pokemon-query-state";

type UsePokemonListOptions = {
  initialListPage?: ListPokemonInfiniteOutput | null;
  initialListInput?: Pick<
    ListPokemonInfiniteInput,
    "search" | "types" | "type" | "generation" | "limit" | "sort"
  > | null;
};

export function usePokemonList(options?: UsePokemonListOptions) {
  const { search, selectedType, selectedTypes, selectedGeneration } = usePokemonQueryState();
  const pageSize = 60;
  const term = useMemo(() => search.trim(), [search]);

  const infiniteInput = useMemo(
    () => ({
      search: term,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      type: selectedType,
      generation: selectedGeneration,
      limit: pageSize,
      sort: "id-asc" as const
    }),
    [pageSize, selectedGeneration, selectedType, selectedTypes, term]
  );

  const initialListInput = options?.initialListInput;

  const useInitialListPage =
    Boolean(options?.initialListPage) &&
    Boolean(initialListInput) &&
    infiniteInput.search.length === 0 &&
    (initialListInput?.search ?? "") === infiniteInput.search &&
    (initialListInput?.generation ?? undefined) === infiniteInput.generation &&
    (initialListInput?.type ?? undefined) === infiniteInput.type &&
    (initialListInput?.sort ?? "id-asc") === infiniteInput.sort &&
    (initialListInput?.limit ?? pageSize) === infiniteInput.limit &&
    JSON.stringify(initialListInput?.types ?? []) === JSON.stringify(infiniteInput.types ?? []);

  const listQuery = trpc.pokemon.listInfinite.useInfiniteQuery(infiniteInput, {
    enabled: infiniteInput.search.length === 0,
    initialCursor: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: useInitialListPage && options?.initialListPage
      ? {
          pages: [options.initialListPage],
          pageParams: [1],
        }
      : undefined,
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

      if (infiniteInput.types && infiniteInput.types.length > 0) {
        const hasAllTypes = infiniteInput.types.every((type) => p.types.includes(type));
        if (!hasAllTypes) {
          return false;
        }
      } else if (infiniteInput.type && !p.types.includes(infiniteInput.type)) {
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
    infiniteInput.types,
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
