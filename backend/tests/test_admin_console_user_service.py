from __future__ import annotations

import pytest
from sqlmodel import select

from app.models.campanha import Campanha
from app.models.usuario import Convite, Membro, Sessao, Usuario
from app.services.admin_console import AdminConsoleError, delete_user, set_user_active
from app.services.auth_admin import create_usuario_with_invite
from app.services.auth_tokens import hash_token
from app.services.auth_session import create_session
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL


def test_status_derivado_e_sessoes_revogadas_ao_desativar(control_session, data_root):
    user = control_session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).one()
    raw_token = create_session(control_session, user.id)
    session = control_session.exec(select(Sessao).where(Sessao.usuario_id == user.id)).one()
    with pytest.raises(AdminConsoleError, match="PROPRIETARIO_COM_MESAS"):
        set_user_active(control_session, user.id, False)
    assert control_session.get(Usuario, user.id).activo
    assert raw_token


def test_exclusao_remove_relacoes_da_conta_sem_remover_mesa(control_session, data_root):
    user, _ = create_usuario_with_invite(control_session, "cleanup@example.org")
    user_id = user.id
    delete_user(control_session, user_id)
    assert control_session.get(Usuario, user_id) is None
    assert control_session.exec(select(Convite).where(Convite.usuario_id == user_id)).first() is None
    assert control_session.exec(select(Sessao).where(Sessao.usuario_id == user_id)).first() is None
    assert control_session.exec(select(Membro).where(Membro.usuario_id == user_id)).first() is None
    assert control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).first() is not None


def test_usuario_sem_mesa_e_desativado_e_sessao_revogada(control_session, data_root):
    user, _ = create_usuario_with_invite(control_session, "desativar@example.org")
    user.activo = True
    user.senha_hash = "hash"
    control_session.add(user)
    control_session.commit()
    raw_token = create_session(control_session, user.id)
    set_user_active(control_session, user.id, False)
    row = control_session.exec(select(Sessao).where(Sessao.token_hash == hash_token(raw_token))).one()
    assert row.revogada is True
    assert not control_session.get(Usuario, user.id).activo


def test_exclusao_protege_ultimo_admin(control_session, admin_user):
    with pytest.raises(AdminConsoleError, match="ULTIMO_ADMINISTRADOR"):
        delete_user(control_session, admin_user.id)
