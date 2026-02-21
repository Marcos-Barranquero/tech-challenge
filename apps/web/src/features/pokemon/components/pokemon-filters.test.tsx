"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PokemonFilters } from "./pokemon-filters";

const queryStateMock = vi.fn();

vi.mock("../hooks/use-pokemon-query-state", () => ({
  usePokemonQueryState: () => queryStateMock(),
}));

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
    vi.clearAllMocks();
    queryStateMock.mockReturnValue({
      selectedType: undefined,
      selectedGeneration: undefined,
      setType: vi.fn(),
      setGeneration: vi.fn(),
      clearFilters: vi.fn(),
    });
  });

  it("updates selected type and generation", async () => {
    const user = userEvent.setup();
    const setType = vi.fn();
    const setGeneration = vi.fn();

    queryStateMock.mockReturnValue({
      selectedType: undefined,
      selectedGeneration: undefined,
      setType,
      setGeneration,
      clearFilters: vi.fn(),
    });

    render(<PokemonFilters />);

    const typeSelect = screen.getByRole("combobox", { name: /type/i });
    const genSelect = screen.getByRole("combobox", { name: /generation/i });

    await user.selectOptions(typeSelect, "fire");
    await user.selectOptions(genSelect, "generation-ii");

    expect(setType).toHaveBeenCalledWith("fire");
    expect(setGeneration).toHaveBeenCalledWith("generation-ii");
  });

  it("clear button resets search and filters", async () => {
    const user = userEvent.setup();
    const clearFilters = vi.fn();

    queryStateMock.mockReturnValue({
      selectedType: "electric",
      selectedGeneration: "generation-i",
      setType: vi.fn(),
      setGeneration: vi.fn(),
      clearFilters,
    });

    render(<PokemonFilters />);

    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(clearFilters).toHaveBeenCalledTimes(1);
  });
});
