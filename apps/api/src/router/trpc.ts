import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import superjson from "superjson";
import { AiProviderError } from "../lib/ai-provider.js";
import { PokeApiError } from "../lib/pokeapi-client.js";

const t = initTRPC.create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export function mapProcedureError(error: unknown): never {
  if (error instanceof PokeApiError) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "PokeAPI is unavailable",
      cause: error,
    });
  }

  if (error instanceof AiProviderError) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "AI provider is unavailable",
      cause: error,
    });
  }

  throw error;
}

export async function withProcedureErrorMapping<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    return mapProcedureError(error);
  }
}
