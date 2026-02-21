"use client";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePokemonFiltersStore } from "@/stores/pokemon-filters.store";

const listUseQueryMock = vi.fn();
const listInfiniteUseQueryMock = vi.fn();
const searchUseQueryMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    pokemon: {
      list: {
        useQuery: (...args: unknown[]) => listUseQueryMock(...args),
      },
      listInfinite: {
        useInfiniteQuery: (...args: unknown[]) => listInfiniteUseQueryMock(...args),
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
    listInfiniteUseQueryMock.mockReturnValue({
      data: {
        pages: [
          {
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
            page: 1,
            pageSize: 60,
            hasNextPage: false,
            nextCursor: null,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isError: false,
      error: null,
    });
    listUseQueryMock.mockReturnValue({});
    searchUseQueryMock.mockReturnValue({ data: { groups: [] }, isLoading: false, isFetching: false, isError: false, error: null });

    const { result } = renderHook(() => usePokemonList());

    expect(listInfiniteUseQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ search: "", limit: 60 }),
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

    listInfiniteUseQueryMock.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isError: false,
      error: null,
    });
    listUseQueryMock.mockReturnValue({});
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

    expect(listInfiniteUseQueryMock).toHaveBeenCalledWith(
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
    listInfiniteUseQueryMock.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isError: true,
      error: new Error("List failed"),
    });
    listUseQueryMock.mockReturnValue({});
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

  it("loads next page when list has more results", () => {
    const fetchNextPageMock = vi.fn();
    listInfiniteUseQueryMock.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 1,
                name: "bulbasaur",
                generation: "generation-i",
                types: ["grass"],
                image: "https://img/bulbasaur.png",
              },
            ],
            total: 2,
            page: 1,
            pageSize: 60,
            hasNextPage: true,
            nextCursor: 2,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: fetchNextPageMock,
      isError: false,
      error: null,
    });
    listUseQueryMock.mockReturnValue({});
    searchUseQueryMock.mockReturnValue({
      data: { groups: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => usePokemonList());
    result.current.loadMore();

    expect(fetchNextPageMock).toHaveBeenCalledTimes(1);
  });

  it("treats whitespace-only search as empty term", () => {
    const store = usePokemonFiltersStore.getState();
    store.setSearch("   ");

    listInfiniteUseQueryMock.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isError: false,
      error: null,
    });
    listUseQueryMock.mockReturnValue({});
    searchUseQueryMock.mockReturnValue({
      data: { groups: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });

    renderHook(() => usePokemonList());

    expect(listInfiniteUseQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ search: "" }),
      expect.objectContaining({ enabled: true }),
    );
    expect(searchUseQueryMock).toHaveBeenCalledWith(
      { term: "", limit: 10 },
      expect.objectContaining({ enabled: false }),
    );
  });
});
