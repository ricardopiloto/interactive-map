from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import get_control_engine
from app.cli import _create_campanha
from app.main import app
from app.models.usuario import Usuario
from app.services.auth_admin import assign_owner
from app.services.auth_password import hash_password
from tests.conftest import TEST_ORIGIN, login_as


def test_patch_visibilidade_dono(client, data_root) -> None:
    _create_campanha(slug="vis-a", nome="VA", sistema="wfrp4e", visibilidade="listada")
    with Session(get_control_engine()) as session:
        assign_owner(session, "vis-a", "gm@teste.local")

    r = client.patch(
        "/api/campanhas/vis-a/visibilidade",
        json={"visibilidade": "so_link"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["visibilidade"] == "so_link"
    cat = client.get("/api/campanhas/catalogo")
    assert "vis-a" not in {c["slug"] for c in cat.json()["campanhas"]}

    r2 = client.patch(
        "/api/campanhas/vis-a/visibilidade",
        json={"visibilidade": "listada"},
    )
    assert r2.status_code == 200
    cat2 = client.get("/api/campanhas/catalogo")
    assert "vis-a" in {c["slug"] for c in cat2.json()["campanhas"]}


def test_patch_visibilidade_forbidden(client_anon, data_root) -> None:
    _create_campanha(slug="vis-b", nome="VB", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="outro@teste.local",
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        assign_owner(session, "vis-b", "outro@teste.local")

    anon = client_anon.patch(
        "/api/campanhas/vis-b/visibilidade",
        json={"visibilidade": "so_link"},
    )
    assert anon.status_code == 401

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as other:
        login_as(other, email="gm@teste.local", password="test-secret-ok")
        r = other.patch(
            "/api/campanhas/vis-b/visibilidade",
            json={"visibilidade": "so_link"},
        )
        assert r.status_code == 403
