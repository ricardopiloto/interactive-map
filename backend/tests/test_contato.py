from datetime import datetime, timedelta
import json
import logging

import httpx
import pytest
from sqlmodel import select

from app.config import Settings, settings
from app.models.usuario import LoginBloqueio
from app.services.auth_admin import valid_email_format
from app.services.auth_lockout import counter_allows, counter_consume, counter_refund, purge_expired_registo_counters
from app.services.contato import render_contato, validate_contato
from app.services.email_sender import LogSender, ResendSender
from app.services.rate_limit import limiter
from app.services.registo_config import validate_public_forms_startup


@pytest.fixture(autouse=True)
def reset_rate_limit():
    limiter._storage.reset()
    yield
    limiter._storage.reset()


def test_sender_reply_to_and_failures(tmp_path):
    requests = []
    def handler(request):
        requests.append(json.loads(request.content))
        return httpx.Response(202, headers={'x-request-id': 'req-1'})
    sender = ResendSender('key', 'from@example.com', httpx.MockTransport(handler))
    assert sender.send('to@example.com', 'subject', '<p>body</p>', 'body', reply_to='user@example.com')
    assert requests[0]['reply_to'] == 'user@example.com'
    for status in (400, 500):
        sender = ResendSender('key', 'from@example.com', httpx.MockTransport(lambda _: httpx.Response(status)))
        assert not sender.send('to@example.com', 'subject', 'html', 'text')
    def timeout(_):
        raise httpx.TimeoutException('timeout')
    assert not ResendSender('key', 'from@example.com', httpx.MockTransport(timeout)).send('to@example.com', 's', 'h', 't')
    assert not LogSender(tmp_path, tmp_path.parent / 'outside').send('to@example.com', 's', 'h', 't')
    log = LogSender(tmp_path, tmp_path / 'emails.jsonl')
    assert log.send('to@example.com', 's', 'h', 't', reply_to='user@example.com')
    assert json.loads((tmp_path / 'emails.jsonl').read_text())['reply_to'] == 'user@example.com'


def test_validation_and_render():
    assert valid_email_format('person@example.com')
    for bad in ('a\r\n@example.com', 'a<>@example.com', 'a,b@example.com', 'a;b@example.com'):
        assert not valid_email_format(bad)
        assert validate_contato('N', bad, 'duvida', '0123456789', 'en') == 'EMAIL_INVALIDO'
    assert validate_contato('', 'a@example.com', 'duvida', '0123456789', 'en') == 'NOME_INVALIDO'
    assert validate_contato('N', 'a@example.com', 'other', '0123456789', 'en') == 'ASSUNTO_INVALIDO'
    for msg in ('short', 'x' * 4001, 'http://a https://b http://c'):
        assert validate_contato('N', 'a@example.com', 'duvida', msg, 'en') == 'MENSAGEM_INVALIDA'
    for msg in ('0123456789', 'http://a https://b'):
        assert validate_contato('N', 'a@example.com', 'duvida', msg, 'en') is None
    subject, html, plain = render_contato('Alice\r\nBcc: evil', 'a@example.com', 'duvida', '<script>http://x</script>')
    assert '\r' not in subject and '\n' not in subject
    assert '<script>' not in html and '&lt;script&gt;' in html and '<a ' not in html
    assert '<script>' in plain and 'http://' not in html


def test_counters_and_purge(control_session):
    window = timedelta(hours=24)
    for key, limit in [('contato:global', 2), ('contato:privacidade', 1)]:
        for _ in range(limit):
            assert counter_allows(control_session, key, limit, window)
            assert counter_consume(control_session, key, limit, window)
        assert not counter_allows(control_session, key, limit, window)
        counter_refund(control_session, key, limit, window)
        assert counter_allows(control_session, key, limit, window)
        row = control_session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == key)).one()
        row.bloqueado_ate = datetime.utcnow() - timedelta(seconds=1)
        control_session.add(row)
        control_session.commit()
        assert counter_allows(control_session, key, limit, window)
    assert purge_expired_registo_counters(control_session) >= 2


def test_startup_config():
    config = Settings(_env_file=None, CONTATO_EMAIL='operator@example.com', DEBUG=False, TRUSTED_PROXY=False)
    with pytest.raises(RuntimeError, match='TRUSTED_PROXY'):
        validate_public_forms_startup(config)
    validate_public_forms_startup(config.model_copy(update={'trusted_proxy': True}))
    validate_public_forms_startup(config.model_copy(update={'contato_email': None}))


def test_route_success_limits_and_refund(client_anon, monkeypatch, caplog):
    from app.routers import contato
    monkeypatch.setattr(settings, 'contato_email', 'operator@example.com')
    monkeypatch.setattr(settings, 'debug', True)
    monkeypatch.setattr(settings, 'turnstile_secret', None)
    sent = []
    class Sender:
        ok = True
        def send(self, *args, **kwargs):
            sent.append((args, kwargs))
            return self.ok
    sender = Sender()
    monkeypatch.setattr(contato, 'get_email_sender', lambda: sender)
    body = {'nome': 'Private Name', 'email': 'person@example.com', 'assunto': 'duvida', 'mensagem': 'Private text here'}
    assert client_anon.get('/api/contato/config').json()['disponivel'] is True
    with caplog.at_level(logging.INFO):
        result = client_anon.post('/api/contato', json=body)
    assert result.status_code == 202
    assert len(sent) == 1 and sent[0][0][0] == settings.contato_email
    assert sent[0][1]['reply_to'] == body['email']
    assert all(secret not in caplog.text for secret in ('Private Name', 'person@example.com', 'Private text here'))
    sender.ok = False
    for _ in range(2):
        assert client_anon.post('/api/contato', json=body).status_code == 502
    sender.ok = True
    assert client_anon.post('/api/contato', json=body).status_code == 202
    assert client_anon.post('/api/contato', json=body).status_code == 202
    limiter._storage.reset()
    result = client_anon.post('/api/contato', json=body)
    assert result.status_code == 429 and result.json()['detail']['erro'] == 'LIMITE_PEDIDOS'


def test_route_failed_delivery_refunds_instance_limit(client_anon, monkeypatch):
    from app.routers import contato
    monkeypatch.setattr(settings, 'contato_email', 'operator@example.com')
    monkeypatch.setattr(settings, 'debug', True)
    monkeypatch.setattr(settings, 'turnstile_secret', None)
    monkeypatch.setattr(settings, 'contato_limite_diario', 1)

    class Sender:
        ok = False
        def send(self, *args, **kwargs):
            return self.ok

    sender = Sender()
    monkeypatch.setattr(contato, 'get_email_sender', lambda: sender)
    base = {'nome': 'N', 'assunto': 'duvida', 'mensagem': '0123456789'}
    assert client_anon.post('/api/contato', json={**base, 'email': 'failed@example.com'}).status_code == 502
    sender.ok = True
    assert client_anon.post('/api/contato', json={**base, 'email': 'accepted@example.com'}).status_code == 202
    result = client_anon.post('/api/contato', json={**base, 'email': 'next@example.com'})
    assert result.status_code == 429 and result.json()['detail']['erro'] == 'LIMITE_CONTATO_DIARIO'


def test_route_honeypot_unavailable_and_validation(client_anon, monkeypatch):
    monkeypatch.setattr(settings, 'contato_email', None)
    body = {'nome': 'N', 'email': 'a@example.com', 'assunto': 'duvida', 'mensagem': '0123456789'}
    assert client_anon.get('/api/contato/config').json()['disponivel'] is False
    assert client_anon.post('/api/contato', json=body).status_code == 503
    monkeypatch.setattr(settings, 'contato_email', 'operator@example.com')
    monkeypatch.setattr(settings, 'debug', True)
    assert client_anon.post('/api/contato', json={**body, 'campo_auxiliar': 'bot'}).status_code == 202
    assert client_anon.post('/api/contato', json={**body, 'assunto': 'wrong'}).json()['detail']['erro'] == 'ASSUNTO_INVALIDO'


def test_route_instance_limits_and_privacy(client_anon, monkeypatch):
    from app.routers import contato
    monkeypatch.setattr(settings, 'contato_email', 'operator@example.com')
    monkeypatch.setattr(settings, 'debug', True)
    monkeypatch.setattr(settings, 'turnstile_secret', None)
    monkeypatch.setattr(settings, 'contato_limite_diario', 1)
    monkeypatch.setattr(settings, 'contato_limite_privacidade', 1)
    class Sender:
        def send(self, *args, **kwargs):
            return True
    monkeypatch.setattr(contato, 'get_email_sender', Sender)
    base = {'nome': 'N', 'assunto': 'duvida', 'mensagem': '0123456789'}
    assert client_anon.post('/api/contato', json={**base, 'email': 'one@example.com'}).status_code == 202
    result = client_anon.post('/api/contato', json={**base, 'email': 'two@example.com'})
    assert result.status_code == 429 and result.json()['detail']['erro'] == 'LIMITE_CONTATO_DIARIO'
    privacy = {**base, 'assunto': 'privacidade'}
    assert client_anon.post('/api/contato', json={**privacy, 'email': 'three@example.com'}).status_code == 202
    result = client_anon.post('/api/contato', json={**privacy, 'email': 'four@example.com'})
    assert result.status_code == 429 and result.json()['detail']['erro'] == 'LIMITE_CONTATO_DIARIO'


def test_route_captcha_failures(client_anon, monkeypatch):
    from app.routers import contato
    monkeypatch.setattr(settings, 'contato_email', 'operator@example.com')
    monkeypatch.setattr(settings, 'debug', True)
    monkeypatch.setattr(settings, 'turnstile_secret', 'secret')
    body = {'nome': 'N', 'email': 'a@example.com', 'assunto': 'duvida', 'mensagem': '0123456789'}
    result = client_anon.post('/api/contato', json=body)
    assert result.status_code == 400 and result.json()['detail']['erro'] == 'CAPTCHA_INVALIDO'
    monkeypatch.setattr(contato, 'verify_turnstile', lambda *args: 'CAPTCHA_INDISPONIVEL')
    result = client_anon.post('/api/contato', json={**body, 'captcha_token': 'token'})
    assert result.status_code == 503 and result.json()['detail']['erro'] == 'CAPTCHA_INDISPONIVEL'
