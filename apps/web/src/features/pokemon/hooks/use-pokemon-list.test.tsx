"use client";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePokemonFiltersStore } from "@/stores/pokemon-filters.store";

const listUseQueryMock = vi.fn();
const searchUseQueryMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    pokemon: {
      list: {
        useQuery: (...args: unknown[]) => listUseQueryMock(...args),
      },
      searchWithEvolutions: {
        useQuery: (...args: unknown[]) => searchUseQueryMock(...args),
      },
    },
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { usePokemonList } from "./use-pokemon-list";

describe("usePokemonList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePokemonFiltersStore.getState().resetAll();
  });

  it("uses list query when search is empty", () => {
    listUseQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 4,
            name: "charmander",
            generation: "generation-i",
            types: ["fire"],
            image: "https://img/charmander.png",
          },
        ],
        total: 1,
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });
    searchUseQueryMock.mockReturnValue({
      data: { groups: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => usePokemonList());

    expect(listUseQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ search: "" }),
      expect.objectContaining({ enabled: true }),
    );
    expect(searchUseQueryMock).toHaveBeenCalledWith(
      { term: "", limit: 10 },
      expect.objectContaining({ enabled: false }),
    );
    expect(result.current.items.map((i) => i.name)).toEqual(["charmander"]);
    expect(result.current.total).toBe(1);
  });

  it("merges and deduplicates searchWithEvolutions results and applies filters", () => {
    const store = usePokemonFiltersStore.getState();
    store.setSearch("chu");
    store.setType("electric");

    listUseQueryMock.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });
    searchUseQueryMock.mockReturnValue({
      data: {
        groups: [
          {
            chainId: 10,
            matches: [
              {
                id: 172,
                name: "pichu",
                generation: "generation-ii",
                types: ["electric"],
                image: "https://img/pichu.png",
              },
              {
                id: 25,
                name: "pikachu",
                generation: "generation-i",
                types: ["electric"],
                image: "https://img/pikachu.png",
              },
            ],
          },
          {
            chainId: 11,
            matches: [
              {
                id: 25,
                name: "pikachu",
                generation: "generation-i",
                types: ["electric"],
                image: "https://img/pikachu.png",
              },
              {
                id: 26,
                name: "raichu",
                generation: "generation-i",
                types: ["electric"],
                image: "https://img/raichu.png",
              },
              {
                id: 4,
                name: "charmander",
                generation: "generation-i",
                types: ["fire"],
                image: "https://img/charmander.png",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => usePokemonList());

    expect(listUseQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ search: "chu" }),
      expect.objectContaining({ enabled: false }),
    );
    expect(searchUseQueryMock).toHaveBeenCalledWith(
      { term: "chu", limit: 10 },
      expect.objectContaining({ enabled: true }),
    );
    expect(result.current.items.map((item) => item.id)).toEqual([172, 25, 26]);
    expect(result.current.total).toBe(3);
  });

  it("emits toast error when either query fails", () => {
    listUseQueryMock.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isFetching: false,
      isError: true,
      error: new Error("List failed"),
    });
    searchUseQueryMock.mockReturnValue({
      data: { groups: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });

    renderHook(() => usePokemonList());

    expect(toastErrorMock).toHaveBeenCalledWith("List failed");
  });
});

