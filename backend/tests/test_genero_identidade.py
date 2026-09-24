from __future__ import annotations

import io
import json
import zipfile

import pytest
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.models.campanha import Campanha
from app.services.campaign_export import export_campaign_to_bytes
from app.services.campaign_import import import_campaign_from_bytes
from app.services.genre_palette import genero_from_legacy
from app.services.package_schema import CONTENT_FILENAME, MANIFEST_FILENAME
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL, TEST_ORIGIN, login_as
from tests.helpers import seed_exportable_campaign


@pytest.mark.parametrize(
    "sistema,acento,expected",
    [
        ("wfrp4e", "latao", "fantasia"),
        ("wfrp4e", None, "fantasia"),
        ("wod", "vinho", "gotico"),
        ("outro", "vinho", "gotico"),
        ("wfrp4e", "verde", "fantasia"),
        ("wod", "latao", "fantasia"),
        ("desconhecido", None, "fantasia"),
    ],
)
def test_genero_from_legacy_mapping(sistema, acento, expected) -> None:
    assert genero_from_legacy(sistema, acento) == expected


def test_criar_requires_genero(client, data_root) -> None:
    r = client.post(
        "/api/campanhas",
        json={"nome": "X", "slug": "sem-genero", "sistema": "wfrp4e"},
    )
    assert r.status_code == 422


def test_criar_genero_invalido(client, data_root) -> None:
    r = client.post(
        "/api/campanhas",
        json={
            "nome": "X",
            "slug": "genero-bad",
            "sistema": "wfrp4e",
            "genero": "cyberpunk",
        },
    )
    assert r.status_code == 422


@pytest.mark.parametrize("genero", ["fantasia", "gotico", "scifi", "urbano"])
def test_criar_with_genero(client, data_root, genero: str) -> None:
    slug = f"g-{genero}"
    r = client.post(
        "/api/campanhas",
        json={"nome": genero, "slug": slug, "sistema": "wfrp4e", "genero": genero},
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["genero"] == genero
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == slug)).first()
        assert camp and camp.genero == genero


def test_default_create_cli_has_genero(data_root) -> None:
    row = _create_campanha(slug="cli-gen", nome="C", sistema="wfrp4e")
    assert row.genero == "fantasia"


def test_capa_owner_ok_and_identidade_gone(client, data_root) -> None:
    gone = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/identidade",
        json={"acento_id": "verde"},
    )
    assert gone.status_code == 404

    ok = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/capa",
        json={"capa_arquivo": "cover.webp"},
    )
    assert ok.status_code == 200, ok.text
    assert ok.json()["capa_arquivo"] == "cover.webp"


def test_capa_anon_denied(client_anon, data_root) -> None:
    r = client_anon.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/capa",
        json={"capa_arquivo": "x.webp"},
    )
    assert r.status_code in (401, 403)


def test_capa_other_master_denied(client, data_root) -> None:
    from fastapi.testclient import TestClient

    from app.main import app
    from app.services.auth_admin import create_usuario_with_invite
    from app.services.auth_invite import accept_activate_invite

    with Session(get_control_engine()) as session:
        _user, token = create_usuario_with_invite(session, "outro@teste.local")
        accept_activate_invite(session, token, "senha-outra-ok")

    with TestClient(app) as other_client:
        login = other_client.post(
            "/api/auth/login",
            json={"email": "outro@teste.local", "password": "senha-outra-ok"},
            headers={"Origin": TEST_ORIGIN},
        )
        assert login.status_code == 200
        r = other_client.patch(
            f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/capa",
            json={"capa_arquivo": "evil.webp"},
        )
        assert r.status_code in (403, 404)


def test_export_manifest_has_genero(client, data_root) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    data = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        manifest = json.loads(zf.read(MANIFEST_FILENAME))
        assert manifest["genero"] == "fantasia"
        assert "acento_id" not in manifest


def test_import_preserves_genero(client, data_root) -> None:
    _create_campanha(slug="exp-gotico", nome="G", sistema="wod", genero="gotico")
    with resolve_campaign_session("exp-gotico") as session:
        seed_exportable_campaign(session, slug="exp-gotico")
    data = export_campaign_to_bytes("exp-gotico")
    camp = import_campaign_from_bytes(
        data,
        owner_email=TEST_GM_EMAIL,
        slug_override="imp-gotico",
    )
    assert camp.genero == "gotico"


def test_import_legacy_acento_id_maps(client, data_root) -> None:
    _create_campanha(slug="exp-leg", nome="L", sistema="wod", genero="fantasia")
    with resolve_campaign_session("exp-leg") as session:
        seed_exportable_campaign(session, slug="exp-leg")
    data = export_campaign_to_bytes("exp-leg")
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        manifest = json.loads(zf.read(MANIFEST_FILENAME))
        content = zf.read(CONTENT_FILENAME)
        images = {n: zf.read(n) for n in zf.namelist() if n.startswith("uploads/")}
    manifest.pop("genero", None)
    manifest["acento_id"] = "vinho"
    manifest["sistema"] = "wod"
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr(MANIFEST_FILENAME, json.dumps(manifest))
        zf.writestr(CONTENT_FILENAME, content)
        for n, blob in images.items():
            zf.writestr(n, blob)
    camp = import_campaign_from_bytes(
        buf.getvalue(),
        owner_email=TEST_GM_EMAIL,
        slug_override="imp-leg",
    )
    assert camp.genero == "gotico"


def test_catalogo_and_minhas_expose_genero(client, data_root) -> None:
    cat = client.get("/api/campanhas/catalogo")
    assert cat.status_code == 200
    for item in cat.json()["campanhas"]:
        assert "genero" in item
        assert "acento_id" not in item

    mine = client.get("/api/campanhas/minhas")
    assert mine.status_code == 200
    for item in mine.json()["campanhas"]:
        assert "genero" in item
        assert "sugestao_acento" not in item
