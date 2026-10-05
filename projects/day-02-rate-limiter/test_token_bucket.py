from token_bucket import RateLimiter, TokenBucket


class FakeClock:
    """A controllable clock so refill timing is exact, not sleep-and-hope."""

    def __init__(self, start: float = 0.0):
        self.now = start

    def advance(self, seconds: float) -> None:
        self.now += seconds

    def __call__(self) -> float:
        return self.now


def test_starts_full_and_allows_up_to_capacity():
    clock = FakeClock()
    bucket = TokenBucket(capacity=3, refill_rate=1, time_fn=clock)

    assert bucket.try_consume() is True
    assert bucket.try_consume() is True
    assert bucket.try_consume() is True
    assert bucket.try_consume() is False  # 4th request, no tokens left


def test_refills_proportionally_to_elapsed_time():
    clock = FakeClock()
    bucket = TokenBucket(capacity=5, refill_rate=2, time_fn=clock)  # 2 tokens/sec

    for _ in range(5):
        bucket.try_consume()
    assert bucket.try_consume() is False

    clock.advance(1.0)  # should refill 2 tokens
    assert bucket.available_tokens == 2
    assert bucket.try_consume() is True
    assert bucket.try_consume() is True
    assert bucket.try_consume() is False


def test_refill_never_exceeds_capacity():
    clock = FakeClock()
    bucket = TokenBucket(capacity=3, refill_rate=10, time_fn=clock)

    clock.advance(100)  # would be 1000 tokens without the cap
    assert bucket.available_tokens == 3


def test_rate_limiter_tracks_clients_independently():
    clock = FakeClock()
    limiter = RateLimiter(capacity=1, refill_rate=1, time_fn=clock)

    assert limiter.allow("client-a") is True
    assert limiter.allow("client-a") is False  # client-a is out of tokens
    assert limiter.allow("client-b") is True   # client-b has its own bucket
