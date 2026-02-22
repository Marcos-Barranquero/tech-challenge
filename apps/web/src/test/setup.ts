import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) => React.createElement("img", { src, alt, ...props }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children),
}));

const EN_MESSAGES: Record<string, Record<string, string>> = {
  common: {
    languageSelector: "Language selector",
    shellColorSelector: "Shell color selector",
    pokedexTitle: "POKEDEX",
    rotateTitle: "Portrait mode only",
    rotateBody: "Rotate your phone to portrait to continue.",
    "theme.purple": "Purple shell",
    "theme.red": "Red shell",
    "theme.yellow": "Yellow shell",
    "theme.blue": "Blue shell",
  },
  search: {
    label: "Search Pokemon and evolutions",
    placeholder: "Search (e.g. pikachu)...",
  },
  filters: {
    typeLabel: "Type",
    generationLabel: "Generation",
    typeAll: "Type...",
    generationAll: "Generation...",
    clear: "Clear",
  },
  empty: {
    title: "No results found",
    subtitle: "Try another name or adjust your filters.",
    hint: "You can clear active filters and search to explore the full Pokedex again.",
    cta: "Reset filters",
  },
  detail: {
    back: "Back",
    funFact: "Fun Fact",
    aiProviderLabel: "AI provider",
    aiProviderNone: "No AI",
    aiProviderOllama: "Ollama Local",
    aiProviderGroq: "Groq API",
    loadingFunFact: "Loading AI fun fact...",
    unavailableFunFact: "AI fun fact unavailable right now.",
    generating: "Generating...",
    another: "Another",
    stats: "Stats",
    evolutions: "Evolutions",
    generationShort: "Gen",
    "statsNames.hp": "HP",
    "statsNames.attack": "Attack",
    "statsNames.defense": "Defense",
    "statsNames.special-attack": "Special Attack",
    "statsNames.special-defense": "Special Defense",
    "statsNames.speed": "Speed",
  },
};

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslations:
    (namespace: string) =>
    (key: string): string =>
      EN_MESSAGES[namespace]?.[key] ?? `${namespace}.${key}`,
}));
