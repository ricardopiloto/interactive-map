from __future__ import annotations

from app.models.npc import PersonagemTipo
from tests.conftest import api
from tests.helpers import seed_personagem, seed_vinculo_publico


def test_hidden_characters_absent_from_public_lists_and_detail(client, db_session) -> None:
    visivel_pj = seed_personagem(
        db_session, nome="PJ Publico", visivel=True, tipo=PersonagemTipo.pj
    )
    oculto_pj = seed_personagem(
        db_session, nome="PJ Oculto", visivel=False, tipo=PersonagemTipo.pj
    )
    visivel_npc = seed_personagem(
        db_session, nome="NPC Publico", visivel=True, tipo=PersonagemTipo.npc
    )
    oculto_npc = seed_personagem(
        db_session, nome="NPC Oculto", visivel=False, tipo=PersonagemTipo.npc
    )
    vinculo = seed_vinculo_publico(db_session, visivel_pj.id, oculto_pj.id)  # type: ignore[arg-type]

    personagens = client.get(api("/api/personagens")).json()
    pj_ids = {row["id"] for row in personagens}
    assert visivel_pj.id in pj_ids
    assert visivel_npc.id in pj_ids
    assert oculto_pj.id not in pj_ids
    assert oculto_npc.id not in pj_ids

    npcs = client.get(api("/api/npcs")).json()
    npc_ids = {row["id"] for row in npcs}
    assert visivel_pj.id in npc_ids
    assert visivel_npc.id in npc_ids
    assert oculto_pj.id not in npc_ids
    assert oculto_npc.id not in npc_ids

    hidden_pj = client.get(api(f"/api/personagens/{oculto_pj.id}"))
    assert hidden_pj.status_code == 404
    assert hidden_pj.json()["detail"]["erro"] == "PERSONAGEM_NAO_ENCONTRADO"

    missing_pj = client.get(api("/api/personagens/999999"))
    assert missing_pj.status_code == 404
    assert missing_pj.json()["detail"]["erro"] == "PERSONAGEM_NAO_ENCONTRADO"

    hidden_npc = client.get(api(f"/api/npcs/{oculto_npc.id}"))
    assert hidden_npc.status_code == 404
    assert hidden_npc.json()["detail"]["erro"] == "NPC_NAO_ENCONTRADO"

    missing_npc = client.get(api("/api/npcs/999999"))
    assert missing_npc.status_code == 404
    assert missing_npc.json()["detail"]["erro"] == "NPC_NAO_ENCONTRADO"

    public_vinculos = {row["id"] for row in client.get(api("/api/vinculos")).json()}
    assert vinculo.id not in public_vinculos

    admin_pjs = {row["id"] for row in client.get(api("/api/admin/personagens")).json()}
    assert oculto_pj.id in admin_pjs
    assert visivel_pj.id in admin_pjs

    admin_npcs = {row["id"] for row in client.get(api("/api/admin/npcs")).json()}
    assert oculto_npc.id in admin_npcs
    assert visivel_npc.id in admin_npcs
