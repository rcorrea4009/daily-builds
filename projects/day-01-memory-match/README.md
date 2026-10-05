# Memory Match

A small browser card-matching game. No build step, no dependencies — open `index.html` directly or serve the folder statically.

**Skills shown:** vanilla JS state management, DOM rendering without a framework, CSS transitions, game-loop-style event handling.

## Run it

```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `index.html`.

## How it works

- `tiles` holds the deck state (icon, revealed, matched) — the only source of truth.
- `render()` builds the DOM once; `updateTileFace()` patches individual tiles instead of re-rendering everything, which keeps the flip logic simple and avoids flicker.
- A simple lock (`lockBoard`) prevents clicking during the brief "mismatch" pause.
