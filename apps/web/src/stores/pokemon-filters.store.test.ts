import { beforeEach, describe, expect, it } from "vitest";
import { usePokemonFiltersStore } from "./pokemon-filters.store";

describe("pokemon filters store", () => {
  beforeEach(() => {
    usePokemonFiltersStore.getState().resetAll();
  });

  it("resets page to 1 when search changes", () => {
    usePokemonFiltersStore.getState().setPage(3);
    usePokemonFiltersStore.getState().setSearch("pika");

    const state = usePokemonFiltersStore.getState();
    expect(state.search).toBe("pika");
    expect(state.page).toBe(1);
  });

  it("clearFilters resets search/type/generation and keeps default page", () => {
    const store = usePokemonFiltersStore.getState();
    store.setSearch("char");
    store.setType("fire");
    store.setGeneration("generation-i");
    store.setPage(5);

    store.clearFilters();
    const state = usePokemonFiltersStore.getState();
    expect(state.search).toBe("");
    expect(state.selectedType).toBeUndefined();
    expect(state.selectedGeneration).toBeUndefined();
    expect(state.page).toBe(1);
  });

  it("setPageSize updates page size and returns to page 1", () => {
    const store = usePokemonFiltersStore.getState();
    store.setPage(4);
    store.setPageSize(24);

    const state = usePokemonFiltersStore.getState();
    expect(state.pageSize).toBe(24);
    expect(state.page).toBe(1);
  });
});

