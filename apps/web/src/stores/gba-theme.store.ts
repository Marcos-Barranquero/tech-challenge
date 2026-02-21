import { create } from "zustand";
import { persist } from "zustand/middleware";

export const GBA_THEMES = ["purple", "red", "yellow", "blue"] as const;
export const GBA_THEME_STORAGE_KEY = "pokedex-gba-theme";

export type GbaTheme = (typeof GBA_THEMES)[number];

type GbaThemeState = {
  theme: GbaTheme;
};

type GbaThemeActions = {
  setTheme: (theme: GbaTheme) => void;
};

export type GbaThemeStore = GbaThemeState & GbaThemeActions;

export const DEFAULT_GBA_THEME: GbaTheme = "purple";

function isGbaTheme(value: string): value is GbaTheme {
  return (GBA_THEMES as readonly string[]).includes(value);
}

export const useGbaThemeStore = create<GbaThemeStore>()(
  persist(
    (set) => ({
      theme: DEFAULT_GBA_THEME,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: GBA_THEME_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
      merge: (persistedState, currentState) => {
        const state = (persistedState ?? {}) as Partial<GbaThemeState>;
        if (!state.theme || !isGbaTheme(state.theme)) {
          return currentState;
        }
        return { ...currentState, theme: state.theme };
      },
    },
  ),
);
