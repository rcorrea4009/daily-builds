import threading
import urllib.request
import urllib.error

import pytest

from server import make_handler
from token_bucket import RateLimiter
from http.server import HTTPServer


@pytest.fixture
def running_server():
    limiter = RateLimiter(capacity=2, refill_rate=0.001)  # effectively no refill during the test
    httpd = HTTPServer(("localhost", 0), make_handler(limiter))
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield f"http://localhost:{port}"
    httpd.shutdown()
    thread.join()


def get_status(url):
    try:
        with urllib.request.urlopen(url) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code


def test_allows_requests_up_to_capacity_then_429s(running_server):
    assert get_status(running_server) == 200
    assert get_status(running_server) == 200
    assert get_status(running_server) == 429
