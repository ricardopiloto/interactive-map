from __future__ import annotations

from tests.conftest import api
from tests.helpers import seed_public_catalog


def test_empty_public_lists_are_empty_not_500(client) -> None:
    for path in ("/api/locais", "/api/npcs", "/api/personagens", "/api/vinculos", "/api/arcos"):
        response = client.get(api(path))
        assert response.status_code == 200, path
        assert response.json() == [], path


def test_empty_grupo_returns_default(client) -> None:
    response = client.get(api("/api/grupo"))
    assert response.status_code == 200
    body = response.json()
    assert body["x"] == 0.5
    assert body["y"] == 0.5
    assert body["formato"] == "bandeira"


def test_config_shape_without_map_image(client) -> None:
    response = client.get(api("/api/config"))
    assert response.status_code == 200
    body = response.json()
    assert body["sistema"] == "wfrp4e"
    assert "modulos_ativos" in body
    assert isinstance(body["modulos_ativos"], list)
    assert "fadiga" in body["modulos_ativos"]
    assert body["has_map_image"] is False


def test_seeded_public_reads(client, db_session) -> None:
    catalog = seed_public_catalog(db_session)

    locais = client.get(api("/api/locais"))
    assert locais.status_code == 200
    assert catalog.local.id in {row["id"] for row in locais.json()}

    local = client.get(api(f"/api/locais/{catalog.local.id}"))
    assert local.status_code == 200
    assert local.json()["nome"] == catalog.local.nome

    npcs = client.get(api("/api/npcs"))
    assert npcs.status_code == 200
    npc_ids = {row["id"] for row in npcs.json()}
    assert catalog.npc_visivel.id in npc_ids
    assert catalog.visivel.id in npc_ids

    npc = client.get(api(f"/api/npcs/{catalog.npc_visivel.id}"))
    assert npc.status_code == 200
    assert npc.json()["nome"] == catalog.npc_visivel.nome

    personagens = client.get(api("/api/personagens"))
    assert personagens.status_code == 200
    pj_ids = {row["id"] for row in personagens.json()}
    assert catalog.visivel.id in pj_ids
    assert catalog.npc_visivel.id in pj_ids

    personagem = client.get(api(f"/api/personagens/{catalog.visivel.id}"))
    assert personagem.status_code == 200
    assert personagem.json()["nome"] == catalog.visivel.nome

    vinculos = client.get(api("/api/vinculos"))
    assert vinculos.status_code == 200
    assert catalog.vinculo.id in {row["id"] for row in vinculos.json()}

    arcos = client.get(api("/api/arcos"))
    assert arcos.status_code == 200
    assert catalog.arco.id in {row["id"] for row in arcos.json()}

    arco = client.get(api(f"/api/arcos/{catalog.arco.id}"))
    assert arco.status_code == 200
    assert arco.json()["titulo"] == catalog.arco.titulo
