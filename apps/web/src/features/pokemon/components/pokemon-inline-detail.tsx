"use client";

import { usePokemonDetail } from "../hooks/use-pokemon-detail";
import { usePokemonAiDescription } from "../hooks/use-pokemon-ai-description";
import Image from "next/image";
import Link from "next/link";
import { TYPE_BADGE } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";
import type { PokemonType } from "@tech-challenge/shared";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocaleStore } from "@/stores/locale.store";

export function PokemonInlineDetail({
  id,
  onBack,
  onSelectEvolution,
  getPokemonHref,
}: {
  id: number;
  onBack: () => void;
  onSelectEvolution: (id: number) => void;
  getPokemonHref: (id: number) => string;
}) {
  const { data, isLoading } = usePokemonDetail(id);
  const [regenerationNonce, setRegenerationNonce] = useState(0);
  const locale = useLocaleStore((state) => state.locale);
  const aiDescriptionQuery = usePokemonAiDescription(id, locale, regenerationNonce);
  const t = useTranslations("detail");
  const tf = useTranslations("filters");
  const formatStatLabel = (statName: string) => t(`statsNames.${statName}`);
  const formatTypeLabel = (type: PokemonType) => {
    const translated = tf(`types.${type}`);
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  };
  const previousIdRef = useRef<number | null>(null);
  const pendingDirectionRef = useRef<"up" | "down" | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<"up" | "down" | null>(null);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (previousIdRef.current === null) {
      previousIdRef.current = id;
      return;
    }

    const fallbackDirection = id > previousIdRef.current ? "up" : "down";
    const direction = pendingDirectionRef.current ?? fallbackDirection;
    setTransitionDirection(direction);
    setTransitionKey((value) => value + 1);

    previousIdRef.current = id;
    pendingDirectionRef.current = null;
  }, [id]);

  useEffect(() => {
    setRegenerationNonce(0);
  }, [id]);

  if (isLoading || !data) {
    return <div className="h-80 animate-pulse rounded-lg bg-[#f3f0ff]/80" />;
  }

  return (
    <section
      key={transitionKey}
      className={`flex h-auto w-full flex-none flex-col overflow-visible rounded-lg border-2 border-[#5f518f] bg-[#f4f1ff]/95 p-2 shadow-[0_5px_0_#4e3f82,0_12px_22px_rgba(37,30,77,0.2)] sm:p-3 md:p-4 lg:h-full lg:min-h-0 lg:flex-1 lg:overflow-hidden ${
        transitionDirection === "up"
          ? "detail-reel-up"
          : transitionDirection === "down"
            ? "detail-reel-down"
            : ""
      }`}
    >
      <button
        type="button"
        onClick={onBack}
        className="gba-ui-font inline-flex cursor-pointer items-center gap-1 rounded-md border-2 border-[#5a4d8f] bg-[#ece8ff] px-2.5 py-1.5 text-[12px] text-[#312e81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:gap-1.5 sm:px-3 sm:py-2 sm:text-[13px] md:px-3.5 md:text-[15px]"
      >
        <ChevronLeft aria-hidden="true" className="size-4 sm:size-5" />
        {t("back")}
      </button>

      <div className="mt-2 grid h-auto grid-cols-1 content-start gap-2 sm:mt-3 sm:gap-3 md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-4">
        <div className="flex min-h-0 flex-col rounded-md border-2 border-[#7b6fb0] bg-[#f6f4ff] p-2 sm:p-3 md:col-span-2 lg:col-span-1">
          <div className="relative h-36 flex-none sm:h-40 md:h-44 lg:h-52 xl:h-56">
            <Image
              src={data.image}
              alt={`${data.name} artwork`}
              fill
              sizes="(max-width: 767px) 200px, (max-width: 1023px) 260px, (max-width: 1279px) 300px, 340px"
              className="object-contain p-1.5 sm:p-2"
              priority
            />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="gba-ui-font text-[10px] uppercase text-[#4c3f7d] sm:text-[11px] md:text-[12px]">
              #{data.id.toString().padStart(4, "0")}
            </p>
            <h2 className="gba-ui-font truncate text-[21px] capitalize text-[#1f2033] sm:text-[25px] md:text-[30px]">
              {data.name}
            </h2>
            <p className="gba-ui-font text-[10px] text-[#4b4d71] sm:text-[11px] md:text-[12px]">
              {data.generation.replace("generation-", `${t("generationShort")} `).toUpperCase()}
            </p>

            <ul className="mt-1.5 flex flex-wrap gap-1 sm:gap-1.5" aria-label="Pokemon types">
              {data.types.map((type: PokemonType) => (
                <li
                  key={type}
                  className={`gba-ui-font rounded-sm border px-1.5 py-0.5 text-[9px] sm:px-2 sm:py-1 sm:text-[10px] md:text-[11px] ${TYPE_BADGE[type]}`}
                >
                  {formatTypeLabel(type)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-h-0 rounded-md border-2 border-[#7b6fb0] bg-[#f6f4ff] p-2 sm:p-3 md:col-span-2 lg:col-span-2 lg:flex lg:flex-col">
          <div className="flex min-h-0 flex-col gap-2 sm:gap-3 lg:flex-1">
            <section className="flex min-h-[130px] flex-col rounded-md border border-[#8a7fc1] bg-[#f1eeff] p-2 sm:min-h-[145px] sm:p-2.5 lg:min-h-0">
              <h3 className="gba-ui-font text-[13px] uppercase text-[#1f2033] sm:text-[15px] md:text-[17px] lg:text-[18px]">
                {t("funFact")}
              </h3>
              <div className="mt-2 flex min-h-0 flex-1 flex-col pb-1">
                <p
                  className="min-h-0 flex-1 overflow-y-auto pr-1 text-[12px] leading-snug text-[#2e3253] sm:text-[13px] md:text-[14px]"
                  tabIndex={0}
                  aria-label="Pokemon fun fact"
                >
                  {aiDescriptionQuery.data
                    ? aiDescriptionQuery.data.funFact
                    : (aiDescriptionQuery.isLoading
                      ? t("loadingFunFact")
                      : t("unavailableFunFact"))}
                </p>
                <button
                  type="button"
                  onClick={() => setRegenerationNonce((value) => value + 1)}
                  disabled={aiDescriptionQuery.isLoading}
                  className="gba-ui-font mt-2 mb-1 inline-flex w-fit items-center justify-center rounded-md border-2 border-[#5a4d8f] bg-[#ece8ff] px-2.5 py-1.5 text-[12px] text-[#312e81] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-2 sm:text-[13px] md:px-3.5 md:text-[15px]"
                >
                  {aiDescriptionQuery.isLoading ? t("generating") : t("another")}
                </button>
              </div>
            </section>

            <section className="flex min-h-[145px] flex-col rounded-md border border-[#8a7fc1] bg-[#f1eeff] p-2 sm:min-h-[165px] sm:p-2.5 lg:min-h-0">
              <h3 className="gba-ui-font text-[13px] uppercase text-[#1f2033] sm:text-[15px] md:text-[17px] lg:text-[18px]">
                {t("stats")}
              </h3>
              <ul className="mt-2 flex min-h-0 flex-1 flex-col justify-between">
                {data.stats.map((stat) => (
                  <li
                    key={stat.name}
                    className="grid min-h-0 grid-cols-[74px_1fr_28px] items-center gap-1.5 sm:grid-cols-[90px_1fr_34px] sm:gap-2 md:grid-cols-[108px_1fr_42px]"
                  >
                    <span className="gba-ui-font text-[7px] uppercase leading-tight text-[#4b4d71] sm:text-[8px] md:text-[9px]">
                      {formatStatLabel(stat.name)}
                    </span>
                    <div className="h-2.5 overflow-hidden rounded-sm border border-[#8a7fc1] bg-[#e4e1f8] sm:h-3">
                      <div className="h-full rounded-none bg-gradient-to-r from-[#5b4d91] to-[#7c6ac4]" style={{ width: `${Math.min(100, stat.value)}%` }} />
                    </div>
                    <span className="gba-ui-font text-right text-[8px] text-[#1f2033] sm:text-[9px] md:text-[10px]">
                      {stat.value}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="min-h-0 rounded-md border-2 border-[#7b6fb0] bg-[#f6f4ff] p-2 sm:p-3 md:col-span-2 lg:col-span-1 lg:flex lg:flex-col">
          <h3 className="gba-ui-font text-[15px] uppercase text-[#1f2033] sm:text-[18px] md:text-[20px] lg:text-[22px]">
            {t("evolutions")}
          </h3>
          <ul className="mt-2 flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1 sm:mt-3 sm:max-h-[260px] md:max-h-[280px] lg:min-h-0 lg:flex-1 lg:max-h-none">
            {data.evolutions.map((evo) => (
              <li key={evo.id}>
                <Link
                  href={getPokemonHref(evo.id)}
                  onClick={(event) => {
                    if (
                      event.defaultPrevented ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0
                    ) {
                      return;
                    }
                    event.preventDefault();
                    const currentIndex = data.evolutions.findIndex((chainMember) => chainMember.id === id);
                    const targetIndex = data.evolutions.findIndex((chainMember) => chainMember.id === evo.id);

                    if (currentIndex >= 0 && targetIndex >= 0 && targetIndex !== currentIndex) {
                      pendingDirectionRef.current = targetIndex > currentIndex ? "up" : "down";
                    } else if (evo.id !== id) {
                      pendingDirectionRef.current = evo.id > id ? "up" : "down";
                    }
                    onSelectEvolution(evo.id);
                  }}
                  aria-current={evo.isCurrent ? "page" : undefined}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md border-2 p-1.5 text-left transition duration-200 ease-poke focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] sm:gap-3 sm:p-2 ${
                    evo.isCurrent
                      ? "border-[#4f46e5] bg-[#ede9fe]"
                      : "border-[#8479b8] bg-[#fdfdff] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12">
                    <Image src={evo.image} alt={`${evo.name} artwork`} fill sizes="44px" className="object-contain" />
                  </div>
                  <p className="gba-ui-font truncate text-[14px] capitalize text-[#1f2033] sm:text-[16px] md:text-[19px]">
                    {evo.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
