from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, Request
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, lookup_campanha
from app.errors import raise_api_error
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.auth_session import COOKIE_NAME, lookup_session


@dataclass
class MembroContext:
    usuario: Usuario
    campanha: Campanha
    membro: Membro


def control_session() -> Session:
    return Session(get_control_engine())


def require_session_user(request: Request) -> Usuario:
    token = request.cookies.get(COOKIE_NAME)
    with Session(get_control_engine()) as session:
        found = lookup_session(session, token)
        if found is None:
            raise_api_error("AUTENTICACAO_NECESSARIA", status_code=401)
        # Detach for use outside session
        usuario = found.usuario
        session.expunge(usuario)
        return usuario


def require_membro(slug: str, request: Request) -> MembroContext:
    token = request.cookies.get(COOKIE_NAME)
    with Session(get_control_engine()) as session:
        found = lookup_session(session, token)
        if found is None:
            raise_api_error("AUTENTICACAO_NECESSARIA", status_code=401)
        camp = lookup_campanha(slug)
        membro = session.exec(
            select(Membro).where(
                Membro.usuario_id == found.usuario.id,
                Membro.campanha_id == camp.id,
            )
        ).first()
        if membro is None:
            raise_api_error("NAO_MEMBRO", status_code=403)
        usuario = found.usuario
        session.expunge(usuario)
        session.expunge(membro)
        return MembroContext(usuario=usuario, campanha=camp, membro=membro)


def require_dono(slug: str, request: Request) -> MembroContext:
    """Session + membership + papel == dono (spec 097)."""
    from app.services.package_schema import NAO_DONO

    ctx = require_membro(slug, request)
    if ctx.membro.papel != "dono":
        raise_api_error(NAO_DONO, status_code=403)
    return ctx


def require_admin(usuario: Usuario = Depends(require_session_user)) -> Usuario:
    """Session + is_admin (spec 129). App-scoped — no campanha/slug involved."""
    if not usuario.is_admin:
        raise_api_error("NAO_ADMINISTRADOR", status_code=403)
    return usuario


# Back-compat name unused — kept import sites migrating to require_membro
def verify_admin(ctx: MembroContext = Depends(require_membro)) -> str:
    return ctx.usuario.email
