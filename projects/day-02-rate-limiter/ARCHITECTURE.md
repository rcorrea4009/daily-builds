# Architecture

```mermaid
graph LR
    Client -->|GET /| Handler["server.py (HTTP layer)"]
    Handler -->|allow(client_ip)| RateLimiter
    RateLimiter -->|one bucket per key| BucketA["TokenBucket (client A)"]
    RateLimiter --> BucketB["TokenBucket (client B)"]
    RateLimiter --> BucketN["TokenBucket (...)"]
```

- **token_bucket.py** — the algorithm, with zero knowledge of HTTP. `TokenBucket` tracks one client's tokens; `RateLimiter` just maps a key (IP, API key, whatever) to its own `TokenBucket`, lazily created on first use.
- **server.py** — the only file that knows about HTTP. It extracts a key from the request (the client's IP) and asks the limiter a yes/no question. This is the same shape a real API-gateway rate limiter uses, just without the distributed-storage part (a production version would back the buckets with Redis instead of an in-process dict, so limits hold across multiple server instances).
- The clock is injected everywhere (`time_fn`), which is what makes [test_token_bucket.py](test_token_bucket.py) able to test refill behavior exactly, instantly, with no real `time.sleep()`.
