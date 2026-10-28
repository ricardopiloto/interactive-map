from __future__ import annotations

import logging
from datetime import timedelta

from fastapi import APIRouter, Request
from pydantic import BaseModel
from sqlmodel import Session

from app.campaign_db import get_control_engine
from app.config import settings
from app.errors import raise_api_error
from app.services.auth_admin import normalize_email
from app.services.auth_lockout import counter_allows, counter_consume, counter_refund
from app.services.client_ip import client_ip
from app.services.contato import contato_disponivel, contato_key, obter_sender_contato, render_contato, validate_contato
from app.services.email_sender import get_email_sender
from app.services.rate_limit import limiter
from app.services.registo import verify_turnstile

router = APIRouter(prefix='/api/contato', tags=['contato'])
logger = logging.getLogger(__name__)
WINDOW = timedelta(hours=24)


class ContatoBody(BaseModel):
    nome: str
    email: str
    assunto: str
    mensagem: str
    idioma: str = 'pt-BR'
    captcha_token: str | None = None
    campo_auxiliar: str = ''


def _sender():
    return obter_sender_contato(get_email_sender)


@router.get('/config')
def contato_config() -> dict:
    return {'disponivel': contato_disponivel(get_email_sender), 'turnstile_site_key': settings.turnstile_site_key}


@router.post('', status_code=202)
@limiter.limit('5/hour')
def enviar_contato(body: ContatoBody, request: Request) -> dict[str, bool]:
    sender = _sender()
    if sender is None:
        raise_api_error('CONTATO_INDISPONIVEL', status_code=503)
    if body.campo_auxiliar:
        return {'ok': True}
    error = validate_contato(body.nome, body.email, body.assunto, body.mensagem, body.idioma)
    if error:
        raise_api_error(error, status_code=400)
    captcha_error = verify_turnstile(body.captcha_token, settings.turnstile_secret, client_ip(request))
    if captcha_error:
        raise_api_error(captcha_error, status_code=503 if captcha_error == 'CAPTCHA_INDISPONIVEL' else 400)
    email_key = contato_key(body.email)
    global_key = 'contato:privacidade' if body.assunto == 'privacidade' else 'contato:global'
    global_limit = settings.contato_limite_privacidade if body.assunto == 'privacidade' else settings.contato_limite_diario
    with Session(get_control_engine()) as session:
        if not counter_allows(session, email_key, 3, WINDOW):
            raise_api_error('LIMITE_PEDIDOS', status_code=429)
        if not counter_allows(session, global_key, global_limit, WINDOW):
            raise_api_error('LIMITE_CONTATO_DIARIO', status_code=429)
        counter_consume(session, email_key, 3, WINDOW)
        subject, html, plain = render_contato(body.nome, body.email, body.assunto, body.mensagem)
        if not sender.send(settings.contato_email, subject, html, plain, reply_to=normalize_email(body.email)):
            counter_refund(session, email_key, 3, WINDOW)
            logger.error('contact delivery failed code=CONTATO_ENVIO_FALHOU')
            raise_api_error('CONTATO_ENVIO_FALHOU', status_code=502)
        counter_consume(session, global_key, global_limit, WINDOW)
    logger.info('contact delivery accepted category=%s', body.assunto)
    return {'ok': True}
