import { z } from "zod";
import type { SupportedLocale } from "@tech-challenge/shared";

type AiPokemonContext = {
  id: number;
  name: string;
  generation: string;
  locale: SupportedLocale;
  types: string[];
  stats: Array<{ name: string; value: number }>;
  evolutions: string[];
  variationSeed?: number;
};

const OLLAMA_RESPONSE_SCHEMA = z.object({
  response: z.string(),
});

const GROQ_RESPONSE_SCHEMA = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
      }),
    }),
  ).min(1),
});

const AI_DESCRIPTION_SCHEMA = z.object({
  funFact: z.string().min(1),
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

function clampFunFact(value: string, maxLength = 200): string {
  if (value.length <= maxLength) {
    return value;
  }

  const limited = value.slice(0, maxLength);
  const lastSentenceBreak = Math.max(
    limited.lastIndexOf("."),
    limited.lastIndexOf("!"),
    limited.lastIndexOf("?"),
  );

  if (lastSentenceBreak >= Math.floor(maxLength * 0.6)) {
    return limited.slice(0, lastSentenceBreak + 1).trim();
  }

  return `${limited.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
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
  const typeNames = context.types.join("/");

  const fallbackByLocale: Record<SupportedLocale, string> = {
    en: `${displayName} is a ${typeNames} Pokemon from ${displayGeneration} known for its distinctive habits in the wild.`,
    es: `${displayName} es un Pokemon de tipo ${typeNames} de ${displayGeneration}, conocido por sus habitos distintivos en estado salvaje.`,
    it: `${displayName} e un Pokemon di tipo ${typeNames} della ${displayGeneration}, noto per le sue abitudini distintive in natura.`,
    pt: `${displayName} e um Pokemon do tipo ${typeNames} da ${displayGeneration}, conhecido por seus habitos distintos na natureza.`,
    de: `${displayName} ist ein Pokemon vom Typ ${typeNames} aus ${displayGeneration}, bekannt fur seine besonderen Gewohnheiten in freier Wildbahn.`,
  };

  return {
    funFact: clampFunFact(normalizeDescription(fallbackByLocale[context.locale])),
    provider: "none",
    model: "none",
  };
}

function buildPrompt(context: AiPokemonContext): string {
  const languageByLocale: Record<SupportedLocale, string> = {
    en: "English",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    de: "German",
  };

  return [
    "You are a concise Pokemon world-lore writer.",
    "Return ONLY valid JSON with this exact shape: {\"funFact\":\"...\"}.",
    "No markdown, no extra keys, no explanations.",
    `Write the funFact in ${languageByLocale[context.locale]}.`,
    `Pokemon: ${context.name} (#${context.id}), ${context.generation}, types=${context.types.join("/")}.`,
    context.variationSeed ? `Variation seed: ${context.variationSeed}. Produce an alternative wording.` : "",
    "Hard constraints:",
    "- Do NOT mention evolutions, evolution chains, or pre/evolved forms.",
    "- Do NOT mention attacks, moves, combat strategy, battle performance, or stat values.",
    "- Do NOT mention that information is unavailable.",
    "Content focus:",
    "- Physical traits or anatomy, behavior/personality, habitat/ecosystem, daily habits, or role in the Pokemon world.",
    "- Keep it concrete and flavorful, avoiding generic filler.",
    "funFact: exactly 2 short sentences, informative and specific.",
    "Hard limit: maximum 200 characters including spaces and punctuation.",
  ].join("\n");
}

function resolveProvider(): "none" | "ollama" | "groq" | "auto" {
  const provider = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  if (provider === "none" || provider === "ollama" || provider === "groq" || provider === "auto") {
    return provider;
  }
  return "auto";
}

async function generateWithOllama(
  context: AiPokemonContext,
  timeoutMs: number,
  prompt: string,
): Promise<{ funFact: string; provider: string; model: string }> {
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
        prompt,
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
      funFact: clampFunFact(normalizeDescription(parsed.funFact)),
      provider: "ollama",
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function generateWithGroq(
  context: AiPokemonContext,
  timeoutMs: number,
  prompt: string,
): Promise<{ funFact: string; provider: string; model: string }> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new AiProviderError("Missing GROQ_API_KEY");
  }

  const url = process.env.GROQ_URL ?? "https://api.groq.com/openai/v1/chat/completions";
  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  const configuredMaxTokens = Number(process.env.AI_MAX_TOKENS ?? 80);
  const maxTokens = Number.isFinite(configuredMaxTokens)
    ? Math.max(24, Math.min(220, configuredMaxTokens))
    : 80;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a concise Pokemon world-lore writer. Return strictly JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new AiProviderError(`Groq request failed: ${response.status}`, response.status);
    }

    const payload = GROQ_RESPONSE_SCHEMA.parse(await response.json());

    let raw: unknown;
    try {
      raw = JSON.parse(payload.choices[0].message.content);
    } catch {
      throw new AiProviderError("Groq returned non-JSON content");
    }

    const parsed = AI_DESCRIPTION_SCHEMA.parse(raw);
    return {
      funFact: clampFunFact(normalizeDescription(parsed.funFact)),
      provider: "groq",
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generatePokemonDescription(context: AiPokemonContext): Promise<{
  funFact: string;
  provider: string;
  model: string;
}> {
  const provider = resolveProvider();
  const prompt = buildPrompt(context);

  if (provider === "none") {
    return buildDeterministicFallback(context);
  }

  const configuredTimeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60000);
  const timeoutMs = Number.isFinite(configuredTimeoutMs)
    ? Math.max(5000, configuredTimeoutMs)
    : 60000;

  try {
    if (provider === "groq") {
      return await generateWithGroq(context, timeoutMs, prompt);
    }
    return await generateWithOllama(context, timeoutMs, prompt);
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
  }
}
