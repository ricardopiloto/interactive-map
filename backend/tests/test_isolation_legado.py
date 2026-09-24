from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import campaign_uploads_path, get_control_engine
from app.cli import main
from app.models.campanha import Campanha
from app.services.auth_admin import create_usuario_with_invite
from app.services.auth_invite import accept_activate_invite
from tests.conftest import TEST_GM_EMAIL, TEST_GM_PASSWORD
from tests.legado_helpers import build_wfrp_tree, build_wod_tree


def _import(origem: Path, slug: str, sistema: str, nome: str, email: str) -> int:
    return main(
        [
            "campanha",
            "importar-legado",
            "--origem",
            str(origem),
            "--slug",
            slug,
            "--sistema",
            sistema,
            "--nome",
            nome,
            "--email",
            email,
        ]
    )


def test_isolation_wfrp_wod(client_anon: TestClient, data_root: Path, tmp_path: Path) -> None:
    wfrp = build_wfrp_tree(tmp_path / "wfrp")
    wod = build_wod_tree(tmp_path / "wod")
    with Session(get_control_engine()) as session:
        _user, token = create_usuario_with_invite(session, "wod@teste.local")
        accept_activate_invite(session, token, TEST_GM_PASSWORD)

    assert _import(wfrp, "wfrp", "wfrp4e", "WFRP", TEST_GM_EMAIL) == 0
    assert _import(wod, "wod", "wod", "WoD", "wod@teste.local") == 0

    lista_w = client_anon.get("/api/c/wfrp/locais")
    lista_d = client_anon.get("/api/c/wod/locais")
    assert lista_w.status_code == 200
    assert lista_d.status_code == 200
    names_w = {row["nome"] for row in lista_w.json()}
    names_d = {row["nome"] for row in lista_d.json()}
    assert names_w.isdisjoint(names_d)
    assert len(lista_w.json()) == 2
    assert len(lista_d.json()) == 1

    assert client_anon.get("/api/c/wfrp/media/portraits/p-wfrp-1.webp").status_code == 200
    assert client_anon.get("/api/c/wod/media/portraits/p-wfrp-1.webp").status_code == 404
    assert client_anon.get("/api/c/wod/media/map/campaign-map.webp").status_code == 200
    assert client_anon.get("/api/c/wfrp/media/map/campaign-map.webp").status_code == 200

    with Session(get_control_engine()) as session:
        a = session.exec(select(Campanha).where(Campanha.slug == "wfrp")).one()
        b = session.exec(select(Campanha).where(Campanha.slug == "wod")).one()
        files_a = {p.name for p in campaign_uploads_path(a.caminho).rglob("*") if p.is_file()}
        files_b = {p.name for p in campaign_uploads_path(b.caminho).rglob("*") if p.is_file()}
        assert "p-wfrp-1.webp" in files_a
        assert "p-wfrp-1.webp" not in files_b
        assert "p-wod-1.webp" in files_b
        assert "p-wod-1.webp" not in files_a
