"use client";

import { useTranslations } from "next-intl";
import { LOCALE_OPTIONS } from "@/i18n/config";
import { useLocaleStore } from "@/stores/locale.store";

export function LanguageSwitcher() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const t = useTranslations("common");

  return (
    <div className="rounded-lg border-2 border-[#5a4d8f] bg-[#ece8ff]/95 p-1 shadow-[0_4px_0_#4c3d7d,0_8px_14px_rgba(37,30,77,0.2)]">
      <div className="flex items-center gap-1" role="group" aria-label={t("languageSelector")}>
        {LOCALE_OPTIONS.map((option) => {
          const isActive = option.locale === locale;

          return (
            <button
              key={option.locale}
              type="button"
              onClick={() => setLocale(option.locale)}
              aria-label={option.label}
              aria-pressed={isActive}
              className={`gba-ui-font inline-flex h-9 min-w-12 items-center justify-center gap-1 rounded-md border-2 px-2 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] ${
                isActive
                  ? "border-[#4f46e5] bg-[#dcd7ff] text-[#1f2033]"
                  : "border-[#7a6cae] bg-[#f7f5ff] text-[#3d336b] hover:-translate-y-0.5"
              }`}
            >
              <span aria-hidden="true">{option.flag}</span>
              <span>{option.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
