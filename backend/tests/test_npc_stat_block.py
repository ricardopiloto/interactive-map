from sqlmodel import Session

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.models.npc import NPC
from app.services.auth_admin import assign_owner
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL, api
from tests.helpers import seed_personagem


def test_stat_block_nao_altera_descricao_e_rejeita_campo(client, data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        npc = seed_personagem(session, nome="Sigurd")
        npc.descricao = "Narrativa intacta"
        session.add(npc)
        session.commit()
        npc_id = npc.id

    updated = client.put(
        api(f"/api/admin/npcs/{npc_id}"),
        json={"stat_block": {"ca": 5, "pericias": ["Navegação"]}},
    )
    assert updated.status_code == 200, updated.text
    body = updated.json()
    assert body["descricao"] == "Narrativa intacta"
    assert body["stat_block"]["ca"] == 5

    rejected = client.put(
        api(f"/api/admin/npcs/{npc_id}"),
        json={"stat_block": {"mana": 9}},
    )
    assert rejected.status_code == 422
    assert rejected.json()["detail"]["erro"] == "STAT_BLOCK_CAMPO_DESCONHECIDO"
    again = client.get(api("/api/admin/npcs")).json()
    saved = next(row for row in again if row["id"] == npc_id)
    assert "mana" not in saved["stat_block"]
    assert saved["stat_block"]["ca"] == 5


def test_npc_antigo_devolve_stat_block_vazio(client, data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        npc = seed_personagem(session, nome="Antigo")
        npc.stat_block = None
        session.add(npc)
        session.commit()
        npc_id = npc.id
    rows = client.get(api("/api/admin/npcs")).json()
    found = next(row for row in rows if row["id"] == npc_id)
    assert found["stat_block"] == {}
    assert found["nome"] == "Antigo"


def test_publico_nao_expoe_stat_block(client, client_anon, data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        npc = seed_personagem(session, nome="Visível", visivel=True)
        npc_id = npc.id
    updated = client.put(
        api(f"/api/admin/npcs/{npc_id}"),
        json={"stat_block": {"ca": 2}, "descricao": "História pública"},
    )
    assert updated.status_code == 200
    public = client_anon.get(api(f"/api/npcs/{npc_id}"))
    assert public.status_code == 200
    payload = public.json()
    assert payload["descricao"] == "História pública"
    assert "stat_block" not in payload
    public_personagem = client_anon.get(api(f"/api/personagens/{npc_id}"))
    assert public_personagem.status_code == 200
    assert "stat_block" not in public_personagem.json()


def test_personagem_admin_grava_e_expoe_stat_block(client, data_root):
    created = client.post(
        api("/api/admin/personagens"),
        json={"nome": "Ficha relacoes", "tipo": "npc", "stat_block": {"ca": 3, "for": 40}},
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["stat_block"]["ca"] == 3
    assert body["stat_block"]["for"] == 40
    listed = client.get(api("/api/admin/personagens")).json()
    saved = next(row for row in listed if row["id"] == body["id"])
    assert saved["stat_block"]["ca"] == 3


def test_schema_de_campos_difere_entre_wfrp_e_wod(client, data_root):
    _create_campanha(slug="mesa-wod", nome="WoD", sistema="wod")
    _create_campanha(slug="mesa-wfrp", nome="WFRP", sistema="wfrp")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "mesa-wod", TEST_GM_EMAIL)
        assign_owner(ctrl, "mesa-wfrp", TEST_GM_EMAIL)
    wfrp = client.get("/api/c/mesa-wfrp/admin/npcs/stat-block-schema")
    wod = client.get("/api/c/mesa-wod/admin/npcs/stat-block-schema")
    assert wfrp.status_code == 200 and wod.status_code == 200
    wfrp_names = [field["nome"] for field in wfrp.json()["fields"]]
    wod_names = [field["nome"] for field in wod.json()["fields"]]
    assert "ca" in wfrp_names
    assert "forca" in wod_names
    assert wfrp_names != wod_names


def test_sistema_sem_template_rejeita_gravacao(client, data_root):
    _create_campanha(slug="mesa-livre", nome="Livre", sistema="shadow")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "mesa-livre", TEST_GM_EMAIL)
    with resolve_campaign_session("mesa-livre") as session:
        npc = NPC(nome="Sem ficha", descricao="texto")
        session.add(npc)
        session.commit()
        npc_id = npc.id
    rejected = client.put(
        f"/api/c/mesa-livre/admin/npcs/{npc_id}",
        json={"stat_block": {"ca": 1}},
    )
    assert rejected.status_code == 422
    assert rejected.json()["detail"]["erro"] == "STAT_BLOCK_SISTEMA_DESCONHECIDO"
