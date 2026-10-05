# Wordle Clone

A 5-letter word-guessing game. The interesting part isn't the DOM — it's that the guess-evaluation logic (`evaluateGuess`) is a pure function in its own module, unit-tested on its own, including the classic Wordle edge case: what happens when your guess repeats a letter more times than the answer contains it.

**Skills shown:** separating game logic from rendering so the hard-to-get-right part is testable without a browser; deterministic tests via an injectable random source.

## Run it

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Test it

```bash
npm test
```

## The duplicate-letter edge case

Real Wordle (and this clone) does a two-pass evaluation: mark exact matches first, *then* mark "present" matches against whatever letters are left over. Guess `ppppp` against answer `apple` (which has exactly two Ps) should mark only two tiles, not five — see `wordLogic.test.js` for the test that pins this down.
