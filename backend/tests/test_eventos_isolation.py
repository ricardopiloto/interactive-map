from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.services.auth_admin import assign_owner
from tests.conftest import TEST_GM_EMAIL, login_as
from tests.helpers import seed_evento


def test_eventos_isolation_a_b(client: TestClient, data_root: Path) -> None:
    _ = data_root
    _create_campanha(slug="mesa-a", nome="A", sistema="wfrp4e")
    _create_campanha(slug="mesa-b", nome="B", sistema="wod")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "mesa-a", TEST_GM_EMAIL)
        assign_owner(ctrl, "mesa-b", TEST_GM_EMAIL)

    with resolve_campaign_session("mesa-a") as session:
        seed_evento(session, titulo="So em A", ano=2400, visivel=False)

    login_as(client)

    pub_a = client.get("/api/c/mesa-a/eventos")
    assert pub_a.status_code == 200
    assert pub_a.json()["eventos"] == []

    admin_a = client.get("/api/c/mesa-a/admin/eventos")
    assert admin_a.status_code == 200
    assert any(e["titulo"] == "So em A" for e in admin_a.json()["eventos"])

    pub_b = client.get("/api/c/mesa-b/eventos")
    assert pub_b.status_code == 200
    assert pub_b.json()["eventos"] == []

    admin_b = client.get("/api/c/mesa-b/admin/eventos")
    assert admin_b.status_code == 200
    assert all(e["titulo"] != "So em A" for e in admin_b.json()["eventos"])
