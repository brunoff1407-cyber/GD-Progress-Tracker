---
name: GD Tracker device-local data model
description: Why levels/sessions/stats are localStorage-only with login kept, and the completionRate display quirk
---

# GD Tracker: device-local data + auth

Levels, practice sessions, and stats live ONLY in the browser's localStorage
(`artifacts/gd-tracker/src/lib/localStore.ts`), surfaced through a drop-in hook
module (`localApi.ts`) that mirrors the generated `@workspace/api-client-react`
hook/query-key/type surface so pages only swap their import path.

**Decision:** keep the login screen (auth still required) but DROP the owner-only
gate in `AuthGate`.
**Why:** with per-device data the single-owner lock would block every user except
the first, directly contradicting "each device sees only its own data." Login is
kept because the user explicitly asked to keep it.
**How to apply:** any authenticated user should pass `AuthGate`; do not reintroduce
an `isOwner` block here. The backend Replit Auth + owner-lock and the unused
levels/sessions/stats DB routes were intentionally left intact (not deleted) to
avoid destructive DB changes — they are simply no longer called by the frontend.

**Quirk (pre-existing, intentionally preserved):** `completionRate` is a 0..1
fraction, but `StatsGrid` renders it as `completionRate.toFixed(1)` followed by a
literal "% rate". So it shows e.g. "0.5% rate" for a 50% rate. `computeStats()`
mirrors the old server math exactly; if you "fix" the fraction, update the UI
formatter in lockstep or the displayed number changes meaning.
