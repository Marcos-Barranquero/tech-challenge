"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePokemonFiltersStore } from "@/stores/pokemon-filters.store";
import { PokemonFilters } from "./pokemon-filters";

vi.mock("../hooks/use-pokemon-meta", () => ({
  usePokemonMeta: () => ({
    data: {
      types: ["fire", "water", "electric"],
      generations: ["generation-i", "generation-ii"],
    },
  }),
}));

describe("PokemonFilters", () => {
  beforeEach(() => {
    usePokemonFiltersStore.getState().resetAll();
  });

  it("updates selected type and generation", async () => {
    const user = userEvent.setup();
    render(<PokemonFilters />);

    const typeSelect = screen.getByRole("combobox", { name: /type/i });
    const genSelect = screen.getByRole("combobox", { name: /generation/i });

    await user.selectOptions(typeSelect, "fire");
    await user.selectOptions(genSelect, "generation-ii");

    const state = usePokemonFiltersStore.getState();
    expect(state.selectedType).toBe("fire");
    expect(state.selectedGeneration).toBe("generation-ii");
  });

  it("clear button resets search and filters", async () => {
    const user = userEvent.setup();
    const store = usePokemonFiltersStore.getState();
    store.setSearch("pikachu");
    store.setType("electric");
    store.setGeneration("generation-i");

    render(<PokemonFilters />);

    await user.click(screen.getByRole("button", { name: /clear/i }));

    const state = usePokemonFiltersStore.getState();
    expect(state.search).toBe("");
    expect(state.selectedType).toBeUndefined();
    expect(state.selectedGeneration).toBeUndefined();
  });
});
