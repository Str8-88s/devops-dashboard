# Claude Progress — DevOps Dashboard Project

## Current Status

**Phase:** Phase 3 — Advanced Features
**Current Week:** Week 11 (in progress)
**Last Updated:** May 17, 2026
**Deployment Strategy:** Cloud Run (GCP) + Supabase (PostgreSQL) + Upstash (Redis) — zero cost stack
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
- [x] **Week 9:** WebSocket server, real-time dashboard updates
- [x] **Week 10:** Redis caching, rate limiting, cache invalidation
- [ ] **Week 11:** Monitoring, health checks, error tracking, observability ← *in progress*
- [ ] **Week 12:** Docs, ADRs, API docs, technical blog post

---

## Session Log

### Session 1 — May 3, 2026
- Git initialized, GitHub repo created, Express + TypeScript server running
- `.claude/` context strategy established

### Session 2 — May 4, 2026
- Zod validation, CRUD routes, Prisma v7 + PostgreSQL setup

### Session 3 — May 5, 2026
- Real Prisma DB calls, bcrypt, SIGTERM handler

### Session 4 — May 5, 2026
- JWT auth, refresh tokens, authenticate middleware

### Session 5 — May 5, 2026
- React + Vite frontend, login page, CORS
- **Commit:** `feat: scaffold React frontend with login form and CORS config`

### Session 6 — May 6, 2026
- httpOnly cookie refresh tokens, token rotation, AuthProvider, ProtectedRoute
- **Commit:** `feat: React frontend with auth flow, protected routes, silent refresh`

### Session 7 — May 7, 2026
- AppError, centralized error handler, Pino structured logging
- **Commit:** `feat: centralized error handling and structured logging`

### Session 8 — May 10, 2026
- Jest 29 + ts-jest 29, integration test suite, 94.71% coverage, app.ts/index.ts split

### Session 9 — May 13, 2026
- Supabase setup, Docker, Cloud Run deployment — production URL live

### Session 10 — May 16, 2026
- Workload Identity Federation, GitHub Actions CI/CD pipeline green

### Session 11 — May 16, 2026
- Socket.io backend, shared socket.ts module, DashboardPage with live activity feed
- **Commit:** `feat: WebSocket server with real-time activity feed`

### Session 12 — May 17, 2026
- Logout button, nav structure, Redis rate limiting, /me caching, cache invalidation
- **Commits:** rate limiting, caching, cache invalidation

### Session 13 — May 17, 2026

**Completed:**
- Enhanced `/health` endpoint — checks DB (`SELECT 1`) and Redis (`ping`) live
- Returns `degraded` + 503 when any dependency is down; verified with Redis stopped
- Spun up Upstash Redis (Pay as You Go, us-east1, eviction off)
- Updated `src/lib/redis.ts` — uses `REDIS_URL` env var when set, falls back to localhost
- Added `REDIS_URL` to `.env`, GitHub Secrets, and Cloud Run `env_vars` in `deploy.yml`
- Fixed CI test failures — `rateLimiter.ts` skips entirely in test env (`NODE_ENV=test`)
- Fixed CI test failures — `redis.del` in `updateUser`/`deleteUser` wrapped in try/catch
- Added `--forceExit` to Jest test script
- All 21 tests passing in CI, deploy green
- Production `/health` returning all healthy with Upstash Redis live

**Key concepts covered:**
- `503` on degraded health — load balancers and Cloud Run act on status codes
- `degraded` state — app is up but not fully operational
- Fail open on Redis errors — Redis outage shouldn't take down login or user updates
- Skip Redis in test env — tests shouldn't depend on external services
- `--forceExit` on Jest — prevents hang when ioredis handles don't close cleanly
- Upstash Pay as You Go — effectively free at this scale

**Commits:**
- `feat: enhanced health check with database and Redis dependency status`
- `feat: Upstash Redis for production, enhanced health check`
- `fix: skip rate limiting in test env, fail open when Redis unavailable`
- `fix: swallow Redis errors in updateUser and deleteUser for test env`

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
| May 13 | Supabase connection method | Session pooler over direct | Direct uses IPv6; session pooler works over IPv4, compatible with Prisma |
| May 13 | Docker base image | node:20-alpine | Minimal image size, LTS Node version |
| May 13 | tsconfig outDir | `./dist` with `rootDir: ./src` | Ensures compiled output lands directly in dist/ not dist/src/ |
| May 16 | CI/CD auth | Workload Identity Federation | Org policy blocked key creation; WIF is more secure anyway |
| May 16 | Dockerfile build | Build TypeScript inside Docker | Ensures image is always built from source |
| May 16 | Socket.io instance location | src/lib/socket.ts shared module | Avoids circular dependency with index.ts |
| May 16 | Socket.io server attachment | io.attach(httpServer, options) in index.ts | socket.ts constructs io first; index.ts attaches after |
| May 17 | Redis client | ioredis over official redis package | Better TypeScript support, more reliable reconnection |
| May 17 | Redis connection | lazyConnect: true | App stays resilient if Redis is down on startup |
| May 17 | Rate limit key | req.ip directly | Functionally correct; normalizing IPv6-mapped addresses adds complexity |
| May 17 | Rate limit storage | Redis over in-memory | Survives restarts, works across multiple Cloud Run instances |
| May 17 | Cache TTL | 5 minutes for /me endpoint | Balances freshness with DB load reduction |
| May 17 | Cache invalidation | redis.del on update/delete | Prevents stale data; next read repopulates from DB |
| May 17 | Production Redis | Upstash Pay as You Go | Zero cost at this scale; no refactoring needed |
| May 17 | Local Redis | Docker container | Already have Docker Desktop; no WSL required |
| May 17 | Health check | Live dependency checks over static response | Real status — DB SELECT 1 + Redis ping; 503 on degraded |
| May 17 | Redis test behavior | Skip rate limiting + fail open on cache ops | Tests shouldn't depend on Redis; Redis outage shouldn't break core app |
| May 17 | Jest exit | --forceExit | ioredis keeps async handles open; forceExit prevents CI hang |

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
- Redis: Docker container (`redis-dev`) on port 6379 — local dev
- Redis: Upstash (Pay as You Go, us-east1) — production
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
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── rateLimiter.ts
│   │   └── socket.ts
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
│       │   ├── DashboardPage.tsx
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
├── .github/
│   └── workflows/
│       └── deploy.yml
├── Dockerfile
├── .dockerignore
├── jest.config.js
└── prisma.config.js
```

## Outstanding / Next Session

- Docker Compose for single-command local dev startup
- Sentry error tracking (free tier)
- Week 12: Documentation, ADRs, API docs, technical blog post
