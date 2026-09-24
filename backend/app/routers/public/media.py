from __future__ import annotations

from fastapi import APIRouter, Path, Request
from fastapi.responses import FileResponse

from app.errors import raise_api_error
from app.services.media_acl import can_access_media
from app.services.media_paths import MEDIA_CATEGORIES, resolve_media_file

router = APIRouter()

_CACHE_PUBLIC = "public, max-age=31536000, immutable"
_CACHE_PORTRAIT = "private, no-store"


@router.get("/media/{categoria}/{arquivo}")
def get_media(
    request: Request,
    slug: str = Path(...),
    categoria: str = Path(...),
    arquivo: str = Path(...),
) -> FileResponse:
    if categoria not in MEDIA_CATEGORIES:
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    if not can_access_media(slug, categoria, arquivo, request):
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    path = resolve_media_file(slug, categoria, arquivo)
    headers = {
        "Cache-Control": _CACHE_PORTRAIT if categoria == "portraits" else _CACHE_PUBLIC,
    }
    return FileResponse(path, headers=headers)
