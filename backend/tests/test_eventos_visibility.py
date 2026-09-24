from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import resolve_campaign_session
from tests.conftest import TEST_CAMPAIGN_SLUG, login_as
from tests.helpers import seed_evento, seed_local, seed_personagem


def test_hidden_evento_omitted_public(client: TestClient, data_root: Path) -> None:
    _ = data_root
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_evento(session, titulo="Secreto", ano=2400, visivel=False)
        seed_evento(session, titulo="Publico", ano=2401, visivel=True)

    login_as(client)
    pub = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/eventos")
    titles = {e["titulo"] for e in pub.json()["eventos"]}
    assert "Publico" in titles
    assert "Secreto" not in titles

    admin = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos")
    admin_titles = {e["titulo"] for e in admin.json()["eventos"]}
    assert "Secreto" in admin_titles


def test_hidden_chips_omitted_keep_evento(client: TestClient, data_root: Path) -> None:
    _ = data_root
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        loc_ok = seed_local(session, nome="Visivel", visivel=True)
        loc_hide = seed_local(session, nome="OcultoLoc", visivel=False)
        pj_ok = seed_personagem(session, nome="VisivelPj", visivel=True)
        pj_hide = seed_personagem(session, nome="OcultoPj", visivel=False)
        ev = seed_evento(
            session,
            titulo="Misto",
            ano=2500,
            visivel=True,
            local_ids=[loc_ok.id, loc_hide.id],  # type: ignore[list-item]
            personagem_ids=[pj_ok.id, pj_hide.id],  # type: ignore[list-item]
        )
        eid = ev.id
        assert eid is not None

    login_as(client)
    pub = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/eventos/{eid}")
    assert pub.status_code == 200
    body = pub.json()
    assert body["titulo"] == "Misto"
    assert {l["nome"] for l in body["locais"]} == {"Visivel"}
    assert {p["nome"] for p in body["personagens"]} == {"VisivelPj"}

    admin = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos/{eid}")
    assert {l["nome"] for l in admin.json()["locais"]} == {"Visivel", "OcultoLoc"}
    assert {p["nome"] for p in admin.json()["personagens"]} == {"VisivelPj", "OcultoPj"}
