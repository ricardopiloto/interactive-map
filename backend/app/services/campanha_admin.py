from __future__ import annotations

import re
import shutil
import uuid
from pathlib import Path
from typing import Any

from sqlmodel import Session, select

from app.campaign_db import (
    campaign_db_path,
    campaign_site_path,
    ensure_campaign_schema,
    get_campaign_engine,
    get_control_engine,
    init_control,
)
from app.config import DEFAULT_MODULOS_BY_SISTEMA
from app.models.campanha import Campanha
from app.models.usuario import Membro
from app.services.genre_palette import DEFAULT_GENRE, normalize_genero
from app.services.media_paths import media_url

SLUG_RE = re.compile(r"^[a-z][a-z0-9-]{1,47}$")

RESERVED_SLUGS = frozenset(
    {
        "api",
        "admin",
        "c",
        "login",
        "painel",
        "static",
        "uploads",
        "health",
        "docs",
        "config",
        "gm",
        "mapa",
        "relacoes",
        "assets",
        "media",
        "convite",
        "reset",
        "conta",
    }
)

DEFAULT_COTA_BYTES = 10 * 1024**3
COTA_AVISO_RATIO = 0.9


class CampanhaAdminError(Exception):
    def __init__(self, codigo: str, message: str = "") -> None:
        self.codigo = codigo
        super().__init__(message or codigo)


def validate_slug(slug: str) -> None:
    if not SLUG_RE.match(slug) or "--" in slug:
        raise CampanhaAdminError("SLUG_INVALIDO")
    if slug in RESERVED_SLUGS:
        raise CampanhaAdminError("SLUG_RESERVADO")


def default_modulos(sistema: str) -> list[str]:
    return list(DEFAULT_MODULOS_BY_SISTEMA.get(sistema, []))


def ensure_upload_tree(site: Path) -> None:
    uploads = site / "uploads"
    for sub in ("map", "portraits", "locals", "covers"):
        (uploads / sub).mkdir(parents=True, exist_ok=True)


def create_campanha(
    *,
    slug: str,
    nome: str,
    sistema: str,
    genero: str = DEFAULT_GENRE,
    visibilidade: str = "listada",
    modulos: list[str] | None = None,
) -> Campanha:
    validate_slug(slug)
    if visibilidade not in ("listada", "so_link"):
        raise CampanhaAdminError("VISIBILIDADE_INVALIDA")
    try:
        genero_n = normalize_genero(genero)
    except ValueError as exc:
        raise CampanhaAdminError(str(exc)) from None

    init_control()
    engine = get_control_engine()
    with Session(engine) as session:
        existing = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if existing is not None:
            raise CampanhaAdminError("SLUG_DUPLICADO")

    camp_uuid = str(uuid.uuid4())
    caminho = f"campanhas/{camp_uuid}"
    site = campaign_site_path(caminho)
    try:
        site.mkdir(parents=True, exist_ok=False)
        ensure_upload_tree(site)
        db_file = campaign_db_path(caminho)
        db_file.touch()
        camp_engine = get_campaign_engine(camp_uuid, caminho)
        ensure_campaign_schema(camp_engine, fresh=True)

        row = Campanha(
            slug=slug,
            nome=nome,
            sistema=sistema,
            genero=genero_n,
            modulos_ativos=modulos if modulos is not None else default_modulos(sistema),
            visibilidade=visibilidade,
            caminho=caminho,
            mapa_arquivo="",
            cota_bytes=DEFAULT_COTA_BYTES,
            bytes_usados=0,
            activa=True,
        )
        with Session(engine) as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            session.expunge(row)
            return row
    except Exception:
        if site.exists():
            shutil.rmtree(site, ignore_errors=True)
        raise


def list_catalogo_publico() -> list[dict[str, Any]]:
    init_control()
    with Session(get_control_engine()) as session:
        rows = session.exec(
            select(Campanha)
            .where(Campanha.activa == True)  # noqa: E712
            .where(Campanha.visibilidade == "listada")
            .order_by(Campanha.nome)
        ).all()
        out: list[dict[str, Any]] = []
        for r in rows:
            capa = (getattr(r, "capa_arquivo", None) or "").strip()
            out.append(
                {
                    "slug": r.slug,
                    "nome": r.nome,
                    "sistema": r.sistema,
                    "genero": getattr(r, "genero", None) or DEFAULT_GENRE,
                    "capa_url": media_url(r.slug, "covers", capa) if capa else None,
                }
            )
        return out


def list_minhas_campanhas(usuario_id: int) -> list[dict[str, Any]]:
    init_control()
    with Session(get_control_engine()) as session:
        rows = session.exec(
            select(Campanha)
            .join(Membro, Membro.campanha_id == Campanha.id)
            .where(Membro.usuario_id == usuario_id)
            .where(Membro.papel == "dono")
            .where(Campanha.activa == True)  # noqa: E712
            .order_by(Campanha.nome)
        ).all()
        out: list[dict[str, Any]] = []
        for r in rows:
            aviso = r.cota_bytes > 0 and r.bytes_usados >= COTA_AVISO_RATIO * r.cota_bytes
            capa = (getattr(r, "capa_arquivo", None) or "").strip()
            out.append(
                {
                    "slug": r.slug,
                    "nome": r.nome,
                    "sistema": r.sistema,
                    "visibilidade": r.visibilidade,
                    "unidade_distancia": getattr(r, "unidade_distancia", None) or "mi",
                    "genero": getattr(r, "genero", None) or DEFAULT_GENRE,
                    "capa_url": media_url(r.slug, "covers", capa) if capa else None,
                    "bytes_usados": r.bytes_usados,
                    "cota_bytes": r.cota_bytes,
                    "aviso_cota": aviso,
                }
            )
        return out


def set_visibilidade(slug: str, visibilidade: str) -> Campanha:
    if visibilidade not in ("listada", "so_link"):
        raise CampanhaAdminError("VISIBILIDADE_INVALIDA")
    init_control()
    with Session(get_control_engine()) as session:
        row = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if row is None or not row.activa:
            raise CampanhaAdminError("CAMPANHA_NAO_ENCONTRADA")
        row.visibilidade = visibilidade
        session.add(row)
        session.commit()
        session.refresh(row)
        session.expunge(row)
        return row


def set_unidade_distancia(slug: str, unidade_distancia: str) -> Campanha:
    if unidade_distancia not in ("mi", "km"):
        raise CampanhaAdminError("UNIDADE_INVALIDA")
    init_control()
    with Session(get_control_engine()) as session:
        row = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if row is None or not row.activa:
            raise CampanhaAdminError("CAMPANHA_NAO_ENCONTRADA")
        row.unidade_distancia = unidade_distancia
        session.add(row)
        session.commit()
        session.refresh(row)
        session.expunge(row)
        return row


def set_capa(
    slug: str,
    *,
    capa_arquivo: str | None = None,
    limpar_capa: bool = False,
) -> Campanha:
    init_control()
    with Session(get_control_engine()) as session:
        row = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if row is None or not row.activa:
            raise CampanhaAdminError("CAMPANHA_NAO_ENCONTRADA")
        if limpar_capa:
            row.capa_arquivo = ""
        elif capa_arquivo is not None:
            name = capa_arquivo.strip()
            if not name or "/" in name or ".." in name:
                raise CampanhaAdminError("CAPA_INVALIDA")
            row.capa_arquivo = name
        session.add(row)
        session.commit()
        session.refresh(row)
        session.expunge(row)
        return row


def set_genero(slug: str, genero: str) -> Campanha:
    try:
        genero_n = normalize_genero(genero)
    except ValueError as exc:
        raise CampanhaAdminError(str(exc)) from None

    init_control()
    with Session(get_control_engine()) as session:
        row = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        if row is None or not row.activa:
            raise CampanhaAdminError("CAMPANHA_NAO_ENCONTRADA")
        row.genero = genero_n
        session.add(row)
        session.commit()
        session.refresh(row)
        session.expunge(row)
        return row
