"""Endereço canônico /c/{id}/{slug}: slug gravado como enviado, resolução por id ou slug."""

from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, lookup_campanha, resolve_campaign_session
from app.cli import _create_campanha
from app.main import app
from app.models.campanha import Campanha
from app.models.usuario import Usuario
from app.services.auth_password import hash_password
from app.services.campaign_export import export_campaign_to_bytes
from app.services.campanha_admin import CampanhaAdminError, validate_slug
from app.services.package_schema import SLUG_OCUPADO
from tests.conftest import (
    TEST_CAMPAIGN_SLUG,
    TEST_ORIGIN,
    login_as,
)
from tests.helpers import seed_exportable_campaign, seed_local


def test_create_stores_slug_exactly(tmp_path, monkeypatch) -> None:
    from app.campaign_db import reset_engines
    from app.config import settings

    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")
    row = _create_campanha(slug="minha-campanha", nome="Um", sistema="wfrp4e")
    assert row.slug == "minha-campanha"
    try:
        _create_campanha(slug="minha-campanha", nome="Dois", sistema="wod")
        raise AssertionError("expected duplicate")
    except CampanhaAdminError as exc:
        assert exc.codigo == "SLUG_DUPLICADO"


def test_slug_of_48_characters_is_accepted() -> None:
    slug = "a" * 48
    validate_slug(slug)
    try:
        validate_slug("b" * 49)
        raise AssertionError("expected invalid")
    except CampanhaAdminError as exc:
        assert exc.codigo == "SLUG_INVALIDO"


def test_http_accepts_48_character_slug(client: TestClient, data_root) -> None:
    slug = "a" * 48
    response = client.post(
        "/api/campanhas",
        json={"nome": "Longa", "slug": slug, "sistema": "wfrp4e"},
    )
    assert response.status_code == 201, response.text
    assert response.json()["slug"] == slug


def test_lookup_resolves_same_campaign_by_id_and_slug(tmp_path, monkeypatch) -> None:
    from app.campaign_db import reset_engines
    from app.config import settings

    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")
    row = _create_campanha(slug="mesa-lookup", nome="Lookup", sistema="wfrp4e")
    by_slug = lookup_campanha(row.slug)
    by_id = lookup_campanha(str(row.id))
    assert by_slug.id == by_id.id == row.id
    assert by_id.slug == "mesa-lookup"


def test_http_id_matches_slug_on_two_endpoints(client: TestClient, data_root) -> None:
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        camp_id = camp.id
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_local(session, nome="Altdorf")

    by_slug_locais = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/locais")
    by_id_locais = client.get(f"/api/c/{camp_id}/locais")
    assert by_slug_locais.status_code == 200
    assert by_id_locais.status_code == 200
    assert by_id_locais.json() == by_slug_locais.json()

    by_slug_cfg = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/config")
    by_id_cfg = client.get(f"/api/c/{camp_id}/config")
    assert by_slug_cfg.status_code == 200
    assert by_id_cfg.status_code == 200
    assert by_id_cfg.json() == by_slug_cfg.json()
    assert by_id_cfg.json()["id"] == camp_id
    assert by_id_cfg.json()["slug"] == TEST_CAMPAIGN_SLUG


def _second_user(email: str) -> None:
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email=email,
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()


def test_import_rejects_occupied_slug_and_keeps_a_new_one(client: TestClient, data_root) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    zip_bytes = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    _second_user("importador-endereco@teste.local")
    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as importer:
        login_as(importer, email="importador-endereco@teste.local", password="password-ok")
        occupied = importer.post(
            "/api/campanhas/import",
            files={"file": ("a.zip", zip_bytes, "application/zip")},
        )
        assert occupied.status_code == 409
        assert occupied.json()["detail"]["erro"] == SLUG_OCUPADO
        before = len(list(Session(get_control_engine()).exec(select(Campanha)).all()))

        fresh = importer.post(
            "/api/campanhas/import",
            files={"file": ("a.zip", zip_bytes, "application/zip")},
            data={"slug": "mesa-importada"},
        )
        assert fresh.status_code == 201, fresh.text
        body = fresh.json()
        assert body["slug"] == "mesa-importada"
        assert body["id"]
    with Session(get_control_engine()) as session:
        stored = session.exec(select(Campanha).where(Campanha.slug == "mesa-importada")).one()
        assert stored.slug == "mesa-importada"
        assert len(list(session.exec(select(Campanha)).all())) == before + 1
