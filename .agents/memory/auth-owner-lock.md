---
name: Auth owner-lock model
description: How access control works for the GD tracker API and why it is single-owner.
---

# Owner-lock authorization

The tracker uses Replit Auth (OIDC) plus an owner-lock: an ALLOWLISTED authenticated
user to log in claims ownership (`usersTable.isOwner` set true). Every other
authenticated user is a non-owner and is denied all tracker data routes.

**Bootstrap hardening (do NOT regress to "first login wins"):** `upsertUser` only
runs the owner-claim UPDATE when `isAllowedOwnerClaim(claims)` is true. The allowlist
(`getOwnerAllowlist`) = `REPL_OWNER_ID` (default) + optional comma-separated
`OWNER_USER_IDS` (OIDC `sub`) / `OWNER_EMAILS`. Empty allowlist => fail closed (no
claim). **Why:** without this gate, any anonymous internet user could self-claim owner
on a fresh/empty deploy and lock out the operator. `sub`/`email` come from the
server-verified ID token, so they are not forgeable. In deployments where
`REPL_OWNER_ID` is absent, the operator MUST set `OWNER_EMAILS`/`OWNER_USER_IDS`.

**Why:** The data model is single shared dataset (levels/sessions have NO `userId`
column). Adding per-row ownership would require a migration and break existing data.
Owner-lock hardens the public API without restructuring the data.

**How to apply:**
- All data routes (levels, stats, sessions) sit behind `requireOwner` in
  `routes/index.ts` (401 if unauthenticated, 403 if authenticated non-owner).
- Health and auth routes stay public, mounted BEFORE `requireOwner`.
- Owner-claim happens in `upsertUser` (routes/auth.ts): if no owner row exists, the
  upserted user is promoted. First login after deploy wins — there is a tiny race if
  two users log in simultaneously on a brand-new deploy.

# Auth sessions table name collision

The auth session store table is `auth_sessions` / `authSessionsTable`, deliberately
renamed from the template's `sessions`. The app already has a practice
`sessionsTable` ("sessions") for gameplay sessions — do not merge or rename these two.
