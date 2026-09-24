from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
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


def test_minhas_isolation_and_cota(client_anon, data_root) -> None:
    _create_campanha(slug="mesa-a", nome="A", sistema="wfrp4e")
    _create_campanha(slug="mesa-b", nome="B", sistema="wod")
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="ua@teste.local",
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.add(
            Usuario(
                email="ub@teste.local",
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        assign_owner(session, "mesa-a", "ua@teste.local")
        assign_owner(session, "mesa-b", "ub@teste.local")

        # Co-mestre of mesa-a (not dono) — should not see it in minhas
        session.add(
            Usuario(
                email="co@teste.local",
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        co = session.exec(select(Usuario).where(Usuario.email == "co@teste.local")).first()
        camp_a = session.exec(select(Campanha).where(Campanha.slug == "mesa-a")).first()
        assert co and camp_a
        session.add(
            Membro(
                usuario_id=co.id,  # type: ignore[arg-type]
                campanha_id=camp_a.id,  # type: ignore[arg-type]
                papel="mestre",
                criado_em=datetime.utcnow(),
            )
        )
        camp_a.bytes_usados = int(0.95 * camp_a.cota_bytes)
        session.add(camp_a)
        session.commit()

    _create_campanha(slug="morta-a", nome="MortaA", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        assign_owner(session, "morta-a", "ua@teste.local")
        morta = session.exec(select(Campanha).where(Campanha.slug == "morta-a")).first()
        assert morta
        morta.activa = False
        session.add(morta)
        session.commit()

    anon = client_anon.get("/api/campanhas/minhas")
    assert anon.status_code == 401

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as a:
        login_as(a, email="ua@teste.local", password="password-ok")
        r = a.get("/api/campanhas/minhas")
        assert r.status_code == 200
        slugs = {c["slug"] for c in r.json()["campanhas"]}
        assert "mesa-a" in slugs
        assert "mesa-b" not in slugs
        assert "morta-a" not in slugs
        item = next(c for c in r.json()["campanhas"] if c["slug"] == "mesa-a")
        assert item["aviso_cota"] is True
        assert "bytes_usados" in item and "cota_bytes" in item

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as co_client:
        login_as(co_client, email="co@teste.local", password="password-ok")
        r = co_client.get("/api/campanhas/minhas")
        assert r.status_code == 200
        assert "mesa-a" not in {c["slug"] for c in r.json()["campanhas"]}
