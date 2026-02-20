import type { Generation, PokemonType } from "@tech-challenge/shared";
import { create } from "zustand";

type PokemonFiltersState = {
  search: string;
  selectedType?: PokemonType;
  selectedGeneration?: Generation;
  page: number;
  pageSize: number;
};

type PokemonFiltersActions = {
  setSearch: (value: string) => void;
  setType: (value?: PokemonType) => void;
  setGeneration: (value?: Generation) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  clearFilters: () => void;
  resetAll: () => void;
};

const DEFAULT_STATE: PokemonFiltersState = {
  search: "",
  selectedType: undefined,
  selectedGeneration: undefined,
  page: 1,
  pageSize: 60,
};

export type PokemonFiltersStore = PokemonFiltersState & PokemonFiltersActions;

export const usePokemonFiltersStore = create<PokemonFiltersStore>((set) => ({
  ...DEFAULT_STATE,

  setSearch: (value) => set({ search: value, page: 1 }),

  setType: (value) => set({ selectedType: value, page: 1 }),

  setGeneration: (value) => set({ selectedGeneration: value, page: 1 }),

  setPage: (value) => set({ page: value }),

  setPageSize: (value) => set({ pageSize: value, page: 1 }),

  clearFilters: () =>
    set({
      search: "",
      selectedType: undefined,
      selectedGeneration: undefined,
      page: 1,
    }),

  resetAll: () => set({ ...DEFAULT_STATE }),
}));

export const pokemonFiltersSelectors = {
  search: (state: PokemonFiltersStore) => state.search,
  selectedType: (state: PokemonFiltersStore) => state.selectedType,
  selectedGeneration: (state: PokemonFiltersStore) => state.selectedGeneration,
  page: (state: PokemonFiltersStore) => state.page,
  pageSize: (state: PokemonFiltersStore) => state.pageSize,
};
