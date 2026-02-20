"use client";

import { trpc } from "@/lib/trpc";

export function usePokemonAiDescription(id: number, regenerationNonce = 0) {
  return trpc.pokemon.aiDescription.useQuery(
    {
      id,
      forceRegenerate: regenerationNonce > 0,
      regenerationNonce: regenerationNonce > 0 ? regenerationNonce : undefined,
    },
    {
      enabled: Number.isFinite(id) && id > 0,
      staleTime: 1000 * 60 * 30,
    },
  );
}
