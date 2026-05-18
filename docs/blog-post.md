# What I Learned Building a Production Node.js API From Scratch

I've been working as an SDET in healthcare IT for a while now — writing test automation frameworks, building internal tooling, keeping CI pipelines green. Strong JavaScript background, comfortable with SQL, familiar with the full stack in theory. But I'd never built a production backend from the ground up and owned every decision myself.

So I did. Over the past several weeks I built a DevOps Dashboard — a team metrics and developer tools platform — using React, TypeScript, Node.js, Express, PostgreSQL, Redis, Socket.io, and Docker, deployed to Google Cloud Run via GitHub Actions. The kind of project where you can't copy someone else's architecture decisions because you have to make them yourself.

This isn't a tutorial. It's an honest account of what actually cost me time, what I'd do differently, and what I understand now that I didn't before.

---

## The Stack

Before getting into what went wrong, here's what I built and why:

- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT with httpOnly cookie refresh tokens
- **Real-time:** Socket.io
- **Caching + Rate limiting:** Redis (Upstash in production)
- **Logging:** Pino
- **Testing:** Jest + Supertest — 94% coverage
- **Deployment:** Docker + GCP Cloud Run + GitHub Actions CI/CD
- **Error tracking:** Sentry

The project is live. The API docs are at [devops-dashboard-985792054692.us-east1.run.app/api/docs](https://devops-dashboard-985792054692.us-east1.run.app/api/docs).

---

## Problem 1: Prisma v7 Broke Everything I Read Online

Prisma was the first major technical wall I hit. I'd used ORMs before and the setup looked straightforward — install the package, define your schema, initialize the client, run queries. Every tutorial, every Stack Overflow answer, every piece of documentation I found showed the same thing:

```typescript
const prisma = new PrismaClient()
```

It didn't work. Queries failed. The connection was never established. No useful error message.

After going in circles for longer than I'd like to admit, I found the issue: Prisma v7 introduced a breaking change that almost no online resource had caught up to yet. The ORM no longer handles database connections implicitly. You have to pass an explicit database adapter to the constructor:

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

And there's more: the `url` field was removed from `schema.prisma` entirely. All connection config now lives in `prisma.config.ts`. If you're used to v6, nothing about v7 setup looks wrong until it silently doesn't work.

The fix is simple once you know it. Finding it is the hard part when every example you can find shows the old API.

**What I took from this:** Version numbers matter more than I gave them credit for. When something doesn't work despite following the docs exactly, check whether the docs are for the version you're actually running. The Prisma changelog would have saved me hours.

---

## Problem 2: GitHub Actions and GCP Auth Going in Circles

The CI/CD pipeline was the other place I lost significant time. The goal was simple: push to main, run tests, build a Docker image, deploy to Cloud Run. Standard stuff.

The standard approach for authenticating GitHub Actions with GCP is to create a service account, export a JSON key, and store it as a GitHub Secret. I set it up, followed the documentation, and hit a wall: the GCP organization policy had `constraints/iam.disableServiceAccountKeyCreation` enforced. Key creation was blocked at the org level. No amount of IAM configuration was going to fix it.

The alternative is Workload Identity Federation — GCP's keyless authentication mechanism. Instead of a stored credential, GitHub Actions presents a short-lived OIDC token to GCP, which exchanges it for a short-lived access token scoped to that specific workflow run. No long-lived credentials stored anywhere.

The concept is straightforward. The setup is not. It requires:

1. Creating a Workload Identity Pool in GCP
2. Creating a Provider within that pool linked to GitHub's OIDC issuer
3. Binding the provider to a service account with the correct IAM roles
4. Getting the `google-github-actions/auth` workflow step configured with the right attribute mappings

Every step has multiple ways to get it slightly wrong. The error messages from GCP when authentication fails are not always specific about which step failed. I went through several iterations before the pipeline went green.

Once it worked, I realized the org policy forcing my hand had actually pushed me toward the better solution. Service account JSON keys are long-lived credentials that need to be rotated, audited, and protected. WIF tokens expire automatically after the workflow run. There's nothing to rotate and nothing to leak.

**What I took from this:** When infrastructure forces you away from the easy path, it's worth understanding why the easy path exists and whether the harder path is actually better. In this case it was.

---

## The Auth Implementation Was More Subtle Than Expected

JWT authentication looks simple until you start thinking through the attack surface.

The naive implementation — store the token in localStorage, send it with every request — is fine for a side project and a security problem in production. localStorage is accessible to any JavaScript on the page. One XSS vulnerability and every token is exposed.

The approach I implemented:

- **Access token:** stored in memory (a module-level variable in React), never in localStorage or sessionStorage. Sent as a Bearer token in the Authorization header. 15-minute expiry.
- **Refresh token:** stored in an httpOnly cookie — inaccessible to JavaScript entirely. Used only to get new access tokens. 7-day expiry, stored in the database to allow revocation on logout.

Token rotation on every refresh: the old token is deleted, a new one is issued. A stolen refresh token can only be used once before it's invalidated.

One non-obvious detail: each refresh token needs a `jti` (JWT ID) claim set to a UUID. Without it, two tokens signed for the same user within the same second produce identical token strings — which causes unique constraint violations in the database. This is the kind of bug that doesn't show up in normal usage and only appears under specific timing conditions.

Another non-obvious detail: React's StrictMode double-fires `useEffect` in development. Silent refresh on mount (calling the refresh endpoint when the app loads) consumes the refresh token before the second call can use it, which breaks token rotation in dev. I disabled StrictMode during development and flagged it to revisit before production.

---

## Testing at 94% Coverage Taught Me More Than I Expected

I came in with a testing background. Writing tests wasn't new. Writing integration tests against a real database with a real HTTP server was.

A few things that took adjustment:

**Test isolation requires a separate database.** Running tests against the dev database means test data bleeds into your local environment and vice versa. A `NODE_ENV=test` environment variable switches the Prisma connection string to a dedicated test database. Simple, but easy to skip.

**Parallel test execution breaks on a shared database.** Jest runs test suites in parallel by default. Two suites running `deleteMany` and `create` against the same database at the same time produce race conditions and foreign key violations. The fix is `--runInBand` — serial execution. Slower, but correct.

**The app/server split is necessary for Supertest.** Supertest needs to import the Express `app` object without starting the HTTP server. If your app and server are in the same file, importing it in tests starts the server as a side effect. Splitting into `app.ts` (Express setup) and `index.ts` (server start) solves it cleanly and is standard practice in production Node.js applications.

---

## Redis Was Simpler Than I Expected, With One Catch

Adding Redis for caching and rate limiting was straightforward — `ioredis` has good TypeScript support and the API is clean. Cache a response, set a TTL, delete the key on write. Rate limit by IP address, increment a counter, return 429 if it exceeds the threshold.

The one thing worth noting: in-memory rate limiting doesn't work on Cloud Run. Cloud Run can run multiple container instances simultaneously, and each instance has its own memory. A rate limit counter in one process is invisible to another. Redis solves this because the counter lives outside any single process and is shared across all instances.

This is a general lesson: any state that needs to be consistent across multiple instances of your application cannot live in process memory.

---

## What the SDET Background Actually Helped With

Going into this I wasn't sure whether my testing background would be an asset or a liability — something I'd have to explain away rather than lead with.

It turned out to be genuinely useful. I thought about edge cases earlier than I might have otherwise. The test suite has real coverage because I knew what to test, not just how to write tests. The health check endpoint does live dependency checks (a real `SELECT 1` against the database, a real `PING` to Redis) rather than returning a static response — because I knew that a static health check doesn't actually tell you anything about the state of your dependencies.

The framing I'd use now: an SDET background doesn't mean you write tests instead of features. It means you think about correctness as part of building features, not as an afterthought.

---

## What I'd Do Differently

**Read changelogs before starting.** The Prisma v7 situation would have been a 10-minute read instead of hours of debugging.

**Set up CI/CD earlier.** I deployed manually for most of the project and added the pipeline near the end. Having automated deployment from the first week would have caught environment-specific issues earlier.

**Plan the token rotation edge cases up front.** The StrictMode issue and the `jti` uniqueness requirement were both things I hit mid-implementation. Neither is hard to handle, but both would have been easier to design for from the start.

---

## Where It Ended Up

The project is deployed and running. 94% test coverage. Automated CI/CD. Structured logging, centralized error handling, Sentry for production error tracking, Redis caching and rate limiting, real-time updates via Socket.io, and full API documentation via Swagger.

The architecture decisions are documented in [ADRs](docs/adr/) — not because anyone required it, but because "why did I make this choice" is a more interesting question than "what did I build."

The code is at [github.com/Str8-88s/devops-dashboard](https://github.com/Str8-88s/devops-dashboard).

---

*Built with Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, Socket.io, Docker, and GCP Cloud Run.*
