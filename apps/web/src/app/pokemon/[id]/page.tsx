import { PokemonDetailView } from "@/features/pokemon/components/pokemon-detail-view";

export default async function PokemonDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PokemonDetailView id={Number(id)} />;
}
