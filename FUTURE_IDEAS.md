# Future Implementation Ideas

## 1. Add Security Hardening

- Add rate limiting on API routes (`/trpc/*`) to prevent abuse.
- Add request validation guards and stricter input constraints for public procedures.
- Add security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- Add CORS policy tightening by environment (dev vs production).
- Add bot/spam protection for high-frequency endpoints.
- Add dependency and container vulnerability scanning in CI.

## 2. Add Dedicated Landing + Error Page

- Add a dedicated landing page with product intro and quick entry into the Pokedex UI.
- Add a branded global error page with clear recovery actions (retry, go home).
- Add route-level `not-found` and graceful fallback states.
- Add outage fallback copy when upstream PokeAPI is unavailable.
- Add monitoring hooks for error tracking and incident visibility.

## 3. Add Testing Strategy

- Add unit tests for core business logic (evolution chain resolution, list filtering).
- Add integration tests for tRPC procedures and schema validation.
- Add component tests for key UI flows (search, filters, inline detail, back navigation).
- Add end-to-end tests for the full user journey in the GBA interface.
- Add CI test gates for pull requests (`typecheck`, `unit`, `integration`, `e2e`).

## 4. Add a Technical Retrospective Document

- Add a short engineering retrospective describing what would be done differently in a second iteration.
- Include architecture trade-offs taken under time constraints and what to improve first.
- Document UX decisions that worked well vs. decisions that created friction.
- Outline a phased improvement plan (performance, maintainability, accessibility, testing).

## 5. Add Public Deployment Flow for Latest Release

- Add a release-driven GitHub Pages deployment for the frontend, always publishing the latest release tag.
- Deploy the BFF API to a managed platform and wire production `NEXT_PUBLIC_API_URL`.
- Add CORS and environment hardening for the public Pages domain.
- Document a zero-cost deployment path (free tiers, no custom domain) for quick demos.

## 6. Extend Local LLM Runtime Integration

- Expand AI insight features using an external local LLM runtime (Ollama host service).
- Implement a provider abstraction (`cloud` vs `local`) to keep business logic provider-agnostic.
- Validate model outputs with strict Zod schemas and cache AI responses aggressively.
- Benchmark latency and memory footprint on Apple Silicon (16 GB baseline) and tune model size.

## 7. Add Xbox Gamepad Support

- Add Web Gamepad API support to map Xbox controller inputs to GBA-like actions.
- Support directional navigation through Pokemon grid, filters, and detail evolutions.
- Map buttons for primary actions (`A` open/select, `B` back, shoulder buttons for quick navigation).
- Add controller connection status and input hints in the UI.
- Provide keyboard fallback and accessibility-safe behavior when no gamepad is available.

## 8. Create a Demo Video

- Record a short end-to-end demo (collection, filters, detail, evolutions, AI fun fact regeneration).
- Publish one concise version for recruiters and one technical version for engineering review.
- Include architecture callouts (BFF, caching, URL state, responsive behavior) as overlays.
- Add the video link to `README.md` and release notes for each tagged version.
