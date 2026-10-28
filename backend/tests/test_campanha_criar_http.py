from __future__ import annotations

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine
from app.cli import _create_campanha
from app.main import app
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from tests.conftest import (
    TEST_GM_EMAIL,
    TEST_GM_PASSWORD,
    TEST_ORIGIN,
    login_as,
)


def test_criar_anon_401(client_anon, data_root) -> None:
    r = client_anon.post(
        "/api/campanhas",
        json={"nome": "X", "slug": "nova-x", "sistema": "wfrp4e"},
    )
    assert r.status_code == 401


def test_criar_success_default_listada(client, data_root) -> None:
    r = client.post(
        "/api/campanhas",
        json={"nome": "Nova", "slug": "nova-mesa", "sistema": "wfrp4e"},
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["slug"] == "nova-mesa"
    assert body["visibilidade"] == "listada"
    assert "genero" not in body
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == body["slug"])).first()
        assert camp and camp.visibilidade == "listada"
        assert camp.indexavel is False
        assert "fadiga" in (camp.modulos_ativos or [])
        user = session.exec(select(Usuario).where(Usuario.email == TEST_GM_EMAIL)).first()
        dono = session.exec(
            select(Membro).where(
                Membro.campanha_id == camp.id,
                Membro.papel == "dono",
            )
        ).first()
        assert user and dono and dono.usuario_id == user.id

    cat = client.get("/api/campanhas/catalogo")
    assert body["slug"] in {c["slug"] for c in cat.json()["campanhas"]}


def test_criar_so_link_and_slug_errors(client, data_root) -> None:
    r = client.post(
        "/api/campanhas",
        json={
            "nome": "Sec",
            "slug": "so-link-um",
            "sistema": "wfrp4e",
            "visibilidade": "so_link",
        },
    )
    assert r.status_code == 201
    assert r.json()["visibilidade"] == "so_link"
    assert r.json()["slug"] == "so-link-um"
    cat = client.get("/api/campanhas/catalogo")
    assert "so-link-um" not in {c["slug"] for c in cat.json()["campanhas"]}

    dup = client.post(
        "/api/campanhas",
        json={"nome": "D", "slug": "so-link-um", "sistema": "wfrp4e"},
    )
    assert dup.status_code == 409
    assert dup.json()["detail"]["erro"] == "SLUG_DUPLICADO"

    reserved = client.post(
        "/api/campanhas",
        json={"nome": "D", "slug": "painel", "sistema": "wfrp4e"},
    )
    assert reserved.status_code == 400
    assert reserved.json()["detail"]["erro"] == "SLUG_RESERVADO"

    bad = client.post(
        "/api/campanhas",
        json={"nome": "D", "slug": "Bad_Slug", "sistema": "wfrp4e"},
    )
    assert bad.status_code == 400
    assert bad.json()["detail"]["erro"] == "SLUG_INVALIDO"

    sis = client.post(
        "/api/campanhas",
        json={"nome": "D", "slug": "ok-slug", "sistema": "desconhecido"},
    )
    assert sis.status_code == 201, sis.text
    assert sis.json()["sistema"] == "desconhecido"
    with Session(get_control_engine()) as session:
        camp = session.exec(select(Campanha).where(Campanha.slug == sis.json()["slug"])).first()
        assert camp is not None
        assert camp.sistema == "desconhecido"
        assert list(camp.modulos_ativos or []) == []


def test_genero_absent_from_contract_and_patch_removed(client, data_root) -> None:
    created = client.post(
        "/api/campanhas",
        json={"nome": "Sem tema", "slug": "sem-tema", "sistema": "Sistema livre"},
    )
    assert created.status_code == 201, created.text
    assert "genero" not in created.json()
    config = client.get("/api/c/sem-tema/config")
    assert config.status_code == 200, config.text
    assert "genero" not in config.json()
    minhas = client.get("/api/campanhas/minhas")
    assert minhas.status_code == 200, minhas.text
    assert all("genero" not in item for item in minhas.json()["campanhas"])
    catalogo = client.get("/api/campanhas/catalogo")
    assert catalogo.status_code == 200, catalogo.text
    assert all("genero" not in item for item in catalogo.json()["campanhas"])
    rejected = client.post(
        "/api/campanhas",
        json={"nome": "Outro", "slug": "outro-tema", "sistema": "Livre", "genero": "gotico"},
    )
    assert rejected.status_code == 422
    patch = client.patch("/api/campanhas/sem-tema/genero", json={"genero": "gotico"})
    assert patch.status_code in (404, 405)
