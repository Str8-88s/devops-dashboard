# Claude Progress — DevOps Dashboard Project

## Current Status

**Phase:** Phase 4 — Dashboard Enhancements
**Current Week:** Week 14 (complete)
**Last Updated:** June 8, 2026
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
- [x] **Week 14:** React frontend served from Express, full production deployment

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
- `TrackedRepo` table + Prisma migration
- Repo CRUD endpoints + settings page
- Commit activity endpoint + heatmap widget
- **Commits:** `feat: per-user repo config, commit heatmap, settings page`

### Session 20 — June 8, 2026
- React frontend now served from Express — `express.static` + catch-all route
- Dockerfile updated to build React client inside the container
- Login and Register pages styled to match dashboard
- Register link added to login page, login link added to register page
- Supabase migration deployed — `TrackedRepo` table applied to production
- `CLIENT_URL` env var added to Cloud Run for CORS
- Fixed path-to-regexp incompatibility (`*` → `/{*path}`)
- Fixed `.dockerignore` excluding `client/` directory
- Fixed hardcoded `localhost:3000` URLs — replaced with relative paths + `VITE_API_URL` for Socket.io
- Fixed `ApiResponse` wrapper mismatch between backend and frontend
- Full production dashboard verified — pipeline health, CI/CD runs, commit heatmap all loading with real data
- **Commits:** `feat: serve React frontend from Express`, `fix: update catch-all route`, `fix: remove client from dockerignore`, `fix: replace hardcoded localhost URLs`, `fix: unwrap ApiResponse wrapper for GitHub endpoints`

---

## Technical Decisions Log

| Date | Decision | Choice | Why |
|------|----------|--------|-----|
| May 3 | ORM | Prisma over raw SQL | Type safety, migrations, easier testing |
| May 3 | Auth | JWT over sessions | Stateless, scales horizontally, works with Cloud Run |
| May 3 | Database | PostgreSQL over MongoDB | Relational model, stronger consistency |
| May 3 | Hosting | Cloud Run over App Engine | Container-based, more control, easier local dev |
| May 5 | Prisma v7 client init | PrismaPg adapter | v7 requires explicit adapter |
| May 6 | Token storage | In-memory access token + httpOnly cookie for refresh token | Eliminates XSS exposure |
| May 10 | App/server split | `app.ts` + `index.ts` | Supertest needs importable app without starting HTTP server |
| May 10 | Production database | Supabase over Cloud SQL | Cloud SQL ~$12-15/month idle; Supabase free |
| May 16 | CI/CD auth | Workload Identity Federation | Org policy blocked key creation; WIF is more secure |
| May 17 | Redis client | ioredis | Better TypeScript support, reliable reconnection |
| May 17 | Production Redis | Upstash Pay as You Go | Zero cost at this scale |
| May 25 | GitHub API client | Native fetch over Octokit | No extra dependency; fetch built into Node 18+ |
| May 27 | Donut chart | CSS conic-gradient over Recharts | Recharts incompatible with Vite build |
| May 27 | PAT encryption | Plaintext + TODO comment, deferred | Encryption requires key management strategy |
| May 29 | Per-user repo config | TrackedRepo table | Enables multi-tenancy from the start |
| May 29 | Heatmap orientation | Columns = weeks, rows = days | Matches GitHub contribution graph layout |
| Jun 8 | Frontend serving | Express static + catch-all | Single deployment unit; no separate frontend host needed |
| Jun 8 | Catch-all route | `/{*path}` over `*` | path-to-regexp v8 removed bare wildcard support |
| Jun 8 | Client URLs | Relative paths + VITE_API_URL for Socket.io | Works in both dev and production without hardcoding |
| Jun 8 | Supabase migration | `prisma migrate deploy` with swapped DATABASE_URL | Prisma reads DATABASE_URL specifically; swap to prod URL, run, swap back |

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
│   ├── types/
│   │   └── api.ts
│   ├── app.ts
│   └── index.ts
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── lib/
│   │   │   ├── authContext.tsx
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   └── App.tsx
│   ├── .env.development
│   └── .env.production
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
├── .dockerignore
├── .env.example
├── README.md
├── jest.config.js
└── prisma.config.js
```

## Outstanding / Next Sessions

1. **Blog post review** — read `docs/blog-post.md` carefully before publishing
2. **Cleanup** — remove `.claude/instructions.md` from this repo once blog post is published
3. **Future widget ideas** — repo stats card (stars, forks, open issues), success rate trend over time
4. **PAT encryption** — key management strategy needed before any real multi-user production use
