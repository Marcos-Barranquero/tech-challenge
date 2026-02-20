import type { SupportedLocale } from "@tech-challenge/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/i18n/config";

type LocaleState = {
  locale: SupportedLocale;
};

type LocaleActions = {
  setLocale: (locale: SupportedLocale) => void;
};

export type LocaleStore = LocaleState & LocaleActions;

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "pokedex-locale",
      partialize: (state) => ({ locale: state.locale }),
      merge: (persistedState, currentState) => {
        const state = (persistedState ?? {}) as Partial<LocaleState>;
        if (!state.locale || !isSupportedLocale(state.locale)) {
          return currentState;
        }
        return { ...currentState, locale: state.locale };
      },
    },
  ),
);
