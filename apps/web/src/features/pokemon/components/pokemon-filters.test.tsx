"use client";

import React from "react";
import { render, screen, within } from "@testing-library/react";
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
      selectedTypes: [],
      selectedGeneration: undefined,
      setTypes: vi.fn(),
      setGeneration: vi.fn(),
      clearFilters: vi.fn(),
    });
  });

  it("updates selected types and generation", async () => {
    const user = userEvent.setup();
    const setTypes = vi.fn();
    const setGeneration = vi.fn();

    queryStateMock.mockReturnValue({
      selectedTypes: [],
      selectedGeneration: undefined,
      setTypes,
      setGeneration,
      clearFilters: vi.fn(),
    });

    render(<PokemonFilters />);

    const typeTrigger = screen.getByRole("button", { name: /type/i });
    const genSelect = screen.getByRole("combobox", { name: /generation/i });

    await user.click(typeTrigger);
    await user.click(screen.getByRole("option", { name: /fire/i }));
    await user.selectOptions(genSelect, "generation-ii");

    expect(setTypes).toHaveBeenCalledWith(["fire"]);
    expect(setGeneration).toHaveBeenCalledWith("generation-ii");
  });

  it("supports multi-select in type menu", async () => {
    const user = userEvent.setup();
    const setTypes = vi.fn();

    queryStateMock.mockReturnValue({
      selectedTypes: ["fire"],
      selectedGeneration: undefined,
      setTypes,
      setGeneration: vi.fn(),
      clearFilters: vi.fn(),
    });

    render(<PokemonFilters />);

    await user.click(screen.getByRole("button", { name: /type/i }));
    await user.click(screen.getByRole("option", { name: /water/i }));

    expect(setTypes).toHaveBeenCalledWith(["fire", "water"]);
  });

  it("supports deselecting an already selected type", async () => {
    const user = userEvent.setup();
    const setTypes = vi.fn();

    queryStateMock.mockReturnValue({
      selectedTypes: ["fire", "water"],
      selectedGeneration: undefined,
      setTypes,
      setGeneration: vi.fn(),
      clearFilters: vi.fn(),
    });

    render(<PokemonFilters />);

    await user.click(screen.getByRole("button", { name: /type/i }));
    await user.click(screen.getByRole("option", { name: /fire/i }));

    expect(setTypes).toHaveBeenCalledWith(["water"]);
  });

  it("clears selected types from dropdown clear action", async () => {
    const user = userEvent.setup();
    const setTypes = vi.fn();

    queryStateMock.mockReturnValue({
      selectedTypes: ["electric"],
      selectedGeneration: "generation-i",
      setTypes,
      setGeneration: vi.fn(),
      clearFilters: vi.fn(),
    });

    render(<PokemonFilters />);

    await user.click(screen.getByRole("button", { name: /type/i }));
    const menu = screen.getByRole("listbox");
    await user.click(within(menu).getByRole("button", { name: /^clear$/i }));

    expect(setTypes).toHaveBeenCalledWith([]);
  });

  it("clear button resets search and filters", async () => {
    const user = userEvent.setup();
    const clearFilters = vi.fn();

    queryStateMock.mockReturnValue({
      selectedTypes: ["electric"],
      selectedGeneration: "generation-i",
      setTypes: vi.fn(),
      setGeneration: vi.fn(),
      clearFilters,
    });

    render(<PokemonFilters />);

    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(clearFilters).toHaveBeenCalledTimes(1);
  });
});
