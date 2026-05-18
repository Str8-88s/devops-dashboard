# ADR-005: Supabase over GCP Cloud SQL for Production Database

## Status
Accepted

## Context
The application requires a managed PostgreSQL instance for production. The initial plan was to use GCP Cloud SQL to keep the entire stack on one cloud provider and maximize the GCP resume signal.

During deployment planning, the cost profile of Cloud SQL became clear: a minimal Cloud SQL instance (db-f1-micro) costs approximately $12–15/month even when completely idle, with no free tier. For a portfolio project with zero traffic, this cost is ongoing and adds up quickly with no return.

## Decision
Use Supabase for the production PostgreSQL database. Supabase offers a generous free tier for managed PostgreSQL with no idle cost. The API continues to run on GCP Cloud Run, preserving the GCP deployment signal on the resume.

The connection uses Supabase's **session pooler** rather than a direct connection or the transaction pooler:
- Direct connections use IPv6 by default, which is incompatible with IPv4-only environments including local Windows development machines
- The transaction pooler breaks Prisma's prepared statements
- The session pooler maintains persistent connections over IPv4 and is fully compatible with Prisma

## Alternatives Considered

**GCP Cloud SQL** — the original plan. Rejected due to ~$12–15/month idle cost with no free tier. No technical advantage over Supabase for this use case since Prisma abstracts the connection entirely.

**PlanetScale** — MySQL-based, not PostgreSQL. Would require schema and query changes. Rejected.

**Railway PostgreSQL** — viable option, but Supabase's free tier is more generous and the platform is more established.

## Consequences

- Zero database hosting cost at this scale
- The stack is split across two cloud providers (GCP for compute, Supabase for database) — a minor architectural inconsistency with no practical impact
- Prisma abstracts the connection string entirely — switching back to Cloud SQL in the future requires only a connection string change and a migration
- The session pooler connection string format differs from a direct connection — this is documented in `.env.example` to avoid confusion during local setup
