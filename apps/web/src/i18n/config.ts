import type { SupportedLocale } from "@tech-challenge/shared";

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const SUPPORTED_LOCALES = ["en", "es", "it", "pt", "de"] as const satisfies ReadonlyArray<SupportedLocale>;

export type LocaleOption = {
  locale: SupportedLocale;
  label: string;
  shortLabel: string;
  flag: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { locale: "en", label: "English", shortLabel: "EN", flag: "🇬🇧" },
  { locale: "es", label: "Español", shortLabel: "ES", flag: "🇪🇸" },
  { locale: "it", label: "Italiano", shortLabel: "IT", flag: "🇮🇹" },
  { locale: "pt", label: "Português", shortLabel: "PT", flag: "🇵🇹" },
  { locale: "de", label: "Deutsch", shortLabel: "DE", flag: "🇩🇪" },
];
