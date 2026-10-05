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

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs the Python and Node test suites for every project that has one, on every push.
