"use client";

import { PokemonFilters } from "./pokemon-filters";
import { PokemonSearch } from "./pokemon-search";
import { usePokemonList } from "../hooks/use-pokemon-list";
import { PokemonCard } from "./pokemon-card";
import { PokemonListSkeleton } from "./pokemon-list-skeleton";
import { PokemonEmptyState } from "./pokemon-empty-state";
import { PokemonInlineDetail } from "./pokemon-inline-detail";
import { useState } from "react";

export function PokemonExplorer() {
  const { items, total, isLoading, isFetching } = usePokemonList();
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const isDetailView = selectedPokemonId !== null;

  return (
    <main id="main-content" className="relative z-10 mx-auto max-w-[1500px] px-4 py-6 md:py-8">
      <section className="gba-console" aria-live="polite">
        <div className="gba-screen-bezel">
          <div className="gba-screen">
            <div className="screen-sticky">
              <p className="px-1 text-sm font-semibold text-poke-ink/75">{isFetching ? "Updating results…" : `${total} results`}</p>
              <div
                aria-hidden={isDetailView}
                className={`mt-2 grid grid-cols-1 items-center gap-2 md:grid-cols-2 ${
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
                  onBack={() => setSelectedPokemonId(null)}
                  onSelectEvolution={(id) => setSelectedPokemonId(id)}
                />
              )}

              {!isDetailView && isLoading && <PokemonListSkeleton />}

              {!isDetailView && !isLoading && items.length === 0 && <PokemonEmptyState />}

              {!isDetailView && !isLoading && items.length > 0 && (
                <div className="screen-grid">
                  {items.map((pokemon) => (
                    <div key={pokemon.id} className="slot-item">
                      <PokemonCard pokemon={pokemon} onSelect={setSelectedPokemonId} />
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
