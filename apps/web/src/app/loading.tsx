export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-14 w-56 animate-pulse rounded-2xl bg-white/70" />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-3xl bg-white/70" />
        ))}
      </div>
    </main>
  );
}
