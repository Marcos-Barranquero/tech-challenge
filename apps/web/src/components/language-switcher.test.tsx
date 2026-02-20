"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageSwitcher } from "./language-switcher";
import { useLocaleStore } from "@/stores/locale.store";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en" });
  });

  it("switches locale in the store", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: /espanol/i }));

    expect(useLocaleStore.getState().locale).toBe("es");
  });
});
