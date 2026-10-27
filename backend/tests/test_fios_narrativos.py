from __future__ import annotations

import io
import json
import zipfile

import pytest
from alembic import command
from sqlalchemy import inspect
from sqlmodel import Session, select

from app.campaign_db import _alembic_config, get_campaign_engine, get_control_engine, resolve_campaign_session
from app.cli import _create_campanha
from app.models.fio_narrativo import FioNarrativo
from app.models.sessao import Sessao
from app.services.campaign_export import export_campaign_to_bytes
from app.services.campaign_import import import_campaign_from_bytes
from app.services.package_schema import CONTENT_FILENAME, MANIFEST_FILENAME, CONTEUDO_INVALIDO, PackageError
from app.services.sessao_service import delete_sessao
from tests.conftest import TEST_CAMPAIGN_SLUG, TEST_GM_EMAIL, api


def _zip(members):
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w") as zf:
        for name, value in members.items():
            zf.writestr(name, value)
    return out.getvalue()


def _members(data):
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        return {name: zf.read(name) for name in zf.namelist()}


def test_migration_idempotent(data_root):
    from app.campaign_db import lookup_campanha
    camp = lookup_campanha(TEST_CAMPAIGN_SLUG)
    engine = get_campaign_engine(camp.caminho.split("/")[-1], camp.caminho)
    cfg = _alembic_config("campaign", str(engine.url))
    assert "fio_narrativo" in inspect(engine).get_table_names()
    command.downgrade(cfg, "011_personagem_notas_mecanicas")
    command.upgrade(cfg, "head")
    from importlib import import_module
    from alembic.migration import MigrationContext
    from alembic.operations import Operations
    migration = import_module("alembic_campaign.versions.012_fio_narrativo")
    with engine.begin() as conn:
        context = MigrationContext.configure(conn)
        with Operations.context(context):
            migration.upgrade()
    assert "fio_narrativo" in inspect(engine).get_table_names()


def test_delete_sessao_keeps_fio(db_session):
    sessao = Sessao(numero=1, titulo="Origem")
    db_session.add(sessao)
    db_session.commit()
    fio = FioNarrativo(titulo="Aberto", sessao_origem_id=sessao.id)
    db_session.add(fio)
    db_session.commit()
    delete_sessao(db_session, sessao.id)
    db_session.refresh(fio)
    assert fio.sessao_origem_id is None
    assert db_session.get(FioNarrativo, fio.id) is not None


def test_crud_lote_ordem_e_validacao(client, db_session):
    base = api("/api/admin/fios")
    a = client.post(base, json={"titulo": "A"})
    assert a.status_code == 201
    aid = a.json()["id"]
    assert client.patch(f"{base}/{aid}", json={"estado": "resolvido", "descricao": "fim"}).json()["estado"] == "resolvido"
    assert [r["id"] for r in client.get(base, params={"estado": "resolvido"}).json()] == [aid]
    batch = client.post(f"{base}/lote", json={"fios": [{"titulo": "B", "origem": "ia"}, {"titulo": "C"}]})
    assert batch.status_code == 201, batch.text
    ids = [r["id"] for r in batch.json()]
    assert client.put(f"{base}/ordem", json={"ids": [ids[1], aid, ids[0]]}).status_code == 200
    assert [r["id"] for r in client.get(base).json()] == [ids[1], aid, ids[0]]
    before = len(client.get(base).json())
    assert client.post(f"{base}/lote", json={"fios": [{"titulo": "Valid"}, {"titulo": "Bad", "sessao_origem_id": 999999}]}).status_code == 400
    assert client.post(f"{base}/lote", json={"fios": [{"titulo": str(i)} for i in range(11)]}).status_code == 422
    assert len(client.get(base).json()) == before
    assert client.delete(f"{base}/{aid}").status_code == 204


def test_private_and_campaign_isolation(client, client_anon, db_session):
    base = api("/api/admin/fios")
    client.post(base, json={"titulo": "Segredo"})
    assert client_anon.get(base).status_code == 401
    assert client.get(api("/api/sessoes")).status_code in (200, 404)
    from app.main import app
    paths = app.openapi()["paths"]
    assert all("/admin/" in path for path in paths if "fios" in path)
    assert all("fios" not in path for path in paths if "/public/" in path)
    other = _create_campanha(slug="outra-fios", nome="Outra", sistema="wfrp4e")
    assert client.get("/api/c/outra-fios/admin/fios").status_code == 403
    with resolve_campaign_session(other.slug) as session:
        assert session.exec(select(FioNarrativo)).all() == []


def test_package_round_trip_old_and_invalid_ref(data_root):
    with resolve_campaign_session(TEST_CAMPAIGN_SLUG) as session:
        sessao = Sessao(numero=1, titulo="Origem")
        session.add(sessao)
        session.commit()
        fio = FioNarrativo(titulo="Fio", descricao="Descrição", estado="resolvido", origem="ia", ordem=7, sessao_origem_id=sessao.id)
        session.add(fio)
        session.commit()
        fio_id = fio.id
        sessao_id = sessao.id
    data = export_campaign_to_bytes(TEST_CAMPAIGN_SLUG)
    imported = import_campaign_from_bytes(data, owner_email=TEST_GM_EMAIL, slug_override="fios-copia")
    with resolve_campaign_session(imported.slug) as session:
        row = session.get(FioNarrativo, fio_id)
        assert (row.titulo, row.descricao, row.estado, row.origem, row.ordem, row.sessao_origem_id) == ("Fio", "Descrição", "resolvido", "ia", 7, sessao_id)
    members = _members(data)
    manifest = json.loads(members[MANIFEST_FILENAME])
    manifest["schema_version"] = "011_personagem_notas_mecanicas"
    members[MANIFEST_FILENAME] = json.dumps(manifest).encode()
    content = json.loads(members[CONTENT_FILENAME])
    content.pop("fios")
    members[CONTENT_FILENAME] = json.dumps(content).encode()
    old = import_campaign_from_bytes(_zip(members), owner_email=TEST_GM_EMAIL, slug_override="fios-old")
    with resolve_campaign_session(old.slug) as session:
        assert session.exec(select(FioNarrativo)).all() == []
    manifest["schema_version"] = "010_sessao_notas_preparo"
    members[MANIFEST_FILENAME] = json.dumps(manifest).encode()
    older = import_campaign_from_bytes(_zip(members), owner_email=TEST_GM_EMAIL, slug_override="fios-older")
    with resolve_campaign_session(older.slug) as session:
        assert session.exec(select(FioNarrativo)).all() == []
    content["fios"] = [{"id": 100, "titulo": "Ruim", "descricao": "", "estado": "aberto", "origem": "manual", "ordem": 0, "sessao_origem_id": 999999}]
    members[CONTENT_FILENAME] = json.dumps(content).encode()
    with pytest.raises(PackageError) as exc:
        import_campaign_from_bytes(_zip(members), owner_email=TEST_GM_EMAIL, slug_override="fios-invalid")
    assert exc.value.codigo == CONTEUDO_INVALIDO


def test_fios_requires_owner_for_player_and_other_owner(client, client_anon, data_root):
    from app.models.campanha import Campanha
    from app.models.usuario import Membro, Usuario
    from app.services.auth_password import hash_password
    from tests.conftest import login_as

    other = _create_campanha(slug="outra-dono-fios", nome="Outra", sistema="wfrp4e")
    with Session(get_control_engine()) as control:
        for email, role, campaign in (
            ("player-fios@teste.local", "jogador", TEST_CAMPAIGN_SLUG),
            ("other-fios@teste.local", "dono", other.slug),
        ):
            user = Usuario(email=email, senha_hash=hash_password("test-secret-ok"), activo=True)
            control.add(user)
            control.flush()
            camp = control.exec(select(Campanha).where(Campanha.slug == campaign)).one()
            control.add(Membro(usuario_id=user.id, campanha_id=camp.id, papel=role))
        control.commit()
    path = api("/api/admin/fios")
    for email in ("player-fios@teste.local", "other-fios@teste.local"):
        client_anon.cookies.clear()
        login_as(client_anon, email=email, password="test-secret-ok")
        assert client_anon.get(path).status_code == 403
        assert client_anon.post(path, json={"titulo": "Negado"}).status_code == 403
