"use client";

import { pokemonFiltersSelectors, usePokemonFiltersStore } from "@/stores/pokemon-filters.store";
import { usePokemonMeta } from "../hooks/use-pokemon-meta";
import type { Generation, PokemonType } from "@tech-challenge/shared";
import { useTranslations } from "next-intl";

export function PokemonFilters() {
  const selectedType = usePokemonFiltersStore(pokemonFiltersSelectors.selectedType);
  const selectedGeneration = usePokemonFiltersStore(pokemonFiltersSelectors.selectedGeneration);
  const setType = usePokemonFiltersStore((s) => s.setType);
  const setGeneration = usePokemonFiltersStore((s) => s.setGeneration);
  const clearFilters = usePokemonFiltersStore((s) => s.clearFilters);
  const { data } = usePokemonMeta();
  const t = useTranslations("filters");

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      <div>
        <label htmlFor="type-filter" className="sr-only">
          {t("typeLabel")}
        </label>
        <select
          id="type-filter"
          name="type"
          value={selectedType ?? ""}
          onChange={(e) => setType((e.target.value || undefined) as PokemonType | undefined)}
          className="gba-ui-font h-14 w-full cursor-pointer rounded-md border-2 border-[#5a4d8f] bg-[#f6f4ff] px-4 text-[20px] text-[#1f2033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
        >
          <option value="">{t("typeAll")}</option>
          {data?.types.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="gen-filter" className="sr-only">
          {t("generationLabel")}
        </label>
        <select
          id="gen-filter"
          name="generation"
          value={selectedGeneration ?? ""}
          onChange={(e) => setGeneration((e.target.value || undefined) as Generation | undefined)}
          className="gba-ui-font h-14 w-full cursor-pointer rounded-md border-2 border-[#5a4d8f] bg-[#f6f4ff] px-4 text-[20px] text-[#1f2033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
        >
          <option value="">{t("generationAll")}</option>
          {data?.generations.map((generation) => (
            <option key={generation} value={generation}>
              {generation.replace("generation-", "Gen ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="gba-ui-font h-14 w-full cursor-pointer rounded-md border-2 border-[#4f46e5] bg-[#ece9ff] px-4 text-[20px] text-[#312e81] transition duration-200 ease-poke hover:bg-[#e4e1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
      >
        {t("clear")}
      </button>
    </div>
  );
}
