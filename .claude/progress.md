# Claude Progress — DevOps Dashboard Project

## Current Status

**Phase:** Phase 1 — Foundation  
**Current Week:** Week 2 (complete)  
**Last Updated:** May 5, 2026

---

## 12-Week Plan

### Phase 1: Foundation (Weeks 1–4)
- [x] **Week 1:** TypeScript + Express setup, basic CRUD, request validation
- [x] **Week 2:** PostgreSQL + Prisma, database schema, migrations ← *complete*
- [x] **Week 3:** JWT authentication, password hashing, protected routes
- [ ] **Week 4:** React + TypeScript frontend, login/register flow, routing

### Phase 2: Production Quality (Weeks 5–8)
- [ ] **Week 5:** Error handling middleware, structured logging, input validation
- [ ] **Week 6:** Testing suite (unit, integration, component — 70%+ coverage)
- [ ] **Week 7:** Docker + GCP Cloud Run + Cloud SQL deployment
- [ ] **Week 8:** CI/CD pipeline with GitHub Actions, automated tests

### Phase 3: Advanced Features (Weeks 9–12)
- [ ] **Week 9:** WebSocket server, real-time dashboard updates
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
- Resolved Prisma v7 breaking changes:
  - Removed `url` from `schema.prisma` — connection config lives in `prisma.config.ts` only
  - Prisma v7 requires explicit `PrismaPg` adapter passed to `PrismaClient` constructor
  - Generated client entry point is `../generated/prisma/client` not `../generated/prisma`
  - `@prisma/client/runtime/library` no longer exists in v7
  - Installed `@prisma/adapter-pg` for local PostgreSQL connection
- Verified full CRUD against real PostgreSQL database — 201, 409, 400, 200, 404 all working
- Fixed cast-then-check anti-pattern in catch blocks — `instanceof` check alone is sufficient, cast is redundant
- Fixed wrong error code in `updateUser` and `deleteUser` catch blocks (P2002 → P2025)
- Added `SIGTERM` handler to `index.ts` for graceful Prisma disconnect
- Added prisma import to `index.ts`
- Excluded password from `UpdateUserSchema` — password changes require dedicated endpoint
- Verified all Thunder Client test scenarios — 201, 409, 404, 204 all correct

**Key concepts covered:**
- Prisma v7 is a significant breaking change from v6 — adapter pattern is now required
- `select` on every Prisma query — whitelist fields explicitly, never return password
- `req.params as { id: string }` — route params are always strings, cast explicitly
- Catch blocks need `err as Prisma.PrismaClientKnownRequestError` for TS type narrowing
- Singleton PrismaClient pattern — one instance for the whole app, not per request
- P2002 = unique constraint violation, P2025 = record not found — wrong code means 404s never fire
- Password changes belong on a dedicated endpoint, not a generic update — security boundary
- SIGTERM handling matters at Cloud Run deployment time, not during local dev

**Before next session:**
- Commit everything to GitHub

**Next session — Week 3:**
- JWT authentication with refresh tokens
- Password hashing (bcrypt already installed)
- Protected route middleware
- Login and register endpoints

---

### Session 4 — May 5, 2026

**Completed:**
- Added `RefreshToken` model to `schema.prisma` with relation to `User`
- Ran migration `20260505180615_add_refresh_tokens` — RefreshToken table live
- Installed `jsonwebtoken` + `@types/jsonwebtoken`
- Created `src/lib/jwt.ts` — signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken
- Created `src/schemas/auth.schema.ts` — LoginSchema with email + password
- Created `src/controllers/auth.controller.ts` — register, login, refresh, logout
- Created `src/routes/auth.routes.ts` — wired up with validation middleware
- Created `src/middleware/auth.ts` — authenticate middleware reads Bearer token, sets res.locals.userId
- Protected user routes — GET, PUT, DELETE require valid access token
- Fixed tsconfig.json — rootDir set to `.`, added prisma.config.ts to include, added types: ["node"]
- Ran `npx prisma generate` after schema change to update generated client

**Key concepts covered:**
- Two token pattern — short-lived access token (15m), long-lived refresh token (7d)
- Separate secrets for access and refresh tokens — one leak doesn't compromise both
- Never reveal which credential failed on login — always return `Invalid credentials`
- `res.locals.userId` — correct way to pass data from middleware to controller in Express
- `npx prisma generate` required after every schema change, separate from migrate
- Login schema uses `min(1)` not `min(8)` — validate presence, not policy

**Next session — Week 4:**
- React + TypeScript frontend
- Login and register forms
- JWT token storage and refresh logic on the client
- Protected route components
- React Router setup

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
| May 4 | API testing | Thunder Client over curl | Avoids PowerShell curl alias issues, lives in VS Code, saves request collections |
| May 4 | Zod version | v4 | Current release; breaking changes from v3 — `z.email()` not `z.string().email()` |
| May 4 | PostgreSQL setup | Local install over Prisma Postgres | Prisma Postgres v7 connection errors; local matches Cloud SQL path better |
| May 5 | Prisma v7 client init | PrismaPg adapter | v7 requires explicit adapter; `new PrismaClient()` with no args no longer works |
| May 5 | Prisma connection config | `prisma.config.ts` only | v7 removed `url` from `schema.prisma`; all connection config lives in config file |

---

## Environment

- OS: Windows (PowerShell)
- Editor: VS Code
- Node.js v24.15.0 ✓
- PostgreSQL 18 (local) ✓
- GitHub repo: `devops-dashboard` ✓
- Thunder Client installed ✓
- TypeScript experience: learning as part of this project

## File Structure (current)
```
src/
  controllers/
    user.controller.ts
  generated/
    prisma/
      client.ts
      (+ other generated files)
  lib/
    prisma.ts
  middleware/
    validate.ts
  routes/
    user.routes.ts
  schemas/
    user.schema.ts
  index.ts
prisma/
  migrations/
    20260505003409_init/
      migration.sql
  schema.prisma
prisma.config.ts
docs/
  decisions.md
.claude/
  instructions.md
  progress.md
```