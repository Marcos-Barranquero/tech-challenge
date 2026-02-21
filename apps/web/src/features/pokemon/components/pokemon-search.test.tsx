"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const queryStateMock = vi.fn();

vi.mock("../hooks/use-pokemon-query-state", () => ({
  usePokemonQueryState: () => queryStateMock(),
}));

import { PokemonSearch } from "./pokemon-search";

describe("PokemonSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryStateMock.mockReturnValue({
      search: "",
      setSearch: vi.fn(),
    });
  });

  it("updates search term", async () => {
    const user = userEvent.setup();
    const setSearch = vi.fn();
    queryStateMock.mockReturnValue({
      search: "",
      setSearch,
    });

    render(<PokemonSearch />);

    await user.type(screen.getByRole("textbox", { name: /search pokemon and evolutions/i }), "pikachu");

    expect(setSearch).toHaveBeenCalled();
    expect(setSearch).toHaveBeenCalledWith("p");
  });
});
