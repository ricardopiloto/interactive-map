from __future__ import annotations

from tests.conftest import api
from tests.helpers import seed_arco, seed_sessao


def _criar_capitulo(client, *, titulo: str, arco_id: int | None = None) -> int:
    payload: dict = {"titulo": titulo}
    if arco_id is not None:
        payload["arco_id"] = arco_id
    created = client.post(api("/api/admin/capitulos"), json=payload)
    assert created.status_code == 201, created.text
    return created.json()["id"]


def test_criar_sessao_com_capitulo_sincroniza_arco(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco.id)

    created = client.post(
        api("/api/admin/sessoes"),
        json={"numero": 1, "titulo": "Sessão 1", "capitulo_id": capitulo_id},
    )
    assert created.status_code == 201, created.text
    assert created.json()["arco_id"] == arco.id
    assert created.json()["capitulo_id"] == capitulo_id


def test_vincular_sessao_existente_a_capitulo_sincroniza_arco(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco.id)
    sessao = seed_sessao(db_session, numero=1)

    update = client.patch(
        api(f"/api/admin/sessoes/{sessao.id}"),
        json={"capitulo_id": capitulo_id},
    )
    assert update.status_code == 200, update.text
    assert update.json()["arco_id"] == arco.id
    assert update.json()["capitulo_id"] == capitulo_id


def test_mesmo_capitulo_em_varias_sessoes(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco.id)
    s1 = seed_sessao(db_session, numero=1)
    s2 = seed_sessao(db_session, numero=2)

    for sessao in (s1, s2):
        update = client.patch(
            api(f"/api/admin/sessoes/{sessao.id}"),
            json={"capitulo_id": capitulo_id},
        )
        assert update.status_code == 200, update.text
        assert update.json()["arco_id"] == arco.id


def test_rejeitar_capitulo_inexistente(client, db_session):
    sessao = seed_sessao(db_session, numero=1)
    response = client.patch(
        api(f"/api/admin/sessoes/{sessao.id}"),
        json={"capitulo_id": 9999},
    )
    assert response.status_code == 422
    assert response.json()["detail"]["erro"] == "SESSAO_CAPITULO_INVALIDO"


def test_mudar_arco_do_capitulo_propaga_para_sessoes_vinculadas(client, db_session):
    arco_a = seed_arco(db_session, titulo="Arco A")
    arco_b = seed_arco(db_session, titulo="Arco B", ordem=2)
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco_a.id)
    s1 = seed_sessao(db_session, numero=1)
    s2 = seed_sessao(db_session, numero=2)
    for sessao in (s1, s2):
        client.patch(api(f"/api/admin/sessoes/{sessao.id}"), json={"capitulo_id": capitulo_id})

    moved = client.patch(
        api(f"/api/admin/capitulos/{capitulo_id}"), json={"arco_id": arco_b.id}
    )
    assert moved.status_code == 200, moved.text

    for sessao in (s1, s2):
        reloaded = client.get(api(f"/api/admin/sessoes/{sessao.id}")).json()
        assert reloaded["arco_id"] == arco_b.id

    sem_arco = client.patch(api(f"/api/admin/capitulos/{capitulo_id}"), json={"arco_id": None})
    assert sem_arco.status_code == 200
    for sessao in (s1, s2):
        reloaded = client.get(api(f"/api/admin/sessoes/{sessao.id}")).json()
        assert reloaded["arco_id"] is None


def test_rejeitar_edicao_direta_de_arco_em_sessao_vinculada(client, db_session):
    arco_a = seed_arco(db_session, titulo="Arco A")
    arco_b = seed_arco(db_session, titulo="Arco B", ordem=2)
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco_a.id)
    sessao = seed_sessao(db_session, numero=1)
    client.patch(api(f"/api/admin/sessoes/{sessao.id}"), json={"capitulo_id": capitulo_id})

    response = client.patch(
        api(f"/api/admin/sessoes/{sessao.id}"), json={"arco_id": arco_b.id}
    )
    assert response.status_code == 409
    assert response.json()["detail"]["erro"] == "SESSAO_ARCO_DERIVADO_DE_CAPITULO"

    reloaded = client.get(api(f"/api/admin/sessoes/{sessao.id}")).json()
    assert reloaded["arco_id"] == arco_a.id


def test_desvincular_capitulo_libera_edicao_direta_do_arco(client, db_session):
    arco_a = seed_arco(db_session, titulo="Arco A")
    arco_b = seed_arco(db_session, titulo="Arco B", ordem=2)
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco_a.id)
    sessao = seed_sessao(db_session, numero=1)
    client.patch(api(f"/api/admin/sessoes/{sessao.id}"), json={"capitulo_id": capitulo_id})

    unlink = client.patch(
        api(f"/api/admin/sessoes/{sessao.id}"), json={"capitulo_id": None}
    )
    assert unlink.status_code == 200
    assert unlink.json()["capitulo_id"] is None
    assert unlink.json()["arco_id"] == arco_a.id  # keeps last synced value

    edit = client.patch(api(f"/api/admin/sessoes/{sessao.id}"), json={"arco_id": arco_b.id})
    assert edit.status_code == 200
    assert edit.json()["arco_id"] == arco_b.id


def test_apagar_capitulo_desvincula_sessoes_sem_apagar(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco.id)
    sessao = seed_sessao(db_session, numero=1)
    client.patch(api(f"/api/admin/sessoes/{sessao.id}"), json={"capitulo_id": capitulo_id})

    deleted = client.delete(api(f"/api/admin/capitulos/{capitulo_id}"))
    assert deleted.status_code == 204

    reloaded = client.get(api(f"/api/admin/sessoes/{sessao.id}"))
    assert reloaded.status_code == 200
    assert reloaded.json()["capitulo_id"] is None
    assert reloaded.json()["arco_id"] == arco.id  # keeps last synced value, now free


def test_arco_bulk_sync_nao_pode_mover_sessao_vinculada_a_capitulo(client, db_session):
    arco_a = seed_arco(db_session, titulo="Arco A")
    arco_b = seed_arco(db_session, titulo="Arco B", ordem=2)
    capitulo_id = _criar_capitulo(client, titulo="Cap", arco_id=arco_a.id)
    sessao = seed_sessao(db_session, numero=1)
    client.patch(api(f"/api/admin/sessoes/{sessao.id}"), json={"capitulo_id": capitulo_id})

    response = client.put(
        api(f"/api/admin/arcos/{arco_b.id}"),
        json={"sessao_ids": [sessao.id]},
    )
    assert response.status_code == 409
    assert response.json()["detail"]["erro"] == "SESSAO_ARCO_DERIVADO_DE_CAPITULO"

    reloaded = client.get(api(f"/api/admin/sessoes/{sessao.id}")).json()
    assert reloaded["arco_id"] == arco_a.id
