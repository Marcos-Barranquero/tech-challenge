# Changelog

All notable changes to this project are documented in this file.

This format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [0.0.8] - 2026-02-21

### Changed

- Collection screen rendering reworked to a page-based centered matrix model:
  - desktop: `6 x 2`,
  - tablet: `3 x 2`,
  - mobile: `2 x 2`.
- Matrix sizing now adapts dynamically using panel measurements (`ResizeObserver`) so card size scales with available space while preserving fixed row/column density.
- Vertical interaction updated to hard page snapping for catalog navigation (slot-machine style), avoiding in-between partial states.
- Spacing model clarified:
  - independent matrix-to-screen insets,
  - independent card-to-card gap.

### Fixed

- Eliminated collection card overlap and clipping across intermediate viewport sizes.
- Prevented cards from touching GBA screen borders in resting states.
- Fixed desktop edge case near tablet breakpoint where the matrix drifted toward the top of the screen.
- Stabilized per-page layout height so only one centered matrix page is visible at a time.

### Added

- Localized Pokemon type labels for all supported languages in UI filters and content surfaces.
- Type badges now render translated labels with leading-capital formatting (instead of all-uppercase raw API values) in:
  - type filter dropdown,
  - collection cards,
  - inline detail view,
  - standalone detail view.

## [0.0.7] - 2026-02-21

### Added

- Pokeball favicon integration for browser tabs (`/pokeball-favicon.svg`) wired through Next.js metadata icons.

### Changed

- Responsive system refactor to a clearer mobile-first 3-tier model:
  - mobile (`<= 768px`),
  - tablet (`769px - 1200px`),
  - desktop (`> 1200px`).
- Detail screen layout rebuilt for responsive stability:
  - improved stacking/column behavior between mobile, tablet, and desktop,
  - better typography scaling for cards, filters, search, and detail content,
  - improved panel sizing and spacing in constrained viewports.
- Console sizing behavior in mobile tuned to keep a stable width envelope while preserving side margins.

### Fixed

- Removed layout shifts in detail view when AI fun-fact content arrives (desktop and tablet).
- Fixed tablet detail container clipping/early visual cutoff by allowing the detail container to grow with scroll content.
- Fixed inconsistent intermediate mobile/tablet card density by keeping the small-screen grid at 2 columns.

## [0.0.6] - 2026-02-21

### Added

- GBA shell color customization with four themes:
  - purple (default),
  - red,
  - yellow,
  - blue.
- Dedicated shell color picker component integrated in the console frame.
- New persisted Zustand store for shell theme selection (`localStorage`).
- UI and state test coverage for theme switching and persistence:
  - store unit tests,
  - theme picker component tests,
  - E2E persistence test across page reload.

### Changed

- Global visual direction updated with a dark page background and theme-driven shell variables.
- Console controls resized and repositioned for better symmetry and to avoid overlap with the color picker.
- Mobile behavior updated so bottom console controls are hidden when side columns collapse, keeping only core branding.

## [0.0.5] - 2026-02-20

### Added

- Internationalization support across the frontend with five locales:
  - English (`en`),
  - Spanish (`es`),
  - Italian (`it`),
  - Portuguese (`pt`),
  - German (`de`).
- New language switcher UI with flag + locale code buttons.
- Locale persistence in client state via Zustand.
- Locale-aware AI fun-fact generation in the BFF:
  - `locale` added to the shared `pokemon.aiDescription` input contract,
  - locale-specific cache keys,
  - locale-specific fallback fun-fact copy.
- Extended test coverage for i18n and AI locale behavior:
  - backend tests for AI provider and AI service locale handling,
  - frontend tests for language switcher and locale store,
  - E2E scenario validating runtime language switch to Spanish.

### Changed

- Detail layout redistributed to a horizontal 4-block composition on desktop:
  - image/name panel (1 column),
  - fun-fact + stats panel (2 columns),
  - evolutions panel (1 smaller column).
- Language switcher moved below the console shell to avoid overlaying the GBA screen.
- Replaced French locale option with German in both UI and backend locale mappings.

### Fixed

- Docker build compatibility in OrbStack and similar environments:
  - switched Docker base/runtime images from `node:25-alpine` to `node:22-alpine`,
  - installed and activated Corepack/Pnpm explicitly in Docker build stages to avoid `corepack: not found`.

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
