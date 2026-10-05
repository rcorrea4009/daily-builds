# Rate Limiter

A token-bucket rate limiter — a staple system-design interview topic — implemented as a plain algorithm first, then wired into a tiny HTTP server as middleware. See [ARCHITECTURE.md](ARCHITECTURE.md) for the layer diagram.

**Skills shown:** implementing a well-known algorithm correctly (not just "looks right"), designing for testability by injecting the clock instead of calling `time.time()` directly, and a real HTTP integration test that spins up a live server on a background thread.

## Run it

```bash
pip install -r requirements.txt
python server.py
# then, in another terminal:
curl -i http://localhost:8000/   # first 5 succeed, then you get 429s
```

## Test it

```bash
pytest -v
```

## Design notes

- `TokenBucket` refills lazily — tokens are only computed (`elapsed * refill_rate`) when something checks the bucket, not on a background timer. No thread, no polling loop, and still exact.
- Tests use a `FakeClock` object instead of `time.monotonic`, so "refills after 1 second" is tested by calling `clock.advance(1.0)` — instant, deterministic, no flaky `time.sleep()`.
- `test_server.py` runs a real `HTTPServer` on an OS-assigned port in a daemon thread and hits it with real HTTP requests, proving the algorithm and the HTTP wiring work together, not just in isolation.
