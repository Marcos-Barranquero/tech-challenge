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
  },
  search: {
    label: "Search Pokemon and evolutions",
    placeholder: "Search (e.g. pikachu)...",
  },
  filters: {
    typeLabel: "Type",
    generationLabel: "Generation",
    typeAll: "Type: All",
    generationAll: "Generation: All",
    clear: "Clear",
  },
  empty: {
    title: "No results found",
    subtitle: "Try another name or adjust your filters.",
  },
  detail: {
    back: "Back",
    funFact: "Fun Fact",
    loadingFunFact: "Loading AI fun fact...",
    unavailableFunFact: "AI fun fact unavailable right now.",
    generating: "Generating...",
    another: "Another",
    stats: "Stats",
    evolutions: "Evolutions",
    generationShort: "Gen",
  },
};

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslations:
    (namespace: string) =>
    (key: string): string =>
      EN_MESSAGES[namespace]?.[key] ?? `${namespace}.${key}`,
}));
