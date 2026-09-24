from __future__ import annotations

import re

_UPLOADS_RE = re.compile(
    r"^/uploads/c/(?P<slug>[^/]+)/(?P<category>map|portraits|locals)/(?P<file>[^/?#]+)"
)
_UPLOADS_CAT_RE = re.compile(
    r"^/uploads/(?P<category>map|portraits|locals)/(?P<file>[^/?#]+)$"
)
_MEDIA_RE = re.compile(
    r"^/api/c/(?P<slug>[^/]+)/media/(?P<category>map|portraits|locals)/(?P<file>[^/?#]+)$"
)
_UPLOADS_BARE_RE = re.compile(r"^/uploads/(?P<file>[^/?#]+)$")


class MediaUrlRewriteError(ValueError):
    """Unmappable stored image URL during persist rewrite (099)."""


def rewrite_media_url(url: str | None) -> str | None:
    """Rewrite legacy /uploads/c/{slug}/… paths to /api/c/{slug}/media/…."""
    if not url:
        return url
    m = _UPLOADS_RE.match(url.strip())
    if not m:
        return url
    return (
        f"/api/c/{m.group('slug')}/media/{m.group('category')}/{m.group('file')}"
    )


def rewrite_legacy_url_for_slug(url: str | None, slug: str) -> str | None:
    """Persist-time rewrite onto `/api/c/{slug}/media/…`. Empty stays empty."""
    if not url or not str(url).strip():
        return url
    raw = str(url).strip()
    for rx in (_MEDIA_RE, _UPLOADS_RE, _UPLOADS_CAT_RE):
        m = rx.match(raw)
        if m:
            return f"/api/c/{slug}/media/{m.group('category')}/{m.group('file')}"
    bare = _UPLOADS_BARE_RE.match(raw)
    if bare:
        name = bare.group("file")
        if name.startswith("campaign-map."):
            return f"/api/c/{slug}/media/map/{name}"
        raise MediaUrlRewriteError(raw)
    if raw.startswith("/uploads/") or raw.startswith("/api/c/"):
        raise MediaUrlRewriteError(raw)
    return url


def url_references_portrait(url: str | None, arquivo: str) -> bool:
    if not url:
        return False
    rewritten = rewrite_media_url(url) or url
    return rewritten.endswith(f"/media/portraits/{arquivo}") or rewritten.endswith(
        f"/portraits/{arquivo}"
    )


def url_references_local(url: str | None, arquivo: str) -> bool:
    if not url:
        return False
    rewritten = rewrite_media_url(url) or url
    return rewritten.endswith(f"/media/locals/{arquivo}") or rewritten.endswith(
        f"/locals/{arquivo}"
    )
