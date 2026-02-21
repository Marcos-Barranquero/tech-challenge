"use client";

import type { PokemonListItem } from "@tech-challenge/shared";
import Image from "next/image";
import Link from "next/link";
import { TYPE_BADGE } from "@/lib/constants";
import { useTranslations } from "next-intl";

export function PokemonCard({
  pokemon,
  href,
  onSelect,
}: {
  pokemon: PokemonListItem;
  href: string;
  onSelect: (id: number) => void;
}) {
  const t = useTranslations("detail");

  return (
    <article className="group h-full w-full overflow-hidden rounded-md border-[3px] border-[#5b4d91] bg-[#e6e2fa] p-1.5 shadow-[0_4px_0_#4c3d7d,0_10px_18px_rgba(37,30,77,0.22)] transition duration-200 ease-poke hover:-translate-y-0.5">
      <Link
        href={href}
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
          onSelect(pokemon.id);
        }}
        className="relative block h-full w-full cursor-pointer overflow-hidden rounded-[6px] border-2 border-[#8479b8] bg-gradient-to-b from-[#fbfaff] to-[#f1eeff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]"
      >
        <div className="absolute inset-x-0 top-0 z-0 h-7 bg-gradient-to-b from-[#d8d2f4] to-transparent" aria-hidden="true" />
        <div className="absolute inset-0">
          <Image
            src={pokemon.image}
            alt={`${pokemon.name} artwork`}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 40vw, 180px"
          />
        </div>

        <div className="absolute left-1.5 top-1 z-10">
          <p className="gba-ui-font text-left text-[10px] uppercase text-[#4c3f7d] sm:text-[11px] xl:text-[12px]">
            #{pokemon.id.toString().padStart(4, "0")}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-1.5 sm:p-2">
          <h3 className="gba-ui-font gba-stroked-text mt-0.5 truncate text-center text-[13px] capitalize leading-tight sm:text-[15px] xl:text-[18px]">
            {pokemon.name}
          </h3>

          <div className="mt-1 flex min-w-0 items-center justify-between gap-1.5">
            <span className="gba-ui-font shrink-0 text-[8px] uppercase text-[#4b4d71] text-left sm:text-[9px] xl:text-[10px]">
              {pokemon.generation.replace("generation-", `${t("generationShort")} `).toUpperCase()}
            </span>
            <ul className="flex min-w-0 flex-wrap justify-end gap-1" aria-label="Pokemon types">
              {pokemon.types.map((type) => (
                <li
                  key={type}
                  className={`gba-ui-font rounded-sm border px-1 py-0.5 text-[8px] uppercase sm:px-1.5 sm:text-[9px] xl:text-[10px] ${TYPE_BADGE[type]}`}
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </Link>
    </article>
  );
}
