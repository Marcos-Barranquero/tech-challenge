"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { usePokemonMeta } from "../hooks/use-pokemon-meta";
import type { Generation, PokemonType } from "@tech-challenge/shared";
import { useTranslations } from "next-intl";
import { usePokemonQueryState } from "../hooks/use-pokemon-query-state";
import { Check } from "lucide-react";

export function PokemonFilters() {
  const { selectedTypes, selectedGeneration, setTypes, setGeneration, clearFilters } = usePokemonQueryState();
  const { data } = usePokemonMeta();
  const t = useTranslations("filters");
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement | null>(null);
  const typeOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const formatTypeLabel = (type: PokemonType) => {
    const translated = t(`types.${type}`);
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  };
  const selectedTypeSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);
  const typeButtonLabel = selectedTypes.length > 0
    ? `${t("typeLabel")} (${selectedTypes.length})`
    : t("typeAll");

  useEffect(() => {
    if (!isTypeMenuOpen) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (!typeMenuRef.current) {
        return;
      }
      const target = event.target as Node | null;
      if (target && typeMenuRef.current.contains(target)) {
        return;
      }
      setIsTypeMenuOpen(false);
    };

    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTypeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    window.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      window.removeEventListener("keydown", onEscape);
    };
  }, [isTypeMenuOpen]);

  useEffect(() => {
    if (!isTypeMenuOpen) {
      return;
    }

    const firstSelectedIndex = data?.types.findIndex((type) => selectedTypeSet.has(type)) ?? -1;
    const focusIndex = firstSelectedIndex >= 0 ? firstSelectedIndex : 0;
    const node = typeOptionRefs.current[focusIndex];
    node?.focus();
  }, [data?.types, isTypeMenuOpen, selectedTypeSet]);

  const focusTypeOption = (index: number) => {
    const options = typeOptionRefs.current.filter(
      (node): node is HTMLButtonElement => node instanceof HTMLButtonElement,
    );
    if (options.length === 0) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    options[clampedIndex]?.focus();
  };

  const onTypeMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const options = typeOptionRefs.current.filter(
      (node): node is HTMLButtonElement => node instanceof HTMLButtonElement,
    );
    if (options.length === 0) {
      return;
    }

    const currentIndex = options.findIndex((node) => node === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusTypeOption(currentIndex < 0 ? 0 : currentIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusTypeOption(currentIndex < 0 ? 0 : currentIndex - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusTypeOption(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusTypeOption(options.length - 1);
    }
  };

  const toggleType = (type: PokemonType) => {
    const next = new Set(selectedTypeSet);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setTypes(Array.from(next));
  };

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div ref={typeMenuRef} className="relative">
        <label htmlFor="type-filter-trigger" className="sr-only">
          {t("typeLabel")}
        </label>
        <button
          id="type-filter-trigger"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isTypeMenuOpen}
          aria-controls="type-filter-menu"
          onClick={() => setIsTypeMenuOpen((open) => !open)}
          className="gba-ui-font h-10 w-full cursor-pointer rounded-md border-2 border-[#5a4d8f] bg-[#f6f4ff] px-3 text-[14px] text-[#1f2033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:h-11 sm:px-3.5 sm:text-[15px] md:h-12 md:text-[16px] xl:h-14 xl:px-4 xl:text-[20px]"
        >
          <span className="block truncate text-left">{typeButtonLabel}</span>
        </button>
        {isTypeMenuOpen && (
          <div
            id="type-filter-menu"
            role="listbox"
            aria-multiselectable="true"
            onKeyDown={onTypeMenuKeyDown}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border-2 border-[#5a4d8f] bg-[#f6f4ff] p-1.5 shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
          >
            <button
              type="button"
              onClick={() => setTypes([])}
              className="gba-ui-font mb-1.5 w-full rounded-md border border-[#7b6fb0] bg-[#ece8ff] px-2 py-1 text-left text-[11px] text-[#312e81] transition hover:bg-[#e2dcff] sm:text-[12px]"
            >
              {t("clear")}
            </button>
            {data?.types.map((type, index) => {
              const isChecked = selectedTypeSet.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  role="option"
                  aria-selected={isChecked}
                  ref={(node) => {
                    typeOptionRefs.current[index] = node;
                  }}
                  onClick={() => toggleType(type)}
                  className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left transition ${
                    isChecked
                      ? "border-[#4f46e5] bg-[#ece9ff]"
                      : "border-transparent hover:border-[#7b6fb0] hover:bg-[#efecff]"
                  }`}
                >
                  <span className="gba-ui-font text-[11px] text-[#1f2033] sm:text-[12px]">
                    {formatTypeLabel(type)}
                  </span>
                  {isChecked ? <Check className="size-3.5 text-[#4f46e5]" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        )}
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
          className="gba-ui-font h-10 w-full cursor-pointer rounded-md border-2 border-[#5a4d8f] bg-[#f6f4ff] px-3 text-[14px] text-[#1f2033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:h-11 sm:px-3.5 sm:text-[15px] md:h-12 md:text-[16px] xl:h-14 xl:px-4 xl:text-[20px]"
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
        className="gba-ui-font h-10 w-full cursor-pointer rounded-md border-2 border-[#4f46e5] bg-[#ece9ff] px-3 text-[14px] text-[#312e81] transition duration-200 ease-poke hover:bg-[#e4e1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:h-11 sm:px-3.5 sm:text-[15px] md:h-12 md:text-[16px] xl:h-14 xl:px-4 xl:text-[20px]"
      >
        {t("clear")}
      </button>
    </div>
  );
}
