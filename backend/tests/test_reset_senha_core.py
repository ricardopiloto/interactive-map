from datetime import datetime, timedelta
import logging

import pytest
from sqlmodel import Session, select

from app.models.usuario import Convite, LoginBloqueio, Usuario
from app.services.auth_admin import canonical_email, deactivate_usuario
from app.services.auth_invite import InviteError, confirm_reset, issue_invite
from app.services.auth_lockout import email_key, is_locked, record_failure, purge_expired_registo_counters
from app.services.auth_tokens import hash_token
from app.services.email_templates import render_email
from app.services import reset_senha
from tests.conftest import TEST_GM_EMAIL


def test_reset_rejects_disabled_and_clears_lockout(control_session):
    user = control_session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).one()
    token = issue_invite(control_session, user.id, 'reset')
    deactivate_usuario(control_session, user.email)
    with pytest.raises(InviteError, match='CONVITE_INVALIDO'):
        confirm_reset(control_session, token, 'new-password-123')
    control_session.refresh(user)
    assert not user.activo
    user.activo = True
    control_session.add(user)
    control_session.commit()
    for _ in range(5):
        record_failure(control_session, email_key(user.email))
    assert is_locked(control_session, email_key(user.email))
    confirm_reset(control_session, token, 'new-password-123')
    assert not is_locked(control_session, email_key(user.email))


@pytest.mark.parametrize('kind,hours', [('activar', 72), ('verificar', 5), ('reset', 72)])
def test_invite_ttls(control_session, kind, hours):
    user = control_session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).one()
    token = issue_invite(control_session, user.id, kind)
    row = control_session.exec(select(Convite).where(Convite.token_hash == hash_token(token))).one()
    assert abs((row.expira_em - row.criado_em).total_seconds() - hours * 3600) < 2
    if kind == 'reset':
        token = issue_invite(control_session, user.id, kind, ttl_horas=1)
        row = control_session.exec(select(Convite).where(Convite.token_hash == hash_token(token))).one()
        assert abs((row.expira_em - row.criado_em).total_seconds() - 3600) < 2


@pytest.mark.parametrize('lang', ['pt-BR', 'en'])
@pytest.mark.parametrize('kind,path', [('verificar', '/convite/token'), ('admin', '/convite/token'), ('reset', '/reset/token'), ('existente', '/login')])
def test_email_links(lang, kind, path):
    subject, html, plain = render_email(kind, lang, 'token')
    assert subject and path in plain and path in html
    if kind == 'existente':
        assert '/esqueci-senha' in plain and '/esqueci-senha' in html and 'token' not in plain
    if kind == 'reset':
        assert ('1 hora' if lang == 'pt-BR' else '1 hour') in plain
        assert ('ignore' in plain.lower())


def test_purge_three_prefixes(control_session):
    for prefix in ('registo:', 'contato:', 'reset:'):
        for suffix, expiry in [('old', -1), ('current', 1)]:
            control_session.add(LoginBloqueio(chave=prefix + suffix, falhas=1, bloqueado_ate=datetime.utcnow() + timedelta(hours=expiry)))
    control_session.commit()
    assert purge_expired_registo_counters(control_session) == 3
    assert len(control_session.exec(select(LoginBloqueio).where(LoginBloqueio.chave.endswith('current'))).all()) == 3


@pytest.fixture
def reset_env(tmp_path, monkeypatch):
    from app.models.campanha import ControlSQLModel
    from sqlmodel import create_engine
    engine = create_engine(f'sqlite:///{tmp_path}/reset.db')
    ControlSQLModel.metadata.create_all(engine)
    monkeypatch.setattr(reset_senha, 'get_control_engine', lambda: engine)
    sent = []
    class Sender:
        ok = True
        def send(self, *args):
            sent.append(args)
            return self.ok
    sender = Sender()
    monkeypatch.setattr(reset_senha, 'get_email_sender', lambda: sender)
    return engine, sender, sent


def add_user(engine, email, *, active=True, password=True):
    with Session(engine) as session:
        user = Usuario(email=email, email_canonico=canonical_email(email), activo=active, senha_hash='hash' if password else None)
        session.add(user)
        session.commit()
        return user.id


def test_process_account_states_alias_and_exact(reset_env, caplog):
    engine, sender, sent = reset_env
    add_user(engine, 'person+home@gmail.com')
    add_user(engine, 'pending@example.com', active=False, password=False)
    add_user(engine, 'disabled@example.com', active=False)
    with caplog.at_level(logging.INFO):
        for email in ('missing@example.com', 'pending@example.com', 'disabled@example.com'):
            reset_senha.process_reset(email)
        reset_senha.process_reset('p.e.r.s.o.n+other@gmail.com')
    assert len(sent) == 1 and sent[0][0] == 'person+home@gmail.com'
    assert all(email not in caplog.text for email in ('missing@example.com', 'pending@example.com', 'disabled@example.com', 'p.e.r.s.o.n+other@gmail.com'))
    add_user(engine, 'person+other@gmail.com')
    reset_senha.process_reset('person+other@gmail.com')
    assert sent[-1][0] == 'person+other@gmail.com'
    reset_senha.process_reset('person+third@gmail.com')
    assert len(sent) == 2


def test_process_invalidates_previous_and_limit(reset_env):
    engine, sender, sent = reset_env
    user_id = add_user(engine, 'limit@example.com')
    with Session(engine) as session:
        old = issue_invite(session, user_id, 'reset')
    reset_senha.process_reset('limit@example.com')
    with Session(engine) as session:
        old_row = session.exec(select(Convite).where(Convite.token_hash == hash_token(old))).one()
        assert old_row.expira_em <= datetime.utcnow()
        assert len(session.exec(select(Convite)).all()) == 2
    for _ in range(5):
        reset_senha.process_reset('limit@example.com')
    assert len(sent) == 5


def test_process_refunds_provider_failure(reset_env):
    engine, sender, sent = reset_env
    add_user(engine, 'failure@example.com')
    sender.ok = False
    for _ in range(6):
        reset_senha.process_reset('failure@example.com')
    assert len(sent) == 6
    with Session(engine) as session:
        row = session.exec(select(LoginBloqueio).where(LoginBloqueio.chave.startswith('reset:'))).one()
        assert row.falhas == 0
