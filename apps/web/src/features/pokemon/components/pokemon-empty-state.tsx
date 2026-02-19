export function PokemonEmptyState() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-blue-300 bg-white/70 p-12 text-center">
      <h3 className="text-2xl font-semibold text-poke-ink">No results found</h3>
      <p className="mt-2 text-poke-ink/70">Try another name or adjust your filters.</p>
    </div>
  );
}
