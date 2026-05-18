# ADR-002: JWT Authentication with httpOnly Cookie Refresh Tokens

## Status
Accepted

## Context
The application requires authentication across a React frontend and a Node.js/Express API. A token strategy was needed that protects against common web vulnerabilities while remaining stateless enough to work correctly across multiple Cloud Run instances.

The two main attack vectors to defend against:
- **XSS (Cross-Site Scripting):** malicious scripts reading tokens from JavaScript-accessible storage
- **CSRF (Cross-Site Request Forgery):** forged requests that exploit cookie-based auth

## Decision
Use a two-token strategy:

- **Access token (15-minute expiry):** stored in memory on the React client (a module-level variable, never in localStorage or sessionStorage). Sent as a `Bearer` token in the `Authorization` header.
- **Refresh token (7-day expiry):** stored in an `httpOnly`, `sameSite: strict` cookie. Never accessible to JavaScript. Used only to obtain new access tokens via `POST /api/auth/refresh`.

Token rotation is enforced — on every refresh, the old token is deleted from the database and a new one is issued. Each refresh token includes a `jti` (JWT ID) claim set to `randomUUID()` to guarantee uniqueness even when two tokens are signed within the same second.

Refresh tokens are stored in a `RefreshToken` database table, which enables explicit revocation on logout.

## Alternatives Considered

**localStorage for both tokens** — simplest implementation, but localStorage is accessible to any JavaScript on the page. A single XSS vulnerability exposes the token permanently. Rejected.

**Session-based auth (server-side sessions)** — stateful, requires shared session storage across Cloud Run instances (Redis or a database). Adds infrastructure complexity without meaningful security benefits over the chosen approach. Rejected.

**Stateless refresh tokens (no database storage)** — eliminates the RefreshToken table but makes logout impossible — a stolen refresh token remains valid until expiry. Rejected.

## Consequences

- Access tokens in memory are lost on page refresh — silent refresh on mount (`useEffect` calling `/api/auth/refresh`) restores the session transparently
- React `StrictMode` double-fires `useEffect` in development, which consumes the refresh token before the second call can use it — StrictMode was disabled during development and will be re-evaluated before production frontend deployment
- Token rotation means replay attacks fail immediately — a refresh token can only be used once
- The `jti: randomUUID()` requirement is non-obvious and easy to miss — without it, two tokens signed in the same second produce identical strings, causing unique constraint violations in the RefreshToken table
