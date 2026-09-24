from __future__ import annotations

from pathlib import Path

from app.campaign_db import uploads_dir_for_slug
from app.errors import raise_api_error

MEDIA_CATEGORIES = frozenset({"map", "portraits", "locals", "covers"})


def media_url(slug: str, category: str, filename: str) -> str:
    return f"/api/c/{slug}/media/{category}/{filename}"


def resolve_media_file(slug: str, category: str, arquivo: str) -> Path:
    """Resolve a file inside the campaign uploads tree or raise opaque 404."""
    if category not in MEDIA_CATEGORIES:
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    name = Path(arquivo).name
    if not name or name != arquivo or ".." in arquivo or "/" in arquivo or "\\" in arquivo:
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    root = uploads_dir_for_slug(slug).resolve()
    target = (root / category / name).resolve()
    try:
        target.relative_to(root)
    except ValueError:
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    if not target.is_file():
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    return target
