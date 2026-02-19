"use client";

import { Search } from "lucide-react";
import { pokemonFiltersSelectors, usePokemonFiltersStore } from "@/stores/pokemon-filters.store";

export function PokemonSearch() {
  const search = usePokemonFiltersStore(pokemonFiltersSelectors.search);
  const setSearch = usePokemonFiltersStore((s) => s.setSearch);

  return (
    <section className="rounded-3xl border-2 border-white/90 bg-white/85 p-4 shadow-claySoft">
      <label htmlFor="pokemon-search" className="mb-1 block text-sm font-bold text-poke-ink">
        Search Pokemon and evolutions
      </label>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-poke-primary" />
        <input
          id="pokemon-search"
          name="pokemonSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Example: pikachu…"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-2xl border-2 border-blue-200 bg-white py-2 pl-10 pr-3 text-base text-poke-ink placeholder:text-poke-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
        />
      </div>
    </section>
  );
}
