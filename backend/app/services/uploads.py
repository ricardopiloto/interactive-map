import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import settings

SUBDIRS = {"map", "portraits", "locals"}


async def save_image(file: UploadFile, category: str) -> str:
    if category not in SUBDIRS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Categoria inválida. Use: {', '.join(sorted(SUBDIRS))}",
        )

    content_type = file.content_type or ""
    if content_type not in settings.allowed_image_type_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de arquivo não permitido: {content_type}",
        )

    data = await file.read()
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Arquivo excede o limite de {settings.max_upload_bytes} bytes",
        )

    ext = _extension_for(content_type, file.filename)
    dest_dir = settings.uploads_dir / category
    dest_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = dest_dir / filename
    dest.write_bytes(data)

    if category == "map":
        canonical = dest_dir / f"campaign-map{ext}"
        canonical.write_bytes(data)
        return f"/uploads/map/{canonical.name}"

    return f"/uploads/{category}/{filename}"


def _extension_for(content_type: str, filename: str | None) -> str:
    mapping = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    if content_type in mapping:
        return mapping[content_type]
    if filename:
        return Path(filename).suffix or ".bin"
    return ".bin"
