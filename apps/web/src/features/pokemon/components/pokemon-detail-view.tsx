"use client";

import { usePokemonDetail } from "../hooks/use-pokemon-detail";
import Image from "next/image";
import Link from "next/link";
import { TYPE_BADGE } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";
import type { PokemonDetailOutput, PokemonType } from "@tech-challenge/shared";

export function PokemonDetailView({ id, initialData }: { id: number; initialData?: PokemonDetailOutput }) {
  const { data, isLoading } = usePokemonDetail(id, initialData);

  if (isLoading || !data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-80 animate-pulse rounded-3xl bg-white/70" />
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-poke-primary shadow-claySoft transition duration-200 ease-poke hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Back to list
      </Link>

      <section className="mt-4 rounded-3xl border-2 border-white/90 bg-white/90 p-5 shadow-claySoft md:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
          <div className="relative h-72 rounded-3xl bg-blue-50 p-4">
            <Image src={data.image} alt={`${data.name} artwork`} fill sizes="(max-width: 768px) 100vw, 280px" className="object-contain p-6" priority />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-poke-primary">#{data.id.toString().padStart(4, "0")}</p>
            <h1 className="text-4xl font-semibold capitalize text-poke-ink">{data.name}</h1>
            <p className="mt-1 text-poke-ink/70">{data.generation.replace("generation-", "Gen ").toUpperCase()}</p>

            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Pokemon types">
              {data.types.map((type: PokemonType) => (
                <li key={type} className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${TYPE_BADGE[type]}`}>
                  {type}
                </li>
              ))}
            </ul>

            <h2 className="mt-8 text-2xl font-semibold text-poke-ink">Stats</h2>
            <ul className="mt-3 space-y-2">
              {data.stats.map((stat) => (
                <li key={stat.name} className="grid grid-cols-[100px_1fr_48px] items-center gap-3">
                  <span className="text-sm font-semibold uppercase text-poke-ink/70">{stat.name}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-poke-primary to-poke-accent" style={{ width: `${Math.min(100, stat.value)}%` }} />
                  </div>
                  <span className="text-right text-sm font-bold text-poke-ink">{stat.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-semibold text-poke-ink">Evolutions</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.evolutions.map((evo) => (
            <li key={evo.id}>
              <Link
                href={`/pokemon/${evo.id}`}
                aria-current={evo.isCurrent ? "page" : undefined}
                className={`block cursor-pointer rounded-2xl border-2 p-3 transition duration-200 ease-poke focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary ${
                  evo.isCurrent
                    ? "border-poke-primary bg-blue-50"
                    : "border-blue-200 bg-white hover:-translate-y-0.5"
                }`}
              >
                <div className="relative mx-auto h-20 w-20">
                  <Image src={evo.image} alt={`${evo.name} artwork`} fill sizes="80px" className="object-contain" />
                </div>
                <p className="mt-2 text-center text-sm font-bold capitalize text-poke-ink">{evo.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
