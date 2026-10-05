from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.models.campanha import Campanha
from app.models.usuario import Membro, Usuario
from app.services.auth_admin import assign_owner
from app.services.auth_password import hash_password
from datetime import datetime

from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL, login_as
from tests.helpers import seed_evento, seed_local, seed_personagem, seed_sessao


def test_primeira_aparicao_ignora_sessao_oculta_para_jogador(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        pj = seed_personagem(session, nome="Aldo")
        seed_sessao(session, numero=1, titulo="Sessão secreta", visivel=False, personagem_ids=[pj.id])
        seed_sessao(session, numero=2, titulo="Sessão pública", visivel=True, personagem_ids=[pj.id])

    publico = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").json()
    assert "alertas" not in publico
    personagem = next(e for e in publico["entidades"] if e["nome"] == "Aldo")
    assert [a["titulo"] for a in personagem["aparicoes"]] == ["Sessão pública"]
    assert "Sessão secreta" not in client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").text

    mestre = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/descoberta").json()
    personagem_gm = next(e for e in mestre["entidades"] if e["nome"] == "Aldo")
    assert [a["titulo"] for a in personagem_gm["aparicoes"]] == ["Sessão secreta", "Sessão pública"]
    assert personagem_gm["aparicoes"][1]["reaparicao"] is True
    assert any(a["personagem_nome"] == "Aldo" for a in mestre["alertas"])


def test_item_sessao_e_evento_em_datas_diferentes(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        sessao = seed_sessao(session, numero=6, titulo="Depois")
        evento = seed_evento(session, titulo="Antes", ano=2510, mes=1)
        sessao_id, evento_id = sessao.id, evento.id
    created = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens",
        json={"nome": "Mapa rasgado", "sessao_ids": [sessao_id], "evento_ids": [evento_id]},
    )
    assert created.status_code == 201, created.text

    corpo = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").json()
    item = next(e for e in corpo["entidades"] if e["nome"] == "Mapa rasgado")
    assert [a["titulo"] for a in item["aparicoes"]] == ["Antes", "Depois"]
    assert item["aparicoes"][0]["reaparicao"] is False
    assert item["aparicoes"][1]["reaparicao"] is True
    assert item["aparicoes"][1]["intervalo"] is not None


def test_reaparicoes_intervalo_curto_e_longo(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        local = seed_local(session, nome="Ponte")
        seed_sessao(session, numero=1, titulo="Chegada", local_ids=[local.id])
        seed_sessao(session, numero=2, titulo="Dia seguinte", local_ids=[local.id])
        pj = seed_personagem(session, nome="Berta")
        seed_evento(session, titulo="Juventude", ano=2500, mes=1, personagem_ids=[pj.id])
        seed_evento(session, titulo="Velhice", ano=2520, mes=6, personagem_ids=[pj.id])

    corpo = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").json()
    ponte = next(e for e in corpo["entidades"] if e["nome"] == "Ponte")
    curto = ponte["aparicoes"][1]["intervalo"]
    assert curto["sessoes"] == 1
    assert ponte["aparicoes"][1]["reaparicao"] is True

    berta = next(e for e in corpo["entidades"] if e["nome"] == "Berta")
    longo = berta["aparicoes"][1]["intervalo"]
    assert longo["anos"] == 20
    assert longo["meses"] == 5
    assert berta["aparicoes"][1]["reaparicao"] is True


def test_faccoes_normalizadas_e_vazia_ignorada(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        guarda = seed_personagem(session, nome="Capitão", faccao="Guarda da Cidade")
        variante = seed_personagem(session, nome="Recruta", faccao="guarda da cidade ")
        sem = seed_personagem(session, nome="Andarilho", faccao="   ")
        seed_sessao(session, numero=1, titulo="Portão", personagem_ids=[guarda.id, sem.id])
        seed_sessao(session, numero=3, titulo="Quartel", personagem_ids=[variante.id])

    corpo = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").json()
    faccoes = [e for e in corpo["entidades"] if e["tipo"] == "faccao"]
    assert len(faccoes) == 1
    assert faccoes[0]["nome"] == "Guarda da Cidade"
    assert [a["titulo"] for a in faccoes[0]["aparicoes"]] == ["Portão", "Quartel"]
    assert all(e["nome"] != "Andarilho" or e["tipo"] != "faccao" for e in corpo["entidades"])
    assert not any(e["tipo"] == "faccao" and not e["nome"].strip() for e in corpo["entidades"])


def test_alerta_nao_bloqueia_gravacao_nem_muda_visibilidade(client: TestClient, client_anon: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        pj = seed_personagem(session, nome="Ciro")
        seed_sessao(session, numero=1, titulo="Passado oculto", visivel=False, personagem_ids=[pj.id])
        pj_id = pj.id

    created = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes",
        json={
            "numero": 4,
            "titulo": "Reencontro",
            "visivel_para_todos": True,
            "personagem_ids": [pj_id],
        },
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["visivel_para_todos"] is True
    assert body["alertas_inconsistencia"]
    assert body["alertas_inconsistencia"][0]["personagem_nome"] == "Ciro"
    assert body["alertas_inconsistencia"][0]["sessao_oculta_titulo"] == "Passado oculto"

    with Session(get_control_engine()) as session:
        user = Usuario(
            email="jogador-alerta@teste.local",
            senha_hash=hash_password("password-ok"),
            activo=True,
            criado_em=datetime.utcnow(),
            actualizado_em=datetime.utcnow(),
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        camp = session.exec(select(Campanha).where(Campanha.slug == TEST_CAMPAIGN_SLUG)).one()
        session.add(Membro(usuario_id=user.id, campanha_id=camp.id, papel="jogador"))
        session.commit()

    login_as(client_anon, email="jogador-alerta@teste.local", password="password-ok")
    lista = client_anon.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes")
    assert lista.status_code == 200
    reencontro = next(s for s in lista.json()["sessoes"] if s["titulo"] == "Reencontro")
    assert reencontro["alertas_inconsistencia"] == []
    publico = client_anon.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").text
    assert "Passado oculto" not in publico
    assert "alertas" not in client_anon.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").json()


def test_item_com_todas_associacoes_ocultas_nao_aparece_ao_jogador(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        sessao = seed_sessao(session, numero=11, titulo="Cofre", visivel=False)
        sessao_id = sessao.id
    created = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens",
        json={"nome": "Chave do cofre", "descricao": "Ferro frio", "visivel_para_todos": True, "sessao_ids": [sessao_id]},
    )
    assert created.status_code == 201, created.text
    publico = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta")
    assert "Chave do cofre" not in publico.text
    assert "Ferro frio" not in publico.text
    nomes = [e["nome"] for e in publico.json()["entidades"] if e["tipo"] == "item"]
    assert "Chave do cofre" not in nomes


def test_itens_isolation_a_b(client: TestClient, data_root: Path) -> None:
    _ = data_root
    _create_campanha(slug="mesa-item-b", nome="B", sistema="wod")
    with Session(get_control_engine()) as ctrl:
        assign_owner(ctrl, "mesa-item-b", TEST_GM_EMAIL)
    login_as(client)

    created = client.post("/api/c/mesa-item-b/admin/itens", json={"nome": "Relíquia de B"})
    assert created.status_code == 201, created.text
    item_id = created.json()["id"]

    lista_a = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens")
    assert all(item["nome"] != "Relíquia de B" for item in lista_a.json()["itens"])
    assert client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens/{item_id}").status_code == 404
    assert client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/itens").text.find("Relíquia de B") == -1

    descoberta_a = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/descoberta").text
    assert "Relíquia de B" not in descoberta_a
    descoberta_b = client.get("/api/c/mesa-item-b/descoberta").json()
    assert any(e["nome"] == "Relíquia de B" for e in descoberta_b["entidades"]) is False
    # Sem associação, o item existe na mesa B mas não entra na descoberta — e não vaza para A.
    assert any(item["nome"] == "Relíquia de B" for item in client.get("/api/c/mesa-item-b/admin/itens").json()["itens"])
