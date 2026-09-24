from __future__ import annotations

from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import campaign_uploads_path, get_control_engine, resolve_campaign_session
from app.models.campanha import Campanha
from app.models.npc import NPC
from tests.conftest import (
    TEST_CAMPAIGN_SLUG,
    TEST_GM_EMAIL,
    TEST_GM_PASSWORD,
    TEST_ORIGIN,
    login_as,
)
from tests.helpers import seed_personagem


def _write_portrait(slug: str, name: str, data: bytes = b"\x89PNG\r\n\x1a\nxxxx") -> Path:
    with Session(get_control_engine()) as ctrl:
        camp = ctrl.exec(select(Campanha).where(Campanha.slug == slug)).one()
        dest = campaign_uploads_path(camp.caminho) / "portraits"
        dest.mkdir(parents=True, exist_ok=True)
        path = dest / name
        path.write_bytes(data)
        return path


def test_hidden_portrait_anonymous_404_member_200(client, client_anon, db_session) -> None:
    name = "oculto.webp"
    _write_portrait(TEST_CAMPAIGN_SLUG, name)
    url = f"/api/c/{TEST_CAMPAIGN_SLUG}/media/portraits/{name}"
    pj = seed_personagem(db_session, nome="Oculto", visivel=False)
    pj.retrato_url = url
    db_session.add(pj)
    db_session.commit()

    assert client_anon.get(url).status_code == 404
    assert client.get(url).status_code == 200


def test_visible_portrait_anonymous_200(client_anon, db_session) -> None:
    name = "visivel.webp"
    _write_portrait(TEST_CAMPAIGN_SLUG, name)
    url = f"/api/c/{TEST_CAMPAIGN_SLUG}/media/portraits/{name}"
    pj = seed_personagem(db_session, nome="Visivel", visivel=True)
    pj.retrato_url = url
    db_session.add(pj)
    db_session.commit()

    r = client_anon.get(url)
    assert r.status_code == 200
    assert "no-store" in r.headers.get("cache-control", "").lower()


def test_orphan_portrait_anonymous_404_member_200(client, client_anon) -> None:
    name = "orfao.webp"
    _write_portrait(TEST_CAMPAIGN_SLUG, name)
    url = f"/api/c/{TEST_CAMPAIGN_SLUG}/media/portraits/{name}"
    assert client_anon.get(url).status_code == 404
    assert client.get(url).status_code == 200


def test_other_campaign_member_denied(client_anon, data_root) -> None:
    from app.cli import _create_campanha
    from app.services.auth_admin import assign_owner
    from datetime import datetime
    from app.models.usuario import Usuario
    from app.services.auth_password import hash_password

    _create_campanha(slug="outra", nome="O", sistema="wfrp4e")
    name = "so-a.webp"
    _write_portrait(TEST_CAMPAIGN_SLUG, name)
    url = f"/api/c/{TEST_CAMPAIGN_SLUG}/media/portraits/{name}"
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        pj = seed_personagem(session, nome="OcultoA", visivel=False)
        pj.retrato_url = url
        session.add(pj)
        session.commit()

    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="outro@teste.local",
                senha_hash=hash_password("password99"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        assign_owner(session, "outra", "outro@teste.local")

    login_as(client_anon, email="outro@teste.local", password="password99")
    assert client_anon.get(url).status_code == 404
