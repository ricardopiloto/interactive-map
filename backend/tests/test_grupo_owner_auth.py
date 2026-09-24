from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.models.campanha import Campanha
from app.models.grupo import GrupoPosicao
from app.models.usuario import Membro, Usuario
from app.services.auth_admin import assign_owner
from app.services.auth_password import hash_password
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL, api, login_as


def _add_member(email: str, password: str, *, slug: str, role: str) -> None:
    with Session(get_control_engine()) as session:
        user = Usuario(email=email, senha_hash=hash_password(password), activo=True)
        session.add(user)
        session.commit()
        session.refresh(user)
        campaign = session.exec(select(Campanha).where(Campanha.slug == slug)).one()
        session.add(Membro(usuario_id=user.id, campanha_id=campaign.id, papel=role))
        session.commit()


def test_group_write_requires_campaign_owner(client, client_anon: TestClient, data_root):
    _create_campanha(slug="grupo-b", nome="B", sistema="wfrp4e")
    _add_member("outsider@teste.local", "outsider-pass", slug="grupo-b", role="dono")
    _add_member("player@teste.local", "player-pass", slug=TEST_CAMPAIGN_SLUG, role="jogador")

    path = api("/api/admin/grupo")
    payload = {"x": 0.25, "y": 0.75, "formato": "brasao"}
    assert client_anon.put(path, json=payload).status_code == 401

    login_as(client_anon, email="outsider@teste.local", password="outsider-pass")
    assert client_anon.put(path, json=payload).status_code == 403

    client_anon.cookies.clear()
    login_as(client_anon, email="player@teste.local", password="player-pass")
    denied = client_anon.put(path, json=payload)
    assert denied.status_code == 403
    assert denied.json()["detail"]["erro"] == "NAO_DONO"

    saved = client.put(path, json=payload)
    assert saved.status_code == 200
    assert saved.json()["x"] == 0.25 and saved.json()["y"] == 0.75
    assert saved.json()["formato"] == "brasao"


def test_group_validation_persistence_and_campaign_isolation(client, db_session, data_root):
    _create_campanha(slug="grupo-b", nome="B", sistema="wfrp4e")
    with Session(get_control_engine()) as control:
        assign_owner(control, "grupo-b", TEST_GM_EMAIL)
    with resolve_campaign_session("grupo-b") as session_b:
        group_b = GrupoPosicao(id=1, x=0.1, y=0.2, formato="bandeira")
        session_b.add(group_b)
        session_b.commit()

    path = api("/api/admin/grupo")
    original = client.get(api("/api/grupo")).json()
    for invalid in (
        {"x": -0.1, "y": 0.2},
        {"x": 1.1, "y": 0.2},
        {"x": 0.2, "y": 0.2, "formato": "estandarte"},
        {"y": 0.2},
    ):
        assert client.put(path, json=invalid).status_code == 422
        assert client.get(api("/api/grupo")).json()["x"] == original["x"]

    updated = client.put(path, json={"x": 0.8, "y": 0.7, "formato": "brasao"})
    assert updated.status_code == 200
    assert client.get(api("/api/grupo")).json()["formato"] == "brasao"
    with resolve_campaign_session("grupo-b") as session_b:
        persisted_b = session_b.get(GrupoPosicao, 1)
        assert (persisted_b.x, persisted_b.y, persisted_b.formato) == (0.1, 0.2, "bandeira")

    # Changing only format leaves the saved coordinates untouched.
    changed = client.put(path, json={"x": 0.8, "y": 0.7, "formato": "bandeira"})
    assert changed.status_code == 200
    assert (changed.json()["x"], changed.json()["y"]) == (0.8, 0.7)
