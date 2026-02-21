"use client";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listInfiniteUseQueryMock = vi.fn();
const searchUseQueryMock = vi.fn();
const toastErrorMock = vi.fn();
const queryStateMock = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    pokemon: {
      listInfinite: {
        useInfiniteQuery: (...args: unknown[]) => listInfiniteUseQueryMock(...args),
      },
      searchWithEvolutions: {
        useQuery: (...args: unknown[]) => searchUseQueryMock(...args),
      },
    },
  },
}));

vi.mock("./use-pokemon-query-state", () => ({
  usePokemonQueryState: () => queryStateMock(),
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
    queryStateMock.mockReturnValue({
      search: "",
      selectedType: undefined,
      selectedGeneration: undefined,
    });
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
    queryStateMock.mockReturnValue({
      search: "chu",
      selectedType: "electric",
      selectedGeneration: undefined,
    });

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
    queryStateMock.mockReturnValue({
      search: "   ",
      selectedType: undefined,
      selectedGeneration: undefined,
    });

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
