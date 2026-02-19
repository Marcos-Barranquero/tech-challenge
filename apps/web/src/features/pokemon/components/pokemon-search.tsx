"use client";

import { Search } from "lucide-react";
import { pokemonFiltersSelectors, usePokemonFiltersStore } from "@/stores/pokemon-filters.store";

export function PokemonSearch() {
  const search = usePokemonFiltersStore(pokemonFiltersSelectors.search);
  const setSearch = usePokemonFiltersStore((s) => s.setSearch);

  return (
    <div className="relative">
      <label htmlFor="pokemon-search" className="sr-only">
        Search Pokemon and evolutions
      </label>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-poke-primary" />
      <input
        id="pokemon-search"
        name="pokemonSearch"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search (e.g. pikachu)…"
        autoComplete="off"
        spellCheck={false}
        className="h-10 w-full rounded-xl border-2 border-blue-200 bg-white pl-9 pr-3 text-sm text-poke-ink placeholder:text-poke-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
      />
    </div>
  );
}
