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
