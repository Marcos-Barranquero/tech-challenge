# Pokedex

A Pokemon explorer built with TypeScript and Next.js, focused on clean architecture, end-to-end type safety, and responsive UX.

## What It Includes

- Main list sorted by ID.
- Per-item data in the list:
  - name,
  - generation,
  - types.
- Combined filters by type and generation.
- Real-time name search that expands to the full evolution chain.
- Detail page per Pokemon with:
  - name,
  - image,
  - generation,
  - types,
  - stats,
  - clickable evolutions with clear current-item highlighting.
- Navigation back from detail preserves list state (search and filters).
- Full page reload resets that client state.

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

## Changelog

See `CHANGELOG.md` for release history.
