from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile, status
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, uploads_dir_for_slug
from app.config import settings
from app.errors import raise_api_error
from app.models.campanha import Campanha
from app.services.media_paths import MEDIA_CATEGORIES, media_url


def _campanha_by_slug(session: Session, slug: str) -> Campanha:
    row = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
    if row is None or not row.activa:
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    return row


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


def reconcile_bytes_usados(slug: str) -> Campanha:
    with Session(get_control_engine()) as session:
        camp = _campanha_by_slug(session, slug)
        root = uploads_dir_for_slug(slug)
        total = 0
        if root.is_dir():
            for path in root.rglob("*"):
                if path.is_file():
                    total += path.stat().st_size
        camp.bytes_usados = total
        session.add(camp)
        session.commit()
        session.refresh(camp)
        session.expunge(camp)
        return camp


async def save_image(file: UploadFile, category: str, slug: str) -> dict:
    if category not in MEDIA_CATEGORIES:
        raise_api_error(
            "CATEGORIA_UPLOAD_INVALIDA",
            status_code=status.HTTP_400_BAD_REQUEST,
            detalhes={"categorias": ", ".join(sorted(MEDIA_CATEGORIES))},
        )

    content_type = file.content_type or ""
    if content_type not in settings.allowed_image_type_list:
        raise_api_error(
            "TIPO_ARQUIVO_NAO_PERMITIDO",
            status_code=status.HTTP_400_BAD_REQUEST,
            detalhes={"content_type": content_type},
        )

    data = await file.read()
    size = len(data)
    if size > settings.max_upload_bytes:
        raise_api_error(
            "ARQUIVO_EXCEDE_TAMANHO_MAXIMO",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detalhes={"limite_bytes": settings.max_upload_bytes},
        )

    with Session(get_control_engine()) as session:
        camp = _campanha_by_slug(session, slug)
        prev_size = 0
        prev_name = ""
        if category == "map" and camp.mapa_arquivo:
            prev_name = camp.mapa_arquivo
            prev_path = uploads_dir_for_slug(slug) / "map" / prev_name
            if prev_path.is_file():
                prev_size = prev_path.stat().st_size

        if category == "map":
            resultante = camp.bytes_usados - prev_size + size
        else:
            resultante = camp.bytes_usados + size

        if resultante > camp.cota_bytes:
            raise_api_error(
                "COTA_EXCEDIDA",
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detalhes={
                    "bytes_usados": camp.bytes_usados,
                    "cota_bytes": camp.cota_bytes,
                    "tamanho": size,
                    "bytes_resultantes": resultante,
                },
            )

        ext = _extension_for(content_type, file.filename)
        dest_dir = uploads_dir_for_slug(slug) / category
        dest_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4().hex}{ext}"
        dest = dest_dir / filename
        dest.write_bytes(data)

        if category == "map":
            if prev_name:
                old = dest_dir / prev_name
                if old.is_file() and old != dest:
                    old.unlink(missing_ok=True)
            camp.mapa_arquivo = filename
            camp.bytes_usados = camp.bytes_usados - prev_size + size
        else:
            camp.bytes_usados = camp.bytes_usados + size

        session.add(camp)
        session.commit()
        session.refresh(camp)

        ratio = (camp.bytes_usados * 100 / camp.cota_bytes) if camp.cota_bytes else 0
        aviso = ratio >= 90 and camp.bytes_usados < camp.cota_bytes

        return {
            "url": media_url(slug, category, filename),
            "aviso_cota": aviso,
            "bytes_usados": camp.bytes_usados,
            "cota_bytes": camp.cota_bytes,
        }
