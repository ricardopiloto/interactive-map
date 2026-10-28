from __future__ import annotations

from datetime import datetime, timedelta
from hashlib import sha256

from sqlalchemy import or_
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


def record_failure(session: Session, chave: str, *, limit: int = MAX_FAILURES, window: timedelta = timedelta(minutes=LOCKOUT_MINUTES)) -> None:
    row = _get_or_create(session, chave)
    now = _now()
    if row.bloqueado_ate and row.bloqueado_ate > now:
        return
    row.falhas += 1
    row.actualizado_em = now
    if row.falhas >= limit:
        row.bloqueado_ate = now + window
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


def registo_key(email_canonico: str) -> str:
    return "registo:" + sha256(email_canonico.encode()).hexdigest()


def allow_registo_email(session: Session, email_canonico: str) -> bool:
    """Fixed 24-hour window, including the first accepted request."""
    key = registo_key(email_canonico)
    if not counter_allows(session, key, 3, timedelta(hours=24)):
        return False
    counter_consume(session, key, 3, timedelta(hours=24))
    return True


def counter_allows(session: Session, chave: str, limite: int, janela: timedelta) -> bool:
    row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == chave)).first()
    return row is None or row.bloqueado_ate is None or row.bloqueado_ate <= _now() or row.falhas < limite


def counter_consume(session: Session, chave: str, limite: int, janela: timedelta) -> bool:
    if not counter_allows(session, chave, limite, janela):
        return False
    now = _now()
    row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == chave)).first()
    if row is None:
        row = LoginBloqueio(chave=chave, falhas=1, actualizado_em=now, bloqueado_ate=now + janela)
    elif row.bloqueado_ate is None or row.bloqueado_ate <= now:
        row.falhas, row.actualizado_em, row.bloqueado_ate = 1, now, now + janela
    else:
        row.falhas += 1
    session.add(row)
    session.commit()
    return True


def counter_refund(session: Session, chave: str, limite: int, janela: timedelta) -> None:
    row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == chave)).first()
    if row is not None and row.bloqueado_ate is not None and row.bloqueado_ate > _now() and row.falhas > 0:
        row.falhas -= 1
        session.add(row)
        session.commit()


def purge_expired_registo_counters(session: Session) -> int:
    prefixes = ("registo:", "contato:", "reset:")
    rows = session.exec(select(LoginBloqueio).where(or_(*(LoginBloqueio.chave.startswith(prefix) for prefix in prefixes)))).all()
    expired = [row for row in rows if row.bloqueado_ate is not None and row.bloqueado_ate <= _now()]
    for row in expired:
        session.delete(row)
    session.commit()
    return len(expired)
