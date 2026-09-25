from __future__ import annotations

from tests.conftest import api


def _payload(**overrides):
    return {
        "nome": "Local estado",
        "descricao": "",
        "x": 0.2,
        "y": 0.3,
        "data_sessao": "Sessão preservada",
        "cor_pin": "#123456",
        **overrides,
    }


def test_local_status_defaults_reads_and_can_be_switched_without_changing_other_fields(client):
    created = client.post(api("/api/admin/locais"), json=_payload())
    assert created.status_code == 201, created.text
    local = created.json()
    assert local["estado_exploracao"] == "conhecido"
    assert local["data_sessao"] == "Sessão preservada"
    assert local["cor_pin"] == "#123456"

    local_id = local["id"]
    public = client.get(api(f"/api/locais/{local_id}"))
    assert public.status_code == 200
    assert public.json()["estado_exploracao"] == "conhecido"

    for state in ("visitado", "conhecido"):
        updated = client.put(api(f"/api/admin/locais/{local_id}"), json={"estado_exploracao": state})
        assert updated.status_code == 200, updated.text
        body = updated.json()
        assert body["estado_exploracao"] == state
        assert body["data_sessao"] == "Sessão preservada"
        assert body["cor_pin"] == "#123456"
        assert client.get(api(f"/api/locais/{local_id}")).json()["estado_exploracao"] == state


def test_invalid_local_status_is_rejected_without_mutation(client):
    created = client.post(api("/api/admin/locais"), json=_payload(data_sessao=None))
    assert created.status_code == 201, created.text
    local_id = created.json()["id"]
    response = client.put(api(f"/api/admin/locais/{local_id}"), json={"estado_exploracao": "desconhecido"})
    assert response.status_code == 422
    admin_rows = client.get(api("/api/admin/locais")).json()
    assert next(row for row in admin_rows if row["id"] == local_id)["estado_exploracao"] == "conhecido"
