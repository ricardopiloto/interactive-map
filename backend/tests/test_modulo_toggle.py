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
from tests.conftest import TEST_ORIGIN, login_as


def test_dono_liga_e_desliga_modulo_linha_tempo_arcos(client, data_root) -> None:
    _create_campanha(slug="mod-a", nome="MA", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        assign_owner(session, "mod-a", "gm@teste.local")

    antes = set(client.get("/api/c/mod-a/config").json()["modulos_ativos"])
    for modulo in ("linha_tempo_arcos", "linha_tempo_descoberta"):
        r = client.patch(
            "/api/campanhas/mod-a/modulos",
            json={"modulo": modulo, "ativo": True},
        )
        assert r.status_code == 422, r.text

    assert set(client.get("/api/c/mod-a/config").json()["modulos_ativos"]) == antes

    ligado = client.patch(
        "/api/campanhas/mod-a/modulos",
        json={"modulo": "ia_arcos", "ativo": True},
    )
    assert ligado.status_code == 200, ligado.text
    assert "ia_arcos" in ligado.json()["modulos_ativos"]

    desligado = client.patch(
        "/api/campanhas/mod-a/modulos",
        json={"modulo": "ia_arcos", "ativo": False},
    )
    assert desligado.status_code == 200
    assert "ia_arcos" not in desligado.json()["modulos_ativos"]


def test_modulos_sao_independentes(client, data_root) -> None:
    _create_campanha(slug="mod-b", nome="MB", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        assign_owner(session, "mod-b", "gm@teste.local")

    r = client.patch(
        "/api/campanhas/mod-b/modulos",
        json={"modulo": "ia_arcos", "ativo": True},
    )
    assert r.status_code == 200
    assert "ia_arcos" in r.json()["modulos_ativos"]

    rejeitado = client.patch(
        "/api/campanhas/mod-b/modulos",
        json={"modulo": "linha_tempo_arcos", "ativo": False},
    )
    assert rejeitado.status_code == 422
    config = client.get("/api/c/mod-b/config").json()
    assert "ia_arcos" in config["modulos_ativos"]
    assert "linha_tempo_arcos" not in config["modulos_ativos"]


def test_patch_modulo_forbidden_for_non_dono(client_anon, data_root) -> None:
    _create_campanha(slug="mod-c", nome="MC", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        session.add(
            Usuario(
                email="outro2@teste.local",
                senha_hash=hash_password("password-ok"),
                activo=True,
                criado_em=datetime.utcnow(),
                actualizado_em=datetime.utcnow(),
            )
        )
        session.commit()
        assign_owner(session, "mod-c", "outro2@teste.local")

    anon = client_anon.patch(
        "/api/campanhas/mod-c/modulos",
        json={"modulo": "ia_arcos", "ativo": True},
    )
    assert anon.status_code == 401

    with TestClient(app, headers={"Origin": TEST_ORIGIN}) as other:
        login_as(other, email="gm@teste.local", password="test-secret-ok")
        r = other.patch(
            "/api/campanhas/mod-c/modulos",
            json={"modulo": "ia_arcos", "ativo": True},
        )
        assert r.status_code == 403


def test_descoberta_opt_in_some_quando_desligado_e_jogador_nao_altera(client, client_anon, data_root) -> None:
    _create_campanha(slug="mod-desc", nome="Desc", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        assign_owner(session, "mod-desc", "gm@teste.local")
        jogador = Usuario(
            email="jogador-desc@teste.local",
            senha_hash=hash_password("password-ok"),
            activo=True,
            criado_em=datetime.utcnow(),
            actualizado_em=datetime.utcnow(),
        )
        session.add(jogador)
        session.commit()
        session.refresh(jogador)
        camp = session.exec(select(Campanha).where(Campanha.slug == "mod-desc")).one()
        session.add(Membro(usuario_id=jogador.id, campanha_id=camp.id, papel="jogador"))
        session.commit()

    rejeitado = client.patch(
        "/api/campanhas/mod-desc/modulos",
        json={"modulo": "linha_tempo_descoberta", "ativo": True},
    )
    assert rejeitado.status_code == 422, rejeitado.text
    assert "linha_tempo_descoberta" not in client.get("/api/c/mod-desc/config").json()["modulos_ativos"]

    login_as(client_anon, email="jogador-desc@teste.local", password="password-ok")
    negado = client_anon.patch(
        "/api/campanhas/mod-desc/modulos",
        json={"modulo": "ia_arcos", "ativo": True},
    )
    assert negado.status_code == 403
    assert "ia_arcos" not in client.get("/api/c/mod-desc/config").json()["modulos_ativos"]


def test_patch_modulo_rejeita_nome_desconhecido(client, data_root) -> None:
    _create_campanha(slug="mod-d", nome="MD", sistema="wfrp4e")
    with Session(get_control_engine()) as session:
        assign_owner(session, "mod-d", "gm@teste.local")

    r = client.patch(
        "/api/campanhas/mod-d/modulos",
        json={"modulo": "modulo_qualquer", "ativo": True},
    )
    assert r.status_code == 422
