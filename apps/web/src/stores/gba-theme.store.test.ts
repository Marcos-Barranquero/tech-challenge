import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_GBA_THEME,
  GBA_THEME_STORAGE_KEY,
  useGbaThemeStore,
} from "./gba-theme.store";

describe("gba theme store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useGbaThemeStore.persist.clearStorage();
    useGbaThemeStore.setState(useGbaThemeStore.getInitialState(), true);
  });

  it("defaults to purple", () => {
    expect(useGbaThemeStore.getState().theme).toBe(DEFAULT_GBA_THEME);
  });

  it("updates selected theme", () => {
    useGbaThemeStore.getState().setTheme("blue");
    expect(useGbaThemeStore.getState().theme).toBe("blue");
  });

  it("stores theme in localStorage", async () => {
    useGbaThemeStore.getState().setTheme("red");
    await useGbaThemeStore.persist.rehydrate();

    const raw = window.localStorage.getItem(GBA_THEME_STORAGE_KEY);
    expect(raw).toContain('"theme":"red"');
  });
});
