from __future__ import annotations

from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.models.campanha import Campanha
from app.models.usuario import Usuario
from app.services.auth_admin import assign_owner, create_usuario_with_invite
from app.services.auth_invite import accept_activate_invite
from app.services.campanha_admin import create_campanha
from app.services.auth_password import hash_password
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL


def test_lista_filtra_metadados_e_mantem_visibilidade_separada(admin_client, data_root):
    r = admin_client.get("/api/admin/campanhas?q=Suite&estado=ativa")
    assert r.status_code == 200, r.text
    campaign = r.json()["campanhas"][0]
    assert campaign["slug"] == TEST_CAMPAIGN_SLUG
    assert campaign["activa"] is True
    assert "visibilidade" in campaign
    assert not {"npcs", "locais", "descricao", "conteudo"} & campaign.keys()


def test_transferencia_e_estado_da_mesa(admin_client, control_session, data_root):
    user, token = create_usuario_with_invite(control_session, "novo-dono@example.org")
    accept_activate_invite(control_session, token, "nova-senha-segura")
    campaign = control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
    response = admin_client.patch(
        f"/api/admin/campanhas/{campaign.id}/proprietario",
        json={"email": user.email},
    )
    assert response.status_code == 200, response.text
    assert response.json()["proprietario"]["email"] == user.email
    inactive = admin_client.patch(f"/api/admin/campanhas/{campaign.id}/estado", json={"activa": False})
    assert inactive.status_code == 200, inactive.text
    assert inactive.json()["activa"] is False
    assert inactive.json()["visibilidade"] == campaign.visibilidade


def test_delete_remove_somente_pasta_confirmada_e_preserva_irma(admin_client, control_session, data_root):
    first = control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
    disposable = create_campanha(slug="mesa-descartavel", nome="Descartável", sistema="wfrp4e")
    assign_owner(control_session, disposable.slug, TEST_GM_EMAIL)
    first_path = Path(data_root) / first.caminho
    deleted_path = Path(data_root) / disposable.caminho
    response = admin_client.delete(f"/api/admin/campanhas/{disposable.id}")
    assert response.status_code == 204, response.text
    assert not deleted_path.exists()
    assert first_path.exists()
    with Session(get_control_engine()) as check:
        assert check.get(Campanha, first.id) is not None
        assert check.get(Campanha, disposable.id) is None


def test_transferencia_recusa_dono_inativo_sem_mudar_atual(admin_client, control_session):
    inactive = Usuario(email="inativo@example.org", senha_hash=hash_password("senha-ativa"), activo=False)
    control_session.add(inactive)
    control_session.commit()
    campaign = control_session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
    old = control_session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).one()
    response = admin_client.patch(
        f"/api/admin/campanhas/{campaign.id}/proprietario", json={"email": inactive.email}
    )
    assert response.status_code == 409
    control_session.refresh(campaign)
    assert campaign.id
    assert control_session.exec(select(Usuario).where(Usuario.email == old.email)).first() is not None


def test_nao_admin_nao_lista_mesas(regular_client):
    assert regular_client.get("/api/admin/campanhas").status_code == 403
