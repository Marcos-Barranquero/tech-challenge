export function PokemonEmptyState() {
  return (
    <div className="rounded-md border-2 border-dashed border-[#6f63a7] bg-[#f4f1ff]/90 p-12 text-center">
      <h3 className="gba-ui-font text-sm text-[#1f2033]">No results found</h3>
      <p className="gba-ui-font mt-3 text-[9px] text-[#4b4d71]">Try another name or adjust your filters.</p>
    </div>
  );
}
