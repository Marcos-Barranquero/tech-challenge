"use client";

import { usePokemonDetail } from "../hooks/use-pokemon-detail";
import Image from "next/image";
import { TYPE_BADGE } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";
import type { PokemonType } from "@tech-challenge/shared";

export function PokemonInlineDetail({
  id,
  onBack,
  onSelectEvolution,
}: {
  id: number;
  onBack: () => void;
  onSelectEvolution: (id: number) => void;
}) {
  const { data, isLoading } = usePokemonDetail(id);

  if (isLoading || !data) {
    return <div className="h-80 animate-pulse rounded-2xl bg-white/70" />;
  }

  return (
    <section className="h-full rounded-2xl border-2 border-blue-200 bg-white/90 p-3 shadow-claySoft md:p-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-poke-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back
      </button>

      <div className="mt-3 grid h-[calc(100%-36px)] grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex min-h-0 flex-col rounded-xl border border-blue-100 bg-blue-50 p-3">
          <div className="relative min-h-0 flex-1">
            <Image src={data.image} alt={`${data.name} artwork`} fill sizes="220px" className="object-contain p-2" priority />
          </div>
          <div className="mt-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-poke-primary">#{data.id.toString().padStart(4, "0")}</p>
            <h2 className="truncate text-lg font-bold capitalize text-poke-ink">{data.name}</h2>
            <p className="text-[11px] text-poke-ink/70">{data.generation.replace("generation-", "Gen ").toUpperCase()}</p>

            <ul className="mt-1.5 flex flex-wrap gap-1" aria-label="Pokemon types">
              {data.types.map((type: PokemonType) => (
                <li key={type} className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${TYPE_BADGE[type]}`}>
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-h-0 rounded-xl border border-blue-100 bg-white p-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-poke-ink">Stats</h3>
          <ul className="mt-2 space-y-1.5">
            {data.stats.map((stat) => (
              <li key={stat.name} className="grid grid-cols-[68px_1fr_32px] items-center gap-2">
                <span className="text-[10px] font-semibold uppercase text-poke-ink/70">{stat.name}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-blue-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-poke-primary to-poke-accent" style={{ width: `${Math.min(100, stat.value)}%` }} />
                </div>
                <span className="text-right text-[10px] font-bold text-poke-ink">{stat.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-0 rounded-xl border border-blue-100 bg-white p-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-poke-ink">Evolutions</h3>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {data.evolutions.map((evo) => (
              <li key={evo.id}>
                <button
                  type="button"
                  onClick={() => onSelectEvolution(evo.id)}
                  aria-current={evo.isCurrent ? "page" : undefined}
                  className={`w-full cursor-pointer rounded-lg border-2 p-1.5 text-left transition duration-200 ease-poke focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary ${
                    evo.isCurrent ? "border-poke-primary bg-blue-50" : "border-blue-200 bg-white hover:-translate-y-0.5"
                  }`}
                >
                  <div className="relative mx-auto h-11 w-11">
                    <Image src={evo.image} alt={`${evo.name} artwork`} fill sizes="44px" className="object-contain" />
                  </div>
                  <p className="mt-1 truncate text-center text-[10px] font-bold capitalize text-poke-ink">{evo.name}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
