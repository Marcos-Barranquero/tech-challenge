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

  const envProvider = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  const requestedProvider = input.aiProvider ?? "default";
  const ollamaModel = process.env.OLLAMA_MODEL ?? "qwen2:0.5b";
  const groqModel = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  const cacheKey = `pokemon:${input.id}:ai-description:${input.locale}:${envProvider}:${requestedProvider}:${ollamaModel}:${groqModel}:v4`;

  const createResponse = async () => {
    const generated = await generatePokemonDescription({
      id: detail.id,
      name: detail.name,
      locale: input.locale,
      generation: detail.generation,
      types: detail.types,
      stats: detail.stats,
      evolutions: detail.evolutions.map((e) => e.name),
      variationSeed: input.regenerationNonce,
      requestedProvider: input.aiProvider,
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
