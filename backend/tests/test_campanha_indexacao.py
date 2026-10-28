from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.main import app
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.auth_password import hash_password
from app.services.campanha_admin import CampanhaAdminError, campanha_indexavel, set_indexavel
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_ORIGIN, login_as


def test_indexacao_owner_config_and_panel(client):
    slug = TEST_CAMPAIGN_SLUG
    path = f"/api/campanhas/{slug}/indexacao"
    assert client.get(f"/api/c/{slug}/config").json()["indexavel"] is False
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == slug)).one()
        camp.modificado_em = datetime.utcnow() - timedelta(days=1)
        before = camp.modificado_em
        session.add(camp)
        session.commit()
    response = client.patch(path, json={"indexavel": True})
    assert response.status_code == 200, response.text
    assert response.json() == {"slug": slug, "indexavel": True}
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == slug)).one()
        assert camp.modificado_em > before
        assert campanha_indexavel(camp) is True
    assert client.get(f"/api/c/{slug}/config").json()["indexavel"] is True
    assert next(c for c in client.get("/api/campanhas/minhas").json()["campanhas"] if c["slug"] == slug)["indexavel"] is True
    assert client.patch(f"/api/campanhas/{slug}/visibilidade", json={"visibilidade": "so_link"}).status_code == 200
    assert client.get(f"/api/c/{slug}/config").json()["indexavel"] is False
    assert next(c for c in client.get("/api/campanhas/minhas").json()["campanhas"] if c["slug"] == slug)["indexavel"] is True
    assert client.patch(f"/api/campanhas/{slug}/visibilidade", json={"visibilidade": "listada"}).status_code == 200
    assert client.get(f"/api/c/{slug}/config").json()["indexavel"] is True
    response = client.patch(path, json={"indexavel": False})
    assert response.status_code == 200 and response.json()["indexavel"] is False
    assert client.get(f"/api/c/{slug}/config").json()["indexavel"] is False


def test_indexacao_auth_and_validation(client, client_anon):
    path = f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/indexacao"
    assert client_anon.patch(path, json={"indexavel": True}).status_code == 401
    assert client.patch(path, json={"indexavel": "maybe"}).status_code == 422
    assert client.patch(path, json={"indexavel": True, "extra": 1}).status_code == 422
    with Session(get_control_engine()) as session:
        owner = session.exec(select(Membro).where(Membro.papel == "dono")).first()
        user = Usuario(email="member@teste.local", senha_hash=hash_password("password-ok"), activo=True,
                       criado_em=datetime.utcnow(), actualizado_em=datetime.utcnow())
        session.add(user)
        session.commit()
        session.refresh(user)
        session.add(Membro(campanha_id=owner.campanha_id, usuario_id=user.id, papel="jogador"))
        session.commit()
    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as member:
        login_as(member, email="member@teste.local", password="password-ok")
        assert member.patch(path, json={"indexavel": True}).status_code == 403


def test_indexacao_inactive_service(data_root):
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp.activa = False
        session.add(camp)
        session.commit()
        assert campanha_indexavel(camp) is False
    with pytest.raises(CampanhaAdminError) as exc:
        set_indexavel(TEST_CAMPAIGN_SLUG, True)
    assert exc.value.codigo == "CAMPANHA_NAO_ENCONTRADA"
