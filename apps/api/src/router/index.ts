import { createTRPCRouter } from "./trpc.js";
import { pokemonRouter } from "./pokemon.js";

export const appRouter = createTRPCRouter({
  pokemon: pokemonRouter,
});

export type AppRouter = typeof appRouter;
