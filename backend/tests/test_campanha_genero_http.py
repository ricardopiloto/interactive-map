from __future__ import annotations

from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.cli import _create_campanha
from app.main import app
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.auth_admin import assign_owner
from app.services.auth_password import hash_password
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_ORIGIN, login_as


@pytest.mark.parametrize("genero", ["fantasia", "gotico", "scifi", "urbano"])
def test_patch_genero_dono_persists_and_updates_config(client, data_root, genero: str) -> None:
    response = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/genero",
        json={"genero": genero},
    )

    assert response.status_code == 200, response.text
    assert response.json() == {"slug": TEST_CAMPAIGN_SLUG, "genero": genero}
    with Session(get_control_engine()) as session:
        campaign = session.exec(
            select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)
        ).one()
        assert campaign.genero == genero

    config = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/config")
    assert config.status_code == 200
    assert config.json()["genero"] == genero


def test_patch_genero_rejects_invalid_value_without_changing_campaign(client, data_root) -> None:
    response = client.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/genero",
        json={"genero": "cyberpunk"},
    )

    assert response.status_code == 400
    assert response.json()["detail"]["erro"] == "GENERO_INVALIDO"
    with Session(get_control_engine()) as session:
        campaign = session.exec(
            select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)
        ).one()
        assert campaign.genero == "fantasia"


def test_patch_genero_requires_owner_and_preserves_saved_value(client_anon, data_root) -> None:
    with Session(get_control_engine()) as session:
        other = Usuario(
            email="genre-member@teste.local",
            senha_hash=hash_password("password-ok"),
            activo=True,
            criado_em=datetime.utcnow(),
            actualizado_em=datetime.utcnow(),
        )
        session.add(other)
        session.commit()
        session.refresh(other)
        campaign = session.exec(
            select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)
        ).one()
        session.add(
            Membro(
                usuario_id=other.id,
                campanha_id=campaign.id,
                papel="jogador",
            )
        )
        session.commit()
        assign_owner(session, TEST_CAMPAIGN_SLUG, "gm@teste.local")

    anonymous = client_anon.patch(
        f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/genero",
        json={"genero": "gotico"},
    )
    assert anonymous.status_code == 401

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as non_owner:
        login_as(
            non_owner,
            email="genre-member@teste.local",
            password="password-ok",
        )
        forbidden = non_owner.patch(
            f"/api/campanhas/{TEST_CAMPAIGN_SLUG}/genero",
            json={"genero": "gotico"},
        )
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"]["erro"] == "NAO_DONO"

    with Session(get_control_engine()) as session:
        campaign = session.exec(
            select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)
        ).one()
        assert campaign.genero == "fantasia"


def test_patch_genero_missing_or_inactive_campaign_returns_not_found(client, data_root) -> None:
    missing = client.patch(
        "/api/campanhas/missing-genre/genero",
        json={"genero": "gotico"},
    )
    assert missing.status_code == 404
    assert missing.json()["detail"]["erro"] == "CAMPANHA_NAO_ENCONTRADA"

    _create_campanha(slug="inactive-genre", nome="Inactive", sistema="wod")
    with Session(get_control_engine()) as session:
        assign_owner(session, "inactive-genre", "gm@teste.local")
        inactive = session.exec(
            select(Campanha).where(Campanha.slug == "inactive-genre")
        ).one()
        inactive.activa = False
        session.add(inactive)
        session.commit()

    inactive_response = client.patch(
        "/api/campanhas/inactive-genre/genero",
        json={"genero": "gotico"},
    )
    assert inactive_response.status_code == 404
    assert inactive_response.json()["detail"]["erro"] == "CAMPANHA_NAO_ENCONTRADA"
