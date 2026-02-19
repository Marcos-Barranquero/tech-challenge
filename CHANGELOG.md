# Changelog

All notable changes to this project are documented in this file.

This format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-02-19

### Added

- Monorepo structure with `apps/web`, `apps/api`, and `packages/shared`.
- BFF backend with `tRPC` + `Fastify` + `Zod` consuming PokeAPI.
- Backend LRU caching for index, detail, and evolution-chain queries.
- Evolution-aware search flow.
- Next.js frontend with modern Pokedex UI, filters, and detail screen.
- Client global state with Zustand for search and filters.
- Multi-stage Docker setup and `docker-compose` orchestration.
- Non-blocking API cache warm-up during startup.
