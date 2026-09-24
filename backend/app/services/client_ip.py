from __future__ import annotations

from starlette.requests import Request

from app.config import settings


def client_ip(request: Request) -> str:
    """Resolve client IP respecting TRUSTED_PROXY + CF / X-Forwarded-For."""
    peer = request.client.host if request.client else "unknown"
    if not settings.trusted_proxy:
        return peer

    cf = request.headers.get("cf-connecting-ip")
    if cf:
        return cf.strip()

    xff = request.headers.get("x-forwarded-for")
    if xff:
        # First hop is the original client when proxy is trusted
        return xff.split(",")[0].strip() or peer
    return peer
