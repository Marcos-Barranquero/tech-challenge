"use client";

import { trpc } from "@/lib/trpc";
import type { SupportedLocale } from "@tech-challenge/shared";

export function usePokemonAiDescription(id: number, locale: SupportedLocale, regenerationNonce = 0) {
  return trpc.pokemon.aiDescription.useQuery(
    {
      id,
      locale,
      forceRegenerate: regenerationNonce > 0,
      regenerationNonce: regenerationNonce > 0 ? regenerationNonce : undefined,
    },
    {
      enabled: Number.isFinite(id) && id > 0,
      staleTime: 1000 * 60 * 30,
    },
  );
}
