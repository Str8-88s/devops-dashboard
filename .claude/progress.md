# Claude Progress — DevOps Dashboard Project

## Current Status

**Phase:** Phase 1 — Foundation  
**Current Week:** Week 2 (active)  
**Last Updated:** May 4, 2026

---

## 12-Week Plan

### Phase 1: Foundation (Weeks 1–4)
- [x] **Week 1:** TypeScript + Express setup, basic CRUD, request validation
- [ ] **Week 2:** PostgreSQL + Prisma, database schema, migrations ← *active*
- [ ] **Week 3:** JWT authentication, password hashing, protected routes
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

**Next session — continue Week 2:**
- Swap controller stubs for real Prisma DB calls
- Instantiate PrismaClient
- Implement `createUser`, `getUser`, `updateUser`, `deleteUser` with real DB operations
- Handle Prisma errors (unique constraint violations, not found, etc.)

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

---

## Environment

- OS: Windows (PowerShell)
- Editor: VS Code
- Node.js ✓
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