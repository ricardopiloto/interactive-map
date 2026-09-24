from __future__ import annotations

from fastapi.testclient import TestClient

from tests.conftest import api, login_as
from tests.helpers import seed_local, seed_personagem, seed_sessao


def test_proximo_numero_and_crud(client: TestClient, db_session) -> None:
    login_as(client)
    seed_sessao(db_session, numero=1)
    seed_sessao(db_session, numero=4)

    prox = client.get(api("/api/admin/sessoes/proximo-numero"))
    assert prox.status_code == 200
    assert prox.json()["numero"] == 5

    loc = seed_local(db_session, nome="Porto")
    pj = seed_personagem(db_session, nome="Elara")

    created = client.post(
        api("/api/admin/sessoes"),
        json={
            "numero": 5,
            "titulo": "Assalto",
            "data_rotulo": "Março",
            "resumo": "**ok**",
            "visivel_para_todos": True,
            "local_ids": [loc.id],
            "personagem_ids": [pj.id],
        },
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["numero"] == 5
    assert body["titulo"] == "Assalto"
    assert body["visivel_para_todos"] is True
    sid = body["id"]

    dup = client.post(
        api("/api/admin/sessoes"),
        json={"numero": 5, "titulo": "Dup", "resumo": ""},
    )
    assert dup.status_code == 400
    assert dup.json()["detail"]["erro"] == "NUMERO_DUPLICADO"

    patched = client.patch(
        api(f"/api/admin/sessoes/{sid}"),
        json={"visivel_para_todos": False, "titulo": "Assalto II"},
    )
    assert patched.status_code == 200
    assert patched.json()["visivel_para_todos"] is False
    assert patched.json()["titulo"] == "Assalto II"

    public = client.get(api("/api/sessoes"))
    assert all(s["id"] != sid for s in public.json()["sessoes"])

    admin_list = client.get(api("/api/admin/sessoes"))
    assert any(s["id"] == sid for s in admin_list.json()["sessoes"])

    deleted = client.delete(api(f"/api/admin/sessoes/{sid}"))
    assert deleted.status_code == 204
    assert client.get(api(f"/api/admin/sessoes/{sid}")).status_code == 404


def test_admin_requires_auth(client_anon: TestClient) -> None:
    resp = client_anon.get(api("/api/admin/sessoes"))
    assert resp.status_code in (401, 403)
