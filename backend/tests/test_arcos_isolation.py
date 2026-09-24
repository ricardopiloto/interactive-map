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
        arco_a = seed_arco(a, titulo="A")
        arco_b = seed_arco(b, titulo="B")
    assert arco_a.id == arco_b.id
    assert client.get("/api/c/teste-suite/admin/arcos").json()[0]["titulo"] == "A"
    assert client.get("/api/c/arcos-b/admin/arcos").json()[0]["titulo"] == "B"
    response = client.put(f"/api/c/teste-suite/admin/arcos/{arco_a.id}", json={"titulo": "Atualizado A"})
    assert response.status_code == 200
    with resolve_campaign_session("arcos-b") as b:
        assert b.get(type(arco_b), arco_b.id).titulo == "B"
