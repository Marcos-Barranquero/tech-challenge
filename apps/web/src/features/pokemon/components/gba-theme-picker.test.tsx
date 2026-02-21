"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGbaThemeStore } from "@/stores/gba-theme.store";
import { GbaThemePicker } from "./gba-theme-picker";

describe("GbaThemePicker", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useGbaThemeStore.persist.clearStorage();
    useGbaThemeStore.setState(useGbaThemeStore.getInitialState(), true);
  });

  it("renders all shell theme options", () => {
    render(<GbaThemePicker />);

    expect(screen.getByRole("button", { name: /purple shell/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /red shell/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /yellow shell/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /blue shell/i })).toBeVisible();
  });

  it("updates the selected theme", async () => {
    const user = userEvent.setup();
    render(<GbaThemePicker />);

    const blueButton = screen.getByRole("button", { name: /blue shell/i });
    await user.click(blueButton);

    expect(useGbaThemeStore.getState().theme).toBe("blue");
    expect(blueButton).toHaveAttribute("aria-pressed", "true");
  });
});
