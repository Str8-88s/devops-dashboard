# ADR-006: Express App and HTTP Server Split for Testability

## Status
Accepted

## Context
The test suite uses Supertest to run integration tests against the Express API without spinning up a real HTTP server. Supertest works by importing the Express `app` object directly and making in-process requests — no network port is involved.

The original single-file structure had the Express app and the `server.listen()` call in the same `index.ts` file. Importing `index.ts` in tests caused the HTTP server to start on a real port as a side effect, which created port conflicts when multiple test suites ran and left open handles that prevented Jest from exiting cleanly.

## Decision
Split the application into two files:

- **`src/app.ts`** — creates and configures the Express application: middleware, routes, error handler. Exports the `app` object. No `listen()` call.
- **`src/index.ts`** — imports `app`, creates the HTTP server, calls `server.listen()`, attaches Socket.io, and registers the `SIGTERM` handler for graceful shutdown.

Tests import directly from `app.ts`. Production entry point remains `index.ts`.

## Alternatives Considered

**Single `index.ts` file** — the original structure. Simple but untestable without side effects. Supertest can work around this by passing a port of `0` to get a random available port, but this still starts a real server and requires explicit teardown in every test file.

**Dependency injection for the server** — passing the server instance into a factory function. More flexible but significantly more complex than the split-file approach with no meaningful benefit at this scale.

## Consequences

- Tests import `app` cleanly with no server startup side effects
- `index.ts` remains the single entry point for production — `Dockerfile` and `package.json` start scripts target `index.ts`
- Socket.io attachment lives in `index.ts` since it requires the HTTP server instance — `src/lib/socket.ts` exports the `io` instance independently to avoid circular imports between `socket.ts` and `index.ts`
- This pattern is standard in production Node.js applications — the split is immediately recognizable to any experienced Express developer reviewing the codebase
