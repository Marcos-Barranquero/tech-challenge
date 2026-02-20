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
            {!isDetailView && (
              <div className="screen-sticky">
                <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-2">
                  <PokemonSearch />
                  <PokemonFilters />
                </div>
              </div>
            )}

            <div className="screen-reel">
              <div className={`screen-carousel ${isDetailView ? "is-detail" : ""}`}>
                <div className="screen-panel screen-panel-list">
                  {isLoading && <PokemonListSkeleton />}

                  {!isLoading && items.length === 0 && <PokemonEmptyState />}

                  {!isLoading && items.length > 0 && (
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

                <div className="screen-panel screen-panel-detail">
                  {selectedPokemonId !== null && (
                    <PokemonInlineDetail
                      id={selectedPokemonId}
                      onBack={closeDetail}
                      onSelectEvolution={openPokemon}
                      getPokemonHref={getPokemonHref}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gba-controls gba-ui-font" aria-hidden="true">
          <div className="flex items-end gap-3">
            <div className="gba-dpad">
              <span />
              <span />
            </div>
            <div className="gba-start-select">
              <span>START</span>
              <span>SELECT</span>
            </div>
          </div>
          <div className="gba-center-brand">
            <small>Nintendo</small>
            <strong>GAME BOY ADVANCE</strong>
          </div>
          <div className="gba-buttons">
            <span />
            <span />
          </div>
        </div>

        <div className="gba-brand-wrap" aria-hidden="true">
          <p className="pokemon-title gba-brand text-yellow-300">POKEDEX</p>
        </div>
      </section>
    </main>
  );
}
