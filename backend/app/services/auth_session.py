from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from fastapi import Response
from sqlmodel import Session, select

from app.config import settings
from app.models.usuario import Sessao, Usuario
from app.services.auth_tokens import generate_opaque_token, hash_token

COOKIE_NAME = "codex_session"
IDLE_HOURS = 12
MAX_AGE_DAYS = 30


@dataclass
class SessionUser:
    usuario: Usuario
    sessao: Sessao
    raw_token: str | None = None


def _now() -> datetime:
    return datetime.utcnow()


def cookie_secure() -> bool:
    if settings.cookie_secure is not None:
        return settings.cookie_secure
    return not settings.debug


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=cookie_secure(),
        path="/",
        max_age=MAX_AGE_DAYS * 24 * 3600,
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, path="/")


def create_session(session: Session, usuario_id: int) -> str:
    raw = generate_opaque_token()
    now = _now()
    row = Sessao(
        usuario_id=usuario_id,
        token_hash=hash_token(raw),
        criado_em=now,
        ultimo_acesso=now,
        revogada=False,
    )
    session.add(row)
    session.commit()
    return raw


def revoke_session_by_token(session: Session, raw_token: str) -> None:
    th = hash_token(raw_token)
    row = session.exec(select(Sessao).where(Sessao.token_hash == th)).first()
    if row is not None:
        row.revogada = True
        session.add(row)
        session.commit()


def revoke_all_user_sessions(session: Session, usuario_id: int) -> None:
    rows = session.exec(select(Sessao).where(Sessao.usuario_id == usuario_id)).all()
    for row in rows:
        row.revogada = True
        session.add(row)
    session.commit()


def _is_expired(row: Sessao, now: datetime) -> bool:
    if row.revogada:
        return True
    if now - row.ultimo_acesso > timedelta(hours=IDLE_HOURS):
        return True
    if now - row.criado_em > timedelta(days=MAX_AGE_DAYS):
        return True
    return False


def lookup_session(session: Session, raw_token: str | None) -> SessionUser | None:
    if not raw_token:
        return None
    th = hash_token(raw_token)
    row = session.exec(select(Sessao).where(Sessao.token_hash == th)).first()
    if row is None:
        return None
    now = _now()
    if _is_expired(row, now):
        row.revogada = True
        session.add(row)
        session.commit()
        return None
    usuario = session.get(Usuario, row.usuario_id)
    if usuario is None or not usuario.activo:
        return None
    row.ultimo_acesso = now
    session.add(row)
    session.commit()
    session.refresh(row)
    session.refresh(usuario)
    return SessionUser(usuario=usuario, sessao=row, raw_token=raw_token)
