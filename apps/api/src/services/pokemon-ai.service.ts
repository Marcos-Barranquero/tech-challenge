import {
  PokemonAIDescriptionOutputSchema,
  type PokemonAIDescriptionInput,
  type PokemonAIDescriptionOutput,
} from "@tech-challenge/shared";
import { getOrSetCache } from "../lib/cache.js";
import { generatePokemonDescription } from "../lib/ai-provider.js";
import { getPokemonDetail } from "./pokemon.service.js";

export async function getPokemonAIDescription(
  input: PokemonAIDescriptionInput,
): Promise<PokemonAIDescriptionOutput> {
  const detail = await getPokemonDetail({ id: input.id });

  const provider = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  const model = process.env.OLLAMA_MODEL ?? "qwen2:0.5b";
  const cacheKey = `pokemon:${input.id}:ai-description:${provider}:${model}:v2`;

  const createResponse = async () => {
    const generated = await generatePokemonDescription({
      id: detail.id,
      name: detail.name,
      generation: detail.generation,
      types: detail.types,
      stats: detail.stats,
      evolutions: detail.evolutions.map((e) => e.name),
      variationSeed: input.regenerationNonce,
    });

    return PokemonAIDescriptionOutputSchema.parse({
      id: detail.id,
      name: detail.name,
      funFact: generated.funFact,
      provider: generated.provider,
      model: generated.model,
      generatedAt: new Date().toISOString(),
    });
  };

  if (input.forceRegenerate) {
    return createResponse();
  }

  return getOrSetCache(cacheKey, createResponse, 1000 * 60 * 60 * 24);
}
