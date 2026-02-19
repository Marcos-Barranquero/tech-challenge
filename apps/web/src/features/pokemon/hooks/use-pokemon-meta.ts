"use client";

import { trpc } from "@/lib/trpc";

export function usePokemonMeta() {
  return trpc.pokemon.meta.useQuery(undefined, {
    staleTime: Infinity
  });
}
