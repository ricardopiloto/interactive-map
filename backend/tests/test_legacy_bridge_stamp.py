from __future__ import annotations

import sqlite3
from pathlib import Path

from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine, text

from app.campaign_db import (
    campaign_db_path,
    ensure_campaign_schema,
    get_campaign_engine,
    reset_engines,
    resolve_campaign_session,
)
from app.cli import _create_campanha
from app.config import settings
from sqlmodel import select
from app.models.local import Local
from app.models.npc import NPC


def _build_legacy_db(path: Path) -> tuple[int, int]:
    """Minimal pre-Alembic schema with sample rows (no alembic_version)."""
    conn = sqlite3.connect(path)
    conn.executescript(
        """
        CREATE TABLE local (
            id INTEGER PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            descricao VARCHAR(10000) NOT NULL DEFAULT '',
            x FLOAT NOT NULL,
            y FLOAT NOT NULL,
            imagem_url VARCHAR(500),
            data_sessao VARCHAR(100),
            arco_id INTEGER
        );
        CREATE TABLE npc (
            id INTEGER PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            descricao VARCHAR(10000) NOT NULL DEFAULT '',
            faccao VARCHAR(200),
            status VARCHAR(20),
            retrato_url VARCHAR(500)
        );
        CREATE TABLE vinculo (
            id INTEGER PRIMARY KEY,
            personagem_a_id INTEGER NOT NULL,
            personagem_b_id INTEGER NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            nota VARCHAR(500) NOT NULL DEFAULT '',
            publico BOOLEAN NOT NULL DEFAULT 0
        );
        INSERT INTO local (id, nome, descricao, x, y) VALUES (1, 'Altdorf', '', 0.5, 0.5);
        INSERT INTO local (id, nome, descricao, x, y) VALUES (2, 'Ubersreik', '', 0.4, 0.6);
        INSERT INTO npc (id, nome) VALUES (1, 'Elara');
        INSERT INTO npc (id, nome) VALUES (2, 'Marcus');
        INSERT INTO vinculo (id, personagem_a_id, personagem_b_id, tipo, publico)
            VALUES (1, 1, 2, 'aliado', 1);
        """
    )
    conn.commit()
    conn.close()
    return 2, 2


def test_legacy_bridge_stamp_and_new_skips_bridge(tmp_path, monkeypatch) -> None:
    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")

    camp = _create_campanha(slug="legado-um", nome="Leg", sistema="wfrp4e")
    db_path = campaign_db_path(camp.caminho)
    # Replace head DB with legacy fixture
    db_path.unlink()
    n_loc, n_npc = _build_legacy_db(db_path)

    uuid_key = Path(camp.caminho).name
    # Drop cached engine pointing at old file
    reset_engines()
    monkeypatch.setattr(settings, "data_dir", tmp_path / "data")

    with resolve_campaign_session("legado-um") as session:
        locs = list(session.exec(select(Local)).all())
        npcs = list(session.exec(select(NPC)).all())
        assert len(locs) == n_loc
        assert len(npcs) == n_npc
        assert {loc.id for loc in locs} == {1, 2}
        assert {n.id for n in npcs} == {1, 2}

    eng = get_campaign_engine(uuid_key, camp.caminho)
    with eng.connect() as conn:
        rev = MigrationContext.configure(conn).get_current_revision()
    assert rev is not None

    # Second open — still same counts
    with resolve_campaign_session("legado-um") as session:
        assert len(list(session.exec(select(Local)).all())) == n_loc

    # New campaign: head without needing bridge
    novo = _create_campanha(slug="nova-limpa", nome="Nova", sistema="wfrp4e")
    with resolve_campaign_session("nova-limpa") as session:
        assert list(session.exec(select(Local)).all()) == []
    eng2 = get_campaign_engine(Path(novo.caminho).name, novo.caminho)
    with eng2.connect() as conn:
        assert MigrationContext.configure(conn).get_current_revision() is not None
