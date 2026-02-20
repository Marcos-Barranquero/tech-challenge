"use client";

import { usePokemonDetail } from "../hooks/use-pokemon-detail";
import Image from "next/image";
import Link from "next/link";
import { TYPE_BADGE } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";
import type { PokemonType } from "@tech-challenge/shared";
import { useEffect, useRef, useState } from "react";

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

  if (isLoading || !data) {
    return <div className="h-80 animate-pulse rounded-lg bg-[#f3f0ff]/80" />;
  }

  return (
    <section
      key={transitionKey}
      className={`h-full rounded-lg border-2 border-[#5f518f] bg-[#f4f1ff]/95 p-3 shadow-[0_5px_0_#4e3f82,0_12px_22px_rgba(37,30,77,0.2)] md:p-4 ${
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
        className="gba-ui-font inline-flex cursor-pointer items-center gap-1 rounded-md border-2 border-[#5a4d8f] bg-[#ece8ff] px-3 py-1.5 text-[12px] text-[#312e81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back
      </button>

      <div className="mt-3 grid h-[calc(100%-36px)] grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex min-h-0 flex-col rounded-md border-2 border-[#7b6fb0] bg-[#f6f4ff] p-3">
          <div className="relative min-h-0 flex-1">
            <Image src={data.image} alt={`${data.name} artwork`} fill sizes="220px" className="object-contain p-2" priority />
          </div>
          <div className="mt-2">
            <p className="gba-ui-font text-[12px] uppercase text-[#4c3f7d]">#{data.id.toString().padStart(4, "0")}</p>
            <h2 className="gba-ui-font truncate text-3xl capitalize text-[#1f2033]">{data.name}</h2>
            <p className="gba-ui-font text-[12px] text-[#4b4d71]">{data.generation.replace("generation-", "Gen ").toUpperCase()}</p>

            <ul className="mt-1.5 flex flex-wrap gap-1" aria-label="Pokemon types">
              {data.types.map((type: PokemonType) => (
                <li key={type} className={`gba-ui-font rounded-sm border px-2 py-1 text-[11px] uppercase ${TYPE_BADGE[type]}`}>
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-h-0 rounded-md border-2 border-[#7b6fb0] bg-[#f6f4ff] p-3">
          <h3 className="gba-ui-font text-[22px] uppercase text-[#1f2033]">Stats</h3>
          <ul className="mt-3 flex h-[calc(100%-44px)] flex-col justify-between">
            {data.stats.map((stat) => (
              <li key={stat.name} className="grid min-h-0 grid-cols-[146px_1fr_64px] items-center gap-3">
                <span className="gba-ui-font text-[14px] uppercase leading-tight text-[#4b4d71]">{stat.name}</span>
                <div className="h-5 overflow-hidden rounded-sm border border-[#8a7fc1] bg-[#e4e1f8]">
                  <div className="h-full rounded-none bg-gradient-to-r from-[#5b4d91] to-[#7c6ac4]" style={{ width: `${Math.min(100, stat.value)}%` }} />
                </div>
                <span className="gba-ui-font text-right text-[16px] text-[#1f2033]">{stat.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-0 rounded-md border-2 border-[#7b6fb0] bg-[#f6f4ff] p-3">
          <h3 className="gba-ui-font text-[22px] uppercase text-[#1f2033]">Evolutions</h3>
          <ul className="mt-3 flex h-[calc(100%-36px)] flex-col gap-2 overflow-y-auto pr-1">
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
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-md border-2 p-2 text-left transition duration-200 ease-poke focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                    evo.isCurrent
                      ? "border-[#4f46e5] bg-[#ede9fe]"
                      : "border-[#8479b8] bg-[#fdfdff] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="relative h-14 w-14 shrink-0">
                    <Image src={evo.image} alt={`${evo.name} artwork`} fill sizes="44px" className="object-contain" />
                  </div>
                  <p className="gba-ui-font truncate text-[16px] capitalize text-[#1f2033]">{evo.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
