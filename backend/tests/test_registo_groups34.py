from datetime import datetime, timedelta
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, select
from app.models.campanha import ControlSQLModel

from app.config import Settings
from app.models.usuario import Convite, LoginBloqueio, Usuario
from app.services.auth_lockout import allow_registo_email, purge_expired_registo_counters, registo_key
from app.services.email_sender import LogSender, ResendSender, get_email_sender
from app.services.email_templates import render_email
from app.services.registo import is_disposable, process_registo, verify_turnstile
from app.services.registo_config import validate_registo_startup
from app.services.rate_limit import limiter
from tests.conftest import TEST_ORIGIN


@pytest.fixture(autouse=True)
def reset_limiter():
    limiter._storage.reset()
    yield
    limiter._storage.reset()


def test_resend_transport_and_log_sender(tmp_path, caplog):
    seen = []
    def handler(request):
        seen.append(request)
        return httpx.Response(200, json={'id': 'email-id'}, headers={'x-request-id': 'request-id'})
    sender = ResendSender('secret', 'from@example.com', httpx.MockTransport(handler))
    sender.send('to@example.com', 'subject', '<b>token</b>', 'token')
    assert len(seen) == 1
    for status in (400, 500):
        ResendSender('secret', 'from@example.com', httpx.MockTransport(lambda _r: httpx.Response(status))).send('to@example.com', 'subject', 'token', 'token')
    def timeout(_request):
        raise httpx.ReadTimeout('timeout')
    ResendSender('secret', 'from@example.com', httpx.MockTransport(timeout)).send('to@example.com', 'subject', 'token', 'token')
    assert 'to@example.com' not in caplog.text and 'token' not in caplog.text
    assert get_email_sender(Settings(_env_file=None, DEBUG=False, EMAIL_API_KEY='')) is None
    log = LogSender(tmp_path, Path('mails.jsonl'))
    log.send('to@example.com', 'subject', 'html', 'text')
    assert 'to@example.com' in (tmp_path / 'mails.jsonl').read_text()
    assert LogSender(tmp_path, Path('../outside')).send('x', 'y', 'z', 'w') is False


@pytest.mark.parametrize('kind', ['verificar', 'existente', 'admin'])
@pytest.mark.parametrize('lang', ['pt-BR', 'en'])
def test_templates(kind, lang):
    subject, html, plain = render_email(kind, lang, 'sample-token')
    assert subject and html and plain
    assert ('/login' if kind == 'existente' else '/convite/sample-token') in plain


def test_startup_conditions():
    base = dict(_env_file=None, REGISTO_MODO='aberto', DEBUG=False, EMAIL_API_KEY='key', PUBLIC_BASE_URL='https://example.com', cors_origins='https://example.com', TRUSTED_PROXY=True)
    validate_registo_startup(Settings(**base))
    for delta in ({'EMAIL_API_KEY': ''}, {'PUBLIC_BASE_URL': 'http://example.com'}, {'PUBLIC_BASE_URL': 'https://localhost'}, {'cors_origins': 'https://other.com'}, {'TRUSTED_PROXY': False}):
        with pytest.raises(RuntimeError):
            validate_registo_startup(Settings(**(base | delta)))
    validate_registo_startup(Settings(**(base | {'DEBUG': True})))


def test_counter_and_expiration(tmp_path):
    engine = create_engine(f'sqlite:///{tmp_path}/counter.db')
    ControlSQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        assert [allow_registo_email(session, 'a@example.com') for _ in range(4)] == [True, True, True, False]
        row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == registo_key('a@example.com'))).one()
        assert '@' not in row.chave
        row.bloqueado_ate = datetime.utcnow() - timedelta(seconds=1)
        session.add(row)
        session.commit()
        assert purge_expired_registo_counters(session) == 1
        assert allow_registo_email(session, 'a@example.com')


def test_disposable_and_turnstile(tmp_path):
    assert is_disposable('a@mailinator.com')
    extra = tmp_path / 'blocked.txt'
    extra.write_text('example.net\n')
    assert is_disposable('a@example.net', Settings(_env_file=None, REGISTO_DOMINIOS_BLOQUEADOS=extra))
    ok = httpx.MockTransport(lambda _r: httpx.Response(200, json={'success': True}))
    fail = httpx.MockTransport(lambda _r: httpx.Response(200, json={'success': False}))
    unavailable = httpx.MockTransport(lambda _r: httpx.Response(503))
    assert verify_turnstile('token', 'secret', transport=ok) is None
    assert verify_turnstile('token', 'secret', transport=fail) == 'CAPTCHA_INVALIDO'
    assert verify_turnstile('token', 'secret', transport=unavailable) == 'CAPTCHA_INDISPONIVEL'
    assert verify_turnstile(None, None) is None


def test_registo_states(tmp_path, monkeypatch):
    from app.services import registo as service
    engine = create_engine(f'sqlite:///{tmp_path}/states.db')
    ControlSQLModel.metadata.create_all(engine)
    monkeypatch.setattr(service, 'get_control_engine', lambda: engine)
    sent = []
    class Sender:
        def send(self, *args):
            sent.append(args)
    monkeypatch.setattr(service, 'get_email_sender', lambda: Sender())
    process_registo('new@example.com')
    with Session(engine) as session:
        user = session.exec(select(Usuario).where(Usuario.email == 'new@example.com')).one()
        assert user.termos_aceitos_em and not user.activo
        first = session.exec(select(Convite).where(Convite.usuario_id == user.id)).one()
        assert first.tipo == 'verificar'
    process_registo('new+alias@example.com')
    with Session(engine) as session:
        assert len(session.exec(select(Usuario)).all()) == 1
        assert session.get(Convite, first.id).expira_em <= datetime.utcnow()
        user = session.exec(select(Usuario)).one()
        user.activo = True
        user.senha_hash = 'hash'
        session.add(user)
        session.commit()
    process_registo('new@example.com')
    with Session(engine) as session:
        user = session.exec(select(Usuario)).one()
        user.activo = False
        session.add(user)
        session.commit()
    process_registo('new@example.com')
    assert len(sent) == 3
    with Session(engine) as session:
        assert not session.exec(select(Usuario)).one().activo
        assert len(session.exec(select(Convite)).all()) == 2


def test_routes(monkeypatch, tmp_path):
    from app.main import app
    from app.routers import auth
    from app.services import registo as service
    engine = create_engine(f'sqlite:///{tmp_path}/routes.db', connect_args={'check_same_thread': False})
    ControlSQLModel.metadata.create_all(engine)
    monkeypatch.setattr(service, 'get_control_engine', lambda: engine)
    monkeypatch.setattr(auth, 'settings', Settings(_env_file=None, REGISTO_MODO='aberto', DEBUG=True))
    monkeypatch.setattr(service, 'get_email_sender', lambda: None)
    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as client:
        assert client.get('/api/auth/registo/config').json()['modo'] == 'aberto'
        bodies = []
        for email in ['fresh@example.com', 'fresh@example.com', 'fresh@example.com', 'fresh@example.com']:
            response = client.post('/api/auth/registo', json={'email': email, 'termos_aceitos': True})
            bodies.append((response.status_code, response.json()))
        assert bodies == [(202, {'ok': True})] * 4


def test_route_validation(monkeypatch):
    from app.main import app
    from app.routers import auth
    monkeypatch.setattr(auth, 'settings', Settings(_env_file=None, REGISTO_MODO='aberto', DEBUG=True))
    with TestClient(app, headers={'Origin': TEST_ORIGIN}) as client:
        assert client.post('/api/auth/registo', json={'email': 'honey@example.com', 'termos_aceitos': True, 'campo_auxiliar': 'trap'}).status_code == 202
        assert client.post('/api/auth/registo', json={'email': 'bad@example.com', 'termos_aceitos': False}).json()['detail']['erro'] == 'TERMOS_NAO_ACEITOS'
        assert client.post('/api/auth/registo', json={'email': 'bad@mailinator.com', 'termos_aceitos': True}).json()['detail']['erro'] == 'EMAIL_DESCARTAVEL'



@pytest.mark.parametrize('state', ['novo', 'pendente', 'ativo', 'desativado'])
def test_route_same_response_for_account_states(tmp_path, monkeypatch, state):
    from app.main import app
    from app.routers import auth
    from app.services import registo as service
    engine = create_engine(f'sqlite:///{tmp_path}/route-states.db', connect_args={'check_same_thread': False})
    ControlSQLModel.metadata.create_all(engine)
    monkeypatch.setattr(service, 'get_control_engine', lambda: engine)
    monkeypatch.setattr(service, 'get_email_sender', lambda: None)
    monkeypatch.setattr(auth, 'settings', Settings(_env_file=None, REGISTO_MODO='aberto', DEBUG=True))
    if state != 'novo':
        with Session(engine) as session:
            session.add(Usuario(email='state@example.com', email_canonico='state@example.com',
                                activo=state == 'ativo', senha_hash=None if state == 'pendente' else 'hash'))
            session.commit()
    with TestClient(app, headers={'Origin': TEST_ORIGIN}) as client:
        response = client.post('/api/auth/registo', json={'email': 'state@example.com', 'termos_aceitos': True})
    assert response.status_code == 202
    assert response.json() == {'ok': True}
    if state == 'desativado':
        with Session(engine) as session:
            user = session.exec(select(Usuario)).one()
            assert not user.activo
            assert session.exec(select(Convite)).all() == []


def test_registration_closed_and_default(monkeypatch):
    from app.main import app
    from app.routers import auth
    assert Settings(_env_file=None).registo_modo == 'fechado'
    monkeypatch.setattr(auth, 'settings', Settings(_env_file=None, REGISTO_MODO='fechado'))
    with TestClient(app, headers={'Origin': TEST_ORIGIN}) as client:
        assert client.get('/api/auth/registo/config').json()['modo'] == 'fechado'
        response = client.post('/api/auth/registo', json={'email': 'x@example.com', 'termos_aceitos': True})
    assert response.status_code == 403
    assert response.json()['detail']['erro'] == 'REGISTO_FECHADO'


def test_registration_rate_limit_shape(monkeypatch):
    from app.main import app
    from app.routers import auth
    monkeypatch.setattr(auth, 'settings', Settings(_env_file=None, REGISTO_MODO='aberto', DEBUG=True))
    with TestClient(app, headers={'Origin': TEST_ORIGIN}) as client:
        for i in range(5):
            assert client.post('/api/auth/registo', json={'email': f'{i}@example.com', 'termos_aceitos': True, 'campo_auxiliar': 'trap'}).status_code == 202
        response = client.post('/api/auth/registo', json={'email': 'six@example.com', 'termos_aceitos': True})
    assert response.status_code == 429
    assert response.json() == {'detail': {'erro': 'LIMITE_REGISTO'}}


def test_other_rate_limit_shape(client):
    from tests.conftest import TEST_CAMPAIGN_SLUG
    url = f'/api/c/{TEST_CAMPAIGN_SLUG}/admin/ia/indice/reindexar'
    for _ in range(3):
        client.post(url)
    response = client.post(url)
    assert response.status_code == 429
    assert response.json() == {'detail': {'erro': 'LIMITE_PEDIDOS'}}


@pytest.mark.parametrize('state', ['novo', 'pendente', 'ativo', 'desativado'])
def test_email_limit_all_states(tmp_path, monkeypatch, state):
    from app.services import registo as service
    engine = create_engine(f'sqlite:///{tmp_path}/limit.db')
    ControlSQLModel.metadata.create_all(engine)
    monkeypatch.setattr(service, 'get_control_engine', lambda: engine)
    sent = []
    class Sender:
        def send(self, *args):
            sent.append(args)
    monkeypatch.setattr(service, 'get_email_sender', lambda: Sender())
    if state != 'novo':
        with Session(engine) as session:
            session.add(Usuario(email='limit@example.com', email_canonico='limit@example.com',
                                activo=state == 'ativo', senha_hash=None if state == 'pendente' else 'hash'))
            session.commit()
    for _ in range(4):
        process_registo('limit@example.com')
    assert len(sent) == 3


def test_integrity_error_race_uses_existing_account(tmp_path, monkeypatch):
    from app.services import registo as service
    engine = create_engine(f'sqlite:///{tmp_path}/race.db')
    ControlSQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        session.add(Usuario(email='race@example.com', email_canonico='race@example.com', activo=True, senha_hash='hash'))
        session.commit()
    monkeypatch.setattr(service, 'get_control_engine', lambda: engine)
    sent = []
    class Sender:
        def send(self, *args):
            sent.append(args)
    monkeypatch.setattr(service, 'get_email_sender', lambda: Sender())
    original_exec = Session.exec
    first = True
    def racing_exec(self, statement, *args, **kwargs):
        nonlocal first
        if first and 'usuario.email_canonico' in str(statement):
            first = False
            return original_exec(self, select(Usuario).where(Usuario.email == 'missing@example.com'))
        return original_exec(self, statement, *args, **kwargs)
    monkeypatch.setattr(Session, 'exec', racing_exec)
    process_registo('race@example.com')
    assert len(sent) == 1
    with Session(engine) as session:
        assert len(session.exec(select(Usuario)).all()) == 1
        assert session.exec(select(Convite)).all() == []


def test_blocked_domains_cache_respects_settings_and_file_changes(tmp_path, monkeypatch):
    from app.services import registo as service
    extra = tmp_path / 'domains.txt'
    extra.write_text('first.example\n')
    config = Settings(_env_file=None, REGISTO_DOMINIOS_BLOQUEADOS=extra)
    service._domains_from_file.cache_clear()
    calls = []
    original = Path.read_text
    def tracked_read(path, *args, **kwargs):
        calls.append(path)
        return original(path, *args, **kwargs)
    monkeypatch.setattr(Path, 'read_text', tracked_read)
    assert service.is_disposable('a@first.example', config)
    count = len(calls)
    assert service.is_disposable('b@first.example', config)
    assert len(calls) == count
    extra.write_text('second.example\n')
    assert service.is_disposable('a@second.example', config)
    assert not service.is_disposable('a@second.example', Settings(_env_file=None))
