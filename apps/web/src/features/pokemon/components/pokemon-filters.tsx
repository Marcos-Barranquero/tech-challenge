"use client";

import { pokemonFiltersSelectors, usePokemonFiltersStore } from "@/stores/pokemon-filters.store";
import { usePokemonMeta } from "../hooks/use-pokemon-meta";
import type { Generation, PokemonType } from "@tech-challenge/shared";

export function PokemonFilters() {
  const selectedType = usePokemonFiltersStore(pokemonFiltersSelectors.selectedType);
  const selectedGeneration = usePokemonFiltersStore(pokemonFiltersSelectors.selectedGeneration);
  const setType = usePokemonFiltersStore((s) => s.setType);
  const setGeneration = usePokemonFiltersStore((s) => s.setGeneration);
  const clearFilters = usePokemonFiltersStore((s) => s.clearFilters);
  const { data } = usePokemonMeta();

  return (
    <section className="rounded-3xl border-2 border-white/90 bg-white/80 p-4 shadow-claySoft">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label htmlFor="type-filter" className="mb-1 block text-sm font-bold text-poke-ink">
            Type
          </label>
          <select
            id="type-filter"
            name="type"
            value={selectedType ?? ""}
            onChange={(e) => setType((e.target.value || undefined) as PokemonType | undefined)}
            className="w-full cursor-pointer rounded-2xl border-2 border-blue-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
          >
            <option value="">All</option>
            {data?.types.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gen-filter" className="mb-1 block text-sm font-bold text-poke-ink">
            Generation
          </label>
          <select
            id="gen-filter"
            name="generation"
            value={selectedGeneration ?? ""}
            onChange={(e) => setGeneration((e.target.value || undefined) as Generation | undefined)}
            className="w-full cursor-pointer rounded-2xl border-2 border-blue-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
          >
            <option value="">All</option>
            {data?.generations.map((generation) => (
              <option key={generation} value={generation}>
                {generation.replace("generation-", "Gen ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            className="w-full cursor-pointer rounded-2xl border-2 border-poke-primary bg-white px-3 py-2 text-sm font-semibold text-poke-primary transition-transform duration-200 ease-poke hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </section>
  );
}
