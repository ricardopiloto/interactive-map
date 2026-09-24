from __future__ import annotations

from datetime import datetime
import io
import json
import zipfile

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.main import app
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.auth_admin import assign_owner
from app.services.auth_password import hash_password
from tests.conftest import (
    TEST_CAMPAIGN_SLUG,
    TEST_GM_EMAIL,
    TEST_GM_PASSWORD,
    TEST_ORIGIN,
    login_as,
)
from tests.helpers import seed_exportable_campaign


def test_export_anon_401(client_anon, data_root) -> None:
    r = client_anon.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/export")
    assert r.status_code == 401


def test_export_other_campaign_dono_403(client_anon, data_root) -> None:
    _create_campanha(slug="outra-mesa", nome="O", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="outro@teste.local",
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        assign_owner(session, "outra-mesa", "outro@teste.local")

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as other:
        login_as(other, email="outro@teste.local", password="password-ok")
        r = other.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/export")
        assert r.status_code == 403
        assert r.json()["detail"]["erro"] == "NAO_MEMBRO"


def test_export_non_dono_member_403(client_anon, data_root) -> None:
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="mestre@teste.local",
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        user = session.exec(select(Usuario).where(Usuario.email == "mestre@teste.local")).first()
        camp = session.exec(
            select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)
        ).first()
        assert user and camp
        session.add(
            Membro(
                usuario_id=user.id,  # type: ignore[arg-type]
                campanha_id=camp.id,  # type: ignore[arg-type]
                papel="mestre",
                criado_em=datetime.utcnow(),
            )
        )
        session.commit()

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as mestre:
        login_as(mestre, email="mestre@teste.local", password="password-ok")
        r = mestre.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/export")
        assert r.status_code == 403
        assert r.json()["detail"]["erro"] == "NAO_DONO"


def test_export_owner_200_zip(client, data_root) -> None:
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        seed_exportable_campaign(session, slug=TEST_CAMPAIGN_SLUG)
    r = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/export")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("application/zip")
    assert "attachment" in r.headers.get("content-disposition", "")
    assert r.content[:2] == b"PK"
