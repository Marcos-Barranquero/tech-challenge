"use client";

import type { PokemonListItem } from "@tech-challenge/shared";
import Image from "next/image";
import Link from "next/link";
import { TYPE_BADGE } from "@/lib/constants";

export function PokemonCard({ pokemon }: { pokemon: PokemonListItem }) {
  return (
    <article className="group h-full rounded-2xl border-2 border-blue-200 bg-white/95 p-3 shadow-claySoft transition duration-200 ease-poke hover:-translate-y-0.5 hover:shadow-clay">
      <Link
        href={`/pokemon/${pokemon.id}`}
        className="flex h-full cursor-pointer flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
      >
        <p className="text-[11px] font-bold uppercase tracking-wide text-poke-primary">#{pokemon.id.toString().padStart(4, "0")}</p>

        <div className="relative mt-1 h-28 rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-2">
          <Image src={pokemon.image} alt={`${pokemon.name} artwork`} fill className="object-contain p-2" sizes="(max-width: 768px) 40vw, 160px" />
        </div>

        <h3 className="mt-2 text-base font-bold capitalize leading-tight text-poke-ink">{pokemon.name}</h3>
        <p className="text-xs font-semibold text-poke-ink/70">{pokemon.generation.replace("generation-", "GEN ").toUpperCase()}</p>

        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Pokemon types">
          {pokemon.types.map((type) => (
            <li key={type} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_BADGE[type]}`}>
              {type}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2">
          <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
            Open
          </span>
        </div>
      </Link>
    </article>
  );
}
