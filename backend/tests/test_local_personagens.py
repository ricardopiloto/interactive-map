from sqlmodel import select

from app.campaign_db import resolve_campaign_session
from app.models.links import LocalNPCLink
from app.models.local import Local
from app.models.npc import NPC, PersonagemTipo
from tests.conftest import TEST_CAMPAIGN_SLUG, api
from tests.helpers import seed_local, seed_personagem


def test_local_persists_pj_and_npc_and_removes_only_requested_link(client, db_session):
    pj = seed_personagem(db_session, nome="PJ associado", tipo=PersonagemTipo.pj)
    npc = seed_personagem(db_session, nome="NPC associado", tipo=PersonagemTipo.npc)
    other_local = seed_local(db_session, nome="Outro local")
    local = seed_local(db_session, nome="Local com personagens")

    updated = client.put(
        api(f"/api/admin/locais/{local.id}"),
        json={"npc_ids": [pj.id, npc.id]},
    )
    assert updated.status_code == 200, updated.text
    assert set(updated.json()["npc_ids"]) == {pj.id, npc.id}

    # A fresh administrative read proves the relation was committed.
    persisted = next(
        row for row in client.get(api("/api/admin/locais")).json() if row["id"] == local.id
    )
    assert set(persisted["npc_ids"]) == {pj.id, npc.id}

    client.put(api(f"/api/admin/locais/{other_local.id}"), json={"npc_ids": [pj.id]})
    removed_one = client.put(
        api(f"/api/admin/locais/{local.id}"), json={"npc_ids": [npc.id]}
    )
    assert removed_one.status_code == 200
    assert removed_one.json()["npc_ids"] == [npc.id]

    db_session.expire_all()
    assert db_session.get(NPC, pj.id) is not None
    assert db_session.get(NPC, npc.id) is not None
    assert db_session.get(Local, local.id) is not None
    assert db_session.get(Local, other_local.id) is not None
    assert db_session.exec(
        select(LocalNPCLink).where(
            LocalNPCLink.local_id == other_local.id,
            LocalNPCLink.npc_id == pj.id,
        )
    ).first() is not None


def test_local_rejects_character_id_from_another_campaign_without_mutation(
    client, db_session, data_root
):
    local = seed_local(db_session, nome="Local preservado")
    original = seed_personagem(db_session, nome="Personagem original")
    assert client.put(
        api(f"/api/admin/locais/{local.id}"), json={"npc_ids": [original.id]}
    ).status_code == 200

    from app.cli import _create_campanha

    _create_campanha(slug="personagens-outra-campanha", nome="Outra", sistema="wfrp4e")
    with resolve_campaign_session("personagens-outra-campanha") as other_session:
        remote = NPC(id=987654, nome="Somente outra campanha", tipo=PersonagemTipo.pj)
        other_session.add(remote)
        other_session.commit()
        other_session.refresh(remote)
        remote_id = remote.id

    response = client.put(
        api(f"/api/admin/locais/{local.id}"), json={"npc_ids": [remote_id]}
    )
    assert response.status_code == 400
    db_session.expire_all()
    assert {row.id for row in db_session.get(Local, local.id).npcs} == {original.id}
