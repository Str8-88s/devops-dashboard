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