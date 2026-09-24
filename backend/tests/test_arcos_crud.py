from tests.conftest import api
from tests.helpers import seed_arco, seed_local


def test_admin_can_manage_arcos_and_delete_preserves_locais(client, db_session):
    arco = seed_arco(db_session, titulo="Primeiro", ordem=2)
    local = seed_local(db_session, nome="Preservado", arco_id=arco.id)
    response = client.post(api("/api/admin/arcos"), json={"titulo": "Segundo", "ordem": 1})
    assert response.status_code == 201
    segundo = response.json()
    rows = client.get(api("/api/admin/arcos")).json()
    assert [row["titulo"] for row in rows] == ["Segundo", "Primeiro"]
    update = client.put(api(f"/api/admin/arcos/{arco.id}"), json={"titulo": "Renomeado", "ordem": 0})
    assert update.status_code == 200
    assert update.json()["titulo"] == "Renomeado"
    assert client.put(api(f"/api/admin/arcos/{segundo['id']}"), json={"ordem": 3}).status_code == 200
    assert client.delete(api(f"/api/admin/arcos/{arco.id}")).status_code == 204
    db_session.refresh(local)
    assert local.arco_id is None
    assert db_session.get(type(local), local.id) is not None

