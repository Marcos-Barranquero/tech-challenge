"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    toast.error(error.message || "An unexpected error occurred.");
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h2 className="text-3xl font-semibold text-poke-ink">Pokedex Error</h2>
      <p className="mt-3 text-base text-poke-ink/80">Could not load data.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 cursor-pointer rounded-2xl border-2 border-poke-primary bg-white px-5 py-3 font-semibold text-poke-primary shadow-claySoft transition-transform duration-200 ease-poke hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-primary"
      >
        Retry
      </button>
    </main>
  );
}
