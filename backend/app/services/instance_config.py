from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import campaign_uploads_path, get_control_engine, lookup_campanha
from app.models.campanha import Campanha
from app.schemas.config import InstanceConfigRead
from app.services.media_paths import media_url

_MAP_EXTENSIONS = (".webp", ".jpg", ".jpeg", ".png", ".gif")


def _stamp_mapa_arquivo_if_needed(camp: Campanha) -> Campanha:
    """One-time bridge from leftover campaign-map.* (094)."""
    if (camp.mapa_arquivo or "").strip():
        return camp
    uploads = campaign_uploads_path(camp.caminho)
    map_dir = uploads / "map"
    if not map_dir.is_dir():
        return camp
    found: str | None = None
    for ext in _MAP_EXTENSIONS:
        candidate = map_dir / f"campaign-map{ext}"
        if candidate.is_file():
            found = candidate.name
            break
    if found is None:
        return camp
    with Session(get_control_engine()) as session:
        row = session.get(Campanha, camp.id)
        if row is None:
            return camp
        if not (row.mapa_arquivo or "").strip():
            row.mapa_arquivo = found
            session.add(row)
            session.commit()
            session.refresh(row)
        session.expunge(row)
        return row


def get_instance_config_for_slug(slug: str) -> InstanceConfigRead:
    """Config from Campanha row — has_map_image from mapa_arquivo (after one-time stamp)."""
    camp = lookup_campanha(slug)
    camp = _stamp_mapa_arquivo_if_needed(camp)
    mods = camp.modulos_ativos if isinstance(camp.modulos_ativos, list) else []
    mapa = (camp.mapa_arquivo or "").strip()
    ud = getattr(camp, "unidade_distancia", None) or "mi"
    if ud not in ("mi", "km"):
        ud = "mi"
    capa = (getattr(camp, "capa_arquivo", None) or "").strip()
    return InstanceConfigRead(
        slug=camp.slug,
        nome=camp.nome,
        sistema=camp.sistema,
        modulos_ativos=list(mods),
        has_map_image=bool(mapa),
        mapa_arquivo=mapa or None,
        map_url=media_url(slug, "map", mapa) if mapa else None,
        unidade_distancia=ud,
        genero=getattr(camp, "genero", None) or "fantasia",
        capa_url=media_url(slug, "covers", capa) if capa else None,
    )


def get_instance_config() -> InstanceConfigRead:
    """Deprecated for HTTP: prefer get_instance_config_for_slug."""
    from app.campaign_db import current_campanha
    from app.errors import raise_api_error

    camp = current_campanha()
    if camp is None:
        raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)
    return get_instance_config_for_slug(camp.slug)
