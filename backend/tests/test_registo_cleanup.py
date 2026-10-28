from datetime import datetime, timedelta
from uuid import uuid4

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.models.usuario import Convite, LoginBloqueio, Membro, Usuario
from app.services.admin_console import purge_unverified_signups
from app.services.auth_lockout import email_key, registo_key
from app.services.auth_admin import canonical_email


def _user(session, email, *, active=False, password=None, kinds=('verificar',), expiries=None):
    now = datetime.utcnow()
    user = Usuario(email=email, email_canonico=canonical_email(email), activo=active, senha_hash=password)
    session.add(user)
    session.flush()
    for index, kind in enumerate(kinds):
        session.add(Convite(usuario_id=user.id, tipo=kind, token_hash=uuid4().hex,
                            criado_em=now + timedelta(minutes=index),
                            expira_em=expiries[index] if expiries else now - timedelta(hours=1)))
    session.commit()
    return user.id


def test_cleanup_eligibility_and_counters(data_root, caplog):
    now = datetime.utcnow()
    with Session(get_control_engine()) as session:
        expired = _user(session, 'expired@example.org')
        second = _user(session, 'second@example.org', kinds=('verificar', 'verificar'),
                       expiries=(now, now - timedelta(minutes=1)))
        admin = _user(session, 'admininvite@example.org', kinds=('activar',))
        active = _user(session, 'active@example.org', active=True, password='hash')
        disabled = _user(session, 'disabled@example.org', password='hash')
        member = _user(session, 'member@example.org')
        session.add(Membro(usuario_id=member, campanha_id=1, papel='dono'))
        session.add(LoginBloqueio(chave=email_key('expired@example.org'), falhas=1))
        session.add(LoginBloqueio(chave=registo_key('expired@example.org'), falhas=1,
                                  bloqueado_ate=now + timedelta(hours=23)))
        session.commit()
        assert purge_unverified_signups(session, now=now) == 2
        assert session.get(Usuario, expired) is None
        assert session.get(Usuario, second) is None
        assert all(session.get(Usuario, uid) is not None for uid in (admin, active, disabled, member))
        assert session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == email_key('expired@example.org'))).first() is None
        assert session.exec(select(LoginBloqueio).where(LoginBloqueio.chave == registo_key('expired@example.org'))).first() is not None
    assert 'expired@example.org' not in caplog.text


def test_activated_before_cleanup_is_preserved(data_root):
    with Session(get_control_engine()) as session:
        uid = _user(session, 'activated@example.org')
        user = session.get(Usuario, uid)
        user.activo = True
        user.senha_hash = 'hash'
        session.add(user)
        session.commit()
        assert purge_unverified_signups(session) == 0
        assert session.get(Usuario, uid) is not None


def test_activation_during_candidate_recheck_is_preserved(data_root, monkeypatch):
    with Session(get_control_engine()) as session:
        uid = _user(session, 'racing@example.org')
        original_get = session.get
        def activating_get(model, identity, **kwargs):
            user = original_get(model, identity, **kwargs)
            if model is Usuario and identity == uid:
                user.activo = True
                user.senha_hash = 'hash'
                session.add(user)
                session.flush()
            return user
        monkeypatch.setattr(session, 'get', activating_get)
        assert purge_unverified_signups(session) == 0
        assert original_get(Usuario, uid) is not None
