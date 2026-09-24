from tests.conftest import api
from tests.helpers import seed_arco, seed_local


def test_local_accepts_existing_and_null_arco(client, db_session):
    arco = seed_arco(db_session)
    base = {"nome": "Novo local", "x": 0.2, "y": 0.3, "cor_pin": "#123456"}
    assert client.post(api("/api/admin/locais"), json={**base, "arco_id": arco.id}).status_code == 201
    assert client.post(api("/api/admin/locais"), json={**base, "nome": "Sem arco", "arco_id": None}).status_code == 201


def test_invalid_arco_is_rejected_without_mutating_local(client, db_session):
    arco = seed_arco(db_session)
    local = seed_local(db_session, nome="Original", arco_id=arco.id)
    base = {"nome": "Inválido", "x": 0.2, "y": 0.3, "cor_pin": "#123456", "arco_id": 987654}
    created = client.post(api("/api/admin/locais"), json=base)
    assert created.status_code == 400
    updated = client.put(api(f"/api/admin/locais/{local.id}"), json={"nome": "Alteração", "arco_id": 987654})
    assert updated.status_code == 400
    db_session.refresh(local)
    assert local.nome == "Original" and local.arco_id == arco.id
