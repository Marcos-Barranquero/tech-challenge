"use client";

import { useTranslations } from "next-intl";
import { usePokemonQueryState } from "../hooks/use-pokemon-query-state";
import { SearchX } from "lucide-react";

export function PokemonEmptyState() {
  const t = useTranslations("empty");
  const { clearFilters } = usePokemonQueryState();

  return (
    <div className="flex h-full min-h-full w-full items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-[#5e52a1] bg-[linear-gradient(180deg,rgba(247,244,255,0.96),rgba(235,230,255,0.95))] p-6 text-center shadow-[0_6px_0_#4b3d81,0_18px_26px_rgba(37,30,77,0.24)] sm:p-8 md:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#6658ab] bg-[#ede9ff] text-[#4d3f8f] sm:h-16 sm:w-16">
          <SearchX className="size-7 sm:size-8" aria-hidden="true" />
        </div>
        <h3 className="gba-ui-font mt-4 text-lg text-[#1f2033] sm:text-2xl">
          {t("title")}
        </h3>
        <p className="mt-3 text-sm text-[#3f4064] sm:text-base">
          {t("subtitle")}
        </p>
        <p className="mt-2 text-xs text-[#5a5c84] sm:text-sm">
          {t("hint")}
        </p>
        <button
          type="button"
          onClick={clearFilters}
          className="gba-ui-font mt-6 inline-flex items-center justify-center rounded-md border-2 border-[#4f46e5] bg-[#ece9ff] px-4 py-2 text-[12px] text-[#312e81] transition duration-200 ease-poke hover:bg-[#e4e1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:px-5 sm:py-2.5 sm:text-[13px]"
        >
          {t("cta")}
        </button>
      </div>
    </div>
  );
}
