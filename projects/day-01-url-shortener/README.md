# URL Shortener

A tiny URL shortener built to show a deliberately layered architecture (routes → service → repository), not just "make it work." Zero npm dependencies — uses Node's built-in `http` and `node:test`.

**Skills shown:** separation of concerns, dependency injection (the repository and the random source are both swappable for tests), unit tests for pure logic, integration tests over real HTTP.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the layer diagram.

## Run it

```bash
node server.js
# open http://localhost:3000
```

## Test it

```bash
npm test
```

## API

- `POST /api/shorten` `{ "url": "https://..." }` → `201 { code, shortUrl }`
- `GET /:code` → `302` redirect to the original URL
- `GET /api/stats/:code` → `{ code, longUrl, hits, createdAt }`
