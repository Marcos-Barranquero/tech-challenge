# Changelog

All notable changes to this project are documented in this file.

This format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [0.0.4] - 2026-02-20

### Added

- LLM integration in the API layer for Pokemon detail enrichment:
  - new `pokemon.aiDescription` procedure in the BFF,
  - provider abstraction with local Ollama support and deterministic fallback mode,
  - strict Zod validation for generated payloads.
- Inline AI content in detail view:
  - generated description + fun fact shown inside the center panel,
  - fixed-position `Another` button to regenerate content on demand.
- Runtime controls for local AI behavior via environment variables (`AI_PROVIDER`, `OLLAMA_URL`, `OLLAMA_MODEL`, token/context/timeouts).
- `scripts/pokedex-stack.sh` helper to run the stack in `host` AI mode (external Ollama) or `none` mode (fallback only).

### Changed

- Docker setup simplified to remove in-container Ollama runtime and rely on external host Ollama for local acceleration scenarios.
- Fallback text formatting improved (capitalized Pokemon names and normalized generation labels).
- Detail accessibility improved for scrollable fun-fact content.

## [0.0.3] - 2026-02-20

### Added

- Test strategy implementation across the monorepo:
  - API unit and contract tests (services, router, OpenAPI contract coverage),
  - Web unit/component tests (store, hooks, key UI components),
  - Playwright E2E tests for collection/detail navigation flow.
- Accessibility and performance smoke coverage:
  - dedicated Playwright a11y checks (`@a11y`),
  - performance smoke checks (`@perf`).
- CI pipeline in GitHub Actions with staged jobs:
  - `Typecheck + Unit Tests`,
  - `E2E + A11y + Perf Smoke`,
  - Playwright artifact upload on failure.

## [0.0.2] - 2026-02-19

### Changed

- Reworked the main UI into a Game Boy Advance-inspired floating shell with a dedicated screen area and bottom branding.
- Converted Pokemon detail navigation to SPA behavior inside the same screen:
  - no URL change on tile click,
  - inline detail panel with `Back`,
  - clickable evolutions that update detail in place.
- Kept console sizing stable between collection and detail modes by preserving header/control layout space.
- Refined collection cards for readability and visual hierarchy:
  - centered full-art image background,
  - metadata overlay with ID pinned top-left,
  - content moved to bottom overlay,
  - reduced gradient height to avoid covering artwork.
- Compacted search and filters into a single horizontal control row on desktop for better screen usage.
- Tuned screen grid/reel behavior for denser catalog browsing and cleaner snap behavior.

### Added

- `FUTURE_IDEAS.md` roadmap extended with a dedicated testing strategy:
  - unit tests,
  - integration tests,
  - component tests,
  - end-to-end tests,
  - CI quality gates.

## [0.0.1] - 2026-02-19

### Added

- Monorepo structure with `apps/web`, `apps/api`, and `packages/shared`.
- BFF backend with `tRPC` + `Fastify` + `Zod` consuming PokeAPI.
- Backend LRU caching for index, detail, and evolution-chain queries.
- Evolution-aware search flow.
- Next.js frontend with modern Pokedex UI, filters, and detail screen.
- Client global state with Zustand for search and filters.
- Multi-stage Docker setup and `docker-compose` orchestration.
- Non-blocking API cache warm-up during startup.
