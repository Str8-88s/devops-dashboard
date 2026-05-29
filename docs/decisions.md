Decision: ORM
Choice: Prisma over raw SQL
Why: Type safety, migrations, easier testing

---

Decision: Auth strategy
Choice: JWT over sessions
Why: Stateless, scales horizontally, works with Cloud Run

---

Decision: Database
Choice: PostgreSQL over MongoDB
Why: Relational model, stronger consistency

---

Decision: Hosting
Choice: Cloud Run over App Engine
Why: Container-based, more control, easier local dev

---

Decision: Port config
Choice: process.env.PORT
Why: Cloud Run injects its own PORT at runtime

---

Decision: Context management
Choice: .claude/ folder in repo over copy-paste instructions
Why: Version-controlled, no copy-paste, split stable vs active context

---

Decision: Validation library
Choice: Zod over express-validator
Why: TypeScript-native, inferred types via z.infer, pairs naturally with Prisma schemas later

---

Decision: Validation placement
Choice: Middleware over controllers
Why: Separation of concerns — controllers stay focused on business logic, validation is reusable across routes, controllers receive data they can trust

---

Decision: API testing tool
Choice: Thunder Client over curl
Why: Avoids PowerShell curl alias issues, lives in VS Code, saves request collections for reuse across sessions

---

Decision: Zod version
Choice: Zod v4
Why: Current release; breaking API changes from v3 — use `z.email()` not `z.string().email()`, and `z.infer` not `z.Infer`. Many online examples still show v3 syntax.

---

Decision: PostgreSQL setup
Choice: Local PostgreSQL 18 install over Prisma Postgres hosted service
Why: Prisma Postgres v7 connection string format caused unresolved errors; local install matches Cloud SQL deployment path better and gives full control over the database

---

Decision: Prisma v7 client initialization
Choice: PrismaPg adapter passed explicitly to PrismaClient constructor
Alternatives considered: new PrismaClient() with no args (v6 style)
Why: Prisma v7 requires an explicit database adapter — the runtime no longer handles the connection implicitly. Must install @prisma/adapter-pg and pass it via new PrismaClient({ adapter })

---

Decision: Prisma connection config location
Choice: prisma.config.ts only — removed url from schema.prisma
Alternatives considered: keeping url = env("DATABASE_URL") in schema.prisma (v6 style)
Why: Prisma v7 removed datasource url from schema.prisma entirely. All connection configuration now lives in prisma.config.ts under the datasource.url field.

---

Decision: Password change excluded from updateUser
Alternatives considered: Allowing password field in UpdateUserSchema
Why: Password changes require current password verification — bundling into a generic update endpoint is a security risk. Dedicated /change-password endpoint to be added in Week 3 alongside JWT auth.

---

Decision: Graceful shutdown via SIGTERM
Alternatives considered: No shutdown handler
Why: Cloud Run sends SIGTERM before terminating containers. Disconnecting Prisma cleanly prevents connection pool issues. Low effort now, avoids production problems in Week 7.

---

Decision: Access token expiry
Choice: 15 minutes
Alternatives considered: 1 hour, 24 hours
Why: Short expiry limits damage from token theft. Refresh token handles seamless re-auth without user friction.

---

Decision: Refresh token storage
Choice: Database (RefreshToken table) over stateless JWT-only
Alternatives considered: Stateless refresh tokens, Redis
Why: Database storage allows token revocation on logout. Stateless refresh tokens can't be invalidated. Redis added later in Week 10.

---

Decision: Auth middleware data passing
Choice: res.locals.userId over custom Request type extension
Alternatives considered: Extending Express Request interface with custom userId field
Why: res.locals is the Express-idiomatic pattern for middleware-to-handler communication. Simpler for now — can migrate to typed Request extension in Week 5 when hardening.

---

Decision: Frontend scaffold
Choice: Vite + React + TypeScript
Alternatives considered: Create React App
Why: Faster dev server, first-class TS support, actively maintained — CRA is deprecated

---

Decision: CORS middleware placement
Choice: Before routes in index.ts
Alternatives considered: After routes
Why: Express runs middleware in registration order — CORS headers must be set before any route handler responds

---

Decision: Token storage
Choice: In-memory access token + httpOnly cookie for refresh token
Alternatives considered: localStorage
Why: Eliminates XSS exposure for access token. httpOnly cookie prevents JS access to refresh token. Silent refresh on mount restores session after page reload.

---

Decision: StrictMode
Choice: Removed during development
Alternatives considered: Keeping StrictMode, implementing idempotent refresh
Why: StrictMode double-fires useEffect in dev, which consumes the refresh token on rotation before the second call can use it. Revisit in Week 6.

---

Decision: Logger
Choice: Pino over Winston
Alternatives considered: Winston
Why: Faster, JSON output by default, ships its own types — no @types/pino needed. pino-pretty handles human-readable dev output.

---

Decision: Request logging middleware
Choice: Manual middleware over pino-http
Alternatives considered: pino-http
Why: pino-http v11 has type incompatibilities with commonjs + ts-node setup. Manual middleware produces identical output (method, url, statusCode, duration) with no import issues.

---

Decision: Error handler structure
Choice: AppError (4xx) → logger.warn, unknown (5xx) → logger.error
Alternatives considered: logging all errors at same level
Why: Distinguishing client errors from server errors makes production log filtering meaningful — 4xx are expected, 5xx need immediate attention.

---

Decision: Validation error routing
Choice: Zod errors flow through errorHandler via next(new AppError(400, ...))
Alternatives considered: Responding directly in validate middleware
Why: Consistent error shape across all failure modes — frontend always receives { error: string }. Centralized handler is the single source of truth for error responses.

---

Decision: Test runner version
Choice: Jest 29 + ts-jest 29 + @types/jest 29
Alternatives considered: Jest 30 (latest)
Why: ts-jest 29 is not compatible with Jest 30. All three packages must match major version exactly or type definitions break.

---

Decision: Test execution mode
Choice: --runInBand flag on all test scripts
Alternatives considered: Default parallel execution
Why: Parallel test suites share the same PostgreSQL test database — concurrent deleteMany/create calls cause foreign key violations and race conditions. Serial execution eliminates this entirely.

---

Decision: Test database
Choice: Separate devops_dashboard_test database
Alternatives considered: Same dev database, SQLite in-memory
Why: Keeps test data completely isolated from dev data. Matches Cloud SQL deployment path better than SQLite. NODE_ENV=test in prisma.ts switches the connection string automatically.

---

Decision: App/server split
Choice: src/app.ts (Express setup) + src/index.ts (listen + SIGTERM)
Alternatives considered: Single index.ts file
Why: Supertest needs to import the Express app without starting the HTTP server. Splitting allows tests to import app directly while production entry point remains index.ts.

---

Decision: Refresh token uniqueness
Choice: jti: randomUUID() added to signRefreshToken payload
Alternatives considered: Relying on iat (issued-at) claim alone
Why: JWT iat is in seconds — two tokens signed for the same user within the same second produce identical token strings, causing unique constraint violations in the RefreshToken table. jti guarantees uniqueness regardless of timing.

---

Decision: Production database
Choice: Supabase over Cloud SQL
Alternatives considered: GCP Cloud SQL
Why: Cloud SQL costs ~$12-15/month even at idle. Supabase free tier is generous and also PostgreSQL — zero refactoring required since Prisma abstracts the connection. Cloud Run still on GCP for the resume signal.

---

Decision: Supabase connection method
Choice: Session pooler over direct connection
Alternatives considered: Direct connection (IPv6), Transaction pooler
Why: Supabase direct connections use IPv6 by default — incompatible with IPv4-only environments like local Windows machines. Transaction pooler breaks Prisma prepared statements. Session pooler maintains persistent connections over IPv4 and is fully Prisma-compatible.

---

Decision: Docker base image
Choice: node:20-alpine
Alternatives considered: node:20, node:22-alpine
Why: Alpine minimizes image size. LTS Node 20 is stable and well-supported. Smaller images mean faster Cloud Run cold starts.

---

Decision: tsconfig outDir/rootDir
Choice: rootDir: ./src, outDir: ./dist
Alternatives considered: Default (no rootDir set)
Why: Without explicit rootDir, tsc nests output under dist/src/ instead of dist/. Dockerfile copies dist/ directly — nested output breaks the container entrypoint.

---

Decision: CI/CD GCP authentication
Choice: Workload Identity Federation over service account JSON key
Alternatives considered: Service account JSON key stored in GitHub Secrets
Why: GCP org policy blocked key creation. WIF is also the better approach — GitHub Actions proves identity via short-lived OIDC token, no long-lived credentials stored anywhere.

---

Decision: Dockerfile build strategy
Choice: Build TypeScript inside the Docker image
Alternatives considered: Pre-building locally and copying dist/ into image
Why: dist/ is gitignored and won't exist in CI. Building inside the image ensures the container is always built from source and is fully self-contained.

---

Decision: Socket.io instance location
Choice: Shared Server instance exported from src/lib/socket.ts
Alternatives considered: Creating io in index.ts and passing it to controllers
Why: Controllers need to emit events but cannot import from index.ts — that would be a circular dependency. A dedicated lib module breaks the cycle.

---

Decision: Socket.io server attachment
Choice: io.attach(httpServer, options) called in index.ts after httpServer is created
Alternatives considered: Passing httpServer into socket.ts constructor
Why: The HTTP server is created in index.ts from the Express app. socket.ts constructs the Server instance first with no httpServer argument, then index.ts calls io.attach(httpServer, corsOptions) once the server exists.

---

Decision: Redis client
Choice: ioredis over official redis package
Alternatives considered: Official redis npm package
Why: Better TypeScript support, more reliable reconnection handling, widely used in production Node.js apps.

---

Decision: Redis connection strategy
Choice: lazyConnect: true
Alternatives considered: Eager connection on startup
Why: App stays resilient if Redis is down on startup — connects on first use rather than throwing immediately. Appropriate for a non-critical caching layer.

---

Decision: Rate limit key format
Choice: Use req.ip directly (includes ::ffff: IPv6-mapped prefix)
Alternatives considered: Normalizing ::ffff:127.0.0.1 to 127.0.0.1
Why: Functionally correct for rate limiting — same IP always produces the same key. Normalization adds complexity with no real benefit locally or on Cloud Run.

---

Decision: Rate limit backing store
Choice: Redis over in-memory Map
Alternatives considered: In-memory rate limiting
Why: Redis survives process restarts and works correctly across multiple Cloud Run instances. In-memory counters reset on restart and don't share state across instances.

---

Decision: Cache TTL for /me endpoint
Choice: 5 minutes (300 seconds)
Alternatives considered: 1 minute, 15 minutes, 1 hour
Why: User profile data changes infrequently. 5 minutes balances DB load reduction with data freshness. Explicit cache invalidation on update/delete handles the stale data problem.

---

Decision: Cache invalidation strategy
Choice: Delete cache key on write (redis.del after update/delete)
Alternatives considered: Update cache in place, time-based expiry only
Why: Deleting on write is simpler and safer than updating in place. Next read repopulates from DB with fresh data. Prevents stale profile data from persisting after updates.

---

Decision: Production Redis
Choice: Upstash Pay as You Go
Alternatives considered: GCP Memorystore (~$40/month)
Why: Upstash is serverless Redis with a generous free tier — zero cost at this scale, matches Supabase philosophy. No refactoring required since ioredis connection string is the only change.

---

Decision: Local Redis setup
Choice: Docker Compose over manual docker run
Alternatives considered: Manual docker run command, WSL Redis install
Why: Docker Compose is version controlled, single command startup, no need to remember flags. Matches production infrastructure-as-code philosophy.

---

Decision: Health check implementation
Choice: Live dependency checks (DB SELECT 1 + Redis ping) over static response
Alternatives considered: Static { status: 'healthy' }
Why: Real dependency checks give Cloud Run and load balancers actionable signal. 503 on degraded state enables automatic traffic routing away from unhealthy instances.

---

Decision: Health check degraded state
Choice: status: 'degraded' + 503 when any dependency fails
Alternatives considered: Still return 200 with unhealthy fields
Why: HTTP status codes are what infrastructure acts on — a 200 with unhealthy fields is invisible to load balancers. 503 triggers Cloud Run health check failures and alerts.

---

Decision: Redis behavior in test environment
Choice: Skip rate limiting entirely (NODE_ENV=test early return) + fail open on cache ops
Alternatives considered: Spin up Redis in CI, mock Redis
Why: Tests shouldn't depend on external services. Rate limiting is infrastructure, not business logic — skipping it in tests doesn't reduce test value. Fail open keeps cache ops from breaking tests when Redis is unavailable.

---

Decision: Jest process exit
Choice: --forceExit flag
Alternatives considered: Explicitly closing ioredis in afterAll, --detectOpenHandles
Why: ioredis keeps async handles open after tests complete, preventing Jest from exiting cleanly. forceExit is the standard solution when third-party clients don't expose clean shutdown in test contexts.

---

Decision: Error tracking
Choice: Sentry over manual logging only
Alternatives considered: Relying solely on Pino logs in Cloud Run
Why: Pino logs require manual log inspection. Sentry automatically captures unhandled errors with full stack traces, request context, and user impact grouping. Email alerts on new issues enable proactive response rather than reactive discovery.

---

Decision: Sentry capture scope
Choice: 5xx errors only (inside errorHandler for unknown errors)
Alternatives considered: Capturing all errors including AppError 4xx
Why: 4xx errors are expected client behavior — invalid input, wrong credentials, not found. Capturing them adds noise without value. 5xx errors are bugs that need fixing.

---

Decision: Sentry sample rate
Choice: tracesSampleRate: 1.0 (100%)
Alternatives considered: 0.1 or 0.2 for high-traffic apps
Why: 100% sampling is appropriate for a low-traffic portfolio project. High-traffic production apps would sample lower to control costs and volume.

---

Decision: Express route ordering
Choice: Routes registered before errorHandler, health + test routes above errorHandler
Alternatives considered: Any order
Why: Express runs middleware in registration order. Routes registered after errorHandler never reach it for error handling — thrown errors propagate to the next error handler registered, which must come after all routes.

---

Decision: GitHub API client
Choice: Native fetch over Octokit
Alternatives considered: Octokit SDK
Why: No extra dependency. fetch is built into Node 18+. The workflow runs endpoint is a single REST call — Octokit adds abstraction with no benefit at this scale.

---

Decision: GitHub authentication
Choice: Personal access token stored in .env
Alternatives considered: GitHub App, OAuth
Why: Simple, free, sufficient for read-only access to a single repo. Token is server-side only — never exposed to the client. GitHub App would be appropriate for a multi-user or multi-repo product.

---

Decision: GitHub cache key
Choice: github:workflow_runs
Alternatives considered: —
Why: Consistent with existing Redis key naming convention (resource:descriptor). Clear and collision-safe.

---

Decision: GitHub cache TTL
Choice: 5 minutes (300 seconds)
Alternatives considered: 1 minute, 15 minutes
Why: Matches /me endpoint TTL. Workflow runs don't change frequently enough to justify a shorter TTL. Consistent caching strategy across the API.

---

Decision: GitHub route auth
Choice: authenticate middleware on all /api/github routes
Alternatives considered: Public endpoint
Why: Consistent with all other data endpoints — only authenticated users access dashboard data. Keeps the personal access token one step further from unauthenticated exposure.

---

Decision: Donut chart implementation
Choice: CSS conic-gradient over Recharts
Alternatives considered: Recharts PieChart, Chart.js via canvas
Why: Recharts throws require_isUnsafeProperty error in Vite build — incompatible without additional config. CSS conic-gradient has zero dependencies, renders instantly, and is fully controllable via inline styles. No library needed for a single static visualization.

---

Decision: PAT encryption at rest
Choice: Plaintext storage with TODO comment, encryption deferred
Alternatives considered: AES-256 encryption with key stored in env, bcrypt (one-way, not suitable)
Why: Encryption requires a key management strategy — where the key lives, how it rotates, what happens on key compromise. That's a real infrastructure decision that deserves its own planning session. For a portfolio project, explicitly flagging the gap is more honest and more impressive than a half-implemented scheme. TODO comment ensures it's not forgotten.

---

Decision: Per-user repo config approach
Choice: TrackedRepo table (userId, owner, repo, accessToken nullable)
Alternatives considered: Hardcoded env vars, user-level JSON config field
Why: Enables multi-tenancy from the start — each user configures their own repo. No throwaway code when multi-repo support is added later. Consistent with existing Prisma/PostgreSQL patterns in the codebase.

---

Decision: TrackedRepo userId constraint
Choice: @unique on userId
Why: One repo per user enforced at the database level. Upsert pattern handles both create and update in a single operation.

---

Decision: GitHub cache key scoping
Choice: github:workflow_runs:${userId} and github:commit_activity:${userId}
Why: Different users track different repos — a shared cache key would return the wrong repo's data to other users.

---

Decision: Commit activity window
Choice: 90 days
Alternatives considered: 365 days (GitHub default)
Why: 90 days is sufficient for portfolio demo purposes. 365 days requires pagination across multiple API calls and broader rate limit budget.

---

Decision: Commit activity scope
Choice: Single configured repo only
Alternatives considered: All repos via GitHub events API
Why: GitHub's contribution graph spans all repos; this dashboard is intentionally repo-scoped. The distinction is documented — it's a feature boundary, not a bug.

---

Decision: Heatmap orientation
Choice: Columns = weeks, rows = days of week (GitHub-style)
Alternatives considered: Simple left-to-right row layout
Why: Matches the mental model users already have from GitHub's contribution graph. Immediately recognizable layout.

---

Decision: Autofill prevention
Choice: autoComplete="off" on text inputs, autoComplete="new-password" on password input
Why: Browser autofill was populating the repo owner/name fields with saved email/password credentials. new-password is the only value browsers reliably respect for disabling password autofill.

---

Decision: PAT storage
Choice: Plaintext with TODO comment
Alternatives considered: AES-256 with env key, bcrypt (unsuitable — one-way)
Why: Encryption requires key management strategy. Flagging explicitly is more honest than half-implemented encryption. TODO ensures it's not forgotten before any real production use.
