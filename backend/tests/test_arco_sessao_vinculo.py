from __future__ import annotations

from tests.conftest import api
from tests.helpers import seed_arco, seed_sessao


def test_arco_cor_persists_with_and_without_value(client, db_session):
    com_cor = client.post(api("/api/admin/arcos"), json={"titulo": "Com cor", "cor": "#ff00aa"})
    assert com_cor.status_code == 201, com_cor.text
    assert com_cor.json()["cor"] == "#ff00aa"

    sem_cor = client.post(api("/api/admin/arcos"), json={"titulo": "Sem cor"})
    assert sem_cor.status_code == 201, sem_cor.text
    assert sem_cor.json()["cor"] is None

    reloaded = client.get(api("/api/admin/arcos")).json()
    by_title = {row["titulo"]: row["cor"] for row in reloaded}
    assert by_title["Com cor"] == "#ff00aa"
    assert by_title["Sem cor"] is None


def test_sessao_associates_to_arco_and_survives_reload(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    created = client.post(
        api("/api/admin/sessoes"),
        json={"numero": 1, "titulo": "Sessão 1", "arco_id": arco.id},
    )
    assert created.status_code == 201, created.text
    assert created.json()["arco_id"] == arco.id

    reloaded = client.get(api(f"/api/admin/sessoes/{created.json()['id']}"))
    assert reloaded.json()["arco_id"] == arco.id


def test_sessao_transicao_aparece_nos_dois_arcos_sem_duplicar(client, db_session):
    arco_a = seed_arco(db_session, titulo="Arco A")
    arco_b = seed_arco(db_session, titulo="Arco B", ordem=2)
    transicao = seed_sessao(db_session, numero=1, arco_id=arco_a.id)

    update = client.patch(
        api(f"/api/admin/sessoes/{transicao.id}"),
        json={"arco_transicao_id": arco_b.id},
    )
    assert update.status_code == 200, update.text
    body = update.json()
    assert body["arco_id"] == arco_a.id
    assert body["arco_transicao_id"] == arco_b.id

    arco_a_read = client.get(api(f"/api/admin/arcos/{arco_a.id}")).json()
    arco_b_read = client.get(api(f"/api/admin/arcos/{arco_b.id}")).json()
    assert transicao.id in arco_a_read["sessao_ids"]
    assert arco_b_read["sessao_transicao_id"] == transicao.id

    # Not duplicated: still exactly one Sessao row with this id in the chronicle.
    todas = client.get(api("/api/admin/sessoes")).json()["sessoes"]
    assert sum(1 for s in todas if s["id"] == transicao.id) == 1


def test_sessao_transicao_sem_arco_e_rejeitada(client, db_session):
    arco_b = seed_arco(db_session, titulo="Arco B")
    sessao = seed_sessao(db_session, numero=1)  # no arco_id

    response = client.patch(
        api(f"/api/admin/sessoes/{sessao.id}"),
        json={"arco_transicao_id": arco_b.id},
    )
    assert response.status_code == 400
    assert response.json()["detail"]["erro"] == "SESSAO_TRANSICAO_SEM_ARCO"


def test_sessao_transicao_igual_ao_arco_e_rejeitada(client, db_session):
    arco_a = seed_arco(db_session, titulo="Arco A")
    sessao = seed_sessao(db_session, numero=1, arco_id=arco_a.id)

    response = client.patch(
        api(f"/api/admin/sessoes/{sessao.id}"),
        json={"arco_transicao_id": arco_a.id},
    )
    assert response.status_code == 400
    assert response.json()["detail"]["erro"] == "SESSAO_TRANSICAO_ARCO_IGUAL"


def test_arco_form_bulk_assigns_and_unassigns_sessoes(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    s1 = seed_sessao(db_session, numero=1)
    s2 = seed_sessao(db_session, numero=2)
    s3 = seed_sessao(db_session, numero=3)

    created = client.post(
        api("/api/admin/arcos"),
        json={"titulo": "Novo", "sessao_ids": [s1.id, s2.id]},
    )
    assert created.status_code == 201, created.text
    novo_id = created.json()["id"]
    assert set(created.json()["sessao_ids"]) == {s1.id, s2.id}

    update = client.put(
        api(f"/api/admin/arcos/{novo_id}"),
        json={"sessao_ids": [s2.id, s3.id]},
    )
    assert update.status_code == 200, update.text
    assert set(update.json()["sessao_ids"]) == {s2.id, s3.id}

    s1_reloaded = client.get(api(f"/api/admin/sessoes/{s1.id}")).json()
    assert s1_reloaded["arco_id"] is None

    # Unrelated arco untouched.
    assert set(client.get(api(f"/api/admin/arcos/{arco.id}")).json()["sessao_ids"]) == set()


def test_player_read_omits_hidden_sessoes_from_arco(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    oculta = seed_sessao(db_session, numero=1, arco_id=arco.id, visivel=False)
    visivel = seed_sessao(db_session, numero=2, arco_id=arco.id, visivel=True)

    public = client.get(api(f"/api/arcos/{arco.id}")).json()
    assert visivel.id in public["sessao_ids"]
    assert oculta.id not in public["sessao_ids"]


def test_delete_arco_detaches_sessoes_not_delete_them(client, db_session):
    arco = seed_arco(db_session, titulo="Arco A")
    sessao = seed_sessao(db_session, numero=1, arco_id=arco.id)

    assert client.delete(api(f"/api/admin/arcos/{arco.id}")).status_code == 204

    reloaded = client.get(api(f"/api/admin/sessoes/{sessao.id}"))
    assert reloaded.status_code == 200
    assert reloaded.json()["arco_id"] is None
