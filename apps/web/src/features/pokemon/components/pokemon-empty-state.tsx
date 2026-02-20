import { useTranslations } from "next-intl";

export function PokemonEmptyState() {
  const t = useTranslations("empty");

  return (
    <div className="rounded-md border-2 border-dashed border-[#6f63a7] bg-[#f4f1ff]/90 p-12 text-center">
      <h3 className="gba-ui-font text-sm text-[#1f2033]">{t("title")}</h3>
      <p className="gba-ui-font mt-3 text-[9px] text-[#4b4d71]">{t("subtitle")}</p>
    </div>
  );
}
