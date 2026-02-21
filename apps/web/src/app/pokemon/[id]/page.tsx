import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail-view";
import type { PokemonDetailOutput } from "@tech-challenge/shared";
import { notFound } from "next/navigation";

function getApiBaseUrl(): string {
  return (
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000"
  );
}

async function fetchPokemonDetailFromServer(id: number): Promise<PokemonDetailOutput | undefined> {
  const apiBase = getApiBaseUrl();

  const response = await fetch(`${apiBase}/api/v1/pokemon/${id}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return undefined;
  }

  const payload = (await response.json()) as Partial<PokemonDetailOutput>;
  if (typeof payload.id !== "number" || payload.id <= 0) {
    return undefined;
  }

  if (
    typeof payload.name !== "string" ||
    typeof payload.image !== "string" ||
    !Array.isArray(payload.types) ||
    !Array.isArray(payload.stats) ||
    !Array.isArray(payload.evolutions)
  ) {
    return undefined;
  }

  return payload as PokemonDetailOutput;
}

export default async function PokemonDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const initialData = await fetchPokemonDetailFromServer(id);
  return <PokemonDetailView id={id} initialData={initialData} />;
}
