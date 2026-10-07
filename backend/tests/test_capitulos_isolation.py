from sqlmodel import Session

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.services.auth_admin import assign_owner
from tests.conftest import TEST_GM_EMAIL
from tests.helpers import seed_arco


def test_capitulos_nao_vazam_entre_campanhas(client, data_root):
    _create_campanha(slug="capitulos-b", nome="B", sistema="wfrp4e")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "capitulos-b", TEST_GM_EMAIL)
    with resolve_campaign_session("teste-suite") as a, resolve_campaign_session("capitulos-b") as b:
        arco_a = seed_arco(a, titulo="A")
        arco_b = seed_arco(b, titulo="B")
        arco_a_id, arco_b_id = arco_a.id, arco_b.id

    criado_a = client.post(
        "/api/c/teste-suite/admin/capitulos",
        json={"arco_id": arco_a_id, "titulo": "Só A"},
    )
    criado_b = client.post(
        "/api/c/capitulos-b/admin/capitulos",
        json={"arco_id": arco_b_id, "titulo": "Só B"},
    )
    assert criado_a.status_code == 201
    assert criado_b.status_code == 201

    lista_a = client.get("/api/c/teste-suite/admin/capitulos", params={"arco_id": arco_a_id}).json()
    lista_b = client.get("/api/c/capitulos-b/admin/capitulos", params={"arco_id": arco_b_id}).json()
    assert [row["titulo"] for row in lista_a["capitulos"]] == ["Só A"]
    assert [row["titulo"] for row in lista_b["capitulos"]] == ["Só B"]

    mesmo_id = client.get(
        f"/api/c/teste-suite/admin/capitulos/{criado_b.json()['id']}",
    )
    if mesmo_id.status_code == 200:
        assert mesmo_id.json()["titulo"] != "Só B"
    else:
        assert mesmo_id.status_code == 404
