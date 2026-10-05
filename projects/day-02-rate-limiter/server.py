"""Thin HTTP layer around RateLimiter -- demonstrates the pattern as
real middleware, not just a library. Every request is keyed by the
client's IP address.
"""
from __future__ import annotations

from http.server import BaseHTTPRequestHandler, HTTPServer

from token_bucket import RateLimiter


def make_handler(limiter: RateLimiter):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):  # noqa: A002 - silence default request logging
            pass

        def do_GET(self):
            client_key = self.client_address[0]
            if limiter.allow(client_key):
                body = b'{"status": "ok"}'
                self.send_response(200)
            else:
                body = b'{"status": "rate_limited"}'
                self.send_response(429)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    return Handler


def run(port: int = 8000, capacity: int = 5, refill_rate: float = 1.0) -> None:
    limiter = RateLimiter(capacity=capacity, refill_rate=refill_rate)
    server = HTTPServer(("localhost", port), make_handler(limiter))
    print(f"Rate-limited server on http://localhost:{port} ({capacity} req burst, {refill_rate}/s refill)")
    server.serve_forever()


if __name__ == "__main__":
    run()
