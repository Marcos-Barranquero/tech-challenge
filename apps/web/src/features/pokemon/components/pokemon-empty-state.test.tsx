"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PokemonEmptyState } from "./pokemon-empty-state";

const queryStateMock = vi.fn();

vi.mock("../hooks/use-pokemon-query-state", () => ({
  usePokemonQueryState: () => queryStateMock(),
}));

describe("PokemonEmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryStateMock.mockReturnValue({
      clearFilters: vi.fn(),
    });
  });

  it("renders the empty-state copy and CTA", () => {
    render(<PokemonEmptyState />);

    expect(screen.getByText(/no results found/i)).toBeVisible();
    expect(screen.getByText(/try another name or adjust your filters/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /reset filters/i })).toBeVisible();
  });

  it("calls clearFilters when CTA is clicked", async () => {
    const user = userEvent.setup();
    const clearFilters = vi.fn();

    queryStateMock.mockReturnValue({
      clearFilters,
    });

    render(<PokemonEmptyState />);
    await user.click(screen.getByRole("button", { name: /reset filters/i }));

    expect(clearFilters).toHaveBeenCalledTimes(1);
  });
});
