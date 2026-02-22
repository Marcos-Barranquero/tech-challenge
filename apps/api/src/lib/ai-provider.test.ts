import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generatePokemonDescription } from "./ai-provider.js";

const context = {
  id: 25,
  name: "pikachu",
  locale: "es" as const,
  generation: "generation-i",
  types: ["electric"],
  stats: [
    { name: "speed", value: 90 },
    { name: "attack", value: 55 },
  ],
  evolutions: ["pichu", "pikachu", "raichu"],
};

describe("ai-provider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.AI_PROVIDER;
    delete process.env.OLLAMA_URL;
    delete process.env.OLLAMA_MODEL;
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_MODEL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns deterministic fallback when provider is none", async () => {
    process.env.AI_PROVIDER = "none";

    const result = await generatePokemonDescription(context);

    expect(result.provider).toBe("none");
    expect(result.model).toBe("none");
    expect(result.funFact.toLowerCase()).toContain("pikachu");
  });

  it("returns parsed ollama response when provider is auto and request succeeds", async () => {
    process.env.AI_PROVIDER = "auto";

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            response: JSON.stringify({
              funFact: "Pikachu stores electricity in its cheeks. It can release powerful sparks when startled.",
            }),
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await generatePokemonDescription(context);

    expect(result.provider).toBe("ollama");
    expect(result.funFact).toContain("Pikachu");
  });

  it("falls back when provider is auto and request fails", async () => {
    process.env.AI_PROVIDER = "auto";

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      }),
    );

    const result = await generatePokemonDescription(context);

    expect(result.provider).toBe("none");
    expect(result.funFact.toLowerCase()).toContain("pikachu");
  });

  it("returns parsed groq response when provider is groq and request succeeds", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-key";
    process.env.GROQ_MODEL = "llama-3.1-8b-instant";

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    funFact: "Pikachu stores electricity in its cheeks. Its electric sacs can power strong sparks.",
                  }),
                },
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    const result = await generatePokemonDescription(context);

    expect(result.provider).toBe("groq");
    expect(result.model).toBe("llama-3.1-8b-instant");
    expect(result.funFact).toContain("Pikachu");
  });
});
