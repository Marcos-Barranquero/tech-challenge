import { z } from "zod";

type AiPokemonContext = {
  id: number;
  name: string;
  generation: string;
  types: string[];
  stats: Array<{ name: string; value: number }>;
  evolutions: string[];
  variationSeed?: number;
};

const OLLAMA_RESPONSE_SCHEMA = z.object({
  response: z.string(),
});

const AI_DESCRIPTION_SCHEMA = z.object({
  funFact: z.string().min(1).max(300),
});

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

function normalizeDescription(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toDisplayName(name: string): string {
  return name.length > 0 ? name.charAt(0).toUpperCase() + name.slice(1) : name;
}

function toDisplayGeneration(generation: string): string {
  const rawRoman = generation.replace(/^generation-/, "");
  return `generation ${rawRoman.toUpperCase()}`;
}

function buildDeterministicFallback(context: AiPokemonContext): {
  funFact: string;
  provider: string;
  model: string;
} {
  const displayName = toDisplayName(context.name);
  const displayGeneration = toDisplayGeneration(context.generation);

  return {
    funFact: normalizeDescription(
      `${displayName} is a ${context.types.join("/")} Pokemon from ${displayGeneration} and appears in an evolution chain with ${context.evolutions.length} stage(s).`,
    ),
    provider: "none",
    model: "none",
  };
}

function buildPrompt(context: AiPokemonContext): string {
  const topStats = [...context.stats]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((s) => `${s.name}:${s.value}`)
    .join(", ");

  return [
    "You are a concise Pokemon analyst.",
    "Return ONLY valid JSON with this exact shape: {\"funFact\":\"...\"}.",
    "No markdown, no extra keys, no explanations.",
    `Pokemon: ${context.name} (#${context.id}), ${context.generation}, types=${context.types.join("/")}, top_stats=${topStats}.`,
    `Evolution chain members: ${context.evolutions.join(" -> ")}.`,
    context.variationSeed ? `Variation seed: ${context.variationSeed}. Produce an alternative wording.` : "",
    "funFact: exactly 2 short sentences, first sentence a concise description and second sentence a specific trivia detail tied to this pokemon or its evolution chain.",
  ].join("\n");
}

export async function generatePokemonDescription(context: AiPokemonContext): Promise<{
  funFact: string;
  provider: string;
  model: string;
}> {
  const provider = (process.env.AI_PROVIDER ?? "auto").toLowerCase();

  if (provider === "none") {
    return buildDeterministicFallback(context);
  }

  const ollamaUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "qwen2:0.5b";
  const configuredMaxTokens = Number(process.env.AI_MAX_TOKENS ?? 80);
  const maxTokens = Number.isFinite(configuredMaxTokens)
    ? Math.max(24, Math.min(160, configuredMaxTokens))
    : 80;
  const configuredNumCtx = Number(process.env.AI_NUM_CTX ?? 1024);
  const numCtx = Number.isFinite(configuredNumCtx)
    ? Math.max(256, Math.min(2048, configuredNumCtx))
    : 1024;
  const configuredTimeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60000);
  const timeoutMs = Number.isFinite(configuredTimeoutMs)
    ? Math.max(5000, configuredTimeoutMs)
    : 60000;

  const seed =
    typeof context.variationSeed === "number" && Number.isFinite(context.variationSeed)
      ? Math.abs(Math.trunc(context.variationSeed))
      : undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        options: {
          temperature: seed ? 0.35 : 0.1,
          num_predict: maxTokens,
          num_ctx: numCtx,
          ...(seed ? { seed } : {}),
        },
        prompt: buildPrompt(context),
      }),
    });

    if (!response.ok) {
      throw new AiProviderError(`Ollama request failed: ${response.status}`, response.status);
    }

    const payload = OLLAMA_RESPONSE_SCHEMA.parse(await response.json());

    let raw: unknown;
    try {
      raw = JSON.parse(payload.response);
    } catch {
      throw new AiProviderError("Ollama returned non-JSON content");
    }

    const parsed = AI_DESCRIPTION_SCHEMA.parse(raw);
    return {
      funFact: normalizeDescription(parsed.funFact),
      provider: "ollama",
      model,
    };
  } catch (error) {
    if (provider === "auto") {
      return buildDeterministicFallback(context);
    }

    if (error instanceof AiProviderError) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new AiProviderError("Invalid AI output shape");
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiProviderError("AI provider timeout", 408);
    }
    throw new AiProviderError("Unexpected AI provider error");
  } finally {
    clearTimeout(timeout);
  }
}
