import uuid
from pathlib import Path

from fastapi import UploadFile, status

from app.config import settings
from app.errors import raise_api_error

SUBDIRS = {"map", "portraits", "locals"}


async def save_image(file: UploadFile, category: str) -> str:
    if category not in SUBDIRS:
        raise_api_error(
            "CATEGORIA_UPLOAD_INVALIDA",
            status_code=status.HTTP_400_BAD_REQUEST,
            detalhes={"categorias": ", ".join(sorted(SUBDIRS))},
        )

    content_type = file.content_type or ""
    if content_type not in settings.allowed_image_type_list:
        raise_api_error(
            "TIPO_ARQUIVO_NAO_PERMITIDO",
            status_code=status.HTTP_400_BAD_REQUEST,
            detalhes={"content_type": content_type},
        )

    data = await file.read()
    if len(data) > settings.max_upload_bytes:
        raise_api_error(
            "ARQUIVO_EXCEDE_TAMANHO_MAXIMO",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detalhes={"limite_bytes": settings.max_upload_bytes},
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
