from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import campaign_uploads_path, get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.models.campanha import Campanha
from app.services.auth_admin import assign_owner
from tests.conftest import TEST_GM_EMAIL
from tests.helpers import seed_local


def test_http_isolation_and_uploads(client: TestClient, data_root: Path) -> None:
    _create_campanha(slug="mesa-a", nome="A", sistema="wfrp4e")
    _create_campanha(slug="mesa-b", nome="B", sistema="wod", visibilidade="so_link")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "mesa-a", TEST_GM_EMAIL)
        assign_owner(ctrl, "mesa-b", TEST_GM_EMAIL)

    with resolve_campaign_session("mesa-a") as session:
        local = seed_local(session, nome="So em A")
        local_id = local.id
        oculto = seed_local(session, nome="Oculto A", visivel=False)
        oculto_id = oculto.id

    with Session(get_control_engine()) as ctrl:
        camp_a = ctrl.exec(select(Campanha).where(Campanha.slug == "mesa-a")).one()
        uploads_a = campaign_uploads_path(camp_a.caminho)
        (uploads_a / "map").mkdir(parents=True, exist_ok=True)
        secret = uploads_a / "map" / "secret-a.txt"
        secret.write_text("only-a")

    lista_a = client.get("/api/c/mesa-a/locais")
    assert lista_a.status_code == 200
    ids_a = {row["id"] for row in lista_a.json()}
    assert local_id in ids_a
    assert oculto_id not in ids_a

    lista_b = client.get("/api/c/mesa-b/locais")
    assert lista_b.status_code == 200
    assert local_id not in {row["id"] for row in lista_b.json()}
    assert oculto_id not in {row["id"] for row in lista_b.json()}

    admin_a = client.get("/api/c/mesa-a/admin/locais")
    assert admin_a.status_code == 200
    assert local_id in {row["id"] for row in admin_a.json()}

    admin_b = client.get("/api/c/mesa-b/admin/locais")
    assert admin_b.status_code == 200
    assert local_id not in {row["id"] for row in admin_b.json()}

    with resolve_campaign_session("mesa-a") as session:
        from tests.helpers import seed_sessao

        seed_sessao(session, numero=1, titulo="Cronica A")

    sessoes_a = client.get("/api/c/mesa-a/sessoes")
    assert sessoes_a.status_code == 200
    assert any(s["titulo"] == "Cronica A" for s in sessoes_a.json()["sessoes"])

    sessoes_b = client.get("/api/c/mesa-b/sessoes")
    assert sessoes_b.status_code == 200
    assert all(s["titulo"] != "Cronica A" for s in sessoes_b.json()["sessoes"])

    admin_sessoes_b = client.get("/api/c/mesa-b/admin/sessoes")
    assert admin_sessoes_b.status_code == 200
    assert all(s["titulo"] != "Cronica A" for s in admin_sessoes_b.json()["sessoes"])

    assert client.get("/api/c/mesa-a/media/map/secret-a.txt").status_code == 200
    assert client.get("/api/c/mesa-b/media/map/secret-a.txt").status_code == 404
    assert client.get("/uploads/c/mesa-a/map/secret-a.txt").status_code == 404

    assert client.get("/api/locais").status_code == 404

    cfg = client.get("/api/c/mesa-b/config")
    assert cfg.status_code == 200
    assert cfg.json()["sistema"] == "wod"


def test_opaque_missing_and_inactive(client: TestClient, data_root: Path) -> None:
    _create_campanha(slug="fantasma", nome="F", sistema="wfrp4e")
    with Session(get_control_engine()) as ctrl:
        row = ctrl.exec(select(Campanha).where(Campanha.slug == "fantasma")).one()
        row.activa = False
        ctrl.add(row)
        ctrl.commit()

    missing = client.get("/api/c/nao-existe/config")
    inactive = client.get("/api/c/fantasma/config")
    assert missing.status_code == 404
    assert inactive.status_code == 404
    assert missing.json()["detail"]["erro"] == "CAMPANHA_NAO_ENCONTRADA"
    assert inactive.json()["detail"]["erro"] == "CAMPANHA_NAO_ENCONTRADA"
    assert missing.json() == inactive.json()


def test_config_differs_per_campaign(client: TestClient, data_root: Path) -> None:
    _create_campanha(slug="cfg-a", nome="A", sistema="wfrp4e")
    _create_campanha(slug="cfg-b", nome="B", sistema="wod")
    a = client.get("/api/c/cfg-a/config").json()
    b = client.get("/api/c/cfg-b/config").json()
    assert a["sistema"] == "wfrp4e"
    assert b["sistema"] == "wod"
    assert "fadiga" in a["modulos_ativos"]
    assert b["modulos_ativos"] == []
