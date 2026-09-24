from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import resolve_campaign_session
from tests.conftest import TEST_CAMPAIGN_SLUG, login_as
from tests.helpers import seed_evento, seed_local, seed_personagem, seed_sessao


def test_list_order_and_empty(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    empty = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/eventos")
    assert empty.status_code == 200
    assert empty.json()["eventos"] == []

    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_evento(session, titulo="Tarde", ano=2512)
        seed_evento(session, titulo="Cedo", ano=2500)
        seed_evento(session, titulo="Meio", ano=2505)

    pub = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/eventos")
    assert pub.status_code == 200
    titles = [e["titulo"] for e in pub.json()["eventos"]]
    assert titles == ["Cedo", "Meio", "Tarde"]


def test_list_order_mes_sessao_id(client: TestClient, data_root: Path) -> None:
    """ano → mes (nulls last) → sessao.numero (nulls last) → id."""
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        s_antiga = seed_sessao(session, numero=1, titulo="Primeira")
        s_nova = seed_sessao(session, numero=3, titulo="Terceira")
        # Same year, months decide
        seed_evento(session, titulo="Jun", ano=2500, mes=6)
        seed_evento(session, titulo="Fev", ano=2500, mes=2)
        # Same year, no month: older session first
        seed_evento(session, titulo="SemMesSessaoNova", ano=2500, sessao_id=s_nova.id)
        seed_evento(session, titulo="SemMesSessaoAntiga", ano=2500, sessao_id=s_antiga.id)
        # Same year, no month, no session: id order (created last appears last among these)
        seed_evento(session, titulo="SemMesSemSessaoA", ano=2500)
        seed_evento(session, titulo="SemMesSemSessaoB", ano=2500)

    pub = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/eventos")
    assert pub.status_code == 200
    titles = [e["titulo"] for e in pub.json()["eventos"]]
    assert titles == [
        "Fev",
        "Jun",
        "SemMesSessaoAntiga",
        "SemMesSessaoNova",
        "SemMesSemSessaoA",
        "SemMesSemSessaoB",
    ]


def test_crud_create_update_delete(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        loc = seed_local(session, nome="Cidade")
        pj = seed_personagem(session, nome="Heroi")
        loc_id = loc.id
        pj_id = pj.id

    created = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos",
        json={
            "titulo": "Queda",
            "ano": 2510,
            "mes": 3,
            "rotulo_era": "Era do Lobo",
            "descricao": "Desc",
            "visivel_para_todos": True,
            "local_ids": [loc_id],
            "personagem_ids": [pj_id],
        },
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["titulo"] == "Queda"
    assert body["ano"] == 2510
    assert body["mes"] == 3
    assert body["rotulo_era"] == "Era do Lobo"
    assert {l["nome"] for l in body["locais"]} == {"Cidade"}
    assert {p["nome"] for p in body["personagens"]} == {"Heroi"}
    eid = body["id"]

    bad = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos",
        json={"titulo": "   ", "ano": 1},
    )
    assert bad.status_code == 422

    patched = client.patch(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos/{eid}",
        json={"titulo": "Queda II", "mes": None, "local_ids": [], "personagem_ids": [pj_id]},
    )
    assert patched.status_code == 200
    assert patched.json()["titulo"] == "Queda II"
    assert patched.json()["mes"] is None
    assert patched.json()["locais"] == []
    assert len(patched.json()["personagens"]) == 1

    deleted = client.delete(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos/{eid}")
    assert deleted.status_code == 204
    gone = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos/{eid}")
    assert gone.status_code == 404


def test_anon_admin_write_denied(client_anon: TestClient, data_root: Path) -> None:
    _ = data_root
    r = client_anon.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos",
        json={"titulo": "X", "ano": 1},
    )
    assert r.status_code in (401, 403)
