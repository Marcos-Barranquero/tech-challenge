import {
  GenerationSchema,
  ListPokemonInfiniteInputSchema,
  ListPokemonInputSchema,
  PokemonAIDescriptionInputSchema,
  PokemonDetailInputSchema,
  PokemonTypeSchema,
  SearchWithEvolutionsInputSchema,
} from "@tech-challenge/shared";
import {
  getPokemonDetail,
  listPokemonInfinite,
  listPokemon,
  searchWithEvolutions,
} from "../services/pokemon.service.js";
import { getPokemonAIDescription } from "../services/pokemon-ai.service.js";
import { createTRPCRouter, publicProcedure, withProcedureErrorMapping } from "./trpc.js";

export const pokemonRouter = createTRPCRouter({
  list: publicProcedure
    .input(ListPokemonInputSchema)
    .query(({ input }) => withProcedureErrorMapping(() => listPokemon(input))),

  listInfinite: publicProcedure
    .input(ListPokemonInfiniteInputSchema)
    .query(({ input }) => withProcedureErrorMapping(() => listPokemonInfinite(input))),

  detail: publicProcedure
    .input(PokemonDetailInputSchema)
    .query(({ input }) => withProcedureErrorMapping(() => getPokemonDetail(input))),

  searchWithEvolutions: publicProcedure
    .input(SearchWithEvolutionsInputSchema)
    .query(({ input }) => withProcedureErrorMapping(() => searchWithEvolutions(input))),

  aiDescription: publicProcedure
    .input(PokemonAIDescriptionInputSchema)
    .query(({ input }) => withProcedureErrorMapping(() => getPokemonAIDescription(input))),

  meta: publicProcedure.query(() => ({
    types: PokemonTypeSchema.options,
    generations: GenerationSchema.options,
  })),
});
