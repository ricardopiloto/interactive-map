from datetime import datetime, timedelta

import pytest
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.config import Settings, settings
from app.models.usuario import Convite, Usuario
from app.services.auth_admin import canonical_email
from app.services.auth_tokens import hash_token
from app.services.rate_limit import limiter
from app.services.auth_session import COOKIE_NAME
from app.services.registo_config import validate_public_forms_startup
from tests.conftest import TEST_GM_EMAIL, TEST_GM_PASSWORD, TEST_ORIGIN


@pytest.fixture(autouse=True)
def reset_limiter():
    limiter._storage.reset()
    yield
    limiter._storage.reset()


@pytest.mark.parametrize('contact,key', [(None, None), ('a@example.com', None), (None, 'key'), ('a@example.com', 'key')])
def test_public_forms_proxy_requirement(contact, key):
    config = Settings(_env_file=None, CONTATO_EMAIL=contact, EMAIL_API_KEY=key, DEBUG=False, TRUSTED_PROXY=False)
    if contact or key:
        with pytest.raises(RuntimeError, match='TRUSTED_PROXY=true é obrigatório para formulários públicos com e-mail'):
            validate_public_forms_startup(config)
    else:
        validate_public_forms_startup(config)
    validate_public_forms_startup(config.model_copy(update={'debug': True}))
    validate_public_forms_startup(config.model_copy(update={'trusted_proxy': True}))


def test_config_and_validation(client_anon, monkeypatch):
    from app.routers import auth
    monkeypatch.setattr(auth, 'get_email_sender', lambda: None)
    assert client_anon.get('/api/auth/reset/config').json()['disponivel'] is False
    response = client_anon.post('/api/auth/reset/pedir', json={'email': 'a@example.com'})
    assert (response.status_code, response.json()['detail']['erro']) == (503, 'RESET_INDISPONIVEL')
    monkeypatch.setattr(auth, 'get_email_sender', lambda: object())
    monkeypatch.setattr(settings, 'turnstile_site_key', 'site-key')
    assert client_anon.get('/api/auth/reset/config').json() == {'disponivel': True, 'turnstile_site_key': 'site-key'}
    called = []
    monkeypatch.setattr(auth, 'process_reset', lambda *args: called.append(args))
    assert client_anon.post('/api/auth/reset/pedir', json={'email': 'bad', 'campo_auxiliar': 'trap'}).json() == {'ok': True}
    assert called == []
    for body, code in [({'email': 'a@example.com', 'idioma': 'fr'}, 'IDIOMA_INVALIDO'), ({'email': 'bad'}, 'EMAIL_INVALIDO')]:
        response = client_anon.post('/api/auth/reset/pedir', json=body)
        assert (response.status_code, response.json()['detail']['erro']) == (400, code)
    for captcha_code, status in [('CAPTCHA_INVALIDO', 400), ('CAPTCHA_INDISPONIVEL', 503)]:
        monkeypatch.setattr(auth, 'verify_turnstile', lambda *args: captcha_code)
        limiter._storage.reset()
        response = client_anon.post('/api/auth/reset/pedir', json={'email': 'a@example.com'})
        assert (response.status_code, response.json()['detail']['erro']) == (status, captcha_code)
    assert called == []


def test_same_response_without_account_lookup_and_ip_limit(client_anon, monkeypatch):
    from app.routers import auth
    monkeypatch.setattr(auth, 'get_email_sender', lambda: object())
    monkeypatch.setattr(auth, 'verify_turnstile', lambda *args: None)
    called = []
    monkeypatch.setattr(auth, 'process_reset', lambda *args: called.append(args))
    for email, active, password in [('active@example.com', True, True), ('pending@example.com', False, False), ('disabled@example.com', False, True)]:
        with Session(get_control_engine()) as session:
            session.add(Usuario(email=email, email_canonico=canonical_email(email), activo=active, senha_hash='hash' if password else None))
            session.commit()
    responses = []
    for email in ['active@example.com', 'missing@example.com', 'pending@example.com', 'disabled@example.com', 'active+alias@example.com']:
        response = client_anon.post('/api/auth/reset/pedir', json={'email': email})
        responses.append((response.status_code, response.json()))
    assert responses == [(202, {'ok': True})] * 5
    assert [args[0] for args in called] == ['active@example.com', 'missing@example.com', 'pending@example.com', 'disabled@example.com', 'active+alias@example.com']
    response = client_anon.post('/api/auth/reset/pedir', json={'email': 'six@example.com'})
    assert (response.status_code, response.json()['detail']['erro']) == (429, 'LIMITE_PEDIDOS')


def test_expired_reset_error_details(client_anon, control_session):
    from app.services.auth_invite import issue_invite
    user = control_session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).one()
    token = issue_invite(control_session, user.id, 'reset')
    invite = control_session.exec(select(Convite).where(Convite.token_hash == hash_token(token))).one()
    invite.expira_em = datetime.utcnow() - timedelta(seconds=1)
    control_session.add(invite)
    control_session.commit()
    response = client_anon.post('/api/auth/reset/confirmar', json={'token': token, 'password': 'new-password-123'})
    assert response.status_code == 400
    assert response.json() == {'detail': {'erro': 'CONVITE_EXPIRADO', 'detalhes': {'tipo': 'reset'}}}


def test_full_reset_flow(client_anon, monkeypatch):
    from app.routers import auth
    from app.services import reset_senha
    monkeypatch.setattr(auth, 'get_email_sender', lambda: object())
    monkeypatch.setattr(auth, 'verify_turnstile', lambda *args: None)
    sent = []

    class Sender:
        def send(self, *args):
            sent.append(args)
            return True

    monkeypatch.setattr(reset_senha, 'get_email_sender', lambda: Sender())
    old_login = client_anon.post('/api/auth/login', json={'email': TEST_GM_EMAIL, 'password': TEST_GM_PASSWORD})
    assert old_login.status_code == 200
    old_cookie = old_login.cookies.get(COOKIE_NAME)
    assert old_cookie
    response = client_anon.post('/api/auth/reset/pedir', json={'email': TEST_GM_EMAIL})
    assert (response.status_code, response.json()) == (202, {'ok': True})
    assert len(sent) == 1 and sent[0][0] == TEST_GM_EMAIL
    with Session(get_control_engine()) as session:
        invite = session.exec(select(Convite).where(Convite.tipo == 'reset')).one()
    # The sender receives the rendered link; extract the opaque token from its plain text.
    token = sent[0][3].split('/reset/', 1)[1].split()[0]
    assert hash_token(token) == invite.token_hash
    response = client_anon.post('/api/auth/reset/confirmar', json={'token': token, 'password': 'new-password-123'})
    assert response.status_code == 200
    assert client_anon.post('/api/auth/login', json={'email': TEST_GM_EMAIL, 'password': TEST_GM_PASSWORD}).status_code == 401
    assert client_anon.get('/api/auth/me', cookies={COOKIE_NAME: old_cookie}).status_code == 401
    assert client_anon.post('/api/auth/login', json={'email': TEST_GM_EMAIL, 'password': 'new-password-123'}).status_code == 200
