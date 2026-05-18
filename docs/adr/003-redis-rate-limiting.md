# ADR-003: Redis-Backed Rate Limiting

## Status
Accepted

## Context
The API is publicly accessible and deployed to Google Cloud Run, which can run multiple container instances simultaneously under load. Rate limiting is required to prevent abuse and protect downstream dependencies (Supabase PostgreSQL, Upstash Redis).

The key constraint: any rate limiting solution must work correctly across multiple instances. A counter that lives in one process is invisible to other processes handling requests from the same client.

## Decision
Implement rate limiting using `ioredis` as the backing store. Each request increments a key in Redis scoped to the client's IP address with a 15-minute TTL. If the counter exceeds the threshold (100 requests per 15 minutes), the middleware returns a `429 Too Many Requests` response before the request reaches any route handler.

The rate limiter is implemented as Express middleware and applied globally in `app.ts`.

In the test environment (`NODE_ENV=test`), rate limiting is skipped entirely via an early return — tests should not depend on infrastructure services.

Redis connection uses `lazyConnect: true` so the application starts successfully even if Redis is temporarily unavailable. If Redis is down, rate limiting fails open (requests are allowed through) rather than taking the API down entirely.

## Alternatives Considered

**In-memory rate limiting (Map or similar)** — simplest implementation, zero dependencies. Rejected because counters reset on every process restart and are not shared across Cloud Run instances — two requests from the same IP hitting different instances would each see a fresh counter.

**express-rate-limit with memory store** — same problem as above. The package supports pluggable stores, but using its Redis store adds a wrapper around what is already a straightforward Redis operation.

**No rate limiting** — unacceptable for a publicly deployed API.

## Consequences

- Rate limit state survives process restarts and is consistent across all Cloud Run instances
- Redis becomes a soft dependency — the fail-open strategy means a Redis outage degrades protection but does not take down the API
- `lazyConnect: true` means connection errors surface on first use rather than startup, which requires careful error handling in the rate limiter middleware
- Test suite skips rate limiting entirely — this is the correct tradeoff since rate limiting is infrastructure behavior, not business logic
