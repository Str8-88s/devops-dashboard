# Claude Progress — DevOps Dashboard Project

## Current Status

**Phase:** Phase 4 — Dashboard Enhancements
**Current Week:** Week 14 (in progress)
**Last Updated:** May 29, 2026
**Deployment Strategy:** Cloud Run (GCP) + Supabase (PostgreSQL) + Upstash (Redis) — zero cost stack
**Production URL:** https://devops-dashboard-985792054692.us-east1.run.app
**Swagger UI:** https://devops-dashboard-985792054692.us-east1.run.app/api/docs

---

## 12-Week Plan

### Phase 1: Foundation (Weeks 1–4)
- [x] **Week 1:** TypeScript + Express setup, basic CRUD, request validation
- [x] **Week 2:** PostgreSQL + Prisma, database schema, migrations
- [x] **Week 3:** JWT authentication, password hashing, protected routes
- [x] **Week 4:** React + TypeScript frontend, login/register flow, routing

### Phase 2: Production Quality (Weeks 5–8)
- [x] **Week 5:** Error handling middleware, structured logging, input validation
- [x] **Week 6:** Testing suite (unit, integration, component — 94% coverage)
- [x] **Week 7:** Docker + GCP Cloud Run + Supabase deployment
- [x] **Week 8:** CI/CD pipeline with GitHub Actions, automated tests

### Phase 3: Advanced Features (Weeks 9–12)
- [x] **Week 9:** WebSocket server, real-time dashboard updates
- [x] **Week 10:** Redis caching, rate limiting, cache invalidation
- [x] **Week 11:** Docker Compose, enhanced health checks, Upstash Redis, Sentry error tracking
- [x] **Week 12:** Swagger/OpenAPI docs, README, ADRs, blog post, debug cleanup

### Phase 4: Enhancements (Week 13+)
- [x] **Week 13:** GitHub API integration — workflow runs endpoint + dashboard widget
- [x] **Week 13:** Pipeline health donut widget
- [x] **Week 14:** Per-user repo config + commit activity heatmap widget

---

## Session Log

### Session 1 — May 3, 2026
- Git initialized, GitHub repo created, Express + TypeScript server running

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

### Session 13 — May 17, 2026
- Enhanced health check, Upstash Redis, CI test fixes, all 21 tests passing in CI

### Session 14 — May 17, 2026
- Docker Compose, Sentry error tracking integration, route ordering fix in app.ts

### Session 15 — May 17, 2026
- Swagger/OpenAPI live in production, README with Mermaid diagram, .env.example

### Session 16 — May 18, 2026
- 6 ADRs written, debug cleanup, technical blog post written
- **Commit:** `docs: add architecture decision records (ADR-001 through ADR-006)`

### Session 17 — May 25, 2026
- GitHub API integration — `GET /api/github/workflows`, CI/CD runs widget
- **Commit:** `feat: GitHub Actions workflow runs widget`

### Session 18 — May 27, 2026
- Deployed GitHub integration to production (Cloud Run env vars added)
- Pipeline health donut widget — CSS conic-gradient, run history dots, passed/failed counts
- **Commit:** `feat: pipeline health donut widget`

### Session 19 — May 29, 2026
- `TrackedRepo` table + Prisma migration (`add-tracked-repo`)
- Repo CRUD endpoints (`GET/POST/DELETE /api/repos`) + `repo.controller.ts` + `repo.routes.ts`
- GitHub controller updated — pulls repo from DB, falls back to env vars, cache scoped per user
- Settings page — owner/repo/PAT input, save/remove, loads existing config, autofill disabled
- Commit activity endpoint (`GET /api/github/commits`) — 90 days, date-keyed counts, Redis cached
- Commit heatmap widget — GitHub-style grid, month labels (Mar/Apr/May), day labels (Mon/Wed/Fri), color intensity
- Fixed Vite port conflict (5173 taken by stale node process)
- Fixed browser caching 304 on `/api/repos` with Cache-Control: no-cache header
- **Commits:** `feat: per-user repo config, commit heatmap, settings page`, `chore: add recharts to client dependencies`

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
| May 5 | Prisma v7 client init | PrismaPg adapter | v7 requires explicit adapter |
| May 5 | Prisma connection config | `prisma.config.ts` only | v7 removed `url` from `schema.prisma` |
| May 5 | Frontend scaffold | Vite + React + TypeScript | Fast dev server, first-class TS support |
| May 6 | Token storage | In-memory access token + httpOnly cookie for refresh token | Eliminates XSS exposure |
| May 6 | Token rotation | Delete old + issue new on every refresh | Replay attacks fail |
| May 6 | StrictMode | Removed during development | Double-fires useEffect in dev, breaks token rotation |
| May 7 | Logger | Pino over Winston | Faster, JSON by default, ships own types |
| May 10 | Test runner | Jest 29 + ts-jest 29 | ts-jest 29 not compatible with Jest 30 |
| May 10 | Test execution | `--runInBand` | Prevents cross-suite DB race conditions |
| May 10 | App/server split | `app.ts` + `index.ts` | Supertest needs importable app without starting HTTP server |
| May 10 | Refresh token uniqueness | `jti: randomUUID()` | Tokens signed same second produce identical strings without jti |
| May 10 | Production database | Supabase over Cloud SQL | Cloud SQL ~$12-15/month idle; Supabase free |
| May 13 | Supabase connection | Session pooler | IPv4 compatible, works with Prisma prepared statements |
| May 16 | CI/CD auth | Workload Identity Federation | Org policy blocked key creation; WIF is more secure |
| May 16 | Socket.io instance | src/lib/socket.ts shared module | Avoids circular dependency with index.ts |
| May 17 | Redis client | ioredis | Better TypeScript support, reliable reconnection |
| May 17 | Redis connection | lazyConnect: true | App stays resilient if Redis down on startup |
| May 17 | Rate limit storage | Redis over in-memory | Works across multiple Cloud Run instances |
| May 17 | Production Redis | Upstash Pay as You Go | Zero cost at this scale |
| May 17 | Health check | Live dependency checks | Real status — DB SELECT 1 + Redis ping; 503 on degraded |
| May 17 | Error tracking | Sentry over manual logging | Automatic capture, stack traces, email alerts |
| May 17 | Sentry capture scope | 5xx errors only | 4xx are expected client errors |
| May 25 | GitHub API client | Native fetch over Octokit | No extra dependency; fetch built into Node 18+ |
| May 25 | GitHub auth | Personal access token in .env | Simple, free, server-side only |
| May 25 | GitHub cache TTL | 5 minutes | Matches /me endpoint TTL |
| May 27 | Donut chart | CSS conic-gradient over Recharts | Recharts incompatible with Vite build |
| May 27 | PAT encryption | Plaintext + TODO comment, deferred | Encryption requires key management strategy — flagged explicitly |
| May 27 | Per-user repo config | TrackedRepo table | Enables multi-tenancy from the start; no throwaway code |
| May 29 | TrackedRepo userId | @unique constraint | One repo per user enforced at DB level |
| May 29 | Repo upsert | prisma.trackedRepo.upsert | Single operation handles both create and update |
| May 29 | GitHub cache key | `github:workflow_runs:${userId}` | Scoped per user — different users get their own repo data |
| May 29 | Commit window | 90 days | Sufficient for portfolio demo; GitHub's 365-day graph requires broader API scope |
| May 29 | Commit scope | Single repo only | GitHub contribution graph spans all repos; this is intentionally repo-scoped |
| May 29 | Heatmap orientation | Columns = weeks, rows = days | Matches GitHub contribution graph layout |
| May 29 | Autofill prevention | autoComplete="off" + "new-password" | Browser autofill was populating repo fields with saved credentials |

---

## Environment

- OS: Windows (PowerShell)
- Editor: VS Code
- Node.js v24.15.0 ✓
- PostgreSQL 18 (local) ✓
- Docker Desktop v29.4.3 ✓
- gcloud CLI SDK 568.0.0 ✓
- GitHub repo: `Str8-88s/devops-dashboard` ✓
- Redis: Docker Compose (`docker compose up -d`) — local dev
- Redis: Upstash (Pay as You Go, us-east1) — production
- Sentry: devops_dashboard project (Express) ✓
- Production URL: `https://devops-dashboard-985792054692.us-east1.run.app`
- Swagger UI: `https://devops-dashboard-985792054692.us-east1.run.app/api/docs`

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
│   │   ├── github.controller.ts
│   │   ├── repo.controller.ts
│   │   └── user.controller.ts
│   ├── lib/
│   │   ├── AppError.ts
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── rateLimiter.ts
│   │   ├── sentry.ts
│   │   ├── socket.ts
│   │   └── swagger.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── github.routes.ts
│   │   ├── repo.routes.ts
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
│       │   ├── RegisterPage.tsx
│       │   └── SettingsPage.tsx
│       └── App.tsx
├── prisma/
│   ├── migrations/
│   │   └── 20260529003948_add_tracked_repo/
│   └── schema.prisma
├── docs/
│   ├── adr/
│   ├── blog-post.md
│   └── decisions.md
├── .claude/
│   ├── instructions.md
│   └── progress.md
├── .github/workflows/deploy.yml
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── README.md
├── jest.config.js
└── prisma.config.js
```

## Outstanding / Next Sessions

1. **Deploy to production** — push triggers CI/CD; then run `prisma migrate deploy` against Supabase for the TrackedRepo migration
2. **Personal site go-live** — purchase `thomaswitherow.dev` June 1st, Formspree production verify
3. **Blog post review** — read `docs/blog-post.md` carefully before publishing
4. **Cleanup** — remove `.claude/instructions.md` from this repo once blog post is published
5. **Future widget ideas** — repo stats card (stars, forks, open issues), success rate trend over time
