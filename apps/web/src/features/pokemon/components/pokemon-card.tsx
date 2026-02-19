"use client";

import type { PokemonListItem } from "@tech-challenge/shared";
import Image from "next/image";
import Link from "next/link";
import { TYPE_BADGE } from "@/lib/constants";

export function PokemonCard({ pokemon }: { pokemon: PokemonListItem }) {
  return (
    <article className="group aspect-square h-full overflow-hidden rounded-2xl border-2 border-blue-200 bg-white/95 p-2.5 shadow-claySoft transition duration-200 ease-poke hover:-translate-y-0.5 hover:shadow-clay">
      <Link
        href={`/pokemon/${pokemon.id}`}
        className="grid h-full cursor-pointer grid-rows-[auto_minmax(0,1fr)_auto_auto] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-poke-primary">#{pokemon.id.toString().padStart(4, "0")}</p>

        <div className="relative mt-1 min-h-0 rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-1.5">
          <Image src={pokemon.image} alt={`${pokemon.name} artwork`} fill className="object-contain p-1.5" sizes="(max-width: 768px) 40vw, 160px" />
        </div>

        <div className="mt-1 min-w-0">
          <h3 className="truncate text-sm font-bold capitalize leading-tight text-poke-ink">{pokemon.name}</h3>
          <p className="text-[10px] font-semibold text-poke-ink/70">{pokemon.generation.replace("generation-", "GEN ").toUpperCase()}</p>
        </div>

        <ul className="mt-1.5 flex min-w-0 flex-wrap gap-1" aria-label="Pokemon types">
          {pokemon.types.map((type) => (
            <li key={type} className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${TYPE_BADGE[type]}`}>
              {type}
            </li>
          ))}
        </ul>
      </Link>
    </article>
  );
}
