import time
from collections import defaultdict
from fastapi import Request, HTTPException, status


class RateLimiter:
    """
    Sliding-window rate limiter to protect authentication and clinical endpoints.
    """

    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests_log = defaultdict(list)

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - self.window_seconds

        # Prune expired timestamps
        self.requests_log[client_ip] = [
            ts for ts in self.requests_log[client_ip] if ts > window_start
        ]

        if len(self.requests_log[client_ip]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please wait a moment before retrying.",
            )

        self.requests_log[client_ip].append(now)


auth_rate_limiter = RateLimiter(max_requests=20, window_seconds=60)
clinical_rate_limiter = RateLimiter(max_requests=60, window_seconds=60)