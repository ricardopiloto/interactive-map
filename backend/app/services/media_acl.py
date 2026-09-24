from __future__ import annotations

from fastapi import Request
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, lookup_campanha, resolve_campaign_session
from app.models.local import Local
from app.models.npc import NPC
from app.models.usuario import Membro
from app.services.auth_session import COOKIE_NAME, lookup_session
from app.services.url_rewrite import url_references_local, url_references_portrait
from app.services.visibility import is_visivel_para_jogador


def is_campaign_member(slug: str, request: Request) -> bool:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return False
    try:
        camp = lookup_campanha(slug)
    except Exception:
        return False
    with Session(get_control_engine()) as session:
        found = lookup_session(session, token)
        if found is None:
            return False
        membro = session.exec(
            select(Membro).where(
                Membro.usuario_id == found.usuario.id,
                Membro.campanha_id == camp.id,
            )
        ).first()
        return membro is not None


def portrait_allowed_for_anonymous(slug: str, arquivo: str) -> bool:
    with resolve_campaign_session(slug) as session:
        rows = list(session.exec(select(NPC)).all())
        for npc in rows:
            if not is_visivel_para_jogador(npc):
                continue
            if url_references_portrait(npc.retrato_url, arquivo):
                return True
    return False


def local_image_allowed_for_anonymous(slug: str, arquivo: str) -> bool:
    with resolve_campaign_session(slug) as session:
        rows = list(session.exec(select(Local)).all())
        for loc in rows:
            if not is_visivel_para_jogador(loc):
                continue
            if url_references_local(loc.imagem_url, arquivo):
                return True
    return False


def can_access_media(slug: str, category: str, arquivo: str, request: Request) -> bool:
    if category in ("map", "covers"):
        return True
    if is_campaign_member(slug, request):
        return True
    if category == "locals":
        return local_image_allowed_for_anonymous(slug, arquivo)
    if category == "portraits":
        return portrait_allowed_for_anonymous(slug, arquivo)
    return False
