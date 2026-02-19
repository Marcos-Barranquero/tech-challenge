import cors from "@fastify/cors";
import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./router/index.js";
import { listPokemon } from "./services/pokemon.service.js";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";
const CACHE_WARMUP_DELAY_MS = Number(process.env.CACHE_WARMUP_DELAY_MS ?? 500);

async function warmupCache() {
  // Warm up only the most used query path (index + first page list).
  await listPokemon({
    search: "",
    page: 1,
    pageSize: 20,
    sort: "id-asc",
  });
}

async function bootstrap() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
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

  await app.listen({ port: PORT, host: HOST });

  setTimeout(() => {
    void (async () => {
      app.log.info("Starting cache warm-up job");
      const startedAt = Date.now();
      try {
        await warmupCache();
        app.log.info({ durationMs: Date.now() - startedAt }, "Cache warm-up completed");
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
