import {
  GenerationSchema,
  ListPokemonInfiniteInputSchema,
  ListPokemonInputSchema,
  PokemonAIDescriptionInputSchema,
  PokemonDetailInputSchema,
  PokemonTypeSchema,
  SearchWithEvolutionsInputSchema,
} from "@tech-challenge/shared";
import { TRPCError } from "@trpc/server";
import { AiProviderError } from "../lib/ai-provider.js";
import { PokeApiError } from "../lib/pokeapi-client.js";
import {
  getPokemonDetail,
  listPokemonInfinite,
  listPokemon,
  searchWithEvolutions,
} from "../services/pokemon.service.js";
import { getPokemonAIDescription } from "../services/pokemon-ai.service.js";
import { createTRPCRouter, publicProcedure } from "./trpc.js";

export const pokemonRouter = createTRPCRouter({
  list: publicProcedure
    .input(ListPokemonInputSchema)
    .query(async ({ input }) => {
      try {
        return await listPokemon(input);
      } catch (error) {
        if (error instanceof PokeApiError) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "PokeAPI is unavailable",
            cause: error,
          });
        }
        throw error;
      }
    }),

  listInfinite: publicProcedure
    .input(ListPokemonInfiniteInputSchema)
    .query(async ({ input }) => {
      try {
        return await listPokemonInfinite(input);
      } catch (error) {
        if (error instanceof PokeApiError) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "PokeAPI is unavailable",
            cause: error,
          });
        }
        throw error;
      }
    }),

  detail: publicProcedure
    .input(PokemonDetailInputSchema)
    .query(async ({ input }) => {
      try {
        return await getPokemonDetail(input);
      } catch (error) {
        if (error instanceof PokeApiError) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "PokeAPI is unavailable",
            cause: error,
          });
        }
        throw error;
      }
    }),

  searchWithEvolutions: publicProcedure
    .input(SearchWithEvolutionsInputSchema)
    .query(async ({ input }) => {
      try {
        return await searchWithEvolutions(input);
      } catch (error) {
        if (error instanceof PokeApiError) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "PokeAPI is unavailable",
            cause: error,
          });
        }
        throw error;
      }
    }),

  aiDescription: publicProcedure
    .input(PokemonAIDescriptionInputSchema)
    .query(async ({ input }) => {
      try {
        return await getPokemonAIDescription(input);
      } catch (error) {
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
    }),

  meta: publicProcedure.query(() => ({
    types: PokemonTypeSchema.options,
    generations: GenerationSchema.options,
  })),
});
