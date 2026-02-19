import {
  GenerationSchema,
  ListPokemonInputSchema,
  PokemonDetailInputSchema,
  PokemonTypeSchema,
  SearchWithEvolutionsInputSchema,
} from "@tech-challenge/shared";
import { TRPCError } from "@trpc/server";
import { PokeApiError } from "../lib/pokeapi-client.js";
import {
  getPokemonDetail,
  listPokemon,
  searchWithEvolutions,
} from "../services/pokemon.service.js";
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

  meta: publicProcedure.query(() => ({
    types: PokemonTypeSchema.options,
    generations: GenerationSchema.options,
  })),
});
