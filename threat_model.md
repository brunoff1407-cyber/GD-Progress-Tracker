# Threat Model

## Project Overview

This project is a Geometry Dash progress tracker built as a pnpm monorepo with a React/Vite frontend (`artifacts/gd-tracker`), an Express 5 API (`artifacts/api-server`), and a PostgreSQL database accessed through Drizzle ORM (`lib/db`). The deployed application is public, so any production API route exposed by the Express server is reachable from the internet unless the application itself enforces access control.

## Assets

- **Tracker data** -- level names, creators, best-percent progress, attempt counts, completion status, notes, and per-session history. This is the primary business and user data stored by the application.
- **Application integrity** -- the correctness of tracked levels, aggregate stats, and practice-session history. Unauthorized writes or deletes would destroy the core value of the app.
- **Database contents and availability** -- the PostgreSQL data backing the tracker. Abuse of public routes can tamper with or erase stored progress.
- **Operational secrets** -- `DATABASE_URL` and any future API credentials or auth tokens used by the server.

## Trust Boundaries

- **Browser to API** -- all client requests cross from an untrusted browser into the Express server. Every production route must treat request parameters, bodies, and headers as attacker-controlled.
- **API to PostgreSQL** -- route handlers can read and modify the full tracker dataset through Drizzle. Any server-side access-control failure or injection issue at the API layer directly affects stored data.
- **Public internet to deployed app** -- the current deployment is public, so unauthenticated routes are internet-reachable rather than limited to trusted internal users.
- **Production vs dev-only artifacts** -- `artifacts/mockup-sandbox/` is a development/experimental surface and should be ignored for production findings unless independent evidence shows it is deployed.

## Scan Anchors

- Production server entry: `artifacts/api-server/src/index.ts` and `artifacts/api-server/src/app.ts`
- Production API routes: `artifacts/api-server/src/routes/`
- Shared data layer: `lib/db/src/`
- API contract and generated validators: `lib/api-spec/openapi.yaml`, `lib/api-zod/src/generated/api.ts`
- Public/authenticated/admin boundaries: currently public API routes exist; no authenticated or admin-only boundary is implemented in the Express app
- Dev-only area to skip by default: `artifacts/mockup-sandbox/`

## Threat Categories

### Spoofing

The application currently has no user-authentication boundary in the production Express app. If the tracker is intended to be personal or owner-managed, the system must require a valid server-verified identity before allowing access to non-public tracker data or any mutation endpoint. Future bearer tokens or cookies must be validated server-side on every protected route.

### Tampering

The core risk in this project is unauthorized modification of tracker records. Level creation, updates, session creation, and deletions must only be permitted to authorized principals, and the server must never rely on frontend navigation or UI affordances as proof of permission. All writes must continue to use validated inputs and parameterized ORM queries.

### Information Disclosure

Tracker notes, session history, and aggregate progress stats are served over public API routes. The project must explicitly decide which data is intended to be public; any owner-only or sensitive tracking data must be gated by server-side authorization rather than hidden only in the UI. Error responses and logs must avoid leaking secrets or internal stack traces.

### Denial of Service

Because the app exposes public database-backed routes, abusive request volume or repeated write/delete actions can degrade service or destroy useful data. Public endpoints must remain bounded in cost, and any sensitive mutation surface should require authentication before being internet-reachable.

### Elevation of Privilege

If roles or ownership are added later, they must be enforced on the server. Route handlers in `artifacts/api-server/src/routes/` are the critical authorization points: an attacker must not be able to escalate from anonymous/public access to full read-write control of the tracker through direct API calls.
