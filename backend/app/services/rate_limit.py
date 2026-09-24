from __future__ import annotations

from slowapi import Limiter
from starlette.requests import Request

from app.services.client_ip import client_ip


def _rate_limit_key(request: Request) -> str:
    return client_ip(request)


limiter = Limiter(key_func=_rate_limit_key)
