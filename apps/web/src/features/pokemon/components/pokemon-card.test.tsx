"use client";

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PokemonListItem } from "@tech-challenge/shared";
import { PokemonCard } from "./pokemon-card";

const pokemon: PokemonListItem = {
  id: 25,
  name: "pikachu",
  generation: "generation-i",
  types: ["electric"],
  image: "https://img/pikachu.png",
};

describe("PokemonCard", () => {
  it("calls onSelect on normal click", () => {
    const onSelect = vi.fn();
    render(<PokemonCard pokemon={pokemon} href="/?pokemon=25" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("link"));

    expect(onSelect).toHaveBeenCalledWith(25);
  });

  it("does not hijack ctrl/meta click", () => {
    const onSelect = vi.fn();
    render(<PokemonCard pokemon={pokemon} href="/?pokemon=25" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("link"), { ctrlKey: true });
    fireEvent.click(screen.getByRole("link"), { metaKey: true });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
