"use client";

import { PokemonFilters } from "./pokemon-filters";
import { PokemonSearch } from "./pokemon-search";
import { usePokemonList } from "../hooks/use-pokemon-list";
import { PokemonCard } from "./pokemon-card";
import { PokemonListSkeleton } from "./pokemon-list-skeleton";
import { PokemonEmptyState } from "./pokemon-empty-state";

export function PokemonExplorer() {
  const { items, total, isLoading, isFetching } = usePokemonList();

  return (
    <main id="main-content" className="relative z-10 mx-auto max-w-6xl px-4 py-6 md:py-8">
      <header className="mb-5 text-center">
        <h1 className="pokemon-title mt-1 text-4xl text-yellow-300 md:text-6xl">Pokedex</h1>
      </header>

      <section className="gba-console" aria-live="polite">
        <div className="gba-screen-bezel">
          <div className="gba-screen">
            <div className="screen-sticky">
              <p className="px-1 text-sm font-semibold text-poke-ink/75">{isFetching ? "Updating results…" : `${total} results`}</p>
              <div className="mt-2 grid grid-cols-1 items-center gap-2 md:grid-cols-2">
                <PokemonSearch />
                <PokemonFilters />
              </div>
            </div>

            <div className="screen-reel">
              {isLoading && <PokemonListSkeleton />}

              {!isLoading && items.length === 0 && <PokemonEmptyState />}

              {!isLoading && items.length > 0 && (
                <div className="screen-grid">
                  {items.map((pokemon) => (
                    <div key={pokemon.id} className="slot-item">
                      <PokemonCard pokemon={pokemon} />
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
      </section>
    </main>
  );
}
