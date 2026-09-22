# zoho-onboarding-portal

HR-fed Auditor portal: replaces a manual Google Form → Google Sheet →
Zoho-admin workflow with a review-and-provisioning workspace. HR requests
arrive through the backend; auditors review, approve, and pass the resolved
account to Zoho. See
`docs/PRD.txt` for the full product spec (workflow statuses, security
boundary, provisioning sequence, etc.) — read it before touching
provisioning/rules logic.

Two independent npm workspaces, run from the repo root or their own folder:

- `backend/` — Node.js (ESM, `type: module`) + Express API, no framework
  ORM, no database (see Data storage below).
- `frontend/` — Next.js 16 (App Router) + React 19 + TypeScript.

## Commands

Run from repo root (each proxies into `backend/`/`frontend/` via `--prefix`):

- `npm run dev` — runs API (port 4000) and web (port 3000) concurrently.
- `npm run dev:api` / `npm run dev:web` — run one side only.
- `npm test` — backend tests (`node --test`). Runs against a temp data dir.
- `npm run typecheck` — frontend `tsc --noEmit`.
- `npm run lint` — frontend `eslint .`.
- `npm run build` — frontend `next build`.

Run a single backend test file directly (from `backend/`):
`node --test test/provisioning.test.js`. Node's built-in test runner also
supports `--test-name-pattern` to run a single test by name.

There is no frontend test suite currently.

## Architecture (backend)

`backend/src/app.js` is the composition root: `createApp(config)` builds
every dependency by hand (no DI container) and wires it into Express. Follow
this factory pattern — it exists so tests (`test/helpers/test-server.js`)
can boot a full app against an isolated temp `DATA_DIR` with no shared state.

Layering, in dependency order:

- `lib/` — generic infra: `store.js` (JSON-file document store, see below),
  `session.js`, `password.js`, `smtp-client.js`, `http-error.js`,
  `async-handler.js`.
- `config/` — `env.js` (loads/validates env vars into `env`), `catalog.js`
  (departments/teams/positions), `rules.js` (deterministic account-config
  rules engine — no AI, per PRD section 10).
- `domain/` — repositories/entities operating on the store, e.g.
  `requests.js` (the onboarding request repository), `users.js`,
  `statuses.js` (workflow status enum), `validation.js`.
- `integrations/` — external systems: `zoho.js` (simulated vs live Zoho
  Directory client, selected by `ZOHO_MODE`), `mailer.js` (outbox vs SMTP,
  selected by `MAIL_MODE`).
- `services/` — orchestration combining domain + integrations:
  `provisioning.js`, `notifications.js`, `email-availability.js`.
- `routes/` — Express routers per audience: `form.js` (public employee
  form), `auth.js`, `auditor.js`, `admin.js`.
- `middleware/` — `auth.js` (`attachUser`, session-cookie auth),
  `error-handler.js`.

**Data storage:** no real database. `lib/store.js` is a crash-safe JSON
document store — one JSON file per collection under `DATA_DIR`
(`backend/data/*.json` by default), temp-file + rename writes, and an
in-process per-collection write queue to avoid lost updates. Interact with
collections only via `find` / `findOne` / `insertOne` / `updateOne` /
`count`; don't read/write the JSON files directly. If this is ever swapped
for a real DB, only `lib/store.js`'s internals should need to change.

**Security boundary (critical, PRD section 18):** employee-submitted data
(`submission` on an onboarding request) must never directly determine
privileged access. `proposedAccount` is a deterministic suggestion computed
by the rules engine (`config/rules.js`) from the submission; it is *not*
what gets provisioned. Only `resolvedAccount` — set exclusively via
`requestRepository.saveResolvedAccount`, which requires an explicit
auditor/admin `actorId` — is ever passed to the Zoho client. Never wire
`proposedAccount` (or raw `submission` fields) directly into a Zoho
provisioning call.

**Zoho/Mail adapters:** both `integrations/zoho.js` and
`integrations/mailer.js` expose a small mode-switched interface
(`simulated`/`outbox` for local dev, `live`/`smtp` for real accounts) so
calling code never branches on mode. `ZOHO_MODE=simulated` also supports a
"fail-demo" convention: if a resolved account's role/groups contain the
substring `fail-demo` (or `fail-demo:<step_name>`), that provisioning step
throws, for exercising the partial-provisioning/retry flow without a real
Zoho account.

## Architecture (frontend)

The user-facing frontend is the Auditor portal under `src/app/auditor`.
The root route, legacy `src/app/onboarding`, and `/admin` route redirect to
`/auditor`; do not add another portal surface unless the product boundary
changes again. All API calls
go through `src/lib/api-client.ts`'s `apiRequest<T>()`, which always calls
same-origin `/api/*` with `credentials: 'include'` (never the Express
origin directly) — `next.config.ts` rewrites `/api/*` to the Express server
(`API_ORIGIN` env var, default `http://localhost:4000`). This sidesteps
CORS/cookie issues for the session-cookie-based auditor/admin auth.
Feature-specific API wrappers (`admin-api.ts`, `auditor-api.ts`,
`auth-api.ts`) sit on top of `api-client.ts`; add new endpoints there rather
than calling `fetch` directly from components.

The Auditor workflow is queue-first: authenticate, inspect an HR request,
review the deterministic proposal, save the explicit `resolvedAccount`, then
create/retry Zoho provisioning and send the account notification. Keep the
approval boundary visible in UI copy and never let raw HR submission fields
become a provisioning payload.

## Conventions

- Backend is ES modules (`import`/`export`, `.js` extensions in imports
  required); no build step or TypeScript.
- Every module is a factory function (`createX(deps)`) that takes its
  dependencies explicitly and returns an object of functions — avoid
  singletons/module-level state so tests can construct isolated instances.
  `test/helpers/test-server.js` boots the real app via `createApp` against a
  `mkdtemp` data dir per test.
- Config is centralized in `backend/src/config/env.js`; add new env vars
  there (with a `.env.example` entry) rather than reading `process.env`
  elsewhere.
