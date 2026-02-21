"use client";

import { PokemonFilters } from "./pokemon-filters";
import { PokemonSearch } from "./pokemon-search";
import { usePokemonList } from "../hooks/use-pokemon-list";
import { PokemonCard } from "./pokemon-card";
import { PokemonListSkeleton } from "./pokemon-list-skeleton";
import { PokemonEmptyState } from "./pokemon-empty-state";
import { PokemonInlineDetail } from "./pokemon-inline-detail";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GbaThemePicker } from "./gba-theme-picker";
import { useGbaThemeStore } from "@/stores/gba-theme.store";

export function PokemonExplorer() {
  const theme = useGbaThemeStore((state) => state.theme);
  const { items, isLoading, isInitialLoading, hasNextPage, isFetchingNextPage, loadMore } = usePokemonList();
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

  const listPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDetailView) {
      return;
    }

    const node = listPanelRef.current;
    if (!node) {
      return;
    }

    const maybeLoadMore = () => {
      if (!hasNextPage || isFetchingNextPage) {
        return;
      }

      const threshold = 220;
      const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
      if (remaining <= threshold) {
        loadMore();
      }
    };

    node.addEventListener("scroll", maybeLoadMore, { passive: true });
    // Trigger once on mount/update in case content does not fill the container yet.
    maybeLoadMore();

    return () => node.removeEventListener("scroll", maybeLoadMore);
  }, [hasNextPage, isDetailView, isFetchingNextPage, loadMore]);

  return (
    <main
      id="main-content"
      className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col items-center px-4 py-2 md:py-3"
    >
      <section className={`gba-console theme-gba-${theme}`} aria-live="polite">
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
                <div ref={listPanelRef} className="screen-panel screen-panel-list">
                  {isInitialLoading && <PokemonListSkeleton />}

                  {!isLoading && !isInitialLoading && items.length === 0 && <PokemonEmptyState />}

                  {!isInitialLoading && items.length > 0 && (
                    <>
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
                      <div className="h-8" aria-hidden="true" />
                      {isFetchingNextPage && (
                        <p className="gba-ui-font pb-2 text-center text-[12px] text-[#3d336b]">
                          Loading more Pokemon...
                        </p>
                      )}
                    </>
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
          <div className="gba-dpad-cluster">
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
        <div className="gba-theme-picker-wrap">
          <GbaThemePicker />
        </div>

        <div className="gba-brand-wrap" aria-hidden="true">
          <p className="pokemon-title gba-brand text-yellow-300">POKEDEX</p>
        </div>
      </section>
      <div className="mt-2 flex justify-center">
        <LanguageSwitcher />
      </div>
    </main>
  );
}
