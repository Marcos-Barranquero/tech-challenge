"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { type GbaTheme, useGbaThemeStore } from "@/stores/gba-theme.store";

type ThemeOption = {
  value: GbaTheme;
  swatchClassName: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { value: "purple", swatchClassName: "bg-[#7f67be]" },
  { value: "red", swatchClassName: "bg-[#b54646]" },
  { value: "yellow", swatchClassName: "bg-[#ccb245]" },
  { value: "blue", swatchClassName: "bg-[#4176bf]" },
];

export function GbaThemePicker() {
  const t = useTranslations("common");
  const theme = useGbaThemeStore((state) => state.theme);
  const setTheme = useGbaThemeStore((state) => state.setTheme);

  const options = useMemo(
    () =>
      THEME_OPTIONS.map((option) => ({
        ...option,
        label: t(`theme.${option.value}`),
      })),
    [t],
  );

  return (
    <div
      className="gba-theme-picker rounded-lg border-2 border-[#2b2f45] bg-[#10131c]/95 p-2 shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
      role="group"
      aria-label={t("shellColorSelector")}
    >
      <div className="flex items-center gap-2">
        {options.map((option) => {
          const isActive = option.value === theme;

          return (
            <button
              key={option.value}
              type="button"
              aria-label={option.label}
              title={option.label}
              aria-pressed={isActive}
              onClick={() => setTheme(option.value)}
              className={`h-6 w-6 rounded-sm border-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8e353] ${
                isActive
                  ? "border-[#f8e353] scale-105 shadow-[0_0_0_2px_rgba(248,227,83,0.3)]"
                  : "border-[#d1d5db]/80 hover:scale-105"
              }`}
            >
              <span aria-hidden="true" className={`block h-full w-full rounded-[2px] ${option.swatchClassName}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
