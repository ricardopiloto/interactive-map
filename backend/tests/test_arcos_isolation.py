from sqlmodel import Session

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.services.auth_admin import assign_owner
from tests.conftest import TEST_GM_EMAIL


def test_arco_crud_is_scoped_to_campaign(client, data_root):
    _create_campanha(slug="arcos-b", nome="B", sistema="wfrp4e")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "arcos-b", TEST_GM_EMAIL)
    with resolve_campaign_session("teste-suite") as a, resolve_campaign_session("arcos-b") as b:
        from tests.helpers import seed_arco
        arco_a = seed_arco(a, titulo="A", cor="#111111")
        arco_b = seed_arco(b, titulo="B", cor="#222222")
    assert arco_a.id == arco_b.id
    rows_a = client.get("/api/c/teste-suite/admin/arcos").json()
    rows_b = client.get("/api/c/arcos-b/admin/arcos").json()
    assert rows_a[0]["titulo"] == "A"
    assert rows_a[0]["cor"] == "#111111"
    assert rows_b[0]["titulo"] == "B"
    assert rows_b[0]["cor"] == "#222222"
    response = client.put(
        f"/api/c/teste-suite/admin/arcos/{arco_a.id}",
        json={"titulo": "Atualizado A", "cor": "#333333"},
    )
    assert response.status_code == 200
    with resolve_campaign_session("arcos-b") as b:
        reloaded_b = b.get(type(arco_b), arco_b.id)
        assert reloaded_b.titulo == "B"
        assert reloaded_b.cor == "#222222"


def test_arco_sessao_ids_do_not_leak_across_campaigns(client, data_root):
    _create_campanha(slug="arcos-sessoes-b", nome="SB", sistema="wfrp4e")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "arcos-sessoes-b", TEST_GM_EMAIL)

    from tests.helpers import seed_arco, seed_sessao

    with resolve_campaign_session("teste-suite") as a, resolve_campaign_session(
        "arcos-sessoes-b"
    ) as b:
        arco_a = seed_arco(a, titulo="A")
        arco_b = seed_arco(b, titulo="B")
        arco_a_id, arco_b_id = arco_a.id, arco_b.id
        sessao_a = seed_sessao(a, numero=1, arco_id=arco_a_id)
        sessao_b = seed_sessao(b, numero=1, arco_id=arco_b_id)
        sessao_a_id, sessao_b_id = sessao_a.id, sessao_b.id
    assert sessao_a_id == sessao_b_id  # same id in both campaigns' own DB — the risky case

    arco_a_read = client.get(f"/api/c/teste-suite/admin/arcos/{arco_a_id}").json()
    arco_b_read = client.get(f"/api/c/arcos-sessoes-b/admin/arcos/{arco_b_id}").json()
    assert arco_a_read["sessao_ids"] == [sessao_a_id]
    assert arco_b_read["sessao_ids"] == [sessao_b_id]

    # Removing campaign A's membership must not touch campaign B's session.
    update = client.put(
        f"/api/c/teste-suite/admin/arcos/{arco_a_id}",
        json={"sessao_ids": []},
    )
    assert update.status_code == 200
    with resolve_campaign_session("arcos-sessoes-b") as b:
        from app.models.sessao import Sessao

        assert b.get(Sessao, sessao_b_id).arco_id == arco_b_id
