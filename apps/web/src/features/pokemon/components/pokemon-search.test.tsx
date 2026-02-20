"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { usePokemonFiltersStore } from "@/stores/pokemon-filters.store";
import { PokemonSearch } from "./pokemon-search";

describe("PokemonSearch", () => {
  beforeEach(() => {
    usePokemonFiltersStore.getState().resetAll();
  });

  it("updates search term in global store", async () => {
    const user = userEvent.setup();
    render(<PokemonSearch />);

    const input = screen.getByRole("textbox", { name: /search pokemon and evolutions/i });
    await user.type(input, "pikachu");

    expect(usePokemonFiltersStore.getState().search).toBe("pikachu");
  });
});
