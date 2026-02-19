export function PokemonListSkeleton() {
  return (
    <div className="screen-grid">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="h-56 animate-pulse rounded-2xl border-2 border-blue-100 bg-white/70" />
      ))}
    </div>
  );
}
