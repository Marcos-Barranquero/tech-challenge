export function PokemonListSkeleton() {
  return (
    <div className="screen-grid">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="aspect-square h-full animate-pulse rounded-md border-[3px] border-[#5b4d91] bg-[#ece8ff]/85" />
      ))}
    </div>
  );
}
