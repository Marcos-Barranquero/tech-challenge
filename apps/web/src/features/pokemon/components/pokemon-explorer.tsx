"use client";

import { PokemonFilters } from "./pokemon-filters";
import { PokemonSearch } from "./pokemon-search";
import { usePokemonList } from "../hooks/use-pokemon-list";
import { PokemonCard } from "./pokemon-card";
import { PokemonListSkeleton } from "./pokemon-list-skeleton";
import { PokemonEmptyState } from "./pokemon-empty-state";
import { PokemonInlineDetail } from "./pokemon-inline-detail";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PokemonExplorer() {
  const { items, isLoading } = usePokemonList();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedPokemonId = useMemo(() => {
    const raw = searchParams.get("pokemon");
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const isDetailView = selectedPokemonId !== null;
  const basePath = pathname || "/";

  const getPokemonHref = useCallback(
    (id: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pokemon", String(id));
      return `${basePath}?${params.toString()}`;
    },
    [basePath, searchParams],
  );

  const openPokemon = useCallback(
    (id: number) => {
      router.push(getPokemonHref(id), { scroll: false });
    },
    [getPokemonHref, router],
  );

  const closeDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("pokemon");
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }, [basePath, router, searchParams]);

  return (
    <main id="main-content" className="relative z-10 mx-auto max-w-[1500px] px-4 py-6 md:py-8">
      <section className="gba-console" aria-live="polite">
        <div className="gba-screen-bezel">
          <div className="gba-screen">
            <div className="screen-sticky">
              <div
                aria-hidden={isDetailView}
                className={`grid grid-cols-1 items-center gap-2 md:grid-cols-2 ${
                  isDetailView ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
              >
                <PokemonSearch />
                <PokemonFilters />
              </div>
            </div>

            <div className={`screen-reel ${isDetailView ? "screen-reel-detail" : ""}`}>
              {isDetailView && selectedPokemonId !== null && (
                <PokemonInlineDetail
                  id={selectedPokemonId}
                  onBack={closeDetail}
                  onSelectEvolution={openPokemon}
                  getPokemonHref={getPokemonHref}
                />
              )}

              {!isDetailView && isLoading && <PokemonListSkeleton />}

              {!isDetailView && !isLoading && items.length === 0 && <PokemonEmptyState />}

              {!isDetailView && !isLoading && items.length > 0 && (
                <div className="screen-grid">
                  {items.map((pokemon) => (
                    <div key={pokemon.id} className="slot-item">
                      <PokemonCard
                        pokemon={pokemon}
                        href={getPokemonHref(pokemon.id)}
                        onSelect={openPokemon}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="gba-controls" aria-hidden="true">
          <div className="gba-dpad">
            <span />
            <span />
          </div>
          <div className="gba-speaker" />
          <div className="gba-buttons">
            <span />
            <span />
          </div>
        </div>

        <div className="gba-brand-wrap" aria-hidden="true">
          <p className="pokemon-title gba-brand text-yellow-300">Pokedex</p>
        </div>
      </section>
    </main>
  );
}
