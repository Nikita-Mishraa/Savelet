# Savelet

A link management API and web app — save, tag, and organize links, with real authentication, persistent storage, and an automated test suite.

Savelet started as a small client-side app that stored links in `localStorage`. This version rebuilds it as a proper backend service: Node.js and Express on top of PostgreSQL, with JWT authentication, request validation, row-level authorization, pagination, structured logging, and integration tests that run against a real database.

**Stack:** Node.js · Express · PostgreSQL · JWT

## Features

- Email/password authentication with hashed passwords (bcrypt) and JWT sessions
- Full CRUD for links, scoped per-user — no user can see or modify another user's data
- Tag-based filtering, text search, and pagination on the links list
- Soft deletes — links are recoverable, not destroyed
- Centralized error handling with consistent JSON error responses
- Rate limiting (tighter on auth endpoints, to slow down brute-force attempts)
- Structured request logging

## Screenshot


## Architecture

```
src/
  app.js                Express app factory (no port binding — testable in isolation)
  server.js              entrypoint: binds port, graceful shutdown on SIGTERM/SIGINT
  config/env.js           env var parsing + validation (zod)
  db/pool.js                connection pool, transaction helper, slow-query logging
  middleware/                auth, validation, error handling, rate limiting
  modules/
    auth/                     register, login, /me
    links/                     CRUD, filtering, pagination, tags
  utils/                        typed errors, async handler, logger
db/
  migrations/               hand-written SQL, tracked in schema_migrations
  migrate.js                  migration runner (up/down)
public/                      frontend, served statically by Express
tests/
  integration/              real HTTP requests against a real test database
  unit/                       service logic tested with a mocked repository
```

## Getting started

### Prerequisites

- Node.js 18+
- Docker (for a zero-setup Postgres), or a local PostgreSQL 14+ install

### Setup

```bash
git clone https://github.com/<your-username>/savelet.git
cd savelet
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET` to a real random string:

```bash
openssl rand -hex 32
```

### Database

```bash
npm run db:up          # starts Postgres in Docker (dev + test DBs)
npm run migrate        # applies schema to the dev DB
npm run migrate:test   # applies schema to the test DB
```

If you're using your own Postgres instead of Docker, create matching `savelet` and `savelet_test` databases/roles first — see `.env.example` for the expected connection strings.

### Run

```bash
npm run dev
```

Visit `http://localhost:4000` — the frontend is served from the same server.

### Test

```bash
npm test
```

Runs the full suite (21 tests) against the real test database, truncating tables between tests for isolation.

## API reference

Base path: `/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | – | Create an account, returns a JWT |
| `POST` | `/auth/login` | – | Returns a JWT |
| `GET` | `/auth/me` | Yes | Current user's profile |
| `GET` | `/links` | Yes | List links — `?tag=&search=&page=&limit=` |
| `POST` | `/links` | Yes | Create a link |
| `GET` | `/links/:id` | Yes | Get a single link |
| `PATCH` | `/links/:id` | Yes | Partially update a link |
| `DELETE` | `/links/:id` | Yes | Soft-delete a link |
| `GET` | `/links/tags` | Yes | Distinct tags for the current user |
| `GET` | `/health` | – | Liveness check |

Authenticated requests need `Authorization: Bearer <token>`.


## Design decisions

- Plain SQL plus a small migration runner, so schema and queries are fully transparent instead of hidden behind generated code.
- **Soft deletes.** Rows get a `deleted_at` timestamp instead of being removed.
- **Fail-fast configuration.** Missing or invalid environment variables crash the server on startup with a clear message, not on the first request that needs them.
- **Same error for wrong password and unknown email.** Login doesn't reveal which emails are registered.
