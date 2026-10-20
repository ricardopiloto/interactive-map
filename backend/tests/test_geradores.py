from __future__ import annotations

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import get_control_engine
from app.cli import _create_campanha
from app.services.auth_admin import assign_owner
from app.services.geradores import FALLBACK_KEY, TIPOS, reset_cache, sortear
from tests.conftest import TEST_GM_EMAIL, api


def test_sortear_avoids_immediate_repeat() -> None:
    reset_cache()
    prev = sortear(tipo="nome", sistema="wfrp4e", lang="pt-BR", scope="t1").resultado
    for _ in range(200):
        nxt = sortear(tipo="nome", sistema="wfrp4e", lang="pt-BR", scope="t1").resultado
        assert nxt != prev
        prev = nxt


def test_sistema_ignora_maiusculas_e_espacos() -> None:
    reset_cache()
    for sistema, esperado in (("WFRP4e", "wfrp4e"), (" WoD ", "wod")):
        res = sortear(tipo="nome", sistema=sistema, lang="en", scope="case")
        assert res.sistema_usado == esperado
        assert res.fallback is False


def test_geradores_por_sistema_e_fallback(client: TestClient) -> None:
    reset_cache()
    wod = _create_campanha(slug="ger-wod", nome="WoD", sistema="wod").slug
    other = _create_campanha(slug="ger-other", nome="Other", sistema="cyberpunk-red").slug
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, wod, TEST_GM_EMAIL)
        assign_owner(ctrl, other, TEST_GM_EMAIL)

    for tipo in TIPOS:
        wfrp = client.post(api(f"/api/admin/geradores/{tipo}"), params={"lang": "pt-BR"})
        assert wfrp.status_code == 200, wfrp.text
        body = wfrp.json()
        assert body["resultado"]
        assert body["tipo"] == tipo
        assert body["sistema_usado"] == "wfrp4e"
        assert body["fallback"] is False

        wod_res = client.post(f"/api/c/{wod}/admin/geradores/{tipo}", params={"lang": "pt-BR"})
        assert wod_res.status_code == 200, wod_res.text
        wod_body = wod_res.json()
        assert wod_body["resultado"]
        assert wod_body["sistema_usado"] == "wod"
        assert wod_body["fallback"] is False

        fb = client.post(f"/api/c/{other}/admin/geradores/{tipo}", params={"lang": "en"})
        assert fb.status_code == 200, fb.text
        fb_body = fb.json()
        assert fb_body["resultado"]
        assert fb_body["sistema_usado"] == FALLBACK_KEY
        assert fb_body["fallback"] is True


def test_gerador_requer_membro(client_anon: TestClient) -> None:
    response = client_anon.post(api("/api/admin/geradores/nome"))
    assert response.status_code in (401, 403)


def test_gerador_tipo_desconhecido(client: TestClient) -> None:
    response = client.post(api("/api/admin/geradores/magia"))
    assert response.status_code == 404
    assert response.json()["detail"]["erro"] == "GERADOR_TIPO_DESCONHECIDO"
