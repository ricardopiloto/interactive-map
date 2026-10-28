from __future__ import annotations

import logging
from functools import lru_cache
from datetime import datetime
from pathlib import Path

import httpx
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.config import Settings, settings
from app.models.usuario import Convite, Usuario
from app.services.auth_admin import canonical_email, normalize_email
from app.services.auth_invite import issue_invite
from app.services.auth_lockout import allow_registo_email
from app.services.email_sender import get_email_sender
from app.services.email_templates import render_email

logger = logging.getLogger(__name__)


@lru_cache(maxsize=32)
def _domains_from_file(path: Path, mtime_ns: int | None) -> frozenset[str]:
    if mtime_ns is None:
        return frozenset()
    return frozenset(
        line.strip().lower()
        for line in path.read_text().splitlines()
        if line.strip() and not line.startswith('#')
    )


def blocked_domains(config: Settings = settings) -> set[str]:
    paths = [Path(__file__).resolve().parent.parent / 'data/disposable_domains.txt']
    if config.registo_dominios_bloqueados:
        paths.append(config.registo_dominios_bloqueados)
    result: set[str] = set()
    for path in paths:
        try:
            mtime_ns = path.stat().st_mtime_ns
        except FileNotFoundError:
            mtime_ns = None
        result.update(_domains_from_file(path, mtime_ns))
    return result


def is_disposable(email: str, config: Settings = settings) -> bool:
    return email.rpartition('@')[2].lower() in blocked_domains(config)


def verify_turnstile(token: str | None, secret: str | None, remoteip: str | None = None, transport: httpx.BaseTransport | None = None) -> str | None:
    if not secret:
        return None
    if not token:
        return 'CAPTCHA_INVALIDO'
    try:
        with httpx.Client(transport=transport, timeout=3.0) as client:
            response = client.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', data={'secret': secret, 'response': token, 'remoteip': remoteip or ''})
            response.raise_for_status()
            return None if response.json().get('success') is True else 'CAPTCHA_INVALIDO'
    except (httpx.HTTPError, ValueError):
        return 'CAPTCHA_INDISPONIVEL'


def process_registo(email: str, idioma: str = 'pt-BR') -> None:
    """Runs after the HTTP response, with its own control DB session."""
    canonical = canonical_email(email)
    try:
        with Session(get_control_engine()) as session:
            if not allow_registo_email(session, canonical):
                return
            user = session.exec(select(Usuario).where(Usuario.email_canonico == canonical)).first()
            if user is None:
                now = datetime.utcnow()
                user = Usuario(email=normalize_email(email), email_canonico=canonical, activo=False, senha_hash=None, termos_aceitos_em=now, criado_em=now, actualizado_em=now)
                session.add(user)
                try:
                    session.commit()
                    session.refresh(user)
                except IntegrityError:
                    session.rollback()
                    user = session.exec(select(Usuario).where(Usuario.email_canonico == canonical)).first()
                    if user is None:
                        logger.error('registration race lookup failed')
                        return
            if user.activo or user.senha_hash is not None:
                kind, token = 'existente', None
            else:
                now = datetime.utcnow()
                for invite in session.exec(select(Convite).where(Convite.usuario_id == user.id, Convite.tipo == 'verificar', Convite.consumido_em == None)).all():
                    invite.expira_em = now
                    session.add(invite)
                session.commit()
                kind, token = 'verificar', issue_invite(session, user.id, 'verificar')
            sender = get_email_sender()
            if sender is not None:
                subject, html, plain = render_email(kind, idioma, token)
                sender.send(user.email, subject, html, plain)
    except Exception as exc:
        logger.error('registration processing failed type=%s', type(exc).__name__)
