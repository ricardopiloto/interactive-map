from __future__ import annotations

from pathlib import Path

import sqlalchemy as sa
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.campaign_db import get_control_engine, resolve_campaign_session
from app.models.usuario import Membro, Usuario
from app.models.campanha import Campanha
from app.services.auth_password import hash_password
from datetime import datetime
from sqlmodel import select

from tests.conftest import TEST_CAMPAIGN_SLUG, login_as
from tests.helpers import seed_evento, seed_sessao


def test_migracao_cria_tabelas_de_item(data_root: Path) -> None:
    _ = data_root
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        inspector = sa.inspect(session.get_bind())
        tables = set(inspector.get_table_names())
        assert {"item", "item_sessao", "item_evento"} <= tables
        cols = {c["name"] for c in inspector.get_columns("item")}
        assert {"id", "nome", "descricao", "visivel_para_todos"} <= cols
        sessao_pk = {c["name"] for c in inspector.get_columns("item_sessao")}
        evento_pk = {c["name"] for c in inspector.get_columns("item_evento")}
        assert sessao_pk == {"item_id", "sessao_id"}
        assert evento_pk == {"item_id", "evento_id"}


def test_criar_sem_nome_rejeitado_e_leitura_minima(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    base = f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens"
    assert client.post(base, json={"descricao": "sem nome"}).status_code == 422
    assert client.post(base, json={"nome": "   "}).status_code == 422

    created = client.post(base, json={"nome": "  Relíquia  ", "descricao": "Antiga"})
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["nome"] == "Relíquia"
    assert body["descricao"] == "Antiga"
    assert body["visivel_para_todos"] is True

    listed = client.get(base)
    assert listed.status_code == 200
    assert any(item["nome"] == "Relíquia" for item in listed.json()["itens"])


def test_crud_associacoes_e_falha_preserva_item(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        sessao = seed_sessao(session, numero=4, titulo="Sessão do item")
        evento = seed_evento(session, titulo="Evento do item", ano=2512, mes=3)
        sessao_id, evento_id = sessao.id, evento.id

    base = f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens"
    created = client.post(
        base,
        json={
            "nome": "Espada",
            "descricao": "Lâmina",
            "visivel_para_todos": True,
            "sessao_ids": [sessao_id],
            "evento_ids": [evento_id],
        },
    )
    assert created.status_code == 201, created.text
    item_id = created.json()["id"]
    assert {s["id"] for s in created.json()["sessoes"]} == {sessao_id}
    assert {e["id"] for e in created.json()["eventos"]} == {evento_id}

    updated = client.patch(
        f"{base}/{item_id}",
        json={"nome": "Espada longa", "descricao": "Afiada", "visivel_para_todos": False},
    )
    assert updated.status_code == 200
    assert updated.json()["nome"] == "Espada longa"
    assert updated.json()["visivel_para_todos"] is False

    failed = client.patch(f"{base}/{item_id}", json={"nome": "  "})
    assert failed.status_code == 422
    again = client.get(f"{base}/{item_id}")
    assert again.json()["nome"] == "Espada longa"

    assert client.delete(f"{base}/{item_id}").status_code == 204
    assert client.get(f"{base}/{item_id}").status_code == 404


def test_excluir_item_nao_remove_sessao_nem_evento(client: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        sessao = seed_sessao(session, numero=8, titulo="Sessão intacta")
        evento = seed_evento(session, titulo="Evento intacto", ano=2501)
        sessao_id, evento_id = sessao.id, evento.id

    created = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens",
        json={"nome": "Amuleto", "sessao_ids": [sessao_id], "evento_ids": [evento_id]},
    )
    assert created.status_code == 201, created.text
    assert client.delete(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens/{created.json()['id']}").status_code == 204

    sessao_resp = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/sessoes/{sessao_id}")
    evento_resp = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/eventos/{evento_id}")
    assert sessao_resp.status_code == 200
    assert evento_resp.status_code == 200
    assert sessao_resp.json()["titulo"] == "Sessão intacta"
    assert evento_resp.json()["titulo"] == "Evento intacto"


def test_jogador_nao_escreve_e_item_oculto_nao_vaza(client: TestClient, client_anon: TestClient, data_root: Path) -> None:
    _ = data_root
    login_as(client)
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        sessao = seed_sessao(session, numero=9, titulo="Sessão oculta do item", visivel=False)
        sessao_id = sessao.id
    created = client.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens",
        json={
            "nome": "Segredo do mestre",
            "descricao": "Não contar",
            "visivel_para_todos": False,
            "sessao_ids": [sessao_id],
        },
    )
    assert created.status_code == 201, created.text
    item_id = created.json()["id"]

    publico = client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/itens")
    assert publico.status_code == 200
    blob = publico.text
    assert "Segredo do mestre" not in blob
    assert "Não contar" not in blob
    assert client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/itens/{item_id}").status_code == 404

    with Session(get_control_engine()) as session:
        user = Usuario(
            email="jogador-item@teste.local",
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

    login_as(client_anon, email="jogador-item@teste.local", password="password-ok")
    negado = client_anon.post(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens",
        json={"nome": "Tentativa"},
    )
    assert negado.status_code == 403
    assert client_anon.patch(
        f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens/{item_id}",
        json={"nome": "Roubo"},
    ).status_code == 403
    assert client_anon.delete(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens/{item_id}").status_code == 403
    assert client.get(f"/api/c/{TEST_CAMPAIGN_SLUG}/admin/itens/{item_id}").json()["nome"] == "Segredo do mestre"
