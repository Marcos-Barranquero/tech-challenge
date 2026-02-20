import { z } from "zod";

export const PokemonTypeSchema = z.enum([
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]);

export const GenerationSchema = z.enum([
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix",
]);

export const PokemonListItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  generation: GenerationSchema,
  types: z.array(PokemonTypeSchema).min(1),
  image: z.string().url(),
});

export const ListPokemonInputSchema = z.object({
  search: z.string().trim().default(""),
  type: PokemonTypeSchema.optional(),
  generation: GenerationSchema.optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(60).default(60),
  sort: z.enum(["id-asc"]).default("id-asc"),
});

export const ListPokemonOutputSchema = z.object({
  items: z.array(PokemonListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  hasNextPage: z.boolean(),
});

export const PokemonStatSchema = z.object({
  name: z.string(),
  value: z.number().int().nonnegative(),
});

export const EvolutionItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  image: z.string().url(),
  isCurrent: z.boolean(),
});

export const PokemonDetailInputSchema = z
  .object({
    id: z.number().int().positive().optional(),
    name: z.string().trim().min(1).optional(),
  })
  .refine((v) => v.id || v.name, {
    message: "Provide id or name",
  });

export const PokemonDetailOutputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  image: z.string().url(),
  generation: GenerationSchema,
  types: z.array(PokemonTypeSchema).min(1),
  stats: z.array(PokemonStatSchema).min(1),
  evolutions: z.array(EvolutionItemSchema).min(1),
});

export const SearchWithEvolutionsInputSchema = z.object({
  term: z.string().trim().min(1),
  limit: z.number().int().min(1).max(30).default(10),
});

export const SearchWithEvolutionsOutputSchema = z.object({
  groups: z.array(
    z.object({
      chainId: z.number().int().positive(),
      matches: z.array(PokemonListItemSchema).min(1),
    }),
  ),
});

export const PokemonAIDescriptionInputSchema = z.object({
  id: z.number().int().positive(),
  forceRegenerate: z.boolean().default(false),
  regenerationNonce: z.number().int().positive().optional(),
});

export const PokemonAIDescriptionOutputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  funFact: z.string().min(1).max(300),
  provider: z.string(),
  model: z.string(),
  generatedAt: z.string(),
});

export type PokemonType = z.infer<typeof PokemonTypeSchema>;
export type Generation = z.infer<typeof GenerationSchema>;
export type PokemonListItem = z.infer<typeof PokemonListItemSchema>;
export type ListPokemonInput = z.infer<typeof ListPokemonInputSchema>;
export type ListPokemonOutput = z.infer<typeof ListPokemonOutputSchema>;
export type PokemonDetailInput = z.infer<typeof PokemonDetailInputSchema>;
export type PokemonDetailOutput = z.infer<typeof PokemonDetailOutputSchema>;
export type SearchWithEvolutionsInput = z.infer<
  typeof SearchWithEvolutionsInputSchema
>;
export type SearchWithEvolutionsOutput = z.infer<
  typeof SearchWithEvolutionsOutputSchema
>;
export type PokemonAIDescriptionInput = z.infer<
  typeof PokemonAIDescriptionInputSchema
>;
export type PokemonAIDescriptionOutput = z.infer<
  typeof PokemonAIDescriptionOutputSchema
>;
