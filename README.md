# Pokedex

A Pokemon explorer built with TypeScript and Next.js, focused on clean architecture, end-to-end type safety, and responsive UX.

Current documented release: `0.0.2`

## What It Includes

- Main list sorted by ID.
- Per-item data in the list:
  - name,
  - generation,
  - types.
- Combined filters by type and generation.
- Real-time name search that expands to the full evolution chain.
- In-screen Pokemon detail view (SPA behavior with dynamic query-string URL, no full page reload) with:
  - name,
  - image,
  - generation,
  - types,
  - stats,
  - clickable evolutions with clear current-item highlighting,
  - back button that returns to the collection grid.
- Navigation state is preserved when moving between collection and detail inside the screen.
- Full page reload resets that client state.
- Game Boy Advance-inspired floating shell UI with collection and detail rendered inside the same screen frame.

## Stack

| Layer | Technology |
|---|---|
| Web | Next.js, React, Tailwind CSS, Zustand |
| BFF | Fastify, tRPC, Zod, LRU Cache |
| Contracts | `packages/shared` (TypeScript + Zod) |
| Infrastructure | Multi-stage Docker + Docker Compose |

## Key Technical Decisions

- The client never calls PokeAPI directly; all access goes through the BFF (`tRPC`).
- Input/output contracts are validated with `Zod`.
- N+1 is avoided on list flows via an aggregated, cached backend index.
- Evolution-chain resolution is cached by `evolution-chain` ID.
- API startup triggers non-blocking cache warm-up to reduce first-interaction latency.
- UI resilience includes loading states, error boundaries, and toast feedback.
- Collection-to-detail interaction is implemented as an in-place SPA flow for fast context-preserving navigation.

## Project Structure

```text
.
├─ apps/
│  ├─ web/                 # Next.js frontend
│  └─ api/                 # tRPC BFF backend
├─ packages/
│  └─ shared/              # Shared schemas and types
├─ Dockerfile.web
├─ Dockerfile.api
├─ docker-compose.yml
└─ CHANGELOG.md
```

## Run Locally

### With Docker (recommended)

```bash
docker compose up --build
```

- Web: `http://localhost:3000`
- API health: `http://localhost:4000/health`

### Development mode

```bash
pnpm install
pnpm dev
```

## tRPC Procedures

- `pokemon.list`
- `pokemon.detail`
- `pokemon.searchWithEvolutions`
- `pokemon.meta`

## Versioned REST + OpenAPI Contract

- OpenAPI JSON: `http://localhost:4000/openapi/v1.json`
- Swagger UI: `http://localhost:4000/docs`
- Versioned REST endpoints (`v1`):
  - `GET /v1/pokemon`
  - `GET /v1/pokemon/{id}`
  - `GET /v1/pokemon/search/evolutions`
  - `GET /v1/pokemon/meta`

The contract is generated from shared Zod schemas in `packages/shared` (single source of truth).

## Testing

### Unit + Integration (web + api)

```bash
pnpm test
pnpm test:coverage
```

### E2E (Playwright)

```bash
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:a11y
```

### Performance Smoke

```bash
pnpm test:perf:smoke
```

## Changelog

See `CHANGELOG.md` for release history.

## Dependency Maintenance

- Dependabot is configured in `.github/dependabot.yml` for:
  - npm/pnpm workspace dependencies,
  - GitHub Actions,
  - Docker images.
