import cors from "@fastify/cors";
import pLimit from "p-limit";
import {
  GenerationSchema,
  ListPokemonInputSchema,
  PokemonDetailInputSchema,
  PokemonTypeSchema,
  SearchWithEvolutionsInputSchema,
} from "@tech-challenge/shared";
import { TRPCError } from "@trpc/server";
import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { ZodError } from "zod";
import { PokeApiError } from "./lib/pokeapi-client.js";
import { getOpenApiDocument } from "./openapi/spec.js";
import { API_PREFIX, API_VERSION } from "./openapi/version.js";
import { appRouter } from "./router/index.js";
import {
  getPokemonDetail,
  listPokemon,
  searchWithEvolutions,
} from "./services/pokemon.service.js";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";
const CACHE_WARMUP_DELAY_MS = Number(process.env.CACHE_WARMUP_DELAY_MS ?? 500);
const CACHE_WARMUP_MODE = (process.env.CACHE_WARMUP_MODE ?? "initial").toLowerCase();
const CACHE_WARMUP_PAGE_SIZE = Number(process.env.CACHE_WARMUP_PAGE_SIZE ?? 60);
const CACHE_WARMUP_CONCURRENCY = Math.max(1, Number(process.env.CACHE_WARMUP_CONCURRENCY ?? 2));
const CACHE_WARMUP_ENABLED = (process.env.CACHE_WARMUP_ENABLED ?? "true").toLowerCase() !== "false";

function getAllowedCorsOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (envOrigins && envOrigins.length > 0) {
    return envOrigins;
  }

  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

function createCorsOriginValidator(allowedOrigins: string[]) {
  return (origin: string | undefined, callback: (error: Error | null, allow: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    callback(null, allowedOrigins.includes(origin));
  };
}

async function warmupCache(mode: "initial" | "full") {
  const pageSize = Number.isFinite(CACHE_WARMUP_PAGE_SIZE)
    ? Math.max(1, Math.min(60, CACHE_WARMUP_PAGE_SIZE))
    : 60;

  if (mode === "full") {
    const firstPage = await listPokemon({
      search: "",
      page: 1,
      pageSize,
      sort: "id-asc",
    });

    if (!firstPage.hasNextPage) {
      return;
    }

    const totalPages = Math.ceil(firstPage.total / pageSize);
    const limit = pLimit(CACHE_WARMUP_CONCURRENCY);
    const remainingPages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);

    await Promise.all(
      remainingPages.map((page) =>
        limit(() =>
          listPokemon({
            search: "",
            page,
            pageSize,
            sort: "id-asc",
          }),
        ),
      ),
    );
    return;
  }

  // Preload index + first page only.
  await listPokemon({
    search: "",
    page: 1,
    pageSize,
    sort: "id-asc",
  });
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function parseTypeList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const fromArray = value
      .flatMap((entry) => (typeof entry === "string" ? entry.split(",") : []))
      .map((entry) => entry.trim())
      .filter(Boolean);
    return fromArray.length > 0 ? fromArray : undefined;
  }
  if (typeof value === "string") {
    const fromCsv = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    return fromCsv.length > 0 ? fromCsv : undefined;
  }
  return undefined;
}

function sendRouteError(reply: { code: (statusCode: number) => { send: (payload: unknown) => void } }, error: unknown): void {
  if (error instanceof ZodError) {
    reply.code(400).send({
      error: "Invalid request input",
      code: "BAD_REQUEST",
      issues: error.issues,
    });
    return;
  }

  if (error instanceof TRPCError && error.code === "NOT_FOUND") {
    reply.code(404).send({
      error: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof PokeApiError) {
    reply.code(502).send({
      error: "PokeAPI is unavailable",
      code: "BAD_GATEWAY",
      endpoint: error.endpoint,
      status: error.status,
    });
    return;
  }

  reply.code(500).send({
    error: "Unexpected server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}

async function bootstrap() {
  const app = Fastify({
    logger: true,
  });
  const allowedOrigins = getAllowedCorsOrigins();

  await app.register(cors, {
    origin: createCorsOriginValidator(allowedOrigins),
    credentials: true,
  });

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: () => ({}),
    },
  });

  app.get("/health", async () => ({ ok: true }));

  app.get(`/openapi/${API_VERSION}.json`, async (request) => {
    const baseUrl = `${request.protocol}://${request.hostname}:${PORT}`;
    return getOpenApiDocument(baseUrl);
  });

  app.get("/docs", async (_request, reply) => {
    reply.header("content-type", "text/html; charset=utf-8");
    reply.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pokedex API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi/${API_VERSION}.json',
        dom_id: '#swagger-ui',
      });
    </script>
  </body>
</html>`);
  });

  app.get(`${API_PREFIX}/pokemon`, async (request, reply) => {
    try {
      const query = request.query as Record<string, unknown>;
      const input = ListPokemonInputSchema.parse({
        search: typeof query.search === "string" ? query.search : "",
        types: parseTypeList(query.types),
        type: typeof query.type === "string" ? query.type : undefined,
        generation: typeof query.generation === "string" ? query.generation : undefined,
        page: parseNumber(query.page) ?? 1,
        pageSize: parseNumber(query.pageSize) ?? 60,
        sort: "id-asc",
      });

      const result = await listPokemon(input);
      reply.send(result);
    } catch (error) {
      sendRouteError(reply, error);
    }
  });

  app.get(`${API_PREFIX}/pokemon/:id`, async (request, reply) => {
    try {
      const params = request.params as { id?: string };
      const input = PokemonDetailInputSchema.parse({
        id: parseNumber(params.id),
      });

      const result = await getPokemonDetail(input);
      reply.send(result);
    } catch (error) {
      sendRouteError(reply, error);
    }
  });

  app.get(`${API_PREFIX}/pokemon/search/evolutions`, async (request, reply) => {
    try {
      const query = request.query as Record<string, unknown>;
      const input = SearchWithEvolutionsInputSchema.parse({
        term: typeof query.term === "string" ? query.term : "",
        limit: parseNumber(query.limit) ?? 10,
      });

      const result = await searchWithEvolutions(input);
      reply.send(result);
    } catch (error) {
      sendRouteError(reply, error);
    }
  });

  app.get(`${API_PREFIX}/pokemon/meta`, async (_request, reply) => {
    reply.send({
      types: PokemonTypeSchema.options,
      generations: GenerationSchema.options,
    });
  });

  await app.listen({ port: PORT, host: HOST });

  if (!CACHE_WARMUP_ENABLED) {
    app.log.info("Cache warm-up disabled by CACHE_WARMUP_ENABLED=false");
    return;
  }

  setTimeout(() => {
    void (async () => {
      const mode = CACHE_WARMUP_MODE === "full" ? "full" : "initial";
      app.log.info({ mode, concurrency: CACHE_WARMUP_CONCURRENCY }, "Starting cache warm-up job");
      const startedAt = Date.now();
      try {
        await warmupCache(mode);
        app.log.info({ durationMs: Date.now() - startedAt, mode }, "Cache warm-up completed");
      } catch (error) {
        app.log.error({ err: error }, "Cache warm-up failed");
      }
    })();
  }, CACHE_WARMUP_DELAY_MS);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
