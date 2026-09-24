from __future__ import annotations

from datetime import datetime, timedelta

from sqlmodel import Session, select

from app.models.usuario import LoginBloqueio

MAX_FAILURES = 5
LOCKOUT_MINUTES = 15


def _now() -> datetime:
    return datetime.utcnow()


def email_key(email: str) -> str:
    return f"email:{email.strip().lower()}"


def ip_key(ip: str) -> str:
    return f"ip:{ip}"


def _get_or_create(session: Session, chave: str) -> LoginBloqueio:
    row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == chave)).first()
    if row is None:
        row = LoginBloqueio(chave=chave, falhas=0, bloqueado_ate=None, actualizado_em=_now())
        session.add(row)
        session.commit()
        session.refresh(row)
    return row


def is_locked(session: Session, chave: str) -> bool:
    row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == chave)).first()
    if row is None or row.bloqueado_ate is None:
        return False
    if row.bloqueado_ate > _now():
        return True
    # Lock expired — reset
    row.falhas = 0
    row.bloqueado_ate = None
    row.actualizado_em = _now()
    session.add(row)
    session.commit()
    return False


def record_failure(session: Session, chave: str) -> None:
    row = _get_or_create(session, chave)
    now = _now()
    if row.bloqueado_ate and row.bloqueado_ate > now:
        return
    row.falhas += 1
    row.actualizado_em = now
    if row.falhas >= MAX_FAILURES:
        row.bloqueado_ate = now + timedelta(minutes=LOCKOUT_MINUTES)
        row.falhas = 0
    session.add(row)
    session.commit()


def clear_failures(session: Session, chave: str) -> None:
    row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == chave)).first()
    if row is None:
        return
    row.falhas = 0
    row.bloqueado_ate = None
    row.actualizado_em = _now()
    session.add(row)
    session.commit()
