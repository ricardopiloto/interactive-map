from __future__ import annotations

from fastapi.testclient import TestClient

from tests.conftest import api
from tests.helpers import seed_local, seed_personagem, seed_sessao


def test_public_list_order_and_visibility(client: TestClient, db_session) -> None:
    seed_sessao(db_session, numero=1, titulo="Antiga")
    seed_sessao(db_session, numero=2, titulo="Recente")
    seed_sessao(db_session, numero=3, titulo="Oculta", visivel=False)

    resp = client.get(api("/api/sessoes"))
    assert resp.status_code == 200
    sessoes = resp.json()["sessoes"]
    assert [s["numero"] for s in sessoes] == [2, 1]
    assert all(s["titulo"] != "Oculta" for s in sessoes)


def test_public_hides_hidden_npc_chips(client: TestClient, db_session) -> None:
    vis = seed_personagem(db_session, nome="Visivel", visivel=True)
    oculto = seed_personagem(db_session, nome="Oculto", visivel=False)
    loc = seed_local(db_session, nome="Porto")
    seed_sessao(
        db_session,
        numero=1,
        titulo="Com chips",
        local_ids=[loc.id],  # type: ignore[list-item]
        personagem_ids=[vis.id, oculto.id],  # type: ignore[list-item]
    )

    resp = client.get(api("/api/sessoes"))
    assert resp.status_code == 200
    s = resp.json()["sessoes"][0]
    nomes = {p["nome"] for p in s["personagens"]}
    assert "Visivel" in nomes
    assert "Oculto" not in nomes
    assert any(l["nome"] == "Porto" for l in s["locais"])


def test_public_hides_hidden_local_chips(client: TestClient, db_session) -> None:
    loc_vis = seed_local(db_session, nome="Porto", visivel=True)
    loc_oculto = seed_local(db_session, nome="Caverna", visivel=False)
    seed_sessao(
        db_session,
        numero=1,
        titulo="Com local oculto",
        local_ids=[loc_vis.id, loc_oculto.id],  # type: ignore[list-item]
    )

    resp = client.get(api("/api/sessoes"))
    assert resp.status_code == 200
    nomes = {l["nome"] for l in resp.json()["sessoes"][0]["locais"]}
    assert "Porto" in nomes
    assert "Caverna" not in nomes


def test_public_detail_404_when_hidden(client: TestClient, db_session) -> None:
    row = seed_sessao(db_session, numero=1, titulo="Oculta", visivel=False)
    resp = client.get(api(f"/api/sessoes/{row.id}"))
    assert resp.status_code == 404
    assert resp.json()["detail"]["erro"] == "SESSAO_NAO_ENCONTRADA"


def test_local_npc_lists_unchanged(client: TestClient, db_session) -> None:
    """Public local/NPC list payloads must not gain sessao fields."""
    seed_local(db_session, nome="X")
    seed_personagem(db_session, nome="Y")
    locais = client.get(api("/api/locais")).json()
    npcs = client.get(api("/api/npcs")).json()
    assert locais and "sessoes" not in locais[0]
    assert npcs and "sessoes" not in npcs[0]
