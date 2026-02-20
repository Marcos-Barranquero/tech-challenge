import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
  GenerationSchema,
  ListPokemonInputSchema,
  ListPokemonOutputSchema,
  PokemonDetailOutputSchema,
  PokemonTypeSchema,
  SearchWithEvolutionsInputSchema,
  SearchWithEvolutionsOutputSchema,
} from "@tech-challenge/shared";
import { z } from "zod";
import { API_PREFIX, OPENAPI_SPEC_VERSION } from "./version.js";

extendZodWithOpenApi(z);

const BaseErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

const ValidationErrorSchema = BaseErrorSchema.extend({
  code: z.literal("BAD_REQUEST"),
  issues: z.array(z.unknown()),
});

const NotFoundErrorSchema = BaseErrorSchema.extend({
  code: z.literal("NOT_FOUND"),
});

const UpstreamErrorSchema = BaseErrorSchema.extend({
  code: z.literal("BAD_GATEWAY"),
  endpoint: z.string().optional(),
  status: z.number().int().optional(),
});

const InternalErrorSchema = BaseErrorSchema.extend({
  code: z.literal("INTERNAL_SERVER_ERROR"),
});

const MetaOutputSchema = z.object({
  types: z.array(PokemonTypeSchema),
  generations: z.array(GenerationSchema),
});

const PokemonPathParamsSchema = z.object({
  id: z.number().int().positive(),
});

function createRegistry() {
  const registry = new OpenAPIRegistry();

  registry.register("ListPokemonInput", ListPokemonInputSchema);
  registry.register("ListPokemonOutput", ListPokemonOutputSchema);
  registry.register("PokemonDetailOutput", PokemonDetailOutputSchema);
  registry.register("SearchWithEvolutionsInput", SearchWithEvolutionsInputSchema);
  registry.register("SearchWithEvolutionsOutput", SearchWithEvolutionsOutputSchema);
  registry.register("MetaOutput", MetaOutputSchema);
  registry.register("ValidationError", ValidationErrorSchema);
  registry.register("NotFoundError", NotFoundErrorSchema);
  registry.register("UpstreamError", UpstreamErrorSchema);
  registry.register("InternalError", InternalErrorSchema);

  registry.registerPath({
    method: "get",
    path: `${API_PREFIX}/pokemon`,
    summary: "List Pokemon",
    description:
      "Returns Pokemon list sorted by ID with optional search, type, and generation filters.",
    request: {
      query: ListPokemonInputSchema,
    },
    responses: {
      200: {
        description: "List result",
        content: {
          "application/json": {
            schema: ListPokemonOutputSchema,
          },
        },
      },
      400: {
        description: "Invalid request input",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
          },
        },
      },
      502: {
        description: "Upstream PokeAPI unavailable",
        content: {
          "application/json": {
            schema: UpstreamErrorSchema,
          },
        },
      },
      500: {
        description: "Unexpected server error",
        content: {
          "application/json": {
            schema: InternalErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: `${API_PREFIX}/pokemon/{id}`,
    summary: "Get Pokemon detail",
    description: "Returns Pokemon detail, stats, and ordered evolution chain.",
    request: {
      params: PokemonPathParamsSchema,
    },
    responses: {
      200: {
        description: "Pokemon detail",
        content: {
          "application/json": {
            schema: PokemonDetailOutputSchema,
          },
        },
      },
      400: {
        description: "Invalid request input",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
          },
        },
      },
      404: {
        description: "Pokemon not found",
        content: {
          "application/json": {
            schema: NotFoundErrorSchema,
          },
        },
      },
      502: {
        description: "Upstream PokeAPI unavailable",
        content: {
          "application/json": {
            schema: UpstreamErrorSchema,
          },
        },
      },
      500: {
        description: "Unexpected server error",
        content: {
          "application/json": {
            schema: InternalErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: `${API_PREFIX}/pokemon/search/evolutions`,
    summary: "Search with evolutions",
    description:
      "Searches Pokemon by name and returns complete evolution groups for all matches.",
    request: {
      query: SearchWithEvolutionsInputSchema,
    },
    responses: {
      200: {
        description: "Search grouped by evolution chain",
        content: {
          "application/json": {
            schema: SearchWithEvolutionsOutputSchema,
          },
        },
      },
      400: {
        description: "Invalid request input",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
          },
        },
      },
      502: {
        description: "Upstream PokeAPI unavailable",
        content: {
          "application/json": {
            schema: UpstreamErrorSchema,
          },
        },
      },
      500: {
        description: "Unexpected server error",
        content: {
          "application/json": {
            schema: InternalErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: `${API_PREFIX}/pokemon/meta`,
    summary: "Get metadata",
    description: "Returns supported Pokemon types and generations.",
    responses: {
      200: {
        description: "Metadata",
        content: {
          "application/json": {
            schema: MetaOutputSchema,
          },
        },
      },
    },
  });

  return registry;
}

export function getOpenApiDocument(serverUrl?: string) {
  const registry = createRegistry();
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const servers = serverUrl ? [{ url: serverUrl }] : [{ url: "http://localhost:4000" }];

  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Tech Challenge Pokemon API",
      version: OPENAPI_SPEC_VERSION,
      description:
        "Versioned OpenAPI contract generated from shared Zod schemas (single source of truth).",
    },
    servers,
  });
}
