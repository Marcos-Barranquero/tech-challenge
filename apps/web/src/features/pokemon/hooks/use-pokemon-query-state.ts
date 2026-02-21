"use client";

import type { Generation, PokemonType } from "@tech-challenge/shared";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const POKEMON_TYPES = new Set<string>([
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]);

const GENERATIONS = new Set<string>([
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix",
]);

function parseType(value: string | null): PokemonType | undefined {
  if (!value) {
    return undefined;
  }
  return POKEMON_TYPES.has(value) ? (value as PokemonType) : undefined;
}

function parseGeneration(value: string | null): Generation | undefined {
  if (!value) {
    return undefined;
  }
  return GENERATIONS.has(value) ? (value as Generation) : undefined;
}

export function usePokemonQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const latestQueryRef = useRef(searchParams.toString());

  useEffect(() => {
    latestQueryRef.current = searchParams.toString();
  }, [searchParams]);

  const state = useMemo(() => {
    const search = searchParams.get("search") ?? "";
    const selectedType = parseType(searchParams.get("type"));
    const selectedGeneration = parseGeneration(searchParams.get("generation"));

    return {
      search,
      selectedType,
      selectedGeneration,
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const currentQuery = latestQueryRef.current;
      const params = new URLSearchParams(currentQuery);
      mutator(params);

      const nextQuery = params.toString();
      if (nextQuery === currentQuery) {
        return;
      }
      latestQueryRef.current = nextQuery;

      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router],
  );

  const setSearch = useCallback(
    (value: string) => {
      updateParams((params) => {
        if (value.length === 0) {
          params.delete("search");
          return;
        }
        params.set("search", value);
      });
    },
    [updateParams],
  );

  const setType = useCallback(
    (value?: PokemonType) => {
      updateParams((params) => {
        if (!value) {
          params.delete("type");
          return;
        }
        params.set("type", value);
      });
    },
    [updateParams],
  );

  const setGeneration = useCallback(
    (value?: Generation) => {
      updateParams((params) => {
        if (!value) {
          params.delete("generation");
          return;
        }
        params.set("generation", value);
      });
    },
    [updateParams],
  );

  const clearFilters = useCallback(() => {
    updateParams((params) => {
      params.delete("search");
      params.delete("type");
      params.delete("generation");
    });
  }, [updateParams]);

  return {
    ...state,
    setSearch,
    setType,
    setGeneration,
    clearFilters,
  };
}
