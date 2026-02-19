"use client";

import type { PokemonListItem } from "@tech-challenge/shared";
import Image from "next/image";
import { TYPE_BADGE } from "@/lib/constants";

export function PokemonCard({
  pokemon,
  onSelect,
}: {
  pokemon: PokemonListItem;
  onSelect: (id: number) => void;
}) {
  return (
    <article className="group aspect-square h-full overflow-hidden rounded-2xl border-2 border-blue-200 bg-white/95 p-2.5 shadow-claySoft transition duration-200 ease-poke hover:-translate-y-0.5 hover:shadow-clay">
      <button
        type="button"
        onClick={() => onSelect(pokemon.id)}
        className="relative h-full w-full cursor-pointer overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
      >
        <div className="absolute inset-0">
          <Image
            src={pokemon.image}
            alt={`${pokemon.name} artwork`}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 40vw, 180px"
          />
        </div>

        <div className="absolute left-0 top-0 z-10 p-2">
          <p className="text-left text-[10px] font-bold uppercase tracking-wide text-poke-primary">
            #{pokemon.id.toString().padStart(4, "0")}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-2">
          <h3 className="mt-0.5 break-words text-sm font-bold capitalize leading-tight text-poke-ink">
            {pokemon.name}
          </h3>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-semibold uppercase text-poke-ink/70">
              {pokemon.generation.replace("generation-", "GEN ").toUpperCase()}
            </span>
            <ul className="flex min-w-0 flex-wrap gap-1" aria-label="Pokemon types">
              {pokemon.types.map((type) => (
                <li key={type} className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${TYPE_BADGE[type]}`}>
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/95 via-white/70 to-transparent" aria-hidden="true" />
      </button>
    </article>
  );
}
