from __future__ import annotations

from urllib.parse import urlparse

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings

_MUTATING = {"POST", "PUT", "PATCH", "DELETE"}


def _allowed_origins() -> set[str]:
    return {o.rstrip("/") for o in settings.cors_origin_list}


def _origin_ok(value: str | None) -> bool:
    if not value:
        return False
    allowed = _allowed_origins()
    # Exact origin match (scheme://host[:port])
    if value.rstrip("/") in allowed:
        return True
    # Also allow matching host if configured without scheme mismatch handled above
    return False


def _referer_origin(referer: str | None) -> str | None:
    if not referer:
        return None
    parsed = urlparse(referer)
    if not parsed.scheme or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


class CsrfOriginMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method in _MUTATING:
            origin = request.headers.get("origin")
            if not _origin_ok(origin):
                ref_origin = _referer_origin(request.headers.get("referer"))
                if not _origin_ok(ref_origin):
                    return JSONResponse(
                        status_code=403,
                        content={"detail": {"erro": "CSRF_ORIGIN_INVALIDA"}},
                    )
        return await call_next(request)
