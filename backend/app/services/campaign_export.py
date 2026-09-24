"""Build portable campaign zip (spec 097)."""

from __future__ import annotations

import io
import json
import zipfile
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

from sqlmodel import Session, select

from app.campaign_db import (
    campaign_uploads_path,
    lookup_campanha,
    resolve_campaign_session,
)
from app.models.arco import Arco
from app.models.grupo import GrupoPosicao
from app.models.links import LocalConexaoLink, LocalNPCLink, SessaoLocalLink, SessaoNpcLink
from app.models.local import Local
from app.models.npc import NPC
from app.models.sessao import Sessao
from app.models.vinculo import Vinculo
from app.models.waypoint import MapScale, RouteSegment, Waypoint
from app.services.package_schema import (
    CONTENT_FILENAME,
    MANIFEST_FILENAME,
    PACKAGE_FORMAT,
    UPLOAD_CATEGORIES,
    campaign_head_revision,
)


def _jsonable(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _jsonable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_jsonable(v) for v in value]
    return value


def _rows(session: Session, model: type) -> list[dict[str, Any]]:
    return [_jsonable(r.model_dump()) for r in session.exec(select(model)).all()]


def build_content_dict(session: Session) -> dict[str, Any]:
    scales = _rows(session, MapScale)
    return {
        "arcos": _rows(session, Arco),
        "npcs": _rows(session, NPC),
        "locais": _rows(session, Local),
        "local_npc": _rows(session, LocalNPCLink),
        "local_conexao": _rows(session, LocalConexaoLink),
        "grupo_posicao": _rows(session, GrupoPosicao),
        "vinculos": _rows(session, Vinculo),
        "waypoints": _rows(session, Waypoint),
        "route_segments": _rows(session, RouteSegment),
        "map_scale": scales[0] if scales else None,
        "sessoes": _rows(session, Sessao),
        "sessao_local": _rows(session, SessaoLocalLink),
        "sessao_npc": _rows(session, SessaoNpcLink),
    }


def build_manifest(camp) -> dict[str, Any]:
    return {
        "package_format": PACKAGE_FORMAT,
        "schema_version": campaign_head_revision(),
        "app_version": _app_version(),
        "sistema": camp.sistema,
        "modulos_ativos": list(camp.modulos_ativos or []),
        "slug_origem": camp.slug,
        "nome": camp.nome,
        "visibilidade": camp.visibilidade,
        "mapa_arquivo": camp.mapa_arquivo or "",
        "genero": getattr(camp, "genero", None) or "fantasia",
        "capa_arquivo": getattr(camp, "capa_arquivo", None) or "",
    }


def _app_version() -> str:
    try:
        from importlib.metadata import version

        return version("mapa-campanha-api")
    except Exception:
        return "0.0.0"


def export_campaign_to_bytes(slug: str) -> bytes:
    camp = lookup_campanha(slug)
    with resolve_campaign_session(slug) as session:
        content = build_content_dict(session)
    manifest = build_manifest(camp)
    uploads_root = campaign_uploads_path(camp.caminho)

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            MANIFEST_FILENAME,
            json.dumps(manifest, ensure_ascii=False, indent=2),
        )
        zf.writestr(
            CONTENT_FILENAME,
            json.dumps(content, ensure_ascii=False, indent=2),
        )
        if uploads_root.is_dir():
            for category in sorted(UPLOAD_CATEGORIES):
                cat_dir = uploads_root / category
                if not cat_dir.is_dir():
                    continue
                for path in sorted(cat_dir.iterdir()):
                    if path.is_file():
                        zf.write(path, f"uploads/{category}/{path.name}")
    return buf.getvalue()


def export_campaign_to_path(slug: str, out_path: Path) -> Path:
    data = export_campaign_to_bytes(slug)
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(data)
    return out_path
