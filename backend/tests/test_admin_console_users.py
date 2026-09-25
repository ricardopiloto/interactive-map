from __future__ import annotations

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.models.usuario import Convite, Sessao, Usuario
from app.services.auth_admin import create_usuario_with_invite
from app.services.auth_session import create_session
from tests.conftest import TEST_GM_EMAIL


def test_listagem_admin_filtra_e_nao_expoe_segredos(admin_client, data_root):
    r = admin_client.get("/api/admin/usuarios?email=gm@teste.local")
    assert r.status_code == 200, r.text
    users = r.json()["usuarios"]
    assert len(users) == 1
    assert users[0]["email"] == TEST_GM_EMAIL
    assert users[0]["estado"] == "ativa"
    assert users[0]["mesas_proprietarias"]
    assert not {"senha_hash", "token", "token_hash", "sessao"} & users[0].keys()


def test_lista_inclui_usuario_pendente(admin_client, control_session):
    create_usuario_with_invite(control_session, "pendente@example.org")
    r = admin_client.get("/api/admin/usuarios?estado=pendente")
    assert r.status_code == 200, r.text
    assert [u["email"] for u in r.json()["usuarios"]] == ["pendente@example.org"]


def test_convite_e_reset_reutilizam_fluxos_de_uso_unico(admin_client, data_root):
    invite = admin_client.post("/api/admin/convites", json={"email": "novo@example.org"})
    assert invite.status_code == 201, invite.text
    assert "/convite/" in invite.json()["link"]
    duplicate = admin_client.post("/api/admin/convites", json={"email": "novo@example.org"})
    assert duplicate.status_code == 409

    with Session(get_control_engine()) as session:
        active_id = session.exec(select(Usuario.id).where(Usuario.email == TEST_GM_EMAIL)).one()
    reset = admin_client.post(f"/api/admin/usuarios/{active_id}/reset")
    assert reset.status_code == 201, reset.text
    assert "/reset/" in reset.json()["link"]
    assert "senha" not in reset.json()


def test_reset_nao_emite_link_para_usuario_pendente(admin_client, control_session):
    pending, _ = create_usuario_with_invite(control_session, "pending-reset@example.org")
    r = admin_client.post(f"/api/admin/usuarios/{pending.id}/reset")
    assert r.status_code == 409
    assert "link" not in r.text


def test_estado_revoga_sessoes_e_exclusao_limpa_dados_da_conta(admin_client, data_root, control_session):
    user, _ = create_usuario_with_invite(control_session, "remover@example.org")
    user.activo = True
    user.senha_hash = "test-hash"
    control_session.add(user)
    control_session.commit()
    create_session(control_session, user.id)
    user_id = user.id

    response = admin_client.patch(f"/api/admin/usuarios/{user_id}/estado", json={"activo": False})
    assert response.status_code == 200, response.text
    assert response.json()["estado"] == "inativa"
    control_session.expire_all()
    assert control_session.exec(select(Sessao).where(Sessao.usuario_id == user_id)).one().revogada is True

    assert admin_client.delete(f"/api/admin/usuarios/{user_id}").status_code == 204
    with Session(get_control_engine()) as check:
        assert check.get(Usuario, user_id) is None
        assert check.exec(select(Convite).where(Convite.usuario_id == user_id)).first() is None
        assert check.exec(select(Sessao).where(Sessao.usuario_id == user_id)).first() is None


def test_proprietario_e_ultimo_admin_nao_podem_ser_desativados_ou_excluidos(admin_client, admin_user):
    owner_id = admin_user.id
    for response in (
        admin_client.patch(f"/api/admin/usuarios/{owner_id}/estado", json={"activo": False}),
        admin_client.delete(f"/api/admin/usuarios/{owner_id}"),
    ):
        assert response.status_code == 409
