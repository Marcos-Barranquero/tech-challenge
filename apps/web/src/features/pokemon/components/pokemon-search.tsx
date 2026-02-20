"use client";

import { pokemonFiltersSelectors, usePokemonFiltersStore } from "@/stores/pokemon-filters.store";

function PokeballIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" className="fill-white stroke-blue-500" strokeWidth="1.8" />
      <path d="M3 12H21" className="stroke-blue-500" strokeWidth="1.8" />
      <path d="M4.2 12A7.8 7.8 0 0 1 12 4.2A7.8 7.8 0 0 1 19.8 12" className="fill-red-500" />
      <circle cx="12" cy="12" r="2.9" className="fill-white stroke-blue-700" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.15" className="fill-blue-500" />
    </svg>
  );
}

export function PokemonSearch() {
  const search = usePokemonFiltersStore(pokemonFiltersSelectors.search);
  const setSearch = usePokemonFiltersStore((s) => s.setSearch);

  return (
    <div className="relative">
      <label htmlFor="pokemon-search" className="sr-only">
        Search Pokemon and evolutions
      </label>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-700">
        <PokeballIcon />
      </span>
      <input
        id="pokemon-search"
        name="pokemonSearch"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search (e.g. pikachu)…"
        autoComplete="off"
        spellCheck={false}
        className="gba-ui-font h-14 w-full rounded-md border-2 border-[#5a4d8f] bg-[#f6f4ff] pl-12 pr-4 text-[20px] text-[#1f2033] placeholder:text-[16px] placeholder:text-[#62648a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
      />
    </div>
  );
}
