"use client";

import { PokemonFilters } from "./pokemon-filters";
import { PokemonSearch } from "./pokemon-search";
import { usePokemonList } from "../hooks/use-pokemon-list";
import { PokemonCard } from "./pokemon-card";
import { PokemonListSkeleton } from "./pokemon-list-skeleton";
import { PokemonEmptyState } from "./pokemon-empty-state";
import { PokemonInlineDetail } from "./pokemon-inline-detail";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
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
  const [gridStyle, setGridStyle] = useState<CSSProperties>({});
  const [gridCols, setGridCols] = useState(6);
  const gridRows = 2;

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

  useEffect(() => {
    const node = listPanelRef.current;
    if (!node) {
      return;
    }

    const compute = () => {
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth <= 768;
      const isTablet = viewportWidth <= 1200 && !isMobile;
      const cols = isMobile ? 2 : isTablet ? 3 : 6;
      const gap = isMobile ? 8 : 10;
      const insetInline = isMobile ? 14 : isTablet ? 16 : 18;
      const insetBlock = isMobile ? 12 : isTablet ? 14 : 16;
      const width = node.clientWidth;
      const height = node.clientHeight;
      const safety = 3;
      const availableWidth = Math.max(0, width - insetInline * 2 - gap * (cols - 1) - safety);
      const availableHeight = Math.max(0, height - insetBlock * 2 - gap * (gridRows - 1) - safety);
      const tile = Math.max(24, Math.floor(Math.min(availableWidth / cols, availableHeight / gridRows)));

      setGridCols(cols);
      setGridStyle({
        ["--grid-cols" as string]: String(cols),
        ["--grid-rows" as string]: String(gridRows),
        ["--grid-gap" as string]: `${gap}px`,
        ["--grid-inset-inline" as string]: `${insetInline}px`,
        ["--grid-inset-block" as string]: `${insetBlock}px`,
        ["--page-height" as string]: `${height}px`,
        ["--tile-size" as string]: `${tile}px`,
      } as CSSProperties);
    };

    const observer = new ResizeObserver(compute);
    observer.observe(node);
    compute();

    return () => observer.disconnect();
  }, []);

  const cardsPerPage = gridCols * gridRows;
  const pagedItems = useMemo(() => {
    const pages: Array<typeof items> = [];
    for (let index = 0; index < items.length; index += cardsPerPage) {
      pages.push(items.slice(index, index + cardsPerPage));
    }
    return pages;
  }, [cardsPerPage, items]);

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
                <div className="grid grid-cols-1 items-center gap-2 lg:grid-cols-2">
                  <PokemonSearch />
                  <PokemonFilters />
                </div>
              </div>
            )}

            <div className="screen-reel">
              <div className={`screen-carousel ${isDetailView ? "is-detail" : ""}`}>
                <div ref={listPanelRef} style={gridStyle} className="screen-panel screen-panel-list">
                  {isInitialLoading && <PokemonListSkeleton />}

                  {!isLoading && !isInitialLoading && items.length === 0 && <PokemonEmptyState />}

                  {!isInitialLoading && items.length > 0 && (
                    <>
                      <div className="screen-pages">
                        {pagedItems.map((page, pageIndex) => (
                          <section key={`page-${pageIndex}`} className="screen-page">
                            <div className="screen-grid">
                              {Array.from({ length: cardsPerPage }).map((_, cellIndex) => {
                                const pokemon = page[cellIndex];
                                if (!pokemon) {
                                  return <div key={`placeholder-${pageIndex}-${cellIndex}`} className="slot-placeholder" aria-hidden="true" />;
                                }
                                return (
                                  <div key={pokemon.id} className="slot-item">
                                    <PokemonCard
                                      pokemon={pokemon}
                                      href={getPokemonHref(pokemon.id)}
                                      onSelect={openPokemon}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        ))}
                      </div>
                      {isFetchingNextPage && (
                        <p className="screen-loading-more gba-ui-font text-center text-[12px] text-[#3d336b]">
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
      <div className="mt-1.5 flex justify-center">
        <LanguageSwitcher />
      </div>
    </main>
  );
}
