# Claude Progress — DevOps Dashboard Project

## Current Status

**Phase:** Phase 2 — Production Quality
**Current Week:** Week 9 (starting)
**Last Updated:** May 16, 2026
**Deployment Strategy:** Cloud Run (GCP) + Supabase (PostgreSQL) — zero cost stack
**Production URL:** https://devops-dashboard-985792054692.us-east1.run.app

---

## 12-Week Plan

### Phase 1: Foundation (Weeks 1–4)
- [x] **Week 1:** TypeScript + Express setup, basic CRUD, request validation
- [x] **Week 2:** PostgreSQL + Prisma, database schema, migrations
- [x] **Week 3:** JWT authentication, password hashing, protected routes
- [x] **Week 4:** React + TypeScript frontend, login/register flow, routing

### Phase 2: Production Quality (Weeks 5–8)
- [x] **Week 5:** Error handling middleware, structured logging, input validation
- [x] **Week 6:** Testing suite (unit, integration, component — 70%+ coverage)
- [x] **Week 7:** Docker + GCP Cloud Run + Supabase deployment
- [x] **Week 8:** CI/CD pipeline with GitHub Actions, automated tests

### Phase 3: Advanced Features (Weeks 9–12)
- [ ] **Week 9:** WebSocket server, real-time dashboard updates ← *next*
- [ ] **Week 10:** Redis caching, query optimization, performance tuning
- [ ] **Week 11:** Monitoring, health checks, error tracking, observability
- [ ] **Week 12:** Docs, ADRs, API docs, technical blog post

---

## Session Log

### Session 1 — May 3, 2026

**Completed:**
- Git initialized at project level; stray `.git` in `C:\Users\Thomas` removed
- GitHub repo created and pushed (`devops-dashboard`)
- PowerShell execution policy set (`RemoteSigned`)
- Express 5 + TypeScript server running; health endpoint verified at `/health`
- `dotenv` configured; `PORT` reads from env (Cloud Run compatible)
- `.gitignore` in place: `node_modules/`, `dist/`, `.env`
- Folder structure created: `src/routes`, `src/controllers`, `src/middleware`, `src/types`
- Switched Claude context strategy: version-controlled `.claude/` folder in repo instead of copy-paste instructions

---

### Session 2 — May 4, 2026

**Completed:**
- Installed Zod and walked through schema → middleware → controller validation pattern
- Created `src/schemas/user.schema.ts` with `CreateUserSchema` and inferred `CreateUserInput` type
- Created `src/middleware/validate.ts` — reusable validation middleware using `safeParse`
- Created `src/controllers/user.controller.ts` with all four CRUD stubs
- Created `src/routes/user.routes.ts` — all four CRUD routes wired up and verified
- Registered routes in `index.ts` under `/api/users`
- Created `docs/decisions.md` with decision entries
- Verified all endpoints in Thunder Client (validation errors working correctly)
- Fixed `z.Infer` → `z.infer` (capital I was deprecated)
- Migrated from `z.string().email()` → `z.email()` (Zod v4 API change)
- Updated `instructions.md` — decisions logged in real time during sessions
- Installed Prisma v7 + PostgreSQL 18 locally
- Defined User model in `schema.prisma`
- Ran first migration (`20260505003409_init`) — User table live in database

**Key concepts covered:**
- `z.infer<typeof Schema>` — single source of truth for runtime + compile-time types
- `safeParse` vs `parse` — never throws, lets you control the error response
- Validation in middleware not controllers — separation of concerns
- Never echo passwords back in responses, even in stubs
- Zod v4 has breaking API changes from v3 — many online examples show outdated syntax
- `.optional()` on update schemas — don't require every field, just validate what's present
- Prisma v7 moves connection URL config out of `schema.prisma` into `prisma.config.ts`
- Never paste `.env` contents into chat

---

### Session 3 — May 5, 2026

**Completed:**
- Installed `bcrypt` + `@types/bcrypt`
- Installed `@types/node` (fixes `process.env` TS errors)
- Created `src/lib/prisma.ts` — singleton PrismaClient with PrismaPg adapter
- Replaced all four CRUD stubs in `user.controller.ts` with real Prisma DB calls
- Handled Prisma error codes: `P2002` (unique constraint) → 409, `P2025` (not found) → 404
- Fixed `dotenv/config` import order — must be first line in `index.ts`
- Resolved Prisma v7 breaking changes
- Verified full CRUD against real PostgreSQL database
- Added `SIGTERM` handler to `index.ts` for graceful Prisma disconnect
- Excluded password from `UpdateUserSchema`

**Key concepts covered:**
- Prisma v7 is a significant breaking change from v6 — adapter pattern is now required
- `select` on every Prisma query — whitelist fields explicitly, never return password
- Singleton PrismaClient pattern — one instance for the whole app, not per request
- P2002 = unique constraint violation, P2025 = record not found
- Password changes belong on a dedicated endpoint, not a generic update

---

### Session 4 — May 5, 2026

**Completed:**
- Added `RefreshToken` model to `schema.prisma` with relation to `User`
- Ran migration `20260505180615_add_refresh_tokens`
- Installed `jsonwebtoken` + `@types/jsonwebtoken`
- Created `src/lib/jwt.ts` — signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken
- Created `src/schemas/auth.schema.ts` — LoginSchema
- Created `src/controllers/auth.controller.ts` — register, login, refresh, logout
- Created `src/routes/auth.routes.ts`
- Created `src/middleware/auth.ts` — authenticate middleware
- Protected user routes

**Key concepts covered:**
- Two token pattern — short-lived access token (15m), long-lived refresh token (7d)
- Separate secrets for access and refresh tokens
- Never reveal which credential failed on login
- `res.locals.userId` — correct way to pass data from middleware to controller

---

### Session 5 — May 5, 2026

**Completed:**
- Scaffolded React + TypeScript frontend using Vite
- Created folder structure: `client/src/components`, `pages`, `lib`, `hooks`, `types`
- Installed React Router and configured routes
- Created `LoginPage.tsx` with fetch to `/api/auth/login`
- Fixed CORS — installed `cors` + `@types/cors`
- Verified full stack login

**Commit:** `feat: scaffold React frontend with login form and CORS config`

---

### Session 6 — May 6, 2026

**Completed:**
- Moved refresh token from JSON response body to httpOnly cookie
- Implemented token rotation in `refresh` controller
- Built `client/src/lib/authContext.tsx` — AuthProvider with silent refresh
- Split `useAuth` hook into separate file
- Built `ProtectedRoute.tsx` and `RegisterPage.tsx`
- Added Vite proxy in `vite.config.ts`
- Removed StrictMode

**Commit:** `feat: React frontend with auth flow, protected routes, silent refresh`

---

### Session 7 — May 7, 2026

**Completed:**
- Created `src/lib/AppError.ts` — custom error class with statusCode
- Created `src/middleware/errorHandler.ts` — centralized error handler
- Refactored all controllers to use `next(err)` instead of inline error responses
- Installed Pino for structured logging
- Created `src/lib/logger.ts` — Pino logger with pino-pretty in dev, JSON in production
- Added manual request logging middleware to `index.ts`

**Commit:** `feat: centralized error handling and structured logging`

---

### Session 8 — May 10, 2026

**Completed:**
- Installed Jest 29 + ts-jest 29 + @types/jest 29 + supertest
- Created test database `devops_dashboard_test`; migrations applied
- Split `src/index.ts` into `src/app.ts` + `src/index.ts`
- Created auth and user integration test suites — 21/21 tests passing
- Final coverage: **94.71% statements, 88.57% branches**
- Decided on deployment stack: Cloud Run (GCP) + Supabase (PostgreSQL)

**Commits:**
- `feat: integration test suite with 94% coverage`
- `chore: update deployment strategy — Cloud Run + Supabase`

---

### Session 10 — May 16, 2026

**Completed:**
- Fixed git config email (was set to placeholder `any@email.com`)
- Set up GCP Workload Identity Federation for GitHub Actions (no long-lived service account keys)
- Created `github-actions` service account with Artifact Registry writer + Cloud Run admin + service account user roles
- Added `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT` to GitHub Secrets
- Wrote `.github/workflows/deploy.yml` — test job + deploy job, deploy gated on tests passing
- Fixed CI issues: added `prisma generate` step, typed catch parameters as `unknown`, removed `src` from `.dockerignore`, removed `prisma.config.ts` from tsconfig include
- Updated Dockerfile to build TypeScript inside the container (`npm run build` in image)
- Rewrote `prisma.config.js` to use `module.exports` instead of `exports.default`
- Removed `github-actions-key.json` from git tracking, added to `.gitignore`
- Pipeline fully green — Test ✅ Deploy ✅ in 2m 42s

**Key concepts covered:**
- Workload Identity Federation — short-lived OIDC tokens instead of long-lived service account keys
- Docker images are immutable snapshots tagged by commit SHA — enables instant rollbacks
- Artifact Registry stores every image ever built — full deploy history
- CI PostgreSQL service containers spin up fresh for each run, torn down after
- `prisma generate` must run in CI before type check — generated client isn't committed to repo
- `exports.default` vs `module.exports` — Prisma config requires the latter for CommonJS

---

### Session 9 — May 13, 2026

**Completed:**
- Created Supabase project (East US - Ohio region)
- Applied Prisma migrations to Supabase via session pooler (`migrate deploy`)
- Verified `User` and `RefreshToken` tables live in Supabase
- Installed Docker Desktop (v29.4.3)
- Wrote `Dockerfile` (node:20-alpine, production build)
- Wrote `.dockerignore`
- Fixed `tsconfig.json` — set `rootDir: ./src`, `outDir: ./dist` so compiled output lands directly in `dist/` not `dist/src/`
- Built Docker image successfully
- Tested container locally — `/health` returned healthy
- Installed and configured `gcloud` CLI (SDK 568.0.0)
- Enabled Cloud Run + Artifact Registry APIs
- Created Artifact Registry repository (`devops-dashboard`, us-east1)
- Tagged and pushed Docker image to Artifact Registry
- Deployed to Cloud Run — **app live at https://devops-dashboard-985792054692.us-east1.run.app**
- Verified `/health` endpoint returning `{"status":"healthy"}` from production

**Key concepts covered:**
- `migrate deploy` vs `migrate dev` — deploy is production-safe, applies existing migrations only
- Supabase direct connections use IPv6 by default — use session pooler for IPv4 environments
- Session pooler vs transaction pooler — session maintains persistent connections, compatible with Prisma; transaction pooler breaks prepared statements
- Percent-encode special characters in database URLs (`@` → `%40`)
- Docker image maps `dist/` not `src/` — container runs compiled JS
- Cloud Run injects `PORT=8080` at runtime — code must read `process.env.PORT`
- `docker tag` + `docker push` to Artifact Registry before `gcloud run deploy`
- `--allow-unauthenticated` flag required for public API access on Cloud Run

**Commit:** `feat: dockerize backend for Cloud Run deployment`

---

## Technical Decisions Log

| Date | Decision | Choice | Why |
|------|----------|--------|-----|
| May 3 | ORM | Prisma over raw SQL | Type safety, migrations, easier testing |
| May 3 | Auth | JWT over sessions | Stateless, scales horizontally, works with Cloud Run |
| May 3 | Database | PostgreSQL over MongoDB | Relational model, stronger consistency |
| May 3 | Hosting | Cloud Run over App Engine | Container-based, more control, easier local dev |
| May 3 | Port config | `process.env.PORT` | Cloud Run injects its own PORT at runtime |
| May 3 | Context mgmt | `.claude/` folder in repo | Version-controlled, no copy-paste, split stable vs active |
| May 4 | Validation | Zod over express-validator | TypeScript-native, inferred types, pairs naturally with Prisma |
| May 4 | Validation placement | Middleware over controllers | Separation of concerns, reusable, controllers receive trusted data |
| May 4 | API testing | Thunder Client over curl | Avoids PowerShell curl alias issues, lives in VS Code |
| May 4 | Zod version | v4 | Current release; breaking changes from v3 |
| May 4 | PostgreSQL setup | Local install over Prisma Postgres | Prisma Postgres v7 connection errors; local matches Cloud SQL path |
| May 5 | Prisma v7 client init | PrismaPg adapter | v7 requires explicit adapter |
| May 5 | Prisma connection config | `prisma.config.ts` only | v7 removed `url` from `schema.prisma` |
| May 5 | Frontend scaffold | Vite + React + TypeScript | Fast dev server, first-class TS support |
| May 5 | CORS placement | Before routes in `index.ts` | Middleware runs in registration order |
| May 6 | Token storage | In-memory access token + httpOnly cookie for refresh token | Eliminates XSS exposure |
| May 6 | Token rotation | Delete old + issue new on every refresh | Replay attacks fail |
| May 6 | StrictMode | Removed during development | Double-fires useEffect in dev, breaks token rotation |
| May 6 | useAuth location | Separate file from AuthProvider | Vite Fast Refresh requires components and non-component exports in separate files |
| May 7 | Logger | Pino over Winston | Faster, JSON by default, ships own types |
| May 7 | Request logging | Manual middleware over pino-http | pino-http v11 type incompatibility with commonjs + ts-node |
| May 10 | Test runner | Jest 29 + ts-jest 29 | ts-jest 29 not compatible with Jest 30; versions must match exactly |
| May 10 | Test execution | `--runInBand` | Prevents cross-suite DB race conditions on shared test database |
| May 10 | Test DB | Separate `devops_dashboard_test` | Isolates test data from dev; NODE_ENV=test switches connection string |
| May 10 | App/server split | `app.ts` + `index.ts` | Supertest needs importable app without starting the HTTP server |
| May 10 | Refresh token uniqueness | `jti: randomUUID()` | Tokens signed same second produce identical strings without jti |
| May 10 | Production database | Supabase over Cloud SQL | Cloud SQL costs ~$12-15/month at idle; Supabase is free PostgreSQL |
| May 13 | Supabase connection method | Session pooler over direct | Direct uses IPv6 by default; session pooler works over IPv4, compatible with Prisma |
| May 13 | Docker base image | node:20-alpine | Minimal image size, LTS Node version |
| May 13 | tsconfig outDir | `./dist` with `rootDir: ./src` | Ensures compiled output lands directly in dist/ not dist/src/ |
| May 16 | CI/CD auth | Workload Identity Federation over service account JSON key | Org policy blocked key creation; WIF is more secure anyway — no long-lived credentials |
| May 16 | Dockerfile build | Build TypeScript inside Docker over pre-building locally | Ensures image is always built from source; no dependency on local dist/ |

---

## Environment

- OS: Windows (PowerShell)
- Editor: VS Code
- Node.js v24.15.0 ✓
- PostgreSQL 18 (local) ✓
- Docker Desktop v29.4.3 ✓
- gcloud CLI SDK 568.0.0 ✓
- GitHub repo: `devops-dashboard` ✓
- Thunder Client installed ✓
- GCP Project: `project-21878190-6e72-4ba8-bcc`
- Artifact Registry: `us-east1-docker.pkg.dev/project-21878190-6e72-4ba8-bcc/devops-dashboard`
- Production URL: `https://devops-dashboard-985792054692.us-east1.run.app`
- TypeScript experience: learning as part of this project

## File Structure (current)

```
devops-dashboard/
├── src/
│   ├── __tests__/
│   │   ├── auth.test.ts
│   │   ├── user.test.ts
│   │   └── setup.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── lib/
│   │   ├── AppError.ts
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── prisma.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   └── user.schema.ts
│   ├── app.ts
│   └── index.ts
├── client/
│   └── src/
│       ├── components/
│       │   └── ProtectedRoute.tsx
│       ├── lib/
│       │   ├── authContext.tsx
│       │   └── useAuth.ts
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   └── RegisterPage.tsx
│       └── App.tsx
├── prisma/
│   └── schema.prisma
├── dist/
│   (compiled output — gitignored)
├── docs/
│   └── decisions.md
├── .claude/
│   ├── instructions.md
│   └── progress.md
├── Dockerfile
├── .dockerignore
├── jest.config.js
└── prisma.config.ts
```