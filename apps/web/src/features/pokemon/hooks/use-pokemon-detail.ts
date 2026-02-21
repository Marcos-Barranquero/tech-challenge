"use client";

import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import toast from "react-hot-toast";
import type { PokemonDetailOutput } from "@tech-challenge/shared";

export function usePokemonDetail(id: number, initialData?: PokemonDetailOutput) {
  const query = trpc.pokemon.detail.useQuery(
    { id },
    {
      enabled: Number.isFinite(id) && id > 0,
      initialData,
      initialDataUpdatedAt: initialData ? Date.now() : undefined,
    },
  );

  useEffect(() => {
    if (query.error) {
      toast.error(query.error.message || "Could not load details.");
    }
  }, [query.error]);

  return query;
}
