from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.services.auth_admin import assign_owner
from tests.conftest import TEST_GM_EMAIL, login_as
from tests.helpers import seed_sessao


def test_sessoes_isolation_a_b(client: TestClient, data_root: Path) -> None:
    _ = data_root
    _create_campanha(slug="mesa-a", nome="A", sistema="wfrp4e")
    _create_campanha(slug="mesa-b", nome="B", sistema="wod")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "mesa-a", TEST_GM_EMAIL)
        assign_owner(ctrl, "mesa-b", TEST_GM_EMAIL)

    with resolve_campaign_session("mesa-a") as session:
        seed_sessao(session, numero=1, titulo="So em A", visivel=False)

    login_as(client)

    pub_a = client.get("/api/c/mesa-a/sessoes")
    assert pub_a.status_code == 200
    assert pub_a.json()["sessoes"] == []

    admin_a = client.get("/api/c/mesa-a/admin/sessoes")
    assert admin_a.status_code == 200
    assert any(s["titulo"] == "So em A" for s in admin_a.json()["sessoes"])

    pub_b = client.get("/api/c/mesa-b/sessoes")
    assert pub_b.status_code == 200
    assert pub_b.json()["sessoes"] == []

    admin_b = client.get("/api/c/mesa-b/admin/sessoes")
    assert admin_b.status_code == 200
    assert all(s["titulo"] != "So em A" for s in admin_b.json()["sessoes"])
