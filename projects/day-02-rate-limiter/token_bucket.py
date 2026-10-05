"""Token-bucket rate limiter.

Classic algorithm: each client has a bucket that holds up to `capacity`
tokens, refilling at `refill_rate` tokens/second. Every request costs
one token; no tokens left means the request is rejected.

The clock is injected (`time_fn`) so tests can control time exactly
instead of sprinkling `time.sleep()` everywhere.
"""
from __future__ import annotations

import time


class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float, time_fn=time.monotonic):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self._time_fn = time_fn
        self._tokens = float(capacity)
        self._last_refill = time_fn()

    def _refill(self) -> None:
        now = self._time_fn()
        elapsed = now - self._last_refill
        if elapsed > 0:
            self._tokens = min(self.capacity, self._tokens + elapsed * self.refill_rate)
            self._last_refill = now

    def try_consume(self, tokens: int = 1) -> bool:
        self._refill()
        if self._tokens >= tokens:
            self._tokens -= tokens
            return True
        return False

    @property
    def available_tokens(self) -> float:
        self._refill()
        return self._tokens


class RateLimiter:
    """Keeps one TokenBucket per client key (e.g. an IP address or API key)."""

    def __init__(self, capacity: int, refill_rate: float, time_fn=time.monotonic):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self._time_fn = time_fn
        self._buckets: dict[str, TokenBucket] = {}

    def _bucket_for(self, key: str) -> TokenBucket:
        if key not in self._buckets:
            self._buckets[key] = TokenBucket(self.capacity, self.refill_rate, self._time_fn)
        return self._buckets[key]

    def allow(self, key: str) -> bool:
        return self._bucket_for(key).try_consume()
