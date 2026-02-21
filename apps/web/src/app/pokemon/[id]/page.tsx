import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail-view";
import { PokemonDetailOutputSchema, type PokemonDetailOutput } from "@tech-challenge/shared";
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

  const payload = await response.json();
  const parsed = PokemonDetailOutputSchema.safeParse(payload);
  return parsed.success ? parsed.data : undefined;
}

export default async function PokemonDetailPage({
  params
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const initialData = await fetchPokemonDetailFromServer(id);
  return <PokemonDetailView id={id} initialData={initialData} />;
}
