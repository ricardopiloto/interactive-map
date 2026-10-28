from __future__ import annotations

import logging
from datetime import datetime, timedelta
from hashlib import sha256

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.models.usuario import Convite, Usuario
from app.services.auth_admin import canonical_email, normalize_email
from app.services.auth_invite import RESET_PEDIDO_TTL_HORAS, issue_invite
from app.services.auth_lockout import counter_allows, counter_consume, counter_refund
from app.services.email_sender import get_email_sender
from app.services.email_templates import render_email

logger = logging.getLogger(__name__)
_RESET_LIMIT = 5
_RESET_WINDOW = timedelta(hours=24)


def process_reset(email: str, idioma: str = 'pt-BR') -> None:
    """Process a public reset request after the response, in its own DB session."""
    try:
        canonical = canonical_email(email)
        key = 'reset:' + sha256(canonical.encode()).hexdigest()
        with Session(get_control_engine()) as session:
            if not counter_allows(session, key, _RESET_LIMIT, _RESET_WINDOW):
                logger.info('reset limit')
                return
            if not counter_consume(session, key, _RESET_LIMIT, _RESET_WINDOW):
                logger.info('reset limit')
                return

            user = session.exec(select(Usuario).where(Usuario.email == normalize_email(email))).first()
            if user is None:
                candidates = session.exec(select(Usuario).where(
                    Usuario.email_canonico == canonical,
                    Usuario.activo == True,
                    Usuario.senha_hash != None,
                )).all()
                if len(candidates) > 1:
                    logger.info('reset ambiguous count=%d', len(candidates))
                    return
                user = candidates[0] if candidates else None
            if user is None or not user.activo or not user.senha_hash:
                logger.info('reset no_account')
                return

            now = datetime.utcnow()
            previous = session.exec(select(Convite).where(
                Convite.usuario_id == user.id,
                Convite.tipo == 'reset',
                Convite.consumido_em == None,
            )).all()
            for invite in previous:
                invite.expira_em = now
                session.add(invite)
            session.commit()
            token = issue_invite(session, user.id, 'reset', ttl_horas=RESET_PEDIDO_TTL_HORAS)
            sender = get_email_sender()
            subject, html, plain = render_email('reset', idioma, token)
            if sender is None or sender.send(user.email, subject, html, plain) is False:
                counter_refund(session, key, _RESET_LIMIT, _RESET_WINDOW)
                logger.warning('reset provider_failure')
                return
            logger.info('reset accepted count=1')
    except Exception as exc:
        logger.error('reset processing failed type=%s', type(exc).__name__)
