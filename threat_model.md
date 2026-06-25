# Threat Model

## Project Overview

This project is a Geometry Dash progress tracker built as a pnpm monorepo with a React/Vite frontend (`artifacts/gd-tracker`), an Express 5 API (`artifacts/api-server`), and a PostgreSQL database accessed through Drizzle ORM (`lib/db`). The deployed application is public at `gdtracker.com`. In the current architecture, browser login uses Replit OIDC through the Express API, protected tracker API routes are server-gated behind a single-owner authorization model, and the current frontend stores tracker records in browser `localStorage` rather than persisting tracker CRUD through the API.

## Assets

- **Owner-only tracker data** -- level names, creators, best-percent progress, attempt counts, completion status, notes, and per-session history. This data is private to the intended tracker owner even though the deployment itself is public.
- **Application integrity** -- the correctness of tracked levels, aggregate stats, and practice-session history. Unauthorized writes or deletes would destroy the core value of the app.
- **Ownership assignment state** -- the single `isOwner` claim in the `users` table. Compromise of this bootstrap state gives one principal full access to all protected server-side tracker routes.
- **Browser-local tracker storage** -- the current frontend keeps tracker records in `localStorage`, so confidentiality and integrity of that data depend on the browser profile boundary as well as the login gate.
- **Database contents and availability** -- the PostgreSQL data backing auth sessions, user ownership state, and any tracker data still served by the API.
- **Operational secrets** -- `DATABASE_URL`, OIDC configuration, and any future API credentials or auth tokens used by the server.

## Trust Boundaries

- **Browser to API** -- all client requests cross from an untrusted browser into the Express server. Every production route must treat request parameters, bodies, headers, and bearer tokens as attacker-controlled.
- **API to PostgreSQL** -- route handlers can read and modify auth sessions, owner state, and any server-stored tracker data through Drizzle. Access-control failures at the API layer directly affect protected data.
- **Public internet to deployed app** -- the deployment is public, so `/api/login`, `/api/callback`, `/api/auth/user`, `/api/logout`, and mobile auth endpoints are internet-reachable even before a user is authenticated.
- **Bootstrap owner claim boundary** -- the application promotes exactly one authenticated account to `isOwner`. Any weakness in the first-claim flow or owner bootstrap logic can permanently transfer control of all protected tracker routes.
- **Browser profile to browser-local data** -- `artifacts/gd-tracker` stores tracker data under fixed same-origin `localStorage` keys. That data is isolated by browser profile and origin, not by authenticated user identity.
- **Production vs dev-only artifacts** -- `artifacts/mockup-sandbox/` is a development/experimental surface and should be ignored for production findings unless independent evidence shows it is deployed.

## Scan Anchors

- Production web artifact: `artifacts/gd-tracker/.replit-artifact/artifact.toml`
- Production API artifact: `artifacts/api-server/.replit-artifact/artifact.toml`
- Production server entry: `artifacts/api-server/src/index.ts` and `artifacts/api-server/src/app.ts`
- Auth and owner bootstrap: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/middlewares/authMiddleware.ts`, `artifacts/api-server/src/middlewares/requireOwner.ts`, `lib/db/src/schema/auth.ts`
- Protected tracker API routes: `artifacts/api-server/src/routes/levels.ts`, `artifacts/api-server/src/routes/sessions.ts`, `artifacts/api-server/src/routes/stats.ts`
- Browser-local tracker state: `artifacts/gd-tracker/src/lib/localStore.ts`, `artifacts/gd-tracker/src/lib/localApi.ts`, `artifacts/gd-tracker/src/components/AuthGate.tsx`
- Dev-only area to skip by default: `artifacts/mockup-sandbox/`

## Threat Categories

### Spoofing

The application does have a server-side authentication boundary now: browser and mobile clients authenticate through Replit OIDC, and session state is resolved in `authMiddleware`. The required guarantee is that only the intended principal can establish an authenticated session, and that protected routes continue to validate the server-side session on every request. Because the deployment is public, the bootstrap path that decides who becomes the single owner is especially sensitive: the system must not equate “first authenticated internet user” with “authorized owner” unless that is an explicit product decision.

### Tampering

The core risk remains unauthorized modification of tracker records. Server-side tracker routes must stay behind `requireOwner`, and frontend storage must not let one signed-in user modify another user's browser-resident tracker state on a shared profile. All writes that do go through the API must continue to use validated inputs and parameterized ORM queries.

### Information Disclosure

The main privacy boundary has shifted. Protected API routes are owner-gated, but the frontend now keeps tracker data in browser `localStorage`, so disclosure risk depends on who can reuse that browser profile as well as who can reach the backend. The application must explicitly protect owner-only notes, progress history, and aggregate stats from both server-side unauthorized access and unintended cross-user exposure within the same browser profile. Error responses and logs must also avoid leaking secrets or internal stack traces.

### Denial of Service

Public auth and health endpoints remain internet-reachable, and the single-owner model means accidental or malicious misassignment of ownership can deny the legitimate operator access to the protected API entirely. The application must keep public endpoints bounded in cost and avoid bootstrap flows that let outsiders permanently lock out the intended owner.

### Elevation of Privilege

The highest-risk privilege boundary is the jump from anonymous internet user to the single tracker owner. Route handlers in `artifacts/api-server/src/routes/` must never allow an attacker to escalate from unauthenticated/public access to full read-write control of the tracker through bootstrap mistakes, bearer-token misuse, or future authorization drift. If the frontend continues to use local-only persistence, it must also enforce that non-owner authenticated users cannot inherit or operate on another user's browser-local tracker dataset.
