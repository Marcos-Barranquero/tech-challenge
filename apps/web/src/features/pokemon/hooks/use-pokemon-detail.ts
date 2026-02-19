"use client";

import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import toast from "react-hot-toast";

export function usePokemonDetail(id: number) {
  const query = trpc.pokemon.detail.useQuery({ id }, { enabled: Number.isFinite(id) && id > 0 });

  useEffect(() => {
    if (query.error) {
      toast.error(query.error.message || "Could not load details.");
    }
  }, [query.error]);

  return query;
}
