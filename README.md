# Daily Builds

Small, finished projects — at least three a day — spanning games, SQL, testing, system architecture, and whatever comes up next. Each one is self-contained, has its own README, and (where it makes sense) a test suite that actually proves it works.

**Live showcase:** the root `index.html` is a static portfolio site that lists every project with a short description, tags, and a link to play it (if it's playable in a browser) or read the code.

## Structure

```
daily-builds/
  index.html, styles.css, app.js, manifest.json   <- the showcase site
  projects/
    day-01-memory-match/        Game: vanilla JS card-matching game
    day-01-library-fines/       SQL + testing: SQLite schema, Python queries, pytest
    day-01-url-shortener/       Architecture + testing: layered Node service, node:test
    day-02-wordle-clone/        Game: word-guessing game, logic unit-tested separately
    day-02-expense-splitter/    SQL + testing: shared-expense schema, settlement algorithm
    day-02-rate-limiter/        Architecture + testing: token-bucket limiter + HTTP middleware
```

Adding a new day = adding a new folder under `projects/` and one new entry in `manifest.json`. The site needs no other changes.

## Running the showcase site locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

(`fetch()` needs a real server, not a `file://` URL — any static server works.)

## Day 1

| Project | Category | What it proves |
|---|---|---|
| [Memory Match](projects/day-01-memory-match) | Game | DOM state management, no framework |
| [Library Fines](projects/day-01-library-fines) | SQL & Testing | schema design, SQL aggregation, deterministic pytest tests |
| [URL Shortener](projects/day-01-url-shortener) | Architecture & Testing | routes/service/repository separation, unit + HTTP integration tests |

## Day 2

| Project | Category | What it proves |
|---|---|---|
| [Wordle Clone](projects/day-02-wordle-clone) | Game | isolating hard-to-get-right logic (duplicate letters) from rendering so it's unit-testable |
| [Expense Splitter](projects/day-02-expense-splitter) | SQL & Testing | integer-cents money math, invariant-based tests, a greedy settlement algorithm |
| [Rate Limiter](projects/day-02-rate-limiter) | Architecture & Testing | token-bucket algorithm, injected clock for deterministic tests, live HTTP integration test |

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs the Python and Node test suites for every project that has one, on every push.
