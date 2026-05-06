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