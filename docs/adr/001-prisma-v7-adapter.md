# ADR-001: Prisma v7 Explicit Database Adapter

## Status
Accepted

## Context
The project uses Prisma ORM for type-safe database access and migrations. During initial setup, Prisma v7 was the current release. Early attempts to initialize the client using the v6 pattern (`new PrismaClient()` with no arguments) produced runtime errors — the connection was never established and queries failed silently.

Investigation revealed that Prisma v7 introduced a breaking change: the ORM no longer handles database connections implicitly. All connection configuration was removed from `schema.prisma` entirely, and the runtime adapter must be passed explicitly to the `PrismaClient` constructor.

## Decision
Install `@prisma/adapter-pg` and pass it explicitly when constructing the Prisma client:

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
```

All connection configuration lives in `prisma.config.ts` under the `datasource.url` field. The `url` field in `schema.prisma` was removed entirely.

## Alternatives Considered

**Stay on Prisma v6** — would have avoided the breaking change but meant running an outdated version from day one. Not appropriate for a project meant to demonstrate current practices.

**Raw SQL with `pg`** — eliminated the ORM abstraction entirely. Rejected because it removes type safety on query results and makes migrations manual.

## Consequences

- Explicit adapter initialization makes the database connection visible in code rather than implicit — easier to reason about and test
- `prisma.config.ts` becomes the single source of truth for connection config
- Most online Prisma examples still show v6 syntax — `new PrismaClient()` with no args — which will not work and produces confusing errors
- Any future Prisma documentation or Stack Overflow answers must be verified against v7 before applying
