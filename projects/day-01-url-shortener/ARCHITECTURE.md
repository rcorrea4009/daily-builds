# Architecture

Three strict layers, each only aware of the one below it:

```mermaid
graph LR
    Client[Browser / curl] -->|HTTP| Routes[routes.js]
    Routes -->|calls| Service[service.js]
    Service -->|calls| Repo[repository.js]
    Repo -->|stores| Store[(In-memory Map)]
```

- **routes.js** — parses HTTP requests, calls the service, maps results/errors to status codes. Knows nothing about validation rules or storage.
- **service.js** — all business rules: URL validation, code generation, collision retry, hit counting. No `req`/`res` anywhere in this file — it's pure enough to unit-test without starting a server.
- **repository.js** — storage only, behind a small interface (`save`, `findByCode`, `recordHit`, `has`). Swapping the `Map` for Postgres/Redis later means rewriting this one file; `service.js` and `routes.js` don't change.

This separation is also why there are two test files: [test/service.test.js](test/service.test.js) exercises business logic directly (fast, no network), and [test/routes.test.js](test/routes.test.js) spins up a real server on an ephemeral port and hits it over HTTP to prove the layers wire together correctly.
